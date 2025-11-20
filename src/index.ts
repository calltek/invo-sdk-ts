/**
 * INVO SDK
 *
 * Backend SDK for INVO API - Authentication and Invoice Management
 *
 */

// Main SDK
export { createInvoSDK, createInvoSDKWithToken, InvoSDK } from './sdk.js'

// Types
export type {
    // SDK Config
    InvoSDKConfig,
    // Custom types
    DecodedToken,
    CreateInvoiceResult,
    // Auto-generated API types
    UserDto,
    LoginDto,
    LoginResponseDto,
    OAuthCallbackDto,
    InvoiceTaxLineDto,
    CreateInvoiceDto,
    UpdateBatchStatusDto,
    MakeupPDFDto,
    MakeupPDFBrandDto,
    MakeupPDFClientDto,
    MakeupPDFBusinessDto,
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
export { decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail } from './utils.js'
