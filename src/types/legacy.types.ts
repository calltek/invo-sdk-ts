/**
 * v0 (INVO API) types, kept so existing integrations compile unchanged.
 *
 * `CreateInvoiceDto` / `InvoiceTaxLineDto` are still the input of
 * `InvoSDK.store()`: the SDK maps them to the ORUGA VERI*FACTU API (see
 * `src/compat.ts`). The rest only remain as deprecated type exports.
 */

import type { VerifactuInvoice } from './verifactu.types'

/** Tax line of the v0 `store()` DTO (camelCase). */
export interface InvoiceTaxLineDto {
    /**
     * Tax: 01 IVA, 02 IPSI (Ceuta/Melilla), 03 IGIC (Canarias), 04/05 Others.
     * `04` was INVO's code for "Others"; the AEAT code is `05` and the SDK
     * translates it.
     * @default "01"
     */
    taxType?: '01' | '02' | '03' | '04' | '05'
    /** Tax rate (%). */
    taxRate: number
    /** Taxable base. Negative in a credit note. */
    baseAmount: number
    /** Tax amount. Negative in a credit note. */
    taxAmount: number
    /** Equivalence surcharge amount. */
    surchargeAmount?: number
    /** Equivalence surcharge rate (%). */
    surchargeRate?: number
    /** Exemption cause (exempt operations only). Mutually exclusive with `operationType`. */
    taxExemptionReason?: 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6'
    /** CalificacionOperacion. If omitted it is deduced from the rate. */
    operationType?: 'S1' | 'S2' | 'N1' | 'N2'
    /** ClaveRegimen. @default "01" */
    regimeKey?:
        | '01'
        | '02'
        | '03'
        | '04'
        | '05'
        | '06'
        | '07'
        | '08'
        | '09'
        | '10'
        | '11'
        | '12'
        | '13'
        | '14'
        | '15'
        | '17'
        | '18'
        | '19'
}

/** Input of `InvoSDK.store()` — the v0 DTO, unchanged (plus optional v1 extras). */
export interface CreateInvoiceDto {
    /** Issue date: `YYYY-MM-DD` or ISO 8601 (e.g. `new Date().toISOString()`). */
    issueDate: string
    /** Official invoice number (series + number). Cannot contain `" ' < > =`. */
    invoiceNumber: string
    /** Your ERP's unique id for this invoice. */
    externalId: string
    /** Total (base + taxes). Negative in a credit note. */
    totalAmount: number
    /** ISO 4217. VERI*FACTU amounts are always EUR: anything else is rejected. @default "EUR" */
    currency?: string
    /** Customer name. Required except in F2/R5 (and `unidentifiedRecipient`). */
    customerName: string
    /** Customer tax id: Spanish NIF (9 chars) or EU VAT number (e.g. DE123456789). */
    customerTaxId: string
    /**
     * Ignored in v1: the issuer name sent to the AEAT is the taxpayer's
     * `legal_name` registered in ORUGA (it must match the AEAT census).
     * @deprecated
     */
    emitterName?: string
    /** Issuer NIF. Must be a taxpayer of your ORUGA workspace. */
    emitterTaxId: string
    /** F1 (full), F2 (simplified), F3 (substitute), R1-R5 (rectificative). @default "F1" */
    type?: 'F1' | 'F2' | 'F3' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
    /** S (substitution) or I (differences). Required in R1-R5. */
    rectificationType?: 'S' | 'I'
    /** Operation description. Defaults to «Factura <number>». */
    description?: string
    /** Full invoice issued as qualified simplified (arts. 7.2 and 7.3). F1, F3, R1-R4. */
    simplifiedQualified?: boolean
    /** Full invoice without recipient identification (art. 6.1.d). F2 and R5. */
    unidentifiedRecipient?: boolean
    /** AEAT billing agreement number (invoicing by the recipient or a third party). */
    billingAgreementNumber?: string
    /**
     * Ids of the rectified invoices (R1-R5). In v1 these are ORUGA invoice ids
     * (`result.invoiceId` / `invoice.id`), numeric strings or numbers.
     */
    rectifiedInvoiceIds?: Array<string | number>
    /** Ids of the substituted simplified invoices (F3 only). ORUGA ids, as above. */
    substitutedInvoiceIds?: Array<string | number>
    /** One line per tax rate (1-12). */
    taxLines: InvoiceTaxLineDto[]
    /** Webhook URL for this invoice's status updates (same as `store()`'s 2nd argument). */
    callback?: string

    // ---- v1 extras (optional, not in v0) ----

    /**
     * v1 only: ImporteRectificacion of a rectification by substitution (`S`).
     * If omitted, the SDK computes it like INVO did: the sum of the tax lines
     * of the rectified invoices' current `alta` record.
     */
    rectifiedAmounts?: { base: number | string; tax: number | string; surcharge?: number | string }
    /** v1 only: FechaOperacion, when it differs from the issue date (`YYYY-MM-DD`). */
    operationDate?: string
    /** v1 only: ORUGA taxpayer id. Takes precedence over `emitterTaxId` + `environment`. */
    taxpayerId?: number
}

/** Result of `InvoSDK.store()` — same shape as v0, plus the full v1 invoice. */
export interface CreateInvoiceResult {
    success: boolean
    /** ORUGA invoice id (numeric, as a string for v0 compatibility). */
    invoiceId: string
    /** Position of the record in the taxpayer's chain. */
    chainIndex: number
    /** v1: the created invoice as returned by the ORUGA API. */
    invoice: VerifactuInvoice
}

/** @deprecated `read()` is not available in v1. */
export type InvoiceReaderResult = Record<string, unknown>

/** @deprecated JWTs are no longer used (API keys are sent directly). */
export interface DecodedToken {
    sub: string
    email: string
    exp: number
    iat: number
    [key: string]: unknown
}

/** @deprecated INVO user. `getUser()` always returns `null` in v1. */
export interface UserDto {
    id: string
    email: string
    role: 'client' | 'admin'
}

/** @deprecated INVO login (no longer used). */
export interface LoginDto {
    email: string
    password: string
}

/** @deprecated INVO token exchange (no longer used). */
export interface LoginResponseDto {
    access_token: string
    refresh_token: string
    expires_in: number
    user: UserDto
    workspaces: unknown[]
    current_workspace_id: string
}

/** @deprecated INVO batches are not exposed in v1. */
export interface UpdateBatchStatusDto {
    status: 'OPEN' | 'READY' | 'PROCESSING' | 'SENT' | 'CLOSED'
}

/** @deprecated `pdf()` is not available in v1. */
export interface MakeupPDFBrandDto {
    logo: string
    favicon: string
    accent_color: string
    foreground_color: string
}

/** @deprecated `pdf()` is not available in v1. */
export interface MakeupPDFClientDto {
    name: string
    cif: string
    address: string
    phone: string
    email: string
}

/** @deprecated `pdf()` is not available in v1. */
export interface MakeupPDFBusinessDto {
    name: string
    cif: string
    address: string
    phone: string
    email: string
}

/** @deprecated `pdf()` is not available in v1. */
export interface MakeupPDFConceptDto {
    name: string
    price: number
    quantity: number
    total: number
    subtotal: number
    discount_value: number
    discount_percent: number
}

/** @deprecated `pdf()` is not available in v1. */
export interface MakeupPDFDto {
    id: string
    date: string
    branding: MakeupPDFBrandDto
    client: MakeupPDFClientDto
    business: MakeupPDFBusinessDto
    total: number
    subtotal: number
    tax_value: number
    tax_percent: number
    surcharge_value: number
    surcharge_percent: number
    observations: string
    payment_instructions: string
    RGPD: string
    verifactu_qr?: string
    type: 'invoice' | 'budget' | 'proforma'
    template: string
    concepts?: MakeupPDFConceptDto[]
}
