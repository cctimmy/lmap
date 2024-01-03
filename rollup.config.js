import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import scss from 'rollup-plugin-scss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    input: `src/index.ts`,
    sourceMap: true,
    format: 'esm',
    plugins: [
      resolve(),
      commonjs(),
      scss({
        output: 'dist/bundle.css',
        insert: true,
        watch: 'src'
      }),
      esbuild()
    ],
    output: [
      {
        dir: 'dist'
      }
    ]
  },
  {
    input: `src/index.ts`,
    external: [/\.scss$/], // ignore .scss file
    plugins: [dts()],
    output: [
      {
        file: `dist/index.d.ts`
      }
    ]
  }
]
