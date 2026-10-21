# Changelog

## 1.0.0 — 2026-10-22

**The SDK now talks to the ORUGA VERI\*FACTU API** (`https://api.oru.ga/v1/verifactu/*`)
instead of the INVO API (`api.invo.rest` / `sandbox.invo.rest`), which is being retired.
INVO's VERI\*FACTU engine now lives in ORUGA: same chaining, same AEAT submission,
same webhooks (same signature headers).

### Migration guide (v0 → v1)

For an integration that only uses `new InvoSDK({ apiToken, environment })` and
`store(dto, callback?)` (copyexpress, vcs…):

1. **Upgrade**: `npm install @calltek/invo-sdk@^1`.
2. **Get an ORUGA API key** (`ogk_…`) for your ORUGA workspace (the workspace
   must have the `verifactu` app active), with the scopes you need —
   at least `verifactu_invoice.*`; add `verifactu_record.view`,
   `verifactu_taxpayer.view`, `verifactu_error.view` and `verifactu_webhook.*`
   if you use those endpoints.
3. **Replace the token**: `new InvoSDK({ apiKey: 'ogk_…' })`. `apiToken` still
   works as an alias, but an old `invo_tok_…` token throws an `InvoConfigError`
   explaining this step.
4. **Register your issuer** as a taxpayer in ORUGA (NIF + legal name exactly as
   in the AEAT census + environment `test` or `production`) with its verified
   representation model. `emitterTaxId` must match that taxpayer.
5. **Environment**: in ORUGA the AEAT environment belongs to each taxpayer, not
   to the URL. `environment: 'sandbox'` (or `'test'`) / `'production'` now only
   picks the taxpayer when the same NIF exists in both environments. There is no
   sandbox URL any more.
6. **URL** (optional): `baseUrl` defaults to `https://api.oru.ga/v1`; set it for
   a local or staging backend.
7. **Webhooks**: nothing changes for existing receivers (`X-Invo-Timestamp`,
   `X-Invo-Signature`, `invoice_id`, `invo_status`). You can now verify them with
   `verifyWebhookSignature()`.

Your `store()` calls and `CreateInvoiceDto` objects do not change.

### What `store()` does now

It keeps its signature and return shape (`{ success, invoiceId, chainIndex }`,
plus `invoice` with the full v1 invoice) and maps the camelCase DTO to
`POST /verifactu/invoices`. Notable details of the mapping (full table in
`src/compat.ts` and the README):

- `emitterTaxId` → `issuer_nif`; `emitterName` is ignored (the AEAT name is the
  taxpayer's `legal_name`).
- `customerName` + `customerTaxId` → `recipients[0]` (`nif` for a Spanish NIF,
  IDOtro `02` for an EU VAT number).
- Tax type `04` (INVO "Others") → `05` (the AEAT code).
- Amounts are sent as decimal strings; floating point noise is rounded to cents.
- `rectifiedInvoiceIds` / `substitutedInvoiceIds` are **ORUGA invoice ids**
  (the `invoiceId` returned by `store()`); INVO UUIDs are rejected.
- For a rectification by substitution (`R*` + `S`) the SDK computes
  ImporteRectificacion from the rectified invoices, like INVO did (or pass
  `rectifiedAmounts`).
- `currency` other than `EUR` is rejected (VERI\*FACTU amounts are in EUR).
- A zone-less `issueDate` date-time keeps its date part.
- Every call sends an `Idempotency-Key`; pass `store(dto, callback, { idempotencyKey })`
  to make retries safe across processes.

### Added

- `sdk.verifactu.*`: the whole VERI\*FACTU API, 1:1 with the backend (snake_case):
  - `invoices.create / bulk / list / search / get / records / qr / qrSvg / correct / annul`
  - `records.list / search / get / xml / resend`
  - `taxpayers.list / create / get / update / delete` and
    `taxpayers.representations.list / create / verify / revoke / document`
  - `errors.list / resolve`
  - `webhook.get / update / rotateSecret / deliveries`
- `verifyWebhookSignature()`, `constructWebhookEvent()`, `signWebhookPayload()`,
  `WEBHOOK_HEADERS`.
- HTTP client: timeout (`timeout`, 30 s), automatic `Idempotency-Key` on writes,
  retries with exponential backoff on 429 (honouring `Retry-After`), 5xx and
  network errors (`maxRetries`, 3; only idempotent requests), custom `fetch`,
  `debug` logger that never prints the API key.
- Typed errors: `InvoApiError` (`status`, `code`, `message`, `requestId`,
  `retryAfter`), `InvoAuthError`, `InvoRateLimitError`, `InvoNetworkError`,
  `InvoTimeoutError`, `InvoConfigError`, `InvoValidationError`,
  `InvoNotAvailableError`. They extend the v0 `AuthError`, so v0 `instanceof`
  checks keep working.
- Per-request options (`idempotencyKey`, `signal`, `timeout`, `maxRetries`, `headers`).
- Test suite (vitest) and a publish workflow on `v*` tags.

### Removed / deprecated

- `read()` (AI invoice reader) and `pdf()` (branded PDFs): **not available in
  v1**. They remain for type compatibility but throw `InvoNotAvailableError`.
  Render your PDF yourself and print the QR from `sdk.verifactu.invoices.qr(id)`.
- `getAccessToken()` (always `null`), `getUser()` (always `null`) and
  `isAuthenticated()` (`true` when a key is configured): there is no JWT
  session any more — the API key is sent directly. Deprecated.
- No `/auth/token` exchange, no workspace header (the API key implies it).
- `request(endpoint, …)` is now relative to the ORUGA base URL; INVO paths
  (`/invoice/store`, `/reader`, `/makeup`) do not exist there.
- JWT helpers (`decodeJWT`, `isTokenExpired`…), `TokenExpiredError`,
  `InvalidTokenError`, `OAuthError` and the INVO types (`UserDto`, `LoginDto`,
  `LoginResponseDto`, `UpdateBatchStatusDto`, `MakeupPDF*`) are still exported
  but deprecated.
- Removed the INVO swagger generator (`swagger.ts`, `npm run types`) and the
  manual scripts in `test/` that called the INVO API.

## 0.2.0

- Regenerated INVO API types; removed `OAuthCallbackDto`.
