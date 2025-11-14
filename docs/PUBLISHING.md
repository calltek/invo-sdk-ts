# Publishing Guide

## Instrucciones para publicar el SDK a npm

### Prerequisitos

1. Cuenta en npm: https://www.npmjs.com/signup
2. Estar autenticado en npm CLI

```bash
npm login
```

### Primera publicación

```bash
cd packages/auth-sdk

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

```bash
cd packages/auth-sdk

# 1. Actualiza la versión según el tipo de cambio
npm version patch   # Para bug fixes (1.0.0 -> 1.0.1)
npm version minor   # Para nuevas features (1.0.0 -> 1.1.0)
npm version major   # Para breaking changes (1.0.0 -> 2.0.0)

# 2. Compila
npm run build

# 3. Publica
npm publish
```

### Verificar la publicación

```bash
# Ver el paquete publicado
npm view @calltek/auth-sdk

# Instalar en otro proyecto para probar
npm install @calltek/auth-sdk
```

## Uso en otros proyectos

Una vez publicado, puedes instalarlo en cualquier proyecto:

```bash
npm install @calltek/auth-sdk
```

```typescript
import { createAuthClient } from '@calltek/auth-sdk'

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
})
```

## Publicación desde CI/CD

Si quieres automatizar la publicación desde GitHub Actions u otro CI:

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
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        working-directory: packages/auth-sdk
        run: npm install

      - name: Build
        working-directory: packages/auth-sdk
        run: npm run build

      - name: Publish to npm
        working-directory: packages/auth-sdk
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Notas importantes

- El nombre del paquete es `@calltek/auth-sdk` (scoped package)
- La primera vez debes usar `--access public` para paquetes scoped
- Los archivos en `.npmignore` no se publicarán
- Solo se publica la carpeta `dist/` (JavaScript + TypeScript definitions)
- El `package.json` está configurado para apuntar a `dist/index.js` y `dist/index.d.ts`

## Versionado semántico

Sigue [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (1.0.0 -> 1.1.0): Nuevas funcionalidades compatibles
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes compatibles

## Testing antes de publicar

Prueba el paquete localmente antes de publicar:

```bash
# En el directorio del SDK
npm link

# En tu proyecto de prueba
npm link @calltek/auth-sdk

# Ahora puedes importar y probar como si estuviera publicado
```

Para deshacer el link:

```bash
npm unlink @calltek/auth-sdk
```
