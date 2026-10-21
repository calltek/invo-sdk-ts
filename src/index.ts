/**
 * @calltek/invo-sdk — SDK for the ORUGA VERI*FACTU API.
 *
 * @example
 * ```typescript
 * import { InvoSDK } from '@calltek/invo-sdk'
 *
 * const sdk = new InvoSDK({ apiKey: process.env.ORUGA_API_KEY! })
 * const invoice = await sdk.verifactu.invoices.create({ ... })
 * ```
 */

// Main SDK
export { InvoSDK } from './sdk'
export { SDK_VERSION, DEFAULT_BASE_URL } from './version'

// VERI*FACTU resources (for typing `sdk.verifactu.*`)
export {
    VerifactuClient,
    VerifactuInvoices,
    VerifactuRecords,
    VerifactuTaxpayers,
    VerifactuRepresentations,
    VerifactuErrors,
    VerifactuWebhook,
} from './verifactu'

// HTTP
export { parseRetryAfter } from './http'
export type { HttpMethod } from './http'

// Webhooks
export {
    verifyWebhookSignature,
    constructWebhookEvent,
    signWebhookPayload,
    WEBHOOK_HEADERS,
} from './webhook'
export type { VerifyWebhookSignatureParams } from './webhook'

// v0 → v1 mapping (exposed for tests and debugging of store())
export { mapCreateInvoiceDto } from './compat'

// Types
export type * from './types'

// Errors
export {
    InvoError,
    InvoConfigError,
    InvoValidationError,
    InvoNotAvailableError,
    InvoApiError,
    InvoAuthError,
    InvoRateLimitError,
    InvoNetworkError,
    InvoTimeoutError,
    // v0 names (deprecated)
    AuthError,
    InvalidCredentialsError,
    InvalidTokenError,
    NetworkError,
    OAuthError,
    TokenExpiredError,
} from './errors'
export type { InvoApiErrorInit } from './errors'

// v0 JWT utilities (deprecated)
export { decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail } from './utils'
