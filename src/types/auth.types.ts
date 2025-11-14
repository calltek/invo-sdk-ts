/**
 * Authentication types
 *
 * Note: Most auth types are auto-generated from Swagger in api.types.ts
 * This file contains only custom types not available in the API spec
 */

/**
 * User information
 */
export interface User {
    id: string
    email: string
}

/**
 * Decoded JWT payload
 */
export interface DecodedToken {
    sub: string
    email: string
    exp: number
    iat: number
    [key: string]: unknown
}
