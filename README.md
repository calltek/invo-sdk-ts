# @calltek/invo-sdk

TypeScript SDK for the **ORUGA VERI\*FACTU API**: register invoices with the
AEAT (VERI\*FACTU), follow their status, get the QR and verify webhooks.

> **v1 talks to ORUGA** (`https://api.oru.ga/v1`), which replaces the INVO API.
> Code written for v0 keeps working (`new InvoSDK({ apiToken })` + `store()`):
> you only need an ORUGA API key (`ogk_…`). See the
> [migration guide](./CHANGELOG.md#migration-guide-v0--v1).

- Zero runtime dependencies, Node ≥ 18 (native `fetch`, `node:crypto`).
- Typed 1:1 with the API (`sdk.verifactu.*`, snake_case).
- Automatic `Idempotency-Key`, timeouts, retries with backoff on 429/5xx.
- Webhook signature verification.

## Installation

```bash
npm install @calltek/invo-sdk
```

## Quick start

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
    apiKey: process.env.ORUGA_API_KEY!, // ogk_…
    // baseUrl: 'https://api.oru.ga/v1', // default
})

const invoice = await sdk.verifactu.invoices.create({
    issuer_nif: 'B12345678', // a taxpayer of your workspace
    invoice_number: 'FAC-2026-001',
    issue_date: '2026-10-21',
    description: 'Servicios de consultoría',
    recipients: [{ name: 'Cliente SL', nif: 'B87654321' }],
    tax_lines: [{ tax_rate: '21', base: '1000.00', tax_amount: '210.00' }],
    total: '1210.00',
    external_id: 'order-12345',
    callback_url: 'https://myapp.com/webhooks/verifactu',
})

console.log(invoice.id, invoice.status) // 42 'queued'

// Later: status, CSV and QR
const detail = await sdk.verifactu.invoices.get(invoice.id)
const { qr_payload, svg } = await sdk.verifactu.invoices.qr(invoice.id)
```

The record is chained and queued immediately; ORUGA submits it to the AEAT in
batches and the status moves to `accepted`, `accepted_with_warnings`,
`rejected` or `failed`. Use a webhook (below) instead of polling.

### Prerequisites in ORUGA

- An ORUGA workspace with the **`verifactu`** app active.
- An **API key** (`ogk_…`) of that workspace with the scopes you need, e.g.
  `verifactu_invoice.*`, `verifactu_record.view`, `verifactu_taxpayer.view`,
  `verifactu_error.view`, `verifactu_webhook.*`. The key implies the workspace:
  no workspace header is needed.
- The issuer registered as a **taxpayer** (`nif`, `legal_name` exactly as in
  the AEAT census, `environment` `test` = AEAT pre-production or
  `production`) with a verified representation model.

## v0 compatibility: `store()`

v0 code keeps working. `store()` keeps its camelCase DTO, its optional
`callback` and its result, and maps everything to `POST /verifactu/invoices`:

```typescript
const sdk = new InvoSDK({
    apiToken: process.env.INVO_API_TOKEN!, // now an ORUGA key: ogk_…
    environment: 'sandbox', // optional: picks the taxpayer's environment (sandbox → test)
})

const result = await sdk.store(
    {
        issueDate: new Date().toISOString(),
        invoiceNumber: 'FAC-2026-001',
        externalId: 'order-12345',
        totalAmount: 1210,
        customerName: 'Cliente SL',
        customerTaxId: 'B87654321',
        emitterTaxId: 'B12345678',
        taxLines: [{ taxRate: 21, baseAmount: 1000, taxAmount: 210 }],
    },
    'https://myapp.com/webhooks/verifactu',
)

// { success: true, invoiceId: '42', chainIndex: 9, invoice: { …full v1 invoice } }
```

| v0 (`CreateInvoiceDto`) | v1 body |
| --- | --- |
| `issueDate` | `issue_date` (a zone-less date-time keeps its date part) |
| `invoiceNumber` | `invoice_number` |
| `externalId` | `external_id` |
| `totalAmount` | `total` (decimal string; float noise rounded to cents) |
| `currency` | — (must be `EUR` or omitted) |
| `customerName` + `customerTaxId` | `recipients[0]`: `{ name, nif }`, or `{ name, id_type: '02', id }` for an EU VAT number |
| `emitterName` | — ignored: the AEAT name is the taxpayer's `legal_name` |
| `emitterTaxId` | `issuer_nif` |
| config `environment` | `environment` (`sandbox` → `test`), only when configured |
| `type` | `invoice_type` |
| `rectificationType` | `rectification_type` |
| `description` | `description` |
| `simplifiedQualified` | `simplified_art_7273` |
| `unidentifiedRecipient` | `unidentified_recipient_art_61d` |
| `billingAgreementNumber` | `billing_agreement_number` |
| `rectifiedInvoiceIds[]` | `rectified_invoices[].invoice_id` (ORUGA ids, not INVO UUIDs) |
| `substitutedInvoiceIds[]` | `substituted_invoices[].invoice_id` |
| `callback` / 2nd argument | `callback_url` |
| `taxLines[].taxType` | `tax_type` (`04` → `05`, the AEAT code for "Others") |
| `taxLines[].taxRate` | `tax_rate` |
| `taxLines[].baseAmount` | `base` |
| `taxLines[].taxAmount` | `tax_amount` |
| `taxLines[].surchargeRate` / `surchargeAmount` | `surcharge_rate` / `surcharge_amount` |
| `taxLines[].taxExemptionReason` / `operationType` | `operation` (mutually exclusive) |
| `taxLines[].regimeKey` | `regime_key` |

Optional v1 extras on the same DTO: `taxpayerId` (→ `taxpayer_id`),
`operationDate`, and `rectifiedAmounts`. For a rectification by substitution
(`R1`–`R5` + `rectificationType: 'S'`) the SDK computes ImporteRectificacion from
the rectified invoices, as INVO did, unless you pass `rectifiedAmounts`.

Pass a third argument for v1 request options, e.g. a stable idempotency key:
``sdk.store(dto, callback, { idempotencyKey: `order-${orderId}` })``.

### Removed in v1

| v0 | v1 |
| --- | --- |
| `read(file)` (AI reader) | Not available: throws `InvoNotAvailableError` |
| `pdf(data)` (branded PDF) | Not available: throws `InvoNotAvailableError`. Print the QR from `verifactu.invoices.qr(id)` on your own PDF |
| `getAccessToken()` | Deprecated, always `null` (no JWT; the key is never exposed) |
| `getUser()` | Deprecated, always `null` |
| `isAuthenticated()` | Deprecated, `true` when a key is configured |
| `invo_tok_…` tokens | Rejected with `InvoConfigError`: use an ORUGA API key |
| `request('/invoice/store', …)` | `request()` is relative to the ORUGA base URL (e.g. `/verifactu/taxpayers`) |

## API reference (`sdk.verifactu`)

All methods take an optional last argument `RequestOptions`:
`{ idempotencyKey?, signal?, timeout?, maxRetries?, headers? }`.
Lists answer `{ data, total_items }` and accept `page`, `limit` (≤ 100), `sort`, `order`.

### Invoices

| Method | Endpoint |
| --- | --- |
| `invoices.create(body)` | `POST /verifactu/invoices` (Idempotency-Key automatic) |
| `invoices.bulk(invoices)` | `POST /verifactu/invoices/bulk` — up to 50; 200 with per-invoice `results` |
| `invoices.list(query)` | `GET /verifactu/invoices` (`taxpayer_id`, `status`, `record_type`, `invoice_number`, `external_id`, `invoice_type`, `source`, `date_from`, `date_to`) |
| `invoices.search(body)` | `POST /verifactu/invoices/search` (filter DSL, e.g. `{ filter: { 'current_record.status': 'rejected' } }`) |
| `invoices.get(id)` | `GET /verifactu/invoices/:id` — with its record history |
| `invoices.records(id)` | `GET /verifactu/invoices/:id/records` |
| `invoices.qr(id)` / `qrSvg(id)` | `GET /verifactu/invoices/:id/qr` (JSON / `?format=svg`) |
| `invoices.correct(id, body)` | `POST /verifactu/invoices/:id/correct` — subsanación |
| `invoices.annul(id)` | `POST /verifactu/invoices/:id/annul` |

### Records, taxpayers, errors, webhook

| Method | Endpoint |
| --- | --- |
| `records.list(query)` / `records.search(body)` | `GET /verifactu/records`, `POST /verifactu/records/search` |
| `records.get(id)` | `GET /verifactu/records/:id` |
| `records.xml(id)` | `GET /verifactu/records/:id/xml` — XML sent/received per attempt |
| `records.resend(id)` | `POST /verifactu/records/:id/resend` — only `failed` records |
| `taxpayers.list / create / get / update / delete` | `/verifactu/taxpayers[/:id]` |
| `taxpayers.representations.list / create / verify / revoke / document` | `/verifactu/taxpayers/:id/representations…` (`create` is multipart: pass `file: Blob`) |
| `errors.list(query)` / `errors.resolve(id)` | `GET /verifactu/errors`, `PATCH /verifactu/errors/:id/resolve` |
| `webhook.get()` / `update(body)` / `rotateSecret()` / `deliveries(query)` | `/verifactu/webhook…` |

Amounts are decimal strings in responses (`"121.00"`); on input both strings
and numbers are accepted (prefer strings).

## Webhooks

Configure a workspace webhook once (or send `callback_url` per invoice):

```typescript
const { secret } = await sdk.verifactu.webhook.update({ url: 'https://myapp.com/webhooks/verifactu' })
// `secret` (whsec_…) is shown only now (and on rotateSecret()): store it
```

Each verdict (`accepted`, `accepted_with_warnings`, `rejected`, `failed`) is
POSTed with the same headers as INVO:

```
X-Invo-Timestamp: <unix seconds>
X-Invo-Signature: sha256=<hex HMAC-SHA256(secret, "<timestamp>.<raw body>")>
X-Oruga-Event: verifactu_record.status_changed
X-Oruga-Delivery: <delivery id>
```

Verify it against the **raw** body:

```typescript
import express from 'express'
import { verifyWebhookSignature, type VerifactuWebhookEvent } from '@calltek/invo-sdk'

app.post('/webhooks/verifactu', express.raw({ type: 'application/json' }), (req, res) => {
    const valid = verifyWebhookSignature({
        secret: process.env.VERIFACTU_WEBHOOK_SECRET!,
        timestamp: req.header('X-Invo-Timestamp'),
        signature: req.header('X-Invo-Signature'),
        body: req.body, // Buffer
        // toleranceSeconds: 300 (default)
    })
    if (!valid) return res.sendStatus(401)

    const event = JSON.parse(req.body.toString('utf8')) as VerifactuWebhookEvent
    // event.invoice_id = your external_id; event.invo_status = 1 registered / 0 not / AEAT error code
    // event.data.status, event.data.aeat_csv, event.data.aeat_error_code…
    res.sendStatus(200)
})
```

`constructWebhookEvent(params)` does both steps and throws `InvoValidationError`
if the signature is invalid. Deliveries are retried with backoff for hours:
deduplicate by `delivery_id`.

## Configuration

```typescript
new InvoSDK({
    apiKey: 'ogk_…', // or apiToken (v0 alias)
    baseUrl: 'https://api.oru.ga/v1', // default
    environment: 'production', // only for store() taxpayer resolution: 'production' | 'sandbox' | 'test'
    timeout: 30_000, // ms per attempt
    maxRetries: 3, // 429 / 5xx / network, idempotent requests only
    retryBaseDelay: 500, // ms, exponential backoff with jitter
    maxRetryDelay: 60_000, // longest Retry-After honoured
    onError: (error) => {}, // every error thrown
    debug: true, // or (message, meta) => logger.debug(message, meta); never logs the API key
    fetch: customFetch, // optional
})
```

### Retries and idempotency

- `invoices.create`, `bulk`, `correct`, `annul` and `store()` always send an
  `Idempotency-Key` (a random UUID unless you pass `idempotencyKey`). Retries reuse
  it, so a retried write never duplicates an invoice. Same key + same body within
  24 h returns the stored response; same key + different body is a 422
  `IDEMPOTENCY_KEY_REUSED`.
- Retries happen on 429 (honouring `Retry-After`), 5xx and network errors/timeouts,
  only for GET/PUT/DELETE, searches and writes with an Idempotency-Key.
- Rate limit: 300 requests/min per API key by default (`X-RateLimit-*` headers).

## Errors

```typescript
import { InvoApiError } from '@calltek/invo-sdk'

try {
    await sdk.verifactu.invoices.create(body)
} catch (error) {
    if (error instanceof InvoApiError) {
        error.status // 400
        error.code // 'VERIFACTU_INVOICE_INVALID'
        error.message // details from the API
        error.requestId // X-Correlation-Id, for support
        error.retryAfter // seconds (429)
    }
}
```

| Class | When |
| --- | --- |
| `InvoApiError` | The API answered with an error (`{ status, code, message }`) |
| `InvoAuthError` | 401 (invalid/revoked key) or 403 (missing scope) |
| `InvoRateLimitError` | 429 `RATE_LIMITED` / `VERIFACTU_BULK_IN_PROGRESS` |
| `InvoNetworkError` / `InvoTimeoutError` | No response / timeout |
| `InvoConfigError` | Bad configuration (missing key, INVO token) |
| `InvoValidationError` | `store()` input that cannot be mapped |
| `InvoNotAvailableError` | `read()` / `pdf()` |

All API and network errors extend the v0 `AuthError` (with `statusCode`), and
`NetworkError` / `InvalidCredentialsError` are aliases of the new classes, so v0
`instanceof` checks keep working.

## Development

```bash
npm install
npm run build      # rollup → dist/index.js + dist/index.d.ts
npm test           # vitest (mocked fetch)
npm run typecheck
```

Publishing is done by CI on a `v*` tag (see [docs/PUBLISHING.md](./docs/PUBLISHING.md)).

## License

MIT
