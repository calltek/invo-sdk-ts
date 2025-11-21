/**
 * INVO SDK
 *
 * Backend SDK for INVO API - Authentication and Invoice Management
 *
 * @example
 * ```typescript
 * import { InvoSDK } from '@calltek/invo-sdk'
 *
 * // Initialize with API token
 * const sdk = new InvoSDK({ apiToken: 'invo_tok_prod_...' })
 *
 * // Use directly - authentication is automatic
 * const invoice = await sdk.createInvoice({...})
 * ```
 */

// Main SDK
export { InvoSDK } from './sdk'

// Types
export type {
    // SDK Config
    InvoSDKConfig,
    // Custom types
    DecodedToken,
    CreateInvoiceResult,
    InvoiceReaderResult,
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
export { decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail } from './utils'
