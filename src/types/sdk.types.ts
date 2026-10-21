/**
 * SDK configuration types
 */

/** Debug logger: receives a message and some metadata (never the API key). */
export type InvoDebugLogger = (message: string, meta?: Record<string, unknown>) => void

export interface InvoSDKConfig {
    /**
     * ORUGA API key (`ogk_…`), created in ORUGA for your workspace with the
     * `verifactu_*` scopes you need. Sent as `Authorization: Bearer ogk_…`.
     * The workspace is the key's: no workspace header is needed.
     */
    apiKey?: string

    /**
     * Alias of `apiKey`, kept for v0 code. It must hold an ORUGA API key
     * (`ogk_…`): the old INVO tokens (`invo_tok_…`) no longer work.
     * @deprecated Use `apiKey`.
     */
    apiToken?: string

    /**
     * Base URL of the ORUGA API, including the version prefix.
     * @default 'https://api.oru.ga/v1'
     */
    baseUrl?: string

    /**
     * Which AEAT environment `store()` targets when it resolves the taxpayer
     * from `emitterTaxId`: `production`, or `sandbox`/`test` (AEAT
     * pre-production, no fiscal effect). It is only needed when the same NIF is
     * registered as a taxpayer in both environments of your workspace. It does
     * NOT change the URL: in ORUGA the environment belongs to each taxpayer.
     */
    environment?: 'production' | 'sandbox' | 'test'

    /** Per-attempt request timeout in ms. @default 30000 */
    timeout?: number

    /**
     * Retries on 429, 5xx and network errors (only for idempotent requests:
     * GET/PUT/DELETE, searches and writes with an `Idempotency-Key`).
     * @default 3
     */
    maxRetries?: number

    /** Base delay of the exponential backoff, in ms. @default 500 */
    retryBaseDelay?: number

    /** Longest `Retry-After` the SDK waits for before giving up, in ms. @default 60000 */
    maxRetryDelay?: number

    /** Called with every error the SDK throws (after retries). */
    onError?: (error: Error) => void

    /**
     * Debug logging of requests and responses (method, URL, status, timing,
     * request id). The API key is never logged. `true` logs to `console.debug`;
     * pass a function to use your own logger.
     * @default false
     */
    debug?: boolean | InvoDebugLogger

    /** Custom `fetch` implementation (tests, proxies…). @default globalThis.fetch */
    fetch?: typeof fetch
}

/** Per-request options. */
export interface RequestOptions {
    /**
     * `Idempotency-Key` header. Writes that create something (invoice create,
     * bulk, correct, annul) get a random one automatically; pass your own (e.g.
     * derived from your order id) to make retries across processes safe. Same
     * key + same body within 24 h ⇒ the same response, without duplicating.
     */
    idempotencyKey?: string
    /** Abort the request. */
    signal?: AbortSignal
    /** Override the per-attempt timeout (ms). */
    timeout?: number
    /** Override the number of retries. */
    maxRetries?: number
    /** Extra headers. */
    headers?: Record<string, string>
}
