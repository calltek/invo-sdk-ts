/**
 * HTTP client: native fetch, Bearer API key, per-attempt timeout, automatic
 * Idempotency-Key, retries with exponential backoff (honouring Retry-After) and
 * typed errors. Zero runtime dependencies.
 */

import { randomUUID } from 'node:crypto'
import {
    InvoApiError,
    type InvoApiErrorInit,
    InvoAuthError,
    InvoNetworkError,
    InvoRateLimitError,
    InvoTimeoutError,
} from './errors'
import type { InvoDebugLogger, RequestOptions } from './types/sdk.types'
import { SDK_VERSION } from './version'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequest extends RequestOptions {
    method: HttpMethod
    /** Path relative to the base URL, e.g. `/verifactu/invoices`. */
    path: string
    query?: object
    /** JSON-serialisable value, or a FormData (multipart). */
    body?: unknown
    /** How to read a successful response. @default 'json' */
    responseType?: 'json' | 'text' | 'arrayBuffer'
    /** Send an `Idempotency-Key` (generated if the caller did not pass one). */
    idempotent?: boolean
    /** Safe to retry even if the method is not idempotent (e.g. a read-only POST /search). */
    retryable?: boolean
}

export interface HttpResponse<T> {
    data: T
    status: number
    headers: Headers
    requestId: string | null
    /** `Idempotent-Replayed: true`: the API returned the stored response of an earlier request. */
    replayed: boolean
}

export interface HttpClientConfig {
    apiKey: string
    baseUrl: string
    timeout: number
    maxRetries: number
    retryBaseDelay: number
    maxRetryDelay: number
    fetch?: typeof fetch
    debug?: InvoDebugLogger
    onError?: (error: Error) => void
}

const IDEMPOTENT_METHODS: ReadonlySet<HttpMethod> = new Set(['GET', 'PUT', 'DELETE'])

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** `Retry-After`: delta-seconds or an HTTP date. Returns seconds, or null. */
export function parseRetryAfter(value: string | null, now = Date.now()): number | null {
    if (value == null || value.trim() === '') return null
    const seconds = Number(value)
    if (Number.isFinite(seconds)) return Math.max(0, seconds)
    const date = Date.parse(value)
    if (Number.isNaN(date)) return null
    return Math.max(0, Math.ceil((date - now) / 1000))
}

function buildQuery(query: object | undefined): string {
    if (!query) return ''
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue
        params.append(key, String(value))
    }
    const text = params.toString()
    return text ? `?${text}` : ''
}

function isFormData(body: unknown): body is FormData {
    return typeof FormData !== 'undefined' && body instanceof FormData
}

export class HttpClient {
    constructor(private readonly config: HttpClientConfig) {}

    get baseUrl(): string {
        return this.config.baseUrl
    }

    async request<T>(req: HttpRequest): Promise<T> {
        return (await this.requestWithResponse<T>(req)).data
    }

    async requestWithResponse<T>(req: HttpRequest): Promise<HttpResponse<T>> {
        try {
            return await this.execute<T>(req)
        } catch (error) {
            this.config.onError?.(error as Error)
            throw error
        }
    }

    private async execute<T>(req: HttpRequest): Promise<HttpResponse<T>> {
        const url = `${this.config.baseUrl}${req.path}${buildQuery(req.query)}`
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'User-Agent': `invo-sdk-ts/${SDK_VERSION}`,
            ...req.headers,
            Authorization: `Bearer ${this.config.apiKey}`,
        }

        const idempotencyKey =
            req.idempotencyKey ?? (req.idempotent ? randomUUID() : undefined)
        if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

        let body: string | FormData | undefined
        if (req.body !== undefined) {
            if (isFormData(req.body)) {
                body = req.body // fetch sets the multipart boundary
            } else {
                headers['Content-Type'] = 'application/json'
                body = JSON.stringify(req.body)
            }
        }

        const canRetry =
            IDEMPOTENT_METHODS.has(req.method) || !!idempotencyKey || !!req.retryable
        const maxRetries = canRetry ? (req.maxRetries ?? this.config.maxRetries) : 0
        const timeout = req.timeout ?? this.config.timeout

        for (let attempt = 0; ; attempt++) {
            const started = Date.now()
            this.log(`→ ${req.method} ${url}`, {
                attempt: attempt + 1,
                ...(idempotencyKey ? { idempotencyKey } : {}),
                ...(body !== undefined
                    ? { body: isFormData(body) ? '[FormData]' : req.body }
                    : {}),
            })

            let response: Response
            try {
                response = await this.fetchWithTimeout(url, {
                    method: req.method,
                    headers,
                    body,
                    timeout,
                    signal: req.signal,
                })
            } catch (error) {
                const networkError =
                    error instanceof InvoNetworkError
                        ? error
                        : new InvoNetworkError(
                              error instanceof Error ? error.message : 'Network request failed',
                              error,
                          )
                this.log(`✗ ${req.method} ${url}`, {
                    attempt: attempt + 1,
                    error: networkError.message,
                    ms: Date.now() - started,
                })
                const aborted = req.signal?.aborted === true
                if (!aborted && attempt < maxRetries) {
                    await sleep(this.backoff(attempt))
                    continue
                }
                throw networkError
            }

            const requestId =
                response.headers.get('x-correlation-id') ?? response.headers.get('x-request-id')
            this.log(`← ${response.status} ${req.method} ${url}`, {
                attempt: attempt + 1,
                ms: Date.now() - started,
                ...(requestId ? { requestId } : {}),
                ...(response.headers.get('idempotent-replayed') ? { replayed: true } : {}),
            })

            if (response.ok) {
                return {
                    data: await this.readBody<T>(response, req.responseType ?? 'json'),
                    status: response.status,
                    headers: response.headers,
                    requestId,
                    replayed: response.headers.get('idempotent-replayed') === 'true',
                }
            }

            const apiError = await this.toApiError(response, requestId)
            const retryableStatus = response.status === 429 || response.status >= 500
            if (retryableStatus && attempt < maxRetries) {
                const wait =
                    apiError.retryAfter != null
                        ? apiError.retryAfter * 1000
                        : this.backoff(attempt)
                if (wait <= this.config.maxRetryDelay) {
                    await sleep(wait)
                    continue
                }
            }
            throw apiError
        }
    }

    /** Exponential backoff with jitter: base·2^attempt + [0, base). */
    private backoff(attempt: number): number {
        const base = this.config.retryBaseDelay
        return Math.min(base * 2 ** attempt + Math.random() * base, this.config.maxRetryDelay)
    }

    private async fetchWithTimeout(
        url: string,
        init: {
            method: string
            headers: Record<string, string>
            body?: string | FormData
            timeout: number
            signal?: AbortSignal
        },
    ): Promise<Response> {
        const fetchImpl = this.config.fetch ?? globalThis.fetch
        if (typeof fetchImpl !== 'function') {
            throw new InvoNetworkError('fetch is not available: use Node >= 18 or pass config.fetch')
        }

        const controller = new AbortController()
        let timedOut = false
        const timer =
            init.timeout > 0
                ? setTimeout(() => {
                      timedOut = true
                      controller.abort()
                  }, init.timeout)
                : undefined
        const onAbort = () => controller.abort()
        if (init.signal) {
            if (init.signal.aborted) controller.abort()
            else init.signal.addEventListener('abort', onAbort, { once: true })
        }

        try {
            return await fetchImpl(url, {
                method: init.method,
                headers: init.headers,
                body: init.body,
                signal: controller.signal,
            })
        } catch (error) {
            if (timedOut) throw new InvoTimeoutError(init.timeout, error)
            if (init.signal?.aborted) throw new InvoNetworkError('Request aborted', error)
            throw error
        } finally {
            if (timer) clearTimeout(timer)
            init.signal?.removeEventListener('abort', onAbort)
        }
    }

    private async readBody<T>(
        response: Response,
        type: 'json' | 'text' | 'arrayBuffer',
    ): Promise<T> {
        if (type === 'arrayBuffer') return (await response.arrayBuffer()) as T
        const text = await response.text()
        if (type === 'text') return text as T
        if (!text) return undefined as T
        try {
            return JSON.parse(text) as T
        } catch {
            return text as T
        }
    }

    private async toApiError(response: Response, requestId: string | null): Promise<InvoApiError> {
        const text = await response.text().catch(() => '')
        let parsed: Record<string, unknown> | null = null
        try {
            const value = text ? JSON.parse(text) : null
            if (value && typeof value === 'object') parsed = value as Record<string, unknown>
        } catch {
            // not JSON (proxy or load balancer page)
        }

        const errors = Array.isArray(parsed?.errors) ? (parsed?.errors as unknown[]) : undefined
        let message =
            typeof parsed?.message === 'string' && parsed.message
                ? parsed.message
                : response.statusText || `HTTP ${response.status}`
        if (errors?.length) {
            message += ` - ${errors.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join('; ')}`
        }

        const init: InvoApiErrorInit = {
            status: response.status,
            code:
                typeof parsed?.code === 'string' && parsed.code
                    ? parsed.code
                    : `HTTP_${response.status}`,
            message,
            requestId,
            retryAfter: parseRetryAfter(response.headers.get('retry-after')),
            errors,
            details:
                parsed?.details && typeof parsed.details === 'object'
                    ? (parsed.details as Record<string, unknown>)
                    : undefined,
            body: parsed ?? (text || undefined),
        }

        if (response.status === 401 || response.status === 403) return new InvoAuthError(init)
        if (response.status === 429) return new InvoRateLimitError(init)
        return new InvoApiError(init)
    }

    private log(message: string, meta?: Record<string, unknown>) {
        this.config.debug?.(`[invo-sdk] ${message}`, meta)
    }
}
