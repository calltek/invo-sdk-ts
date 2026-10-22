/**
 * SDK configuration types
 */

/** Debug logger: receives a message and some metadata (never the API key). */
export type OrugaDebugLogger = (message: string, meta?: Record<string, unknown>) => void

export interface OrugaSDKConfig {
    /**
     * ORUGA API key (`ogk_…`), created in ORUGA for your workspace with the
     * scopes you need (e.g. `verifactu_*`). Sent as `Authorization: Bearer ogk_…`.
     * The workspace is the key's: no workspace header is needed.
     */
    apiKey: string

    /**
     * Base URL of the ORUGA API, including the version prefix.
     * @default 'https://api.oru.ga/v1'
     */
    baseUrl?: string

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
    debug?: boolean | OrugaDebugLogger

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
