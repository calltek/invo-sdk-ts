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

// API Token types
export interface CreateApiTokenDto {
    name: string
    expires_in?: number
    scopes?: string[]
}

export interface ApiTokenResponse {
    id: string
    token: string
    name: string
    scopes?: string[]
    created_at: string
    expires_at?: string
    is_active: boolean
}

export interface ApiTokenListItem {
    id: string
    prefix: string
    name: string
    scopes?: string[]
    created_at: string
    expires_at?: string
    last_used_at?: string
    last_used_ip?: string
    is_active: boolean
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
