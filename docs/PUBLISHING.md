# Publicar `@calltek/oruga-sdk`

La publicación a npm la hace CI (workflow `Publish @calltek/oruga-sdk`,
`.github/workflows/publish.yml`) al empujar un tag `v*`. Nadie publica a mano
desde su máquina.

## Requisitos (una vez)

- Secreto del repo `NPM_TOKEN`: un token de npm de tipo *Automation* (o
  *Granular* con permiso de publicación sobre `@calltek/oruga-sdk`; para la
  primera publicación de un paquete nuevo, el token tiene que poder crear
  paquetes en el scope `@calltek`).

## Pasos

1. En una rama, sube la versión siguiendo semver y actualiza `CHANGELOG.md`:
   ```bash
   npm version minor --no-git-tag-version   # o patch / major
   ```
   `src/version.ts` (`SDK_VERSION`) tiene que coincidir con `package.json`:
   hay un test que lo comprueba.
2. PR a `main` (el workflow `Build @calltek/oruga-sdk` corre build, typecheck y tests).
3. Tras el merge, en `main`:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```
4. El workflow `Publish @calltek/oruga-sdk` comprueba que el tag coincide con
   `package.json`, corre build y tests y publica con
   `npm publish --provenance --access public`.

Una versión con guion (`v1.3.0-beta.1`) se publica con el dist-tag `next`.

## Paquete anterior

`@calltek/invo-sdk` queda sustituido. Tras publicar la 1.0.0 de
`@calltek/oruga-sdk`, deprecarlo (a mano, una vez):

```bash
npm deprecate @calltek/invo-sdk "Replaced by @calltek/oruga-sdk"
```
