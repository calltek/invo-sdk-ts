# INVO — SDK TypeScript (`invo-sdk-ts`)

> **⚙️ Flujo de trabajo — léelo antes de tocar nada.**
> **Ramas + Pull Request, nunca commit directo a `main`.** Este repo no tiene
> rama `sandbox`, solo `main`. CI (`.github/workflows/build.yml`) corre build,
> typecheck y tests en cada push/PR a `main`; `publish.yml` publica a npm al
> empujar un tag `v*` (secreto `NPM_TOKEN`). Nadie publica a mano.

Paquete npm público (`@calltek/invo-sdk`) para que **ERPs de terceros**
(copyexpress, vcs…) registren facturas VERI\*FACTU. **Desde la v1 habla con la
API de ORUGA** (`https://api.oru.ga/v1/verifactu/*`, backend `og-backend`), no
con INVO: el motor VERI\*FACTU de INVO se portó a ORUGA y INVO se retira (ver
`og-backend/docs/architecture/verifactu.md`).

---

## 1. Stack

| Capa | Elección |
| --- | --- |
| Lenguaje | TypeScript, **cero dependencias en runtime** (`fetch` nativo, `node:crypto`) |
| Build | Rollup (`@rollup/plugin-typescript` + `rollup-plugin-dts`) → `dist/index.js` (ESM) + `dist/index.d.ts`. `node:*` es external |
| Tests | **vitest** con `fetch` simulado (`test/*.test.ts`), sin red |
| Tipos de la API | **Escritos a mano** desde los DTOs y presenters de og-backend (`src/types/verifactu.types.ts`). El `swagger.json` del backend no estaba al día; si algún día se generan desde el OpenAPI, que sea del tag Verifactu |
| Package manager | npm (CI, `package-lock.json`). bun sirve en local |
| Runtime objetivo | Node ≥ 18 (vitest/vite 7 piden ≥ 20.19 para correr los tests; en CI, Node 18 solo compila) |

---

## 2. Estructura

```
src/
├── index.ts        ← superficie pública (export curado)
├── sdk.ts          ← InvoSDK: config, store() (compat v0), request(), métodos v0 deprecados
├── compat.ts       ← mapeo CreateInvoiceDto (camelCase, v0) → body v1 (snake_case). La tabla está en el comentario de cabecera
├── verifactu.ts    ← sdk.verifactu.{invoices,records,taxpayers(+representations),errors,webhook}, 1:1 con los controladores
├── http.ts         ← cliente HTTP: Bearer ogk_, timeout, Idempotency-Key automática, reintentos, errores tipados
├── webhook.ts      ← verifyWebhookSignature / constructWebhookEvent (X-Invo-Timestamp / X-Invo-Signature)
├── errors.ts       ← InvoError → AuthError (v0) → InvoApiError/InvoAuthError/InvoRateLimitError, InvoNetworkError/InvoTimeoutError
├── version.ts      ← SDK_VERSION (= package.json, lo comprueba un test) y DEFAULT_BASE_URL
├── utils.ts        ← helpers JWT de v0, deprecados (no se usan)
└── types/
    ├── verifactu.types.ts ← tipos de la API de ORUGA
    ├── legacy.types.ts    ← CreateInvoiceDto/InvoiceTaxLineDto (entrada de store()) y tipos v0 deprecados
    └── sdk.types.ts       ← InvoSDKConfig, RequestOptions
```

---

## 3. Cómo correrlo

```bash
npm install
npm run build       # rollup -c → dist/
npm test            # vitest
npm run typecheck   # src + tests
```

`dist/` no está en git (está en `.gitignore`; antes se trackeaba un `dist/`
viejo y se quitó en la v1).

---

## 4. Decisiones tomadas (v1)

- **Compatibilidad hacia atrás**: `new InvoSDK({ apiToken, environment })` y
  `store(dto, callback?)` siguen igual, con el mismo DTO camelCase y el mismo
  resultado `{ success, invoiceId, chainIndex }` (+ `invoice` con la factura v1).
  `apiToken` es alias de `apiKey`. Un `invo_tok_…` lanza `InvoConfigError`
  explicando que hace falta una API key de ORUGA.
- **`environment`** ya no cambia la URL (en ORUGA el entorno es del obligado):
  solo se manda como `environment` (`sandbox` → `test`) para resolver el
  obligado por `issuer_nif`, y solo si se configuró.
- **`read()` y `pdf()`** se mantienen (para no romper la compilación) pero
  lanzan `InvoNotAvailableError`: ni el lector con IA ni `makeup` se portaron a
  ORUGA. `getAccessToken()`/`getUser()` devuelven `null` e `isAuthenticated()`
  `true` si hay key: no hay sesión JWT.
- **Tipo de impuesto `04` → `05`** (INVO usaba 04 para «Otros»; el código AEAT es 05).
- **ImporteRectificacion**: INVO lo calculaba en servidor; ORUGA lo exige en el
  cuerpo. `store()` lo calcula igual (suma del desglose del alta vigente de las
  rectificadas, con un `GET` por cada una) salvo que venga `rectifiedAmounts`.
- **Importes** a string decimal; el ruido de coma flotante se redondea a
  céntimos, una precisión real de más de 2 decimales se manda tal cual y la
  rechaza la API.
- **Reintentos** solo en peticiones idempotentes (GET/PUT/DELETE, `search`,
  `errors.resolve` y escrituras con Idempotency-Key); 429 respeta `Retry-After`.
  `records.resend` y `taxpayers.create` no se reintentan.
- **Errores**: todos los de API/red heredan de `AuthError` (v0) para que los
  `instanceof` antiguos sigan valiendo; `NetworkError` e
  `InvalidCredentialsError` son alias.
- El `requestId` del error es la cabecera `X-Correlation-Id` del backend.

---

## 5. Pendiente / fuera de alcance

- `docs/` solo tiene `PUBLISHING.md`; la documentación pública es el README.
- ESLint y Prettier siguen rotos (config vieja con ESLint 9; `.prettierrc.js`
  con `module.exports` en un paquete ESM). No corren en CI.
- Cuando cambie un DTO del backend (`og-backend/src/modules/verifactu/**/dto`
  o los presenters `presentInvoice`/`presentRecord`), hay que actualizar
  `src/types/verifactu.types.ts` a mano.
