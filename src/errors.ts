/**
 * Errors thrown by the SDK.
 *
 *   OrugaError                     root of everything the SDK throws
 *   ├─ OrugaConfigError            bad configuration (missing or malformed API key…)
 *   ├─ OrugaValidationError        invalid input caught before calling the API
 *   │                              (e.g. an invalid or expired webhook signature)
 *   ├─ OrugaApiError               the API answered with an error ({ status, code, message })
 *   │  ├─ OrugaAuthError           401 / 403
 *   │  └─ OrugaRateLimitError      429
 *   └─ OrugaNetworkError           no response (DNS, connection, abort)
 *      └─ OrugaTimeoutError        the request timed out
 */

import type { ApiErrorBody } from './types/verifactu.types'

export class OrugaError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'OrugaError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class OrugaConfigError extends OrugaError {
    constructor(message: string) {
        super(message)
        this.name = 'OrugaConfigError'
    }
}

export class OrugaValidationError extends OrugaError {
    constructor(message: string) {
        super(message)
        this.name = 'OrugaValidationError'
    }
}

export interface OrugaApiErrorInit {
    status: number
    code: string
    message: string
    requestId?: string | null
    retryAfter?: number | null
    errors?: unknown[]
    details?: Record<string, unknown>
    body?: unknown
}

/** The API answered with an error status. */
export class OrugaApiError extends OrugaError {
    /** HTTP status. */
    readonly status: number
    /** Machine-readable code, e.g. `VERIFACTU_INVOICE_INVALID`, `RATE_LIMITED`. */
    readonly code: string
    /** Correlation id of the request (`X-Correlation-Id`), for support. */
    readonly requestId: string | null
    /** Seconds to wait before retrying (`Retry-After`), when the API sent it. */
    readonly retryAfter: number | null
    /** Validation errors, when the API sent them. */
    readonly errors?: unknown[]
    readonly details?: Record<string, unknown>
    /** Raw error body. */
    readonly body?: unknown

    constructor(init: OrugaApiErrorInit) {
        super(init.message)
        this.name = 'OrugaApiError'
        this.status = init.status
        this.code = init.code
        this.requestId = init.requestId ?? null
        this.retryAfter = init.retryAfter ?? null
        this.errors = init.errors
        this.details = init.details
        this.body = init.body
    }

    /** The error as the API sent it. */
    toJSON(): ApiErrorBody & { requestId: string | null } {
        return {
            status: this.status,
            code: this.code,
            message: this.message,
            ...(this.errors ? { errors: this.errors } : {}),
            ...(this.details ? { details: this.details } : {}),
            requestId: this.requestId,
        }
    }
}

/** 401 (missing, invalid, revoked or expired API key) or 403 (missing scope). */
export class OrugaAuthError extends OrugaApiError {
    constructor(init: OrugaApiErrorInit) {
        super(init)
        this.name = 'OrugaAuthError'
    }
}

/** 429: `RATE_LIMITED` (see `retryAfter`) or `VERIFACTU_BULK_IN_PROGRESS`. */
export class OrugaRateLimitError extends OrugaApiError {
    constructor(init: OrugaApiErrorInit) {
        super(init)
        this.name = 'OrugaRateLimitError'
    }
}

/** No response from the API (DNS, connection refused, reset, aborted…). */
export class OrugaNetworkError extends OrugaError {
    constructor(
        message = 'Network request failed',
        public readonly cause?: unknown,
    ) {
        super(message)
        this.name = 'OrugaNetworkError'
    }
}

/** The request did not finish within the timeout. */
export class OrugaTimeoutError extends OrugaNetworkError {
    constructor(
        public readonly timeoutMs: number,
        cause?: unknown,
    ) {
        super(`Request timed out after ${timeoutMs} ms`, cause)
        this.name = 'OrugaTimeoutError'
    }
}
