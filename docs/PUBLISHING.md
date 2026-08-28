# Publishing Guide

## Instrucciones para publicar el SDK a npm

### Prerequisitos

1. Cuenta en npm con acceso a la organización `@calltek`: https://www.npmjs.com/signup
2. Estar autenticado en npm CLI

```bash
npm login
```

### Primera publicación

```bash
# En la raíz del repo (no es un monorepo, no hay que entrar a ningún subdirectorio)

# 1. Asegúrate de que todo está actualizado
npm install

# 2. Compila el proyecto
npm run build

# 3. Verifica que todo esté correcto
ls dist/

# 4. Publica a npm (primera vez con --access public)
npm publish --access public
```

### Actualizaciones posteriores

No se usan changesets (el script `release` de `package.json` no está conectado
a nada — no hay `.changeset/`): la versión se sube a mano con `npm version`.

```bash
# 1. Actualiza la versión según el tipo de cambio
npm version patch   # Para bug fixes (1.0.0 -> 1.0.1)
npm version minor   # Para nuevas features, o breaking changes en 0.x (0.1.0 -> 0.2.0)
npm version major   # Para breaking changes en >=1.x (1.0.0 -> 2.0.0)

# 2. Compila
npm run build

# 3. Publica
npm publish
```

`prepublishOnly` ya corre `npm run clean && npm run build` automáticamente
antes de cada `npm publish`, así que el paso 2 es redundante en la práctica
— se deja explícito aquí para poder revisar `dist/` antes de publicar.

### Verificar la publicación

```bash
# Ver el paquete publicado
npm view @calltek/invo-sdk

# Instalar en otro proyecto para probar
npm install @calltek/invo-sdk
```

## Uso en otros proyectos

Una vez publicado, puedes instalarlo en cualquier proyecto:

```bash
npm install @calltek/invo-sdk
```

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({ apiToken: process.env.INVO_API_TOKEN! })
```

Ver el [README](../README.md) para el resto de la API (`store`, `read`, `pdf`).

## Publicación desde CI/CD

Si quieres automatizar la publicación desde GitHub Actions u otro CI (hoy no
está automatizado — `.github/workflows/build.yml` solo compila en cada push/PR
a `main`, no publica):

### GitHub Actions Example

```yaml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Notas importantes

- El nombre del paquete es `@calltek/invo-sdk` (scoped package)
- La primera vez debes usar `--access public` para paquetes scoped
- Solo se publica lo que declara `files` en `package.json` (`dist/`,
  `README.md`, `LICENSE`) — `.npmignore` también existe, pero cuando hay un
  `files` en `package.json` es ese campo el que manda; da igual lo que diga
  `.npmignore` (comprobado con `npm pack --dry-run`)
- El `package.json` está configurado para apuntar a `dist/index.js` y `dist/index.d.ts`

## Versionado semántico

Sigue [Semantic Versioning](https://semver.org/), con la salvedad de que el
paquete está en `0.x` — por convención de semver, en `0.x` un breaking change
sube el **MINOR**, no el MAJOR (el MAJOR se reserva para cuando el paquete
llegue a `1.0.0`):

- **MAJOR** (1.0.0 -> 2.0.0): Cambios incompatibles con versiones anteriores (solo aplica desde 1.x)
- **MINOR** (1.0.0 -> 1.1.0, o 0.1.0 -> 0.2.0): Nuevas funcionalidades compatibles, o breaking changes mientras el paquete esté en 0.x
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes compatibles

## Testing antes de publicar

Prueba el paquete localmente antes de publicar:

```bash
# En el directorio del SDK
npm link

# En tu proyecto de prueba
npm link @calltek/invo-sdk

# Ahora puedes importar y probar como si estuviera publicado
```

Para deshacer el link:

```bash
npm unlink @calltek/invo-sdk
```
