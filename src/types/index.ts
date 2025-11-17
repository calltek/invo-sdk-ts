/**
 * Type exports
 */

export interface DecodedToken {
    sub: string
    email: string
    exp: number
    iat: number
    [key: string]: unknown
}
export interface CreateInvoiceResult {
    success: boolean
    invoiceId: string
    chainIndex: number
}
// SDK types
export type { InvoSDKConfig } from './sdk.types'

// Auto-generated API types
export type {
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
} from './api.types'
