import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  // Bundle JS
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js', // archivo final JS
      format: 'esm',          // ESM para Node
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },

  // Bundle de tipos .d.ts
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
