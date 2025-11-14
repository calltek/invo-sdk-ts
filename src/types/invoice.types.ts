/**
 * Invoice types
 *
 * Note: Most invoice types are auto-generated from Swagger in api.types.ts
 * This file contains only custom types not available in the API spec
 */

/**
 * Invoice creation result
 */
export interface CreateInvoiceResult {
    success: boolean
    invoiceId: string
    chainIndex: number
}
