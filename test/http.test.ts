import { describe, expect, it, vi } from 'vitest'
import {
    AuthError,
    InvalidCredentialsError,
    InvoApiError,
    InvoAuthError,
    InvoConfigError,
    InvoNetworkError,
    InvoRateLimitError,
    InvoSDK,
    InvoTimeoutError,
    NetworkError,
    parseRetryAfter,
} from '../src'
import { API_KEY, invoiceResponse, json, makeSdk, mockFetch } from './helpers'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const createBody = {
    issuer_nif: 'B75700005',
    invoice_number: 'FAC-1',
    issue_date: '2026-10-21',
    tax_lines: [{ base: '100.00', tax_rate: '21', tax_amount: '21.00' }],
    total: '121.00',
}

describe('configuration', () => {
    it('requires an API key', () => {
        expect(() => new InvoSDK({})).toThrow(InvoConfigError)
    })

    it('rejects INVO tokens with an explanation', () => {
        expect(() => new InvoSDK({ apiToken: 'invo_tok_prod_abc' })).toThrow(/ORUGA/)
        expect(() => new InvoSDK({ apiToken: 'invo_tok_sand_abc' })).toThrow(InvoConfigError)
    })

    it('rejects keys that are not ORUGA API keys', () => {
        expect(() => new InvoSDK({ apiKey: 'sk_live_123' })).toThrow(/ogk_/)
    })

    it('accepts apiToken as an alias of apiKey', async () => {
        const { fetch, calls } = mockFetch(() => json({ data: [], total_items: 0 }))
        const sdk = new InvoSDK({ apiToken: API_KEY, fetch })
        await sdk.verifactu.invoices.list()
        expect(calls[0].headers.authorization).toBe(`Bearer ${API_KEY}`)
    })

    it('defaults to the ORUGA production URL and strips trailing slashes', () => {
        expect(new InvoSDK({ apiKey: API_KEY }).apiUrl).toBe('https://api.oru.ga/v1')
        expect(new InvoSDK({ apiKey: API_KEY, baseUrl: 'http://localhost:5150/v1/' }).apiUrl).toBe(
            'http://localhost:5150/v1',
        )
    })

    it('rejects an unknown environment', () => {
        expect(() => new InvoSDK({ apiKey: API_KEY, environment: 'staging' as never })).toThrow(
            InvoConfigError,
        )
    })
})

describe('requests', () => {
    it('sends the API key as Bearer, without workspace header nor token exchange', async () => {
        const { fetch, calls } = mockFetch(() => json(invoiceResponse()))
        const sdk = makeSdk(fetch)
        await sdk.verifactu.invoices.get(42)

        expect(calls).toHaveLength(1)
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/invoices/42')
        expect(calls[0].method).toBe('GET')
        expect(calls[0].headers.authorization).toBe(`Bearer ${API_KEY}`)
        expect(calls[0].headers['x-workspace-id']).toBeUndefined()
        expect(calls[0].headers['user-agent']).toMatch(/^invo-sdk-ts\//)
    })

    it('serialises list queries, skipping undefined values', async () => {
        const { fetch, calls } = mockFetch(() => json({ data: [], total_items: 0 }))
        await makeSdk(fetch).verifactu.errors.list({ resolved: false, code: undefined, page: 2 })
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/errors?resolved=false&page=2')
    })

    it('adds an automatic Idempotency-Key to create, bulk, correct and annul', async () => {
        const { fetch, calls } = mockFetch(
            () => json(invoiceResponse(), 201),
            () => json({ total: 1, succeeded: 1, failed: 0, results: [] }),
            () => json(invoiceResponse()),
            () => json(invoiceResponse()),
        )
        const sdk = makeSdk(fetch)
        await sdk.verifactu.invoices.create(createBody)
        await sdk.verifactu.invoices.bulk([createBody])
        await sdk.verifactu.invoices.correct(42, { tax_lines: createBody.tax_lines, total: '121.00' })
        await sdk.verifactu.invoices.annul(42)

        expect(calls.map((c) => c.url)).toEqual([
            'https://api.test/v1/verifactu/invoices',
            'https://api.test/v1/verifactu/invoices/bulk',
            'https://api.test/v1/verifactu/invoices/42/correct',
            'https://api.test/v1/verifactu/invoices/42/annul',
        ])
        for (const call of calls) {
            expect(call.method).toBe('POST')
            expect(call.headers['idempotency-key']).toMatch(UUID)
        }
        expect(new Set(calls.map((c) => c.headers['idempotency-key'])).size).toBe(4)
        expect(calls[1].body).toEqual({ invoices: [createBody] })
    })

    it('uses the Idempotency-Key given by the caller', async () => {
        const { fetch, calls } = mockFetch(() => json(invoiceResponse(), 201))
        await makeSdk(fetch).verifactu.invoices.create(createBody, { idempotencyKey: 'order-1' })
        expect(calls[0].headers['idempotency-key']).toBe('order-1')
    })

    it('does not send an Idempotency-Key on reads', async () => {
        const { fetch, calls } = mockFetch(() => json({ data: [], total_items: 0 }))
        await makeSdk(fetch).verifactu.invoices.list()
        expect(calls[0].headers['idempotency-key']).toBeUndefined()
    })

    it('reads the QR as SVG text', async () => {
        const { fetch, calls } = mockFetch(
            () => new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } }),
        )
        const svg = await makeSdk(fetch).verifactu.invoices.qrSvg(42)
        expect(svg).toBe('<svg/>')
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/invoices/42/qr?format=svg')
    })

    it('uploads representations as multipart', async () => {
        const { fetch, calls } = mockFetch(() => json({ id: 1 }, 201))
        await makeSdk(fetch).verifactu.taxpayers.representations.create(3, {
            file: new Blob(['%PDF'], { type: 'application/pdf' }),
            filename: 'modelo.pdf',
            model_version: '017',
            signed_at: '2026-10-01',
            signer_name: 'Firmante',
            signer_nif: '12345678Z',
            valid_from: '2026-10-01',
        })
        expect(calls[0].url).toBe('https://api.test/v1/verifactu/taxpayers/3/representations')
        expect(calls[0].body).toBeInstanceOf(FormData)
        expect(calls[0].headers['content-type']).toBeUndefined()
        const form = calls[0].body as FormData
        expect(form.get('model_version')).toBe('017')
        expect((form.get('file') as File).name).toBe('modelo.pdf')
    })
})

describe('retries', () => {
    it('retries a 429 honouring Retry-After, then succeeds', async () => {
        const { fetch, calls } = mockFetch(
            () =>
                json({ status: 429, code: 'RATE_LIMITED', message: 'Too many requests' }, 429, {
                    'retry-after': '0',
                }),
            () => json(invoiceResponse(), 201),
        )
        const invoice = await makeSdk(fetch).verifactu.invoices.create(createBody)
        expect(invoice.id).toBe(42)
        expect(calls).toHaveLength(2)
        // Same key on the retry: the API deduplicates
        expect(calls[1].headers['idempotency-key']).toBe(calls[0].headers['idempotency-key'])
    })

    it('retries 503 with backoff up to maxRetries and then throws', async () => {
        const { fetch, calls } = mockFetch(() =>
            json({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Down' }, 503),
        )
        const error = await makeSdk(fetch, { maxRetries: 2 })
            .verifactu.invoices.get(1)
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoApiError)
        expect(error.status).toBe(503)
        expect(calls).toHaveLength(3)
    })

    it('retries network errors on idempotent requests', async () => {
        const { fetch, calls } = mockFetch(
            () => {
                throw new TypeError('fetch failed')
            },
            () => json(invoiceResponse()),
        )
        await expect(makeSdk(fetch).verifactu.invoices.get(42)).resolves.toMatchObject({ id: 42 })
        expect(calls).toHaveLength(2)
    })

    it('does not retry non-idempotent requests without Idempotency-Key', async () => {
        const { fetch, calls } = mockFetch(() =>
            json({ status: 503, code: 'X', message: 'Down' }, 503),
        )
        await expect(makeSdk(fetch).verifactu.records.resend(5)).rejects.toBeInstanceOf(InvoApiError)
        expect(calls).toHaveLength(1)
    })

    it('does not retry 4xx', async () => {
        const { fetch, calls } = mockFetch(() =>
            json({ status: 409, code: 'VERIFACTU_RECORD_IN_FLIGHT', message: 'In flight' }, 409),
        )
        await expect(makeSdk(fetch).verifactu.invoices.annul(1)).rejects.toMatchObject({
            status: 409,
            code: 'VERIFACTU_RECORD_IN_FLIGHT',
        })
        expect(calls).toHaveLength(1)
    })

    it('gives up when Retry-After is longer than maxRetryDelay', async () => {
        const { fetch, calls } = mockFetch(() =>
            json({ status: 429, code: 'RATE_LIMITED', message: 'Slow down' }, 429, {
                'retry-after': '120',
            }),
        )
        const error = await makeSdk(fetch, { maxRetryDelay: 1000 })
            .verifactu.invoices.list()
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoRateLimitError)
        expect(error.retryAfter).toBe(120)
        expect(calls).toHaveLength(1)
    })

    it('parses Retry-After as seconds or HTTP date', () => {
        expect(parseRetryAfter('3')).toBe(3)
        expect(parseRetryAfter(null)).toBeNull()
        expect(parseRetryAfter('nonsense')).toBeNull()
        const now = Date.parse('2026-10-21T10:00:00Z')
        expect(parseRetryAfter('Wed, 21 Oct 2026 10:00:05 GMT', now)).toBe(5)
    })
})

describe('timeout', () => {
    it('aborts a request that exceeds the timeout', async () => {
        const fetchImpl = vi.fn(
            (_url: RequestInfo | URL, init?: RequestInit) =>
                new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () =>
                        reject(new DOMException('aborted', 'AbortError')),
                    )
                }),
        ) as unknown as typeof fetch
        const error = await makeSdk(fetchImpl, { timeout: 20, maxRetries: 0 })
            .verifactu.invoices.get(1)
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoTimeoutError)
        expect(error).toBeInstanceOf(InvoNetworkError)
        expect(error.timeoutMs).toBe(20)
    })

    it('retries a timed-out idempotent request', async () => {
        let n = 0
        const fetchImpl = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            n++
            if (n === 1) {
                return new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () =>
                        reject(new DOMException('aborted', 'AbortError')),
                    )
                })
            }
            return Promise.resolve(json(invoiceResponse()))
        }) as unknown as typeof fetch
        await expect(
            makeSdk(fetchImpl, { timeout: 20 }).verifactu.invoices.get(42),
        ).resolves.toMatchObject({ id: 42 })
        expect(n).toBe(2)
    })

    it('does not retry when the caller aborts', async () => {
        const controller = new AbortController()
        controller.abort()
        const { fetch, calls } = mockFetch(() => json({}))
        const error = await makeSdk(fetch)
            .verifactu.invoices.get(1, { signal: controller.signal })
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoNetworkError)
        expect(error).not.toBeInstanceOf(InvoTimeoutError)
        expect(calls).toHaveLength(1)
    })
})

describe('error mapping', () => {
    it('maps the API error body, request id and validation errors', async () => {
        const { fetch } = mockFetch(() =>
            json(
                {
                    status: 400,
                    code: 'VALIDATION_FAILED',
                    message: 'Validation failed',
                    errors: ['total must be a decimal number'],
                },
                400,
                { 'x-correlation-id': 'req-123' },
            ),
        )
        const error = await makeSdk(fetch)
            .verifactu.invoices.create(createBody)
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoApiError)
        expect(error).toBeInstanceOf(AuthError) // v0 instanceof checks keep working
        expect(error.status).toBe(400)
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe('VALIDATION_FAILED')
        expect(error.requestId).toBe('req-123')
        expect(error.message).toContain('total must be a decimal number')
        expect(error.toJSON()).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' })
    })

    it('maps 401/403 to InvoAuthError (and the v0 InvalidCredentialsError)', async () => {
        const { fetch } = mockFetch(
            () => json({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' }, 401),
            () => json({ status: 403, code: 'FORBIDDEN', message: 'Missing scope' }, 403),
        )
        const sdk = makeSdk(fetch)
        const e401 = await sdk.verifactu.invoices.list().catch((e) => e)
        const e403 = await sdk.verifactu.taxpayers.create({
            nif: 'B75700005',
            legal_name: 'X',
            environment: 'test',
        }).catch((e) => e)
        expect(e401).toBeInstanceOf(InvoAuthError)
        expect(e401).toBeInstanceOf(InvalidCredentialsError)
        expect(e403).toBeInstanceOf(InvoAuthError)
        expect(e403.status).toBe(403)
    })

    it('maps a non-JSON error page', async () => {
        const { fetch } = mockFetch(
            () => new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }),
        )
        const error = await makeSdk(fetch, { maxRetries: 0 })
            .verifactu.invoices.list()
            .catch((e) => e)
        expect(error).toMatchObject({ status: 502, code: 'HTTP_502', message: 'Bad Gateway' })
    })

    it('maps network failures to InvoNetworkError (v0 NetworkError) and calls onError', async () => {
        const onError = vi.fn()
        const { fetch } = mockFetch(() => {
            throw new TypeError('fetch failed')
        })
        const error = await makeSdk(fetch, { maxRetries: 0, onError })
            .verifactu.invoices.list()
            .catch((e) => e)
        expect(error).toBeInstanceOf(InvoNetworkError)
        expect(error).toBeInstanceOf(NetworkError)
        expect(error.message).toBe('fetch failed')
        expect(onError).toHaveBeenCalledWith(error)
    })
})

describe('debug logging', () => {
    it('logs requests without leaking the API key', async () => {
        const lines: string[] = []
        const { fetch } = mockFetch(() => json(invoiceResponse(), 201, { 'x-correlation-id': 'r1' }))
        await makeSdk(fetch, {
            debug: (message, meta) => lines.push(`${message} ${JSON.stringify(meta)}`),
        }).verifactu.invoices.create(createBody)
        expect(lines.length).toBeGreaterThanOrEqual(2)
        expect(lines.join('\n')).toContain('POST https://api.test/v1/verifactu/invoices')
        expect(lines.join('\n')).not.toContain(API_KEY)
    })
})
