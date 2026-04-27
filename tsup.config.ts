import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { 'main/index': 'src/main/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['electron'],
    outDir: 'dist'
  },
  {
    entry: { 'preload/index': 'src/preload/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    external: ['electron'],
    noExternal: ['darkreader'],
    outDir: 'dist'
  }
])
