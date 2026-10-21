import { describe, expect, it } from 'vitest'
import {
    type CreateInvoiceDto,
    InvoNotAvailableError,
    InvoValidationError,
    mapCreateInvoiceDto,
} from '../src'
import { sumDecimals, toDecimalString, toIssueDate, toRecipient } from '../src/compat'
import { invoiceResponse, json, makeSdk, mockFetch } from './helpers'

/** A v0 store() DTO as copyexpress/vcs send it today. */
const v0Invoice: CreateInvoiceDto = {
    issueDate: '2026-10-21T09:15:00.000Z',
    invoiceNumber: 'FAC-2026-001',
    externalId: 'order-12345',
    totalAmount: 1210,
    currency: 'EUR',
    customerName: 'Cliente SL',
    customerTaxId: 'b12345678',
    emitterName: 'Mi Empresa SL',
    emitterTaxId: 'B75700005',
    description: 'Servicios de consultoría',
    taxLines: [{ taxRate: 21, baseAmount: 1000, taxAmount: 210 }],
}

describe('store() compatibility mapping', () => {
    it('maps the v0 DTO to the v1 snake_case body', () => {
        expect(mapCreateInvoiceDto(v0Invoice, { callback: 'https://erp.example.com/hook' })).toEqual({
            issuer_nif: 'B75700005',
            invoice_number: 'FAC-2026-001',
            issue_date: '2026-10-21T09:15:00.000Z',
            description: 'Servicios de consultoría',
            recipients: [{ name: 'Cliente SL', nif: 'B12345678' }],
            tax_lines: [{ tax_rate: '21', base: '1000.00', tax_amount: '210.00' }],
            total: '1210.00',
            external_id: 'order-12345',
            callback_url: 'https://erp.example.com/hook',
        })
    })

    it('maps every optional field', () => {
        const body = mapCreateInvoiceDto(
            {
                ...v0Invoice,
                type: 'R1',
                rectificationType: 'I',
                rectifiedInvoiceIds: ['17', 18],
                simplifiedQualified: true,
                billingAgreementNumber: 'ACU-1',
                callback: 'https://dto.example.com/hook',
                operationDate: '2026-10-20',
                taxLines: [
                    {
                        taxType: '04',
                        taxRate: 5.2,
                        baseAmount: 100,
                        taxAmount: 5.2,
                        surchargeRate: 0.62,
                        surchargeAmount: 0.62,
                        regimeKey: '01',
                        operationType: 'S1',
                    },
                    { taxType: '03', taxRate: 0, baseAmount: 50, taxAmount: 0, taxExemptionReason: 'E5' },
                ],
            },
            { environment: 'sandbox' },
        )
        expect(body).toMatchObject({
            environment: 'test',
            invoice_type: 'R1',
            rectification_type: 'I',
            rectified_invoices: [{ invoice_id: 17 }, { invoice_id: 18 }],
            simplified_art_7273: true,
            billing_agreement_number: 'ACU-1',
            callback_url: 'https://dto.example.com/hook',
            operation_date: '2026-10-20',
            tax_lines: [
                {
                    tax_type: '05', // INVO "04 Otros" → AEAT 05
                    regime_key: '01',
                    operation: 'S1',
                    tax_rate: '5.2',
                    base: '100.00',
                    tax_amount: '5.20',
                    surcharge_rate: '0.62',
                    surcharge_amount: '0.62',
                },
                { tax_type: '03', operation: 'E5', tax_rate: '0', base: '50.00', tax_amount: '0.00' },
            ],
        })
    })

    it('maps environment production → production, and omits it when not configured', () => {
        expect(mapCreateInvoiceDto(v0Invoice, { environment: 'production' }).environment).toBe(
            'production',
        )
        expect(mapCreateInvoiceDto(v0Invoice).environment).toBeUndefined()
        expect(
            mapCreateInvoiceDto({ ...v0Invoice, taxpayerId: 1 }, { environment: 'production' }),
        ).toMatchObject({ taxpayer_id: 1, issuer_nif: 'B75700005' })
    })

    it('maps a foreign VAT number to IDOtro 02 and an ES-prefixed one to a NIF', () => {
        expect(toRecipient('GmbH', 'DE123456789')).toEqual({ name: 'GmbH', id_type: '02', id: 'DE123456789' })
        expect(toRecipient('SL', 'ES B12345678')).toEqual({ name: 'SL', nif: 'B12345678' })
        expect(toRecipient('Persona', '12345678-z')).toEqual({ name: 'Persona', nif: '12345678Z' })
    })

    it('omits recipients for F2 without customer', () => {
        const body = mapCreateInvoiceDto({
            ...v0Invoice,
            type: 'F2',
            customerName: '',
            customerTaxId: '',
        })
        expect(body.recipients).toBeUndefined()
        expect(body.invoice_type).toBe('F2')
    })

    it('cleans floating point noise in amounts', () => {
        expect(toDecimalString(0.1 + 0.2, 'x')).toBe('0.30')
        expect(toDecimalString(-12.5, 'x')).toBe('-12.50')
        expect(toDecimalString(1210.0000000001, 'x')).toBe('1210.00')
        expect(toDecimalString(19.99 * 3, 'x')).toBe('59.97')
        expect(toDecimalString(1.234, 'x')).toBe('1.234') // real precision: the API decides
        expect(toDecimalString('121.00', 'x')).toBe('121.00')
        expect(toDecimalString(21, 'x', 'trim')).toBe('21')
        expect(toDecimalString(-0.001, 'x')).toBe('-0.001')
    })

    it('normalises issue dates', () => {
        expect(toIssueDate('2026-10-21')).toBe('2026-10-21')
        expect(toIssueDate('2026-10-21T23:30:00+02:00')).toBe('2026-10-21T23:30:00+02:00')
        expect(toIssueDate('2026-10-21T10:30:00')).toBe('2026-10-21')
        expect(() => toIssueDate('21/10/2026')).toThrow(InvoValidationError)
    })

    it('rejects what cannot be mapped', () => {
        expect(() => mapCreateInvoiceDto({ ...v0Invoice, currency: 'USD' })).toThrow(/EUR/)
        expect(() =>
            mapCreateInvoiceDto({
                ...v0Invoice,
                type: 'R1',
                rectifiedInvoiceIds: ['550e8400-e29b-41d4-a716-446655440000'],
            }),
        ).toThrow(/INVO UUIDs/)
        expect(() =>
            mapCreateInvoiceDto({
                ...v0Invoice,
                taxLines: [{ taxRate: 0, baseAmount: 1, taxAmount: 0, taxExemptionReason: 'E1', operationType: 'N1' }],
            }),
        ).toThrow(/mutually exclusive/)
        expect(() => mapCreateInvoiceDto({ ...v0Invoice, taxLines: [] })).toThrow(InvoValidationError)
    })

    it('adds decimals exactly', () => {
        expect(sumDecimals(['0.10', '0.20', null, '-1.5'])).toBe('-1.20')
        expect(sumDecimals([])).toBe('0.00')
    })
})

describe('store()', () => {
    it('posts the mapped body and returns the v0 result shape plus the invoice', async () => {
        const { fetch, calls } = mockFetch(() => json(invoiceResponse({ id: 77, chain_index: 12 }), 201))
        const sdk = makeSdk(fetch, { environment: 'sandbox' })
        const result = await sdk.store(v0Invoice, 'https://erp.example.com/hook')

        expect(calls).toHaveLength(1)
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/invoices')
        expect(calls[0].method).toBe('POST')
        expect(calls[0].headers['idempotency-key']).toBeTruthy()
        expect(calls[0].body).toMatchObject({
            issuer_nif: 'B75700005',
            environment: 'test',
            total: '1210.00',
            callback_url: 'https://erp.example.com/hook',
        })
        expect(result).toEqual({
            success: true,
            invoiceId: '77',
            chainIndex: 12,
            invoice: expect.objectContaining({ id: 77 }),
        })
    })

    it('computes ImporteRectificacion for a substitution like INVO did', async () => {
        const original = {
            ...invoiceResponse({ id: 17 }),
            records: [
                { record_type: 'alta', chain_index: 3, tax_lines: [{ base: '50.00', tax_amount: '10.50', surcharge_amount: null }] },
                { record_type: 'alta', chain_index: 5, tax_lines: [
                    { base: '100.00', tax_amount: '21.00', surcharge_amount: '5.20' },
                    { base: '10.00', tax_amount: '1.00', surcharge_amount: null },
                ] },
                { record_type: 'anulacion', chain_index: 6, tax_lines: [] },
            ],
        }
        const { fetch, calls } = mockFetch(
            () => json(original),
            () => json(invoiceResponse({ id: 99, invoice_type: 'R1' }), 201),
        )
        await makeSdk(fetch).store({
            ...v0Invoice,
            type: 'R1',
            rectificationType: 'S',
            rectifiedInvoiceIds: ['17'],
        })
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/invoices/17')
        expect(calls[1].body).toMatchObject({
            rectified_invoices: [{ invoice_id: 17 }],
            rectified_amounts: { base: '110.00', tax: '22.00', surcharge: '5.20' },
        })
    })

    it('uses rectifiedAmounts when given (no extra request)', async () => {
        const { fetch, calls } = mockFetch(() => json(invoiceResponse(), 201))
        await makeSdk(fetch).store({
            ...v0Invoice,
            type: 'R1',
            rectificationType: 'S',
            rectifiedInvoiceIds: [17],
            rectifiedAmounts: { base: 100, tax: 21 },
        })
        expect(calls).toHaveLength(1)
        expect(calls[0].body).toMatchObject({ rectified_amounts: { base: '100.00', tax: '21.00' } })
    })
})

describe('deprecated v0 methods', () => {
    it('read() and pdf() throw a descriptive error', async () => {
        const { fetch, calls } = mockFetch(() => json({}))
        const sdk = makeSdk(fetch)
        await expect(sdk.read(new Blob(['x']))).rejects.toBeInstanceOf(InvoNotAvailableError)
        await expect(sdk.pdf({} as never)).rejects.toThrow(/not available in @calltek\/invo-sdk v1/)
        expect(calls).toHaveLength(0)
    })

    it('session helpers no longer expose tokens', () => {
        const sdk = makeSdk(mockFetch(() => json({})).fetch)
        expect(sdk.getAccessToken()).toBeNull()
        expect(sdk.getUser()).toBeNull()
        expect(sdk.isAuthenticated()).toBe(true)
    })

    it('request() is relative to the base URL', async () => {
        const { fetch, calls } = mockFetch(() => json({ data: [], total_items: 0 }))
        await makeSdk(fetch).request('verifactu/taxpayers')
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/taxpayers')
    })
})
