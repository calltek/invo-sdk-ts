/**
 * v0 → v1 compatibility: translates the camelCase `CreateInvoiceDto` that
 * `store()` received in v0 (INVO API) into the snake_case body of
 * `POST /v1/verifactu/invoices` (ORUGA API).
 *
 * | v0 (`CreateInvoiceDto`)            | v1 (`CreateVerifactuInvoiceInput`)                  |
 * |------------------------------------|-----------------------------------------------------|
 * | issueDate                          | issue_date (zone-less date-times → their date part) |
 * | invoiceNumber                      | invoice_number                                      |
 * | externalId                         | external_id                                         |
 * | totalAmount (number)               | total (decimal string, 2 decimals)                  |
 * | currency                           | — (must be EUR or omitted)                          |
 * | customerName + customerTaxId       | recipients[0] = { name, nif } or { name, id_type: '02', id } |
 * | emitterName                        | — (the AEAT name is the taxpayer's legal_name)      |
 * | emitterTaxId                       | issuer_nif                                          |
 * | config.environment                 | environment (sandbox → test), only if configured    |
 * | taxpayerId (v1 extra)              | taxpayer_id                                         |
 * | type                               | invoice_type                                        |
 * | rectificationType                  | rectification_type                                  |
 * | description                        | description                                         |
 * | simplifiedQualified                | simplified_art_7273                                 |
 * | unidentifiedRecipient              | unidentified_recipient_art_61d                      |
 * | billingAgreementNumber             | billing_agreement_number                            |
 * | rectifiedInvoiceIds[]              | rectified_invoices[] = { invoice_id }               |
 * | substitutedInvoiceIds[]            | substituted_invoices[] = { invoice_id }             |
 * | rectifiedAmounts (v1 extra)        | rectified_amounts (computed if S and omitted)       |
 * | operationDate (v1 extra)           | operation_date                                      |
 * | callback / store(dto, callback)    | callback_url                                        |
 * | taxLines[].taxType                 | tax_lines[].tax_type ('04' → '05')                  |
 * | taxLines[].taxRate                 | tax_lines[].tax_rate                                |
 * | taxLines[].baseAmount              | tax_lines[].base                                    |
 * | taxLines[].taxAmount               | tax_lines[].tax_amount                              |
 * | taxLines[].surchargeRate           | tax_lines[].surcharge_rate                          |
 * | taxLines[].surchargeAmount         | tax_lines[].surcharge_amount                        |
 * | taxLines[].taxExemptionReason      | tax_lines[].operation (E1-E6)                       |
 * | taxLines[].operationType           | tax_lines[].operation (S1, S2, N1, N2)              |
 * | taxLines[].regimeKey               | tax_lines[].regime_key                              |
 */

import { InvoValidationError } from './errors'
import type { CreateInvoiceDto, InvoiceTaxLineDto } from './types/legacy.types'
import type {
    CreateVerifactuInvoiceInput,
    VerifactuEnvironment,
    VerifactuInvoiceDetail,
    VerifactuRecipientInput,
    VerifactuTaxLineInput,
} from './types/verifactu.types'

/** SDK `environment` (v0 names) → taxpayer environment in ORUGA. */
export function toVerifactuEnvironment(
    environment: 'production' | 'sandbox' | 'test' | undefined,
): VerifactuEnvironment | undefined {
    if (environment === undefined) return undefined
    return environment === 'production' ? 'production' : 'test'
}

/**
 * A JS number → decimal string. Floating point noise (`0.1 + 0.2`,
 * `1210.0000000001`) is rounded to cents, which is what INVO stored; a value
 * with real sub-cent precision is sent as-is and the API will reject it.
 * `decimals: 'trim'` drops trailing zeros (rates: `5.2`, `21`).
 */
export function toDecimalString(
    value: number | string,
    field: string,
    decimals: 'fixed' | 'trim' = 'fixed',
): string {
    if (typeof value === 'string') return value.trim()
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new InvoValidationError(`${field} must be a finite number`)
    }
    const scaled = value * 100
    const cents = Math.round(scaled)
    if (Math.abs(scaled - cents) > 1e-6) return String(value)

    const negative = cents < 0
    const abs = Math.abs(cents)
    const integer = Math.floor(abs / 100)
    let fraction = String(abs % 100).padStart(2, '0')
    if (decimals === 'trim') fraction = fraction.replace(/0+$/, '')
    const text = fraction ? `${integer}.${fraction}` : String(integer)
    return negative && cents !== 0 ? `-${text}` : text
}

/**
 * v0 `issueDate`. v1 accepts `YYYY-MM-DD` or an ISO instant WITH zone (read in
 * Madrid). A date-time without zone is ambiguous for the API: v0 treated it as
 * the issue date, so the SDK keeps its date part.
 */
export function toIssueDate(value: string, field = 'issueDate'): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new InvoValidationError(`${field} is required (YYYY-MM-DD or ISO 8601)`)
    }
    const text = value.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
    if (/^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/i.test(text)) return text
    const zoneless = /^(\d{4}-\d{2}-\d{2})[T ][\d:.]+$/.exec(text)
    if (zoneless) return zoneless[1]
    throw new InvoValidationError(`${field} must be YYYY-MM-DD or ISO 8601, got "${value}"`)
}

/**
 * v0 `customerTaxId` → recipient. Spanish NIF (9 alphanumeric, optionally with
 * an `ES` prefix) → `nif`; anything starting with a country prefix (EU VAT
 * number, e.g. `DE123456789`) → IDOtro type 02 (NIF-IVA).
 */
export function toRecipient(name: string, taxId: string): VerifactuRecipientInput {
    const normalized = taxId.replace(/[\s.-]+/g, '').toUpperCase()
    const withoutEs = /^ES[A-Z0-9]{9}$/.test(normalized) ? normalized.slice(2) : normalized
    if (/^[A-Z0-9]{9}$/.test(withoutEs) && !/^[A-Z]{2}/.test(withoutEs)) {
        return { name, nif: withoutEs }
    }
    if (/^[A-Z]{2}[A-Z0-9]{2,18}$/.test(normalized)) {
        return { name, id_type: '02', id: normalized }
    }
    // Let the API validate it (it will answer with a precise message)
    return { name, nif: normalized }
}

function toInvoiceId(value: string | number, field: string): number {
    const n = typeof value === 'number' ? value : Number(String(value).trim())
    if (!Number.isSafeInteger(n) || n < 1) {
        throw new InvoValidationError(
            `${field} must contain ORUGA invoice ids (numbers, e.g. the invoiceId returned by store()). ` +
                `INVO UUIDs are not valid in v1: got "${value}"`,
        )
    }
    return n
}

export function toTaxLine(line: InvoiceTaxLineDto, index: number): VerifactuTaxLineInput {
    const field = `taxLines[${index}]`
    if (line.taxExemptionReason && line.operationType) {
        throw new InvoValidationError(
            `${field}: taxExemptionReason and operationType are mutually exclusive`,
        )
    }
    const out: VerifactuTaxLineInput = {
        // INVO used 04 for "Others"; the AEAT (and ORUGA) code is 05
        ...(line.taxType ? { tax_type: line.taxType === '04' ? '05' : line.taxType } : {}),
        ...(line.regimeKey ? { regime_key: line.regimeKey } : {}),
        ...(line.taxExemptionReason || line.operationType
            ? { operation: (line.taxExemptionReason ?? line.operationType)! }
            : {}),
        tax_rate: toDecimalString(line.taxRate, `${field}.taxRate`, 'trim'),
        base: toDecimalString(line.baseAmount, `${field}.baseAmount`),
        tax_amount: toDecimalString(line.taxAmount, `${field}.taxAmount`),
    }
    if (line.surchargeRate != null) {
        out.surcharge_rate = toDecimalString(line.surchargeRate, `${field}.surchargeRate`, 'trim')
    }
    if (line.surchargeAmount != null) {
        out.surcharge_amount = toDecimalString(line.surchargeAmount, `${field}.surchargeAmount`)
    }
    return out
}

export interface StoreMappingContext {
    callback?: string
    environment?: 'production' | 'sandbox' | 'test'
}

/** v0 `CreateInvoiceDto` → v1 `CreateVerifactuInvoiceInput`. Pure (no I/O). */
export function mapCreateInvoiceDto(
    dto: CreateInvoiceDto,
    context: StoreMappingContext = {},
): CreateVerifactuInvoiceInput {
    if (!dto || typeof dto !== 'object') throw new InvoValidationError('store() needs an invoice')
    if (dto.currency && dto.currency.toUpperCase() !== 'EUR') {
        throw new InvoValidationError(
            `currency "${dto.currency}" is not supported: VERI*FACTU amounts are in EUR`,
        )
    }
    if (!Array.isArray(dto.taxLines) || dto.taxLines.length === 0) {
        throw new InvoValidationError('taxLines must have at least one line')
    }

    const environment = toVerifactuEnvironment(context.environment)
    const callback = context.callback ?? dto.callback
    const recipients =
        dto.customerName && dto.customerTaxId
            ? [toRecipient(dto.customerName, dto.customerTaxId)]
            : undefined

    const body: CreateVerifactuInvoiceInput = {
        ...(dto.taxpayerId ? { taxpayer_id: dto.taxpayerId } : {}),
        ...(dto.emitterTaxId ? { issuer_nif: dto.emitterTaxId.replace(/\s+/g, '').toUpperCase() } : {}),
        // Only when it disambiguates by NIF; with taxpayer_id it is not needed
        ...(environment && !dto.taxpayerId ? { environment } : {}),
        invoice_number: dto.invoiceNumber,
        issue_date: toIssueDate(dto.issueDate),
        ...(dto.type ? { invoice_type: dto.type } : {}),
        ...(dto.rectificationType ? { rectification_type: dto.rectificationType } : {}),
        ...(dto.rectifiedInvoiceIds?.length
            ? {
                  rectified_invoices: dto.rectifiedInvoiceIds.map((v) => ({
                      invoice_id: toInvoiceId(v, 'rectifiedInvoiceIds'),
                  })),
              }
            : {}),
        ...(dto.substitutedInvoiceIds?.length
            ? {
                  substituted_invoices: dto.substitutedInvoiceIds.map((v) => ({
                      invoice_id: toInvoiceId(v, 'substitutedInvoiceIds'),
                  })),
              }
            : {}),
        ...(dto.rectifiedAmounts
            ? {
                  rectified_amounts: {
                      base: toDecimalString(dto.rectifiedAmounts.base, 'rectifiedAmounts.base'),
                      tax: toDecimalString(dto.rectifiedAmounts.tax, 'rectifiedAmounts.tax'),
                      ...(dto.rectifiedAmounts.surcharge != null
                          ? {
                                surcharge: toDecimalString(
                                    dto.rectifiedAmounts.surcharge,
                                    'rectifiedAmounts.surcharge',
                                ),
                            }
                          : {}),
                  },
              }
            : {}),
        ...(dto.operationDate ? { operation_date: toIssueDate(dto.operationDate, 'operationDate') } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.simplifiedQualified !== undefined
            ? { simplified_art_7273: dto.simplifiedQualified }
            : {}),
        ...(dto.unidentifiedRecipient !== undefined
            ? { unidentified_recipient_art_61d: dto.unidentifiedRecipient }
            : {}),
        ...(dto.billingAgreementNumber
            ? { billing_agreement_number: dto.billingAgreementNumber }
            : {}),
        ...(recipients ? { recipients } : {}),
        tax_lines: dto.taxLines.map(toTaxLine),
        total: toDecimalString(dto.totalAmount, 'totalAmount'),
        ...(dto.externalId ? { external_id: dto.externalId } : {}),
        ...(callback ? { callback_url: callback } : {}),
    }

    if (!body.taxpayer_id && !body.issuer_nif) {
        throw new InvoValidationError('emitterTaxId is required')
    }
    return body
}

/** Exact sum of decimal strings with up to 2 decimals (BigInt cents). */
export function sumDecimals(values: Array<string | null | undefined>): string {
    let cents = 0n
    for (const value of values) {
        if (value == null || value === '') continue
        const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim())
        if (!match) throw new InvoValidationError(`Cannot add amount "${value}"`)
        const abs = BigInt(match[2]) * 100n + BigInt((match[3] ?? '').padEnd(2, '0'))
        cents += match[1] ? -abs : abs
    }
    const negative = cents < 0n
    const abs = negative ? -cents : cents
    const text = `${abs / 100n}.${String(abs % 100n).padStart(2, '0')}`
    return negative ? `-${text}` : text
}

/**
 * ImporteRectificacion of a rectification by substitution, computed like INVO
 * did: the sum of the tax lines of each rectified invoice's current `alta`
 * record (the last alta in chain order).
 */
export function rectifiedAmountsFrom(invoices: VerifactuInvoiceDetail[]): {
    base: string
    tax: string
    surcharge: string
} {
    const lines = invoices.flatMap((invoice) => {
        const altas = invoice.records
            .filter((record) => record.record_type === 'alta')
            .sort((a, b) => a.chain_index - b.chain_index)
        const current = altas[altas.length - 1]
        if (!current) {
            throw new InvoValidationError(
                `Rectified invoice ${invoice.id} (${invoice.invoice_number}) has no alta record`,
            )
        }
        return current.tax_lines ?? []
    })
    return {
        base: sumDecimals(lines.map((line) => line.base)),
        tax: sumDecimals(lines.map((line) => line.tax_amount)),
        surcharge: sumDecimals(lines.map((line) => line.surcharge_amount)),
    }
}
