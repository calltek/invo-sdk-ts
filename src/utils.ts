/**
 * v0 JWT helpers. The v1 SDK sends the ORUGA API key directly and never handles
 * JWTs; these stay exported only so v0 imports keep compiling.
 */

import type { DecodedToken } from './types/legacy.types'
import { InvalidTokenError } from './errors'

/** @deprecated Not used by the SDK since v1. */
export function decodeJWT(token: string): DecodedToken {
    try {
        const base64Url = token.split('.')[1]
        if (!base64Url) {
            throw new InvalidTokenError('Invalid token format')
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        )

        return JSON.parse(jsonPayload) as DecodedToken
    } catch {
        throw new InvalidTokenError('Failed to decode token')
    }
}

/** @deprecated Not used by the SDK since v1. */
export function isTokenExpired(token: string, bufferSeconds = 0): boolean {
    try {
        const decoded = decodeJWT(token)
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp < currentTime + bufferSeconds
    } catch {
        return true
    }
}

/** @deprecated Not used by the SDK since v1. */
export function getSecondsUntilExpiration(token: string): number {
    try {
        const decoded = decodeJWT(token)
        const currentTime = Math.floor(Date.now() / 1000)
        return Math.max(0, decoded.exp - currentTime)
    } catch {
        return 0
    }
}

/** @deprecated Not used by the SDK since v1. */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
