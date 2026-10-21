/**
 * Errors thrown by the SDK.
 *
 *   InvoError                     root of everything the SDK throws
 *   ├─ InvoConfigError            bad configuration (missing key, INVO token…)
 *   ├─ InvoValidationError        store() input that cannot be mapped to v1
 *   ├─ InvoNotAvailableError      v0 methods removed in v1 (read, pdf)
 *   └─ AuthError                  (v0 name, kept so `instanceof AuthError` still works)
 *      ├─ InvoApiError            the API answered with an error ({ status, code, message })
 *      │  ├─ InvoAuthError        401 / 403
 *      │  └─ InvoRateLimitError   429
 *      └─ InvoNetworkError        no response (DNS, connection, abort)
 *         └─ InvoTimeoutError     the request timed out
 */

import type { ApiErrorBody } from './types/verifactu.types'

export class InvoError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvoError'
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class InvoConfigError extends InvoError {
    constructor(message: string) {
        super(message)
        this.name = 'InvoConfigError'
    }
}

export class InvoValidationError extends InvoError {
    constructor(message: string) {
        super(message)
        this.name = 'InvoValidationError'
    }
}

export class InvoNotAvailableError extends InvoError {
    constructor(message: string) {
        super(message)
        this.name = 'InvoNotAvailableError'
    }
}

/**
 * v0 base class of API and network errors. Kept (with `statusCode`) so v0
 * `catch (e) { if (e instanceof AuthError) … }` blocks keep working.
 * New code should check `InvoApiError` / `InvoNetworkError`.
 */
export class AuthError extends InvoError {
    constructor(
        message: string,
        public statusCode?: number,
    ) {
        super(message)
        this.name = 'AuthError'
    }
}

export interface InvoApiErrorInit {
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
export class InvoApiError extends AuthError {
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

    constructor(init: InvoApiErrorInit) {
        super(init.message, init.status)
        this.name = 'InvoApiError'
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
export class InvoAuthError extends InvoApiError {
    constructor(init: InvoApiErrorInit) {
        super(init)
        this.name = 'InvoAuthError'
    }
}

/** 429: `RATE_LIMITED` (see `retryAfter`) or `VERIFACTU_BULK_IN_PROGRESS`. */
export class InvoRateLimitError extends InvoApiError {
    constructor(init: InvoApiErrorInit) {
        super(init)
        this.name = 'InvoRateLimitError'
    }
}

/** No response from the API (DNS, connection refused, reset, aborted…). */
export class InvoNetworkError extends AuthError {
    constructor(
        message = 'Network request failed',
        public readonly cause?: unknown,
    ) {
        super(message)
        this.name = 'InvoNetworkError'
    }
}

/** The request did not finish within the timeout. */
export class InvoTimeoutError extends InvoNetworkError {
    constructor(
        public readonly timeoutMs: number,
        cause?: unknown,
    ) {
        super(`Request timed out after ${timeoutMs} ms`, cause)
        this.name = 'InvoTimeoutError'
    }
}

// ============================================================================
// v0 names (deprecated)
// ============================================================================

/** @deprecated v0 name of `InvoNetworkError`. */
export const NetworkError = InvoNetworkError
/** @deprecated v0 name of `InvoNetworkError`. */
export type NetworkError = InvoNetworkError

/** @deprecated v0 name of `InvoAuthError` (401). */
export const InvalidCredentialsError = InvoAuthError
/** @deprecated v0 name of `InvoAuthError` (401). */
export type InvalidCredentialsError = InvoAuthError

/** @deprecated There are no JWTs in v1: never thrown. */
export class TokenExpiredError extends AuthError {
    constructor(message = 'Token has expired') {
        super(message, 401)
        this.name = 'TokenExpiredError'
    }
}

/** @deprecated Only thrown by the deprecated JWT helpers (`decodeJWT`). */
export class InvalidTokenError extends AuthError {
    constructor(message = 'Invalid or malformed token') {
        super(message, 401)
        this.name = 'InvalidTokenError'
    }
}

/** @deprecated There is no OAuth in v1: never thrown. */
export class OAuthError extends AuthError {
    constructor(message = 'OAuth authentication failed') {
        super(message, 401)
        this.name = 'OAuthError'
    }
}
