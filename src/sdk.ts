import { mapCreateInvoiceDto, rectifiedAmountsFrom } from './compat'
import { InvoConfigError, InvoNotAvailableError } from './errors'
import { HttpClient, type HttpMethod } from './http'
import type {
    CreateInvoiceDto,
    CreateInvoiceResult,
    InvoiceReaderResult,
    MakeupPDFDto,
    UserDto,
} from './types/legacy.types'
import type { InvoDebugLogger, InvoSDKConfig, RequestOptions } from './types/sdk.types'
import { VerifactuClient } from './verifactu'
import { DEFAULT_BASE_URL } from './version'

const API_KEY_PREFIX = 'ogk_'
const INVO_TOKEN_PREFIX = 'invo_tok_'

function resolveApiKey(config: InvoSDKConfig): string {
    const key = (config.apiKey ?? config.apiToken ?? '').trim()
    if (!key) {
        throw new InvoConfigError(
            'An ORUGA API key is required: new InvoSDK({ apiKey: "ogk_..." })',
        )
    }
    if (key.startsWith(INVO_TOKEN_PREFIX)) {
        throw new InvoConfigError(
            'INVO API tokens (invo_tok_...) no longer work: @calltek/invo-sdk v1 talks to the ORUGA API. ' +
                'Create an API key (ogk_...) with the verifactu scopes in your ORUGA workspace and pass it as apiKey.',
        )
    }
    if (!key.startsWith(API_KEY_PREFIX)) {
        throw new InvoConfigError('Invalid API key: ORUGA API keys start with "ogk_"')
    }
    return key
}

function resolveDebug(debug: InvoSDKConfig['debug']): InvoDebugLogger | undefined {
    if (!debug) return undefined
    if (typeof debug === 'function') return debug
    return (message, meta) => console.debug(message, meta ?? '')
}

const notAvailable = (method: string, hint: string) =>
    new InvoNotAvailableError(`InvoSDK.${method}() is not available in @calltek/invo-sdk v1. ${hint}`)

/**
 * SDK for the ORUGA VERI*FACTU API.
 *
 * @example
 * ```typescript
 * const sdk = new InvoSDK({ apiKey: process.env.ORUGA_API_KEY! })
 *
 * // v0-compatible
 * const { invoiceId, chainIndex } = await sdk.store({ ...camelCaseInvoice })
 *
 * // v1 API (snake_case, 1:1 with the backend)
 * const invoice = await sdk.verifactu.invoices.create({ ... })
 * const qr = await sdk.verifactu.invoices.qr(invoice.id)
 * ```
 */
export class InvoSDK {
    /** VERI*FACTU API: invoices, records, taxpayers, errors and webhook. */
    readonly verifactu: VerifactuClient

    /**
     * v0 property. In v1 it only selects the taxpayer environment used by
     * `store()` when resolving `emitterTaxId` (it does not change the URL).
     * `undefined` unless configured.
     */
    environment: 'production' | 'sandbox' | 'test' | undefined

    private readonly http: HttpClient
    private readonly hasApiKey: boolean

    constructor(config: InvoSDKConfig) {
        if (!config || typeof config !== 'object') {
            throw new InvoConfigError('InvoSDK needs a config object: new InvoSDK({ apiKey })')
        }
        if (
            config.environment !== undefined &&
            !['production', 'sandbox', 'test'].includes(config.environment)
        ) {
            throw new InvoConfigError(
                'Invalid environment. Allowed values are production, sandbox (= test), test.',
            )
        }

        const apiKey = resolveApiKey(config)
        this.hasApiKey = true
        this.environment = config.environment

        this.http = new HttpClient({
            apiKey,
            baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
            timeout: config.timeout ?? 30_000,
            maxRetries: Math.max(0, config.maxRetries ?? 3),
            retryBaseDelay: config.retryBaseDelay ?? 500,
            maxRetryDelay: config.maxRetryDelay ?? 60_000,
            fetch: config.fetch,
            debug: resolveDebug(config.debug),
            onError: config.onError,
        })
        this.verifactu = new VerifactuClient(this.http)
    }

    /** Base URL of the API (v0 name). */
    get apiUrl(): string {
        return this.http.baseUrl
    }

    /**
     * Create and submit an invoice — v0 signature and DTO, mapped to
     * `POST /verifactu/invoices` (see `src/compat.ts` for the field mapping).
     *
     * @param data - v0 invoice DTO (camelCase)
     * @param callback - Optional webhook URL for this invoice's status updates
     * @param options - v1: `idempotencyKey`, `signal`, `timeout`…
     * @returns `{ success, invoiceId, chainIndex }` as in v0, plus the full `invoice`
     *
     * @example
     * ```typescript
     * const result = await sdk.store({
     *   issueDate: '2026-10-21',
     *   invoiceNumber: 'FAC-2026-001',
     *   externalId: 'order-12345',
     *   totalAmount: 121,
     *   customerName: 'Cliente SL',
     *   customerTaxId: 'B12345678',
     *   emitterTaxId: 'B87654321',
     *   taxLines: [{ taxRate: 21, baseAmount: 100, taxAmount: 21 }],
     * }, 'https://myapp.com/webhooks/verifactu')
     * ```
     */
    async store(
        data: CreateInvoiceDto,
        callback?: string,
        options?: RequestOptions,
    ): Promise<CreateInvoiceResult> {
        const body = mapCreateInvoiceDto(data, { callback, environment: this.environment })

        // INVO computed ImporteRectificacion itself for rectifications by
        // substitution; ORUGA needs it in the body, so the SDK computes it the
        // same way from the rectified invoices when the caller did not send it.
        if (
            body.rectification_type === 'S' &&
            !body.rectified_amounts &&
            body.rectified_invoices?.length
        ) {
            const rectified = await Promise.all(
                body.rectified_invoices.map((ref) =>
                    this.verifactu.invoices.get(ref.invoice_id as number, {
                        signal: options?.signal,
                        timeout: options?.timeout,
                    }),
                ),
            )
            body.rectified_amounts = rectifiedAmountsFrom(rectified)
        }

        const invoice = await this.verifactu.invoices.create(body, options)
        return {
            success: true,
            invoiceId: String(invoice.id),
            chainIndex: invoice.chain_index as number,
            invoice,
        }
    }

    /**
     * Generic request to any endpoint of the API, relative to `baseUrl`
     * (e.g. `/verifactu/taxpayers`). Note that v0 INVO paths (`/invoice/store`…)
     * do not exist in ORUGA.
     */
    async request<T>(
        endpoint: string,
        method: HttpMethod = 'GET',
        body?: unknown,
        options?: RequestOptions,
    ): Promise<T> {
        return this.http.request<T>({
            ...options,
            method,
            path: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
            body,
        })
    }

    // ========================================================================
    // v0 methods removed in v1
    // ========================================================================

    /**
     * @deprecated Not available in v1: the AI invoice reader is not part of the
     * ORUGA VERI*FACTU API. Always throws `InvoNotAvailableError`.
     */
    async read(_file: File | Blob): Promise<InvoiceReaderResult> {
        throw notAvailable('read', 'The AI invoice reader was an INVO feature and has not been ported to ORUGA.')
    }

    /**
     * @deprecated Not available in v1: ORUGA does not render third-party PDFs.
     * Print the QR on your own PDF with `sdk.verifactu.invoices.qr(id)` (or
     * `qrSvg`). Always throws `InvoNotAvailableError`.
     */
    async pdf(_data: MakeupPDFDto): Promise<ArrayBuffer> {
        throw notAvailable(
            'pdf',
            'Render the PDF in your system and print the VERI*FACTU QR from sdk.verifactu.invoices.qr(invoiceId).',
        )
    }

    /**
     * @deprecated v1 sends the API key directly; there is no access token.
     * Always returns `null` (it never exposes the API key).
     */
    getAccessToken(): string | null {
        return null
    }

    /** @deprecated There is no user session with an API key. Always returns `null`. */
    getUser(): UserDto | null {
        return null
    }

    /**
     * @deprecated There is no session in v1. Returns `true` when an API key is
     * configured; it does not check that the key is valid (any call will).
     */
    isAuthenticated(): boolean {
        return this.hasApiKey
    }
}
