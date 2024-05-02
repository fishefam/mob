import type { Platform } from 'esbuild'

export function getOptionEntries(platform: Platform): BuildEntries {
  if (platform === 'node') return { paths: [{ in: 'src/main.ts', out: 'main' }], platform: 'node' }
  return {
    paths: [
      { in: 'src/renderer.tsx', out: 'renderer' },
      { in: 'src/index.html', out: 'index' },
    ],
    platform: 'browser',
  }
}

export function getDirs() {
  return {
    assets: 'public',
    electron: '.electron',
    out: 'out',
    source: 'src',
  } as const
}

export function getPkgNames() {
  return {
    core: 'mob-core',
    root: 'mob',
  }
}
