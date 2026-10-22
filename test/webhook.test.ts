import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
    constructWebhookEvent,
    OrugaValidationError,
    SDK_VERSION,
    signWebhookPayload,
    verifyWebhookSignature,
    WEBHOOK_HEADERS,
} from '../src'

const secret = 'whsec_test_secret'
const body = JSON.stringify({
    event: 'verifactu_record.status_changed',
    occurred_at: '2026-10-21T10:00:00.000Z',
    invoice_id: 'order-1',
    data: { verifactu_invoice_id: 42, status: 'accepted' },
    delivery_id: 9,
})
const now = Date.parse('2026-10-21T10:00:00Z')
const timestamp = String(Math.floor(now / 1000))

/** Exactly what og-backend does (webhook-signature.ts → signWebhook). */
const backendSignature = (ts: string, raw: string) =>
    `sha256=${createHmac('sha256', secret).update(`${ts}.${raw}`).digest('hex')}`

describe('verifyWebhookSignature', () => {
    it('accepts a valid signature computed like the backend', () => {
        const signature = backendSignature(timestamp, body)
        expect(signWebhookPayload(secret, timestamp, body)).toBe(signature)
        expect(verifyWebhookSignature({ secret, timestamp, signature, body, now })).toBe(true)
        // Raw Buffer body, numeric timestamp and bare hex are accepted
        expect(
            verifyWebhookSignature({
                secret,
                timestamp: Number(timestamp),
                signature: signature.slice('sha256='.length),
                body: Buffer.from(body),
                now,
            }),
        ).toBe(true)
    })

    it('rejects a tampered body or signature, or the wrong secret', () => {
        const signature = backendSignature(timestamp, body)
        const tampered = body.replace('"accepted"', '"rejected"')
        expect(verifyWebhookSignature({ secret, timestamp, signature, body: tampered, now })).toBe(false)
        expect(
            verifyWebhookSignature({ secret, timestamp, signature: signature.slice(0, -1) + '0', body, now }),
        ).toBe(false)
        expect(verifyWebhookSignature({ secret: 'whsec_other', timestamp, signature, body, now })).toBe(false)
        // The timestamp is signed: changing it breaks the signature
        expect(
            verifyWebhookSignature({ secret, timestamp: String(Number(timestamp) + 1), signature, body, now }),
        ).toBe(false)
    })

    it('rejects expired or future timestamps beyond the tolerance', () => {
        const old = String(Number(timestamp) - 301)
        expect(
            verifyWebhookSignature({ secret, timestamp: old, signature: backendSignature(old, body), body, now }),
        ).toBe(false)
        const future = String(Number(timestamp) + 301)
        expect(
            verifyWebhookSignature({ secret, timestamp: future, signature: backendSignature(future, body), body, now }),
        ).toBe(false)
        // Within a custom tolerance it is fine
        expect(
            verifyWebhookSignature({
                secret,
                timestamp: old,
                signature: backendSignature(old, body),
                body,
                now,
                toleranceSeconds: 600,
            }),
        ).toBe(true)
    })

    it('returns false for missing or malformed input', () => {
        const signature = backendSignature(timestamp, body)
        expect(verifyWebhookSignature({ secret, timestamp: undefined, signature, body, now })).toBe(false)
        expect(verifyWebhookSignature({ secret, timestamp, signature: null, body, now })).toBe(false)
        expect(verifyWebhookSignature({ secret, timestamp: 'abc', signature, body, now })).toBe(false)
        expect(verifyWebhookSignature({ secret: '', timestamp, signature, body, now })).toBe(false)
    })

    it('constructWebhookEvent parses a valid event and throws on an invalid one', () => {
        const signature = backendSignature(timestamp, body)
        expect(constructWebhookEvent({ secret, timestamp, signature, body, now })).toMatchObject({
            invoice_id: 'order-1',
            data: { status: 'accepted' },
        })
        expect(() =>
            constructWebhookEvent({ secret, timestamp, signature, body: body + ' ', now }),
        ).toThrow(OrugaValidationError)
    })
})

describe('WEBHOOK_HEADERS', () => {
    it('uses the ORUGA header names sent by og-backend', () => {
        expect(WEBHOOK_HEADERS).toEqual({
            TIMESTAMP: 'x-oruga-timestamp',
            SIGNATURE: 'x-oruga-signature',
            EVENT: 'x-oruga-event',
            DELIVERY: 'x-oruga-delivery',
        })
    })

    it('reads the signature from a Headers object case-insensitively', () => {
        const signature = backendSignature(timestamp, body)
        const headers = new Headers({
            'X-Oruga-Timestamp': timestamp,
            'X-Oruga-Signature': signature,
        })
        expect(
            verifyWebhookSignature({
                secret,
                timestamp: headers.get(WEBHOOK_HEADERS.TIMESTAMP),
                signature: headers.get(WEBHOOK_HEADERS.SIGNATURE),
                body,
                now,
            }),
        ).toBe(true)
    })
})

describe('package', () => {
    it('SDK_VERSION matches package.json', () => {
        const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
        expect(SDK_VERSION).toBe(pkg.version)
        expect(pkg.name).toBe('@calltek/oruga-sdk')
    })
})
