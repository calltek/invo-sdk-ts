import { vi } from 'vitest'
import { InvoSDK } from '../src'
import type { InvoSDKConfig } from '../src'

export const API_KEY = 'ogk_test_0123456789abcdef'

export interface RecordedCall {
    url: string
    method: string
    headers: Record<string, string>
    body: unknown
}

export type Responder = (call: RecordedCall, index: number) => Response | Promise<Response>

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
    })
}

/** A fetch mock that records each call and answers with the responders, in order (the last one repeats). */
export function mockFetch(...responders: Responder[]) {
    const calls: RecordedCall[] = []
    const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers: Record<string, string> = {}
        new Headers(init?.headers).forEach((value, key) => {
            headers[key] = value
        })
        let body: unknown = init?.body
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body)
            } catch {
                // keep text
            }
        }
        const call: RecordedCall = {
            url: String(input),
            method: init?.method ?? 'GET',
            headers,
            body,
        }
        calls.push(call)
        const index = calls.length - 1
        const responder = responders[Math.min(index, responders.length - 1)]
        if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError')
        return responder(call, index)
    })
    return { fetch: fn as unknown as typeof fetch, calls }
}

export function makeSdk(fetchImpl: typeof fetch, config: Partial<InvoSDKConfig> = {}) {
    return new InvoSDK({
        apiKey: API_KEY,
        baseUrl: 'https://api.test/v1',
        retryBaseDelay: 1,
        fetch: fetchImpl,
        ...config,
    })
}

/** A minimal invoice as the API returns it. */
export function invoiceResponse(overrides: Record<string, unknown> = {}) {
    return {
        id: 42,
        taxpayer_id: 1,
        issuer_nif: 'B75700005',
        environment: 'test',
        source: 'api',
        source_invoice_id: null,
        external_id: 'order-1',
        invoice_number: 'FAC-1',
        issue_date: '2026-10-21',
        invoice_type: 'F1',
        rectification_type: null,
        callback_url: null,
        qr_payload: 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=B75700005',
        current_record_id: 7,
        record_type: 'alta',
        status: 'queued',
        chain_index: 9,
        hash: 'ABC',
        aeat_status: null,
        aeat_csv: null,
        aeat_error_code: null,
        aeat_error_description: null,
        total: '121.00',
        tax_total: '21.00',
        sent_at: null,
        responded_at: null,
        created_at: '2026-10-21T10:00:00.000Z',
        updated_at: '2026-10-21T10:00:00.000Z',
        ...overrides,
    }
}
