# INVO — SDK TypeScript (`invo-sdk-ts`)

> **⚙️ Flujo de trabajo — léelo antes de tocar nada.**
> **Ramas + Pull Request, nunca commit directo a `main`.** A diferencia de
> `invo-backend`/`invo-app`, este repo **no tiene rama `sandbox`** — solo
> existe `main`. No lo confundas con el entorno `sandbox` de la API (ver
> más abajo): son cosas distintas, una es una rama que no existe aquí y la
> otra es un environment de `InvoSDK`/`swagger.ts`. CI en GitHub Actions
> (`.github/workflows/build.yml`) corre `npm run build` en Node 18.x y
> 20.x en cada push/PR a `main` — sin tests ni lint (ver §5, están rotos).

Paquete npm público (`@calltek/invo-sdk`) para que **clientes externos**
integren VERI\*FACTU sin hablar con la API a mano: crear/enviar facturas
(`store`), leer datos de una factura desde PDF/XML (`read`) y generar PDFs
con marca propia (`pdf`). Autenticación solo por API token (los tokens se
gestionan desde `invo-app`, no desde aquí). Fuera de eso, no expone nada:
sin auth de usuario, sin gestión de tokens, sin workspaces — a propósito
(ver §4).

---

## 1. Stack

| Capa | Elección |
| --- | --- |
| Lenguaje | TypeScript, sin dependencias en runtime (`Zero Dependencies` en el README) |
| Build | **Rollup** (`rollup.config.js`, `@rollup/plugin-typescript` + `rollup-plugin-dts`) → `dist/` (JS + `.d.ts` bundleados) |
| Tipos de la API | Generados con **`swagger-typescript-api`** desde el swagger real de `invo-backend` (`swagger.ts` → `src/types/api.types.ts`) |
| Package manager | **npm** es el oficial (CI, `package-lock.json`, docs). **bun funciona igual** para desarrollo local — es lo que se ha usado en la práctica en este entorno (`bun install`, `bunx tsc`, `bunx rollup`) |
| Runtime objetivo | Node ≥18 (`engines` en `package.json`); el paquete lo consumen apps Node/Express/NestJS de terceros |
| CI | GitHub Actions, solo `npm run build` en Node 18.x/20.x. Sin tests ni lint en CI |

---

## 2. Estructura

```
invo-sdk-ts/
├── CLAUDE.md              ← este fichero
├── README.md               ← documentación pública (npm)
├── docs/                   ← guías ampliadas (§5, alguna desfasada — ver ahí)
├── swagger.ts              ← regenera src/types/api.types.ts desde el swagger real
├── rollup.config.js
├── test/                   ← scripts manuales (test:invoice, test:makeup, test:reader, test:token)
│                              contra la API real — necesitan un token válido en .env, no es
│                              una suite automatizada ni corre en CI
└── src/
    ├── index.ts             ← superficie pública del paquete (export curado, no export *)
    ├── sdk.ts                ← clase InvoSDK: store/read/pdf/request + login automático
    ├── errors.ts             ← AuthError, InvalidCredentialsError, NetworkError, TokenExpiredError…
    ├── utils.ts               ← decodeJWT, isTokenExpired…
    └── types/
        ├── api.types.ts       ← GENERADO por swagger.ts. Tracked en git (pese a estar también en
        │                        .gitignore bajo "Custom" — así estaba antes de este fichero, no se
        │                        ha tocado); no se edita a mano, se regenera
        ├── index.ts            ← re-exporta un subconjunto curado de api.types.ts + tipos propios
        │                        (algunos, como CreateApiTokenDto/ApiTokenResponse aquí, no se
        │                        publican desde src/index.ts — quedaron sin usar, ver §5)
        └── sdk.types.ts        ← InvoSDKConfig
```

`InvoSDK` es deliberadamente fino: `store()`, `read()`, `pdf()` y un
`request()` genérico de escape. No hay wrappers para tokens, auth, TOTP,
workspaces, etc. — ni falta, dado el caso de uso (ver el bloque de arriba).
Antes de añadir un método nuevo, confirma que el caso de uso lo pide (ver
§5, "no añadiríamos algo más de momento").

---

## 3. Cómo correrlo

```bash
npm install        # o bun install — ambos funcionan aquí

npm run build       # rollup -c → dist/
npm run build:watch # tsc --watch

npm run types          # regenera src/types/api.types.ts contra PRODUCCIÓN (api.invo.rest)
npm run types:sandbox  # ídem contra SANDBOX (sandbox.invo.rest)

npm run test:invoice   # scripts manuales contra la API real — necesitan INVO_API_TOKEN en .env
npm run test:makeup    # (no hay .env.example en el repo pese a que docs/TESTING.md lo menciona,
npm run test:reader    #  ver §5 — hay que crear el .env a mano con las claves de docs/TESTING.md)
npm run test:token
```

**El tipo de `env` en `swagger.ts` lo decide el primer argumento posicional
(`process.argv[2]`), con `INVO_ENV` y `'production'` como fallback** — antes
solo miraba `INVO_ENV`, así que `npm run types:sandbox` regeneraba siempre
contra producción sin avisar (arreglado en PR #1, ver §5). Si alguna vez
vuelve a fallar, es lo primero que hay que mirar.

**Publicar a npm**: `npm version patch|minor|major` (semver estándar, sin
changesets — el script `release: changeset publish` de `package.json` no
está conectado a nada, no hay `.changeset/`) → `npm run build` →
`npm publish`. Detalle completo en `docs/PUBLISHING.md`, **con la salvedad
de la §5** (parte de ese fichero es boilerplate de otro paquete).

---

## 4. Decisiones tomadas

### Los tipos se regeneran contra producción, no sandbox

`npm run types` (sin sufijo) es el flujo por defecto documentado en el
README, y es lo que se usa antes de publicar: el contrato público real es
el de `api.invo.rest`, no el de sandbox — sandbox puede llevar features
que aún no se promocionaron a producción (comprobado: la descripción de
`scopes` y el step-up del webhook secret estaban en sandbox pero no en
producción el 2026-08-28). Regenerar contra sandbox es solo para probar
en desarrollo.

### `OAuthCallbackDto` se quitó de las exportaciones públicas (PR #1, breaking menor → 0.2.0)

Al regenerar `api.types.ts` tras meses sin hacerlo, `OAuthCallbackDto`
había desaparecido del swagger real: los endpoints de callback OAuth ya
no llevan body. Mantenerlo a mano en `src/index.ts`/`src/types/index.ts`
habría sido mentir sobre el contrato de la API, así que se quitó — el
paquete no compilaba si no. Nunca formó parte de la superficie
documentada/usada (`store`/`read`/`pdf`), así que el riesgo real para
integraciones existentes es bajo, pero es una exportación pública que
desaparece: se subió la versión a `0.2.0` para dejarlo señalizado, no un
patch silencioso.

### `scopes` se generaba como `any[][]` — la causa era `invo-backend`, no el cliente

El SDK regeneraba `scopes?: any[][]` en vez de `string[]` para la creación
de API tokens. La causa no estaba aquí: en `invo-backend`,
`CreateApiTokenDto.scopes` usaba `@ApiProperty({ isArray: true, ... })`
sin un `type` explícito — sin él, `@nestjs/swagger` no puede saber el tipo
de los elementos (los genéricos de TS se pierden al compilar) y generaba
`items: { type: 'array' }` en vez de `items: { type: 'string' }`. Se
arregló en `invo-backend` (`type: [String]`, PR #235, mergeado
2026-08-28) — **una vez esté desplegado**, regenerar aquí con `npm run
types` recogerá el tipo correcto sin tocar nada de este repo.

---

## 5. Lo que NO se ha tocado (a propósito o pendiente)

- **`dist/` está trackeado en git pero desfasado** — referencia una
  estructura de `src/types/` antigua (`auth.types.ts`, `invoice.types.ts`,
  `manual.types.ts`) que ya no existe. No importa para lo que se publica
  de verdad: `prepublishOnly` corre `clean && build` antes de cada
  `npm publish`, así que el `dist/` de git nunca es lo que llega a npm. No
  se ha limpiado por no ser parte de lo pedido — si se toca alguna vez,
  ojo a no confundir este `dist/` viejo con el real.
- **`docs/PUBLISHING.md` es boilerplate de otro paquete, sin adaptar**:
  habla de `packages/auth-sdk`, del paquete `@calltek/auth-sdk` y de
  `createAuthClient({ apiUrl })` — nada de eso existe en este repo (el
  paquete real es `@calltek/invo-sdk`, sin monorepo, con `InvoSDK`). La
  sección de versionado semántico y el flujo `npm version` sí son
  correctos y es lo que se ha seguido en las decisiones de arriba; el
  resto hay que leerlo con cuidado.
- **`docs/TESTING.md` referencia un `.env.example` que no existe** en el
  repo — hay que crear el `.env` a mano con las claves que ahí se
  documentan (`INVO_API_TOKEN`, `INVO_NAME`, `INVO_NIF`).
- **ESLint y Prettier están rotos**, no por este trabajo: `.eslintrc.js`
  es formato viejo con ESLint 9 instalado (pide `eslint.config.js`), y
  `.prettierrc.js` usa `module.exports` en un paquete `"type": "module"`.
  Ninguno de los dos corre en CI, así que llevan tiempo así sin que nadie
  lo note.
- **El "Types" del README (sección homónima) está escrito a mano y se
  desincroniza del DTO real** — no se genera desde `api.types.ts`. A
  fecha 2026-08-28: `emitterName` se documenta como obligatorio y en
  todos los ejemplos se pasa siempre, pero en el DTO real es opcional (si
  se omite, se toma del certificado); `type` se documenta como `string`
  suelto y en realidad es la unión literal `'F1'|'F2'|'F3'|'R1'|...|'R5'`;
  y `rectificationType` (obligatorio en las rectificativas R1-R5) no
  aparece documentado en ningún sitio del README ni de `docs/`.
- **`src/types/index.ts` define `CreateApiTokenDto`/`ApiTokenResponse`/
  `ApiTokenListItem` a mano** (con `scopes?: string[]`, ya bien tipado)
  pero **`src/index.ts` no los reexporta** — no llegan a consumidores del
  paquete. Cadáver del código, no una API pública real; no confundirlos
  con el `CreateApiTokenDto` autogenerado en `api.types.ts` (incompatible
  entre sí, mismo nombre).

---

## 6. El ecosistema INVO

Ver `invo-backend/CLAUDE.md` e `invo-app/CLAUDE.md` para el detalle
completo. Resumen relevante desde aquí:

| Repo | Qué es | Dónde vive |
| --- | --- | --- |
| `invo-backend` | la API (NestJS). Fuente de verdad del swagger que consume `swagger.ts` (`/swagger-internal.json`, sandbox y producción) | `api.invo.rest` / `sandbox.invo.rest` |
| `invo-app` | backoffice (Vue 3). Gestiona los API tokens que este SDK consume — aquí no se crean ni se listan | `app.invo.rest` |
| `invo-sdk-ts` | este repo — SDK TypeScript público | npm (`@calltek/invo-sdk`) |
| `invo-front` | landing pública (Astro), no tiene relación con este SDK | `invo.rest` |
