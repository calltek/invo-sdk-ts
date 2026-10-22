/**
 * Verification of VERI*FACTU webhook signatures:
 *
 *   X-Oruga-Timestamp: <unix seconds>
 *   X-Oruga-Signature: sha256=<hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`)>
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VerifactuWebhookEvent } from './types/verifactu.types'
import { OrugaValidationError } from './errors'

/** Headers of a webhook delivery (lower-case, as Node exposes them). */
export const WEBHOOK_HEADERS = {
    TIMESTAMP: 'x-oruga-timestamp',
    SIGNATURE: 'x-oruga-signature',
    /** Event name, e.g. `verifactu_record.status_changed`. */
    EVENT: 'x-oruga-event',
    /** Delivery id: use it to discard duplicates. */
    DELIVERY: 'x-oruga-delivery',
} as const

export interface VerifyWebhookSignatureParams {
    /** Webhook secret (`whsec_…`), shown once when the webhook is created or rotated. */
    secret: string
    /** `X-Oruga-Timestamp` header. */
    timestamp: string | number | null | undefined
    /** `X-Oruga-Signature` header (`sha256=<hex>`; the bare hex is accepted too). */
    signature: string | null | undefined
    /** The RAW request body, exactly as received (not re-serialised JSON). */
    body: string | Uint8Array
    /** Max clock skew in seconds. @default 300 */
    toleranceSeconds?: number
    /** Current time in ms (tests). @default Date.now() */
    now?: number
}

/** Computes the signature header value for a body (useful in tests). */
export function signWebhookPayload(
    secret: string,
    timestamp: string | number,
    body: string | Uint8Array,
): string {
    const hmac = createHmac('sha256', secret)
    hmac.update(`${timestamp}.`)
    hmac.update(body)
    return `sha256=${hmac.digest('hex')}`
}

/**
 * `true` if the signature is valid and the timestamp is within the tolerance.
 * Constant-time comparison. Never throws for bad input: it returns `false`.
 *
 * @example
 * ```ts
 * app.post('/webhooks/verifactu', express.raw({ type: 'application/json' }), (req, res) => {
 *   const ok = verifyWebhookSignature({
 *     secret: process.env.VERIFACTU_WEBHOOK_SECRET!,
 *     timestamp: req.header('X-Oruga-Timestamp'),
 *     signature: req.header('X-Oruga-Signature'),
 *     body: req.body, // Buffer with the raw body
 *   })
 *   if (!ok) return res.sendStatus(401)
 *   const event = JSON.parse(req.body.toString('utf8'))
 *   res.sendStatus(200)
 * })
 * ```
 */
export function verifyWebhookSignature(params: VerifyWebhookSignatureParams): boolean {
    const { secret, body, toleranceSeconds = 300, now = Date.now() } = params
    if (!secret || params.signature == null || params.timestamp == null) return false

    const timestamp = String(params.timestamp).trim()
    if (!/^\d+$/.test(timestamp)) return false
    const ts = Number(timestamp)
    if (!Number.isSafeInteger(ts)) return false
    if (Math.abs(Math.floor(now / 1000) - ts) > toleranceSeconds) return false

    let signature = params.signature.trim()
    if (!signature.startsWith('sha256=')) signature = `sha256=${signature}`

    const expected = Buffer.from(signWebhookPayload(secret, timestamp, body))
    const received = Buffer.from(signature.toLowerCase())
    return expected.length === received.length && timingSafeEqual(expected, received)
}

/**
 * Verifies the signature and parses the event. Throws `OrugaValidationError`
 * if the signature is invalid or expired.
 */
export function constructWebhookEvent(params: VerifyWebhookSignatureParams): VerifactuWebhookEvent {
    if (!verifyWebhookSignature(params)) {
        throw new OrugaValidationError('Invalid or expired webhook signature')
    }
    const text =
        typeof params.body === 'string' ? params.body : new TextDecoder().decode(params.body)
    return JSON.parse(text) as VerifactuWebhookEvent
}
