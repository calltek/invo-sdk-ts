/**
 * `sdk.verifactu.*` — the ORUGA VERI*FACTU API (`/v1/verifactu/*`), 1:1 with
 * the backend endpoints and in its snake_case.
 */

import type { HttpClient } from './http'
import type { RequestOptions } from './types/sdk.types'
import type {
    CorrectVerifactuInvoiceInput,
    CreateVerifactuInvoiceInput,
    CreateVerifactuRepresentationInput,
    CreateVerifactuTaxpayerInput,
    ListResponse,
    ListVerifactuErrorsQuery,
    ListVerifactuInvoicesQuery,
    ListVerifactuRecordsQuery,
    ListVerifactuTaxpayersQuery,
    ListVerifactuWebhookDeliveriesQuery,
    RevokeVerifactuRepresentationInput,
    SearchBody,
    UpdateVerifactuTaxpayerInput,
    UpdateVerifactuWebhookInput,
    VerifactuBulkResult,
    VerifactuDocument,
    VerifactuError,
    VerifactuInvoice,
    VerifactuInvoiceDetail,
    VerifactuQr,
    VerifactuRecord,
    VerifactuRecordDetail,
    VerifactuRecordXml,
    VerifactuRepresentation,
    VerifactuTaxpayer,
    VerifactuTaxpayerDeleteResult,
    VerifactuTaxpayerDetail,
    VerifactuWebhookConfig,
    VerifactuWebhookDelivery,
    VerifactuWebhookSecret,
    VerifactuWebhookUpdateResult,
} from './types/verifactu.types'

const id = (value: number) => encodeURIComponent(String(value))

export class VerifactuInvoices {
    constructor(private readonly http: HttpClient) {}

    /**
     * Register an invoice (alta): creates the chained record and queues it for
     * the AEAT. Sends an `Idempotency-Key` (random unless you pass one).
     */
    create(body: CreateVerifactuInvoiceInput, options?: RequestOptions): Promise<VerifactuInvoice> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: '/verifactu/invoices',
            body,
            idempotent: true,
        })
    }

    /**
     * Register up to 50 invoices. Answers 200 even if some fail: check
     * `failed` / `results[].success`. With the Idempotency-Key, each invoice
     * uses `key:index`, so retrying the batch does not duplicate.
     */
    bulk(
        invoices: CreateVerifactuInvoiceInput[],
        options?: RequestOptions,
    ): Promise<VerifactuBulkResult> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: '/verifactu/invoices/bulk',
            body: { invoices },
            idempotent: true,
        })
    }

    list(
        query: ListVerifactuInvoicesQuery = {},
        options?: RequestOptions,
    ): Promise<ListResponse<VerifactuInvoice>> {
        return this.http.request({ ...options, method: 'GET', path: '/verifactu/invoices', query })
    }

    /** Advanced search (filter DSL with `current_record.*` and `taxpayer.*`). */
    search(body: SearchBody = {}, options?: RequestOptions): Promise<ListResponse<VerifactuInvoice>> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: '/verifactu/invoices/search',
            body,
            retryable: true,
        })
    }

    /** The invoice with its record history. */
    get(invoiceId: number, options?: RequestOptions): Promise<VerifactuInvoiceDetail> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/invoices/${id(invoiceId)}`,
        })
    }

    /** Records of the invoice (alta, corrections, annulment). */
    records(invoiceId: number, options?: RequestOptions): Promise<VerifactuRecord[]> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/invoices/${id(invoiceId)}/records`,
        })
    }

    /** QR (`qr_payload` URL + SVG). */
    qr(invoiceId: number, options?: RequestOptions): Promise<VerifactuQr> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/invoices/${id(invoiceId)}/qr`,
        })
    }

    /** QR as an SVG document (`?format=svg`). */
    qrSvg(invoiceId: number, options?: RequestOptions): Promise<string> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/invoices/${id(invoiceId)}/qr`,
            query: { format: 'svg' },
            responseType: 'text',
            headers: { Accept: 'image/svg+xml', ...options?.headers },
        })
    }

    /** Correct (subsanar) the invoice: new chained alta record, same number and date. */
    correct(
        invoiceId: number,
        body: CorrectVerifactuInvoiceInput,
        options?: RequestOptions,
    ): Promise<VerifactuInvoice> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/invoices/${id(invoiceId)}/correct`,
            body,
            idempotent: true,
        })
    }

    /** Annul the invoice (only if the AEAT has it registered). */
    annul(invoiceId: number, options?: RequestOptions): Promise<VerifactuInvoice> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/invoices/${id(invoiceId)}/annul`,
            idempotent: true,
        })
    }
}

export class VerifactuRecords {
    constructor(private readonly http: HttpClient) {}

    list(
        query: ListVerifactuRecordsQuery = {},
        options?: RequestOptions,
    ): Promise<ListResponse<VerifactuRecord>> {
        return this.http.request({ ...options, method: 'GET', path: '/verifactu/records', query })
    }

    search(body: SearchBody = {}, options?: RequestOptions): Promise<ListResponse<VerifactuRecord>> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: '/verifactu/records/search',
            body,
            retryable: true,
        })
    }

    /** Record with tax lines, `is_current`, invoice and errors. */
    get(recordId: number, options?: RequestOptions): Promise<VerifactuRecordDetail> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/records/${id(recordId)}`,
        })
    }

    /** XML sent to and received from the AEAT, for each attempt of the record's batch. */
    xml(recordId: number, options?: RequestOptions): Promise<VerifactuRecordXml> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/records/${id(recordId)}/xml`,
        })
    }

    /** Re-queue a `failed` record (409 `VERIFACTU_RECORD_NOT_RESENDABLE` otherwise). */
    resend(recordId: number, options?: RequestOptions): Promise<VerifactuRecordDetail> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/records/${id(recordId)}/resend`,
        })
    }
}

export class VerifactuRepresentations {
    constructor(private readonly http: HttpClient) {}

    list(taxpayerId: number, options?: RequestOptions): Promise<VerifactuRepresentation[]> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/taxpayers/${id(taxpayerId)}/representations`,
        })
    }

    /** Upload the signed representation model (multipart). It does not count until verified by Calltek. */
    create(
        taxpayerId: number,
        input: CreateVerifactuRepresentationInput,
        options?: RequestOptions,
    ): Promise<VerifactuRepresentation> {
        const { file, filename, ...fields } = input
        const form = new FormData()
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined && value !== null) form.append(key, String(value))
        }
        form.append('file', file, filename ?? 'representation.pdf')
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/taxpayers/${id(taxpayerId)}/representations`,
            body: form,
        })
    }

    /** Platform OWNER only (JWT session): an API key gets 403. */
    verify(
        taxpayerId: number,
        representationId: number,
        options?: RequestOptions,
    ): Promise<VerifactuRepresentation> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/taxpayers/${id(taxpayerId)}/representations/${id(representationId)}/verify`,
        })
    }

    revoke(
        taxpayerId: number,
        representationId: number,
        body: RevokeVerifactuRepresentationInput = {},
        options?: RequestOptions,
    ): Promise<VerifactuRepresentation> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: `/verifactu/taxpayers/${id(taxpayerId)}/representations/${id(representationId)}/revoke`,
            body,
        })
    }

    /** Download the signed model. */
    async document(
        taxpayerId: number,
        representationId: number,
        options?: RequestOptions,
    ): Promise<VerifactuDocument> {
        const response = await this.http.requestWithResponse<ArrayBuffer>({
            ...options,
            method: 'GET',
            path: `/verifactu/taxpayers/${id(taxpayerId)}/representations/${id(representationId)}/document`,
            responseType: 'arrayBuffer',
            headers: { Accept: '*/*', ...options?.headers },
        })
        const disposition = response.headers.get('content-disposition') ?? ''
        const match = /filename="([^"]*)"/.exec(disposition)
        return {
            data: response.data,
            contentType: response.headers.get('content-type'),
            filename: match ? match[1] : null,
        }
    }
}

export class VerifactuTaxpayers {
    /** Signed representation models (Tipo 017) of a taxpayer. */
    readonly representations: VerifactuRepresentations

    constructor(private readonly http: HttpClient) {
        this.representations = new VerifactuRepresentations(http)
    }

    list(
        query: ListVerifactuTaxpayersQuery = {},
        options?: RequestOptions,
    ): Promise<ListResponse<VerifactuTaxpayer>> {
        return this.http.request({ ...options, method: 'GET', path: '/verifactu/taxpayers', query })
    }

    create(body: CreateVerifactuTaxpayerInput, options?: RequestOptions): Promise<VerifactuTaxpayer> {
        return this.http.request({ ...options, method: 'POST', path: '/verifactu/taxpayers', body })
    }

    /** With `has_current_representation` and `can_send`. */
    get(taxpayerId: number, options?: RequestOptions): Promise<VerifactuTaxpayerDetail> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: `/verifactu/taxpayers/${id(taxpayerId)}`,
        })
    }

    /** NIF and environment are fixed once it has records (409 `VERIFACTU_TAXPAYER_LOCKED`). */
    update(
        taxpayerId: number,
        body: UpdateVerifactuTaxpayerInput,
        options?: RequestOptions,
    ): Promise<VerifactuTaxpayer> {
        return this.http.request({
            ...options,
            method: 'PATCH',
            path: `/verifactu/taxpayers/${id(taxpayerId)}`,
            body,
        })
    }

    /** Deletes it if it has no invoices nor representations; otherwise deactivates it. */
    delete(taxpayerId: number, options?: RequestOptions): Promise<VerifactuTaxpayerDeleteResult> {
        return this.http.request({
            ...options,
            method: 'DELETE',
            path: `/verifactu/taxpayers/${id(taxpayerId)}`,
        })
    }
}

export class VerifactuErrors {
    constructor(private readonly http: HttpClient) {}

    /** Errors inbox (`resolved: false` = pending). */
    list(
        query: ListVerifactuErrorsQuery = {},
        options?: RequestOptions,
    ): Promise<ListResponse<VerifactuError>> {
        return this.http.request({ ...options, method: 'GET', path: '/verifactu/errors', query })
    }

    /** Mark as resolved (idempotent). */
    resolve(errorId: number, options?: RequestOptions): Promise<VerifactuError> {
        return this.http.request({
            ...options,
            method: 'PATCH',
            path: `/verifactu/errors/${id(errorId)}/resolve`,
            retryable: true,
        })
    }
}

export class VerifactuWebhook {
    constructor(private readonly http: HttpClient) {}

    /** Current configuration (never the secret). */
    get(options?: RequestOptions): Promise<VerifactuWebhookConfig> {
        return this.http.request({ ...options, method: 'GET', path: '/verifactu/webhook' })
    }

    /** Set URL and/or `active`. The first time it returns `secret` (only that time). */
    update(
        body: UpdateVerifactuWebhookInput,
        options?: RequestOptions,
    ): Promise<VerifactuWebhookUpdateResult> {
        return this.http.request({ ...options, method: 'PUT', path: '/verifactu/webhook', body })
    }

    /** Invalidate the current secret and return the new one (only this time). */
    rotateSecret(options?: RequestOptions): Promise<VerifactuWebhookSecret> {
        return this.http.request({
            ...options,
            method: 'POST',
            path: '/verifactu/webhook/rotate-secret',
        })
    }

    /** Deliveries with attempts and last status code. */
    deliveries(
        query: ListVerifactuWebhookDeliveriesQuery = {},
        options?: RequestOptions,
    ): Promise<ListResponse<VerifactuWebhookDelivery>> {
        return this.http.request({
            ...options,
            method: 'GET',
            path: '/verifactu/webhook/deliveries',
            query,
        })
    }
}

/** `sdk.verifactu` */
export class VerifactuClient {
    readonly invoices: VerifactuInvoices
    readonly records: VerifactuRecords
    readonly taxpayers: VerifactuTaxpayers
    readonly errors: VerifactuErrors
    readonly webhook: VerifactuWebhook

    constructor(http: HttpClient) {
        this.invoices = new VerifactuInvoices(http)
        this.records = new VerifactuRecords(http)
        this.taxpayers = new VerifactuTaxpayers(http)
        this.errors = new VerifactuErrors(http)
        this.webhook = new VerifactuWebhook(http)
    }
}
