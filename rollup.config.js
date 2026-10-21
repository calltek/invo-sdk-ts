import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

// Node built-ins are never bundled (the SDK has zero runtime dependencies)
const external = [/^node:/];

export default [
  // Bundle JS
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.js', // archivo final JS
      format: 'esm',          // ESM para Node
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        // the .d.ts bundle comes from rollup-plugin-dts below
        declaration: false,
        declarationMap: false,
      }),
    ],
  },

  // Bundle de tipos .d.ts
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
