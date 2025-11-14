/**
 * INVO SDK
 *
 * Backend SDK for INVO API - Authentication and Invoice Management
 *
 */

// Main SDK
export { createInvoSDK, InvoSDK } from './sdk'

// Types
export type {
    // SDK Config
    InvoSDKConfig,
    // Custom types
    User,
    DecodedToken,
    CreateInvoiceResult,
    // Auto-generated API types
    LoginDto,
    LoginResponseDto,
    OAuthCallbackDto,
    InvoiceTaxLineDto,
    CreateInvoiceDto,
    UpdateBatchStatusDto,
} from './types'

// Errors
export {
    AuthError,
    InvalidCredentialsError,
    InvalidTokenError,
    NetworkError,
    OAuthError,
    TokenExpiredError,
} from './errors'

// Utilities
export { decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail } from './utils'
