import { spawnSync } from 'child_process'
import { buildSync } from 'esbuild'
import { resolve } from 'path'

import { getDirs } from './libs/constants'
import { resolveRelative } from './libs/utils'

main()

function main() {
  const { nodeModules, scripts } = getDirs()
  const lintStaged = { cmd: <BinCmds>'lint-staged', out: resolve(nodeModules, <BinCmds>'lint-staged' + '.config') }
  buildSync({
    bundle: true,
    entryPoints: [{ in: resolveRelative(scripts, 'lint-staged.ts'), out: 'lint-staged.config' }],
    external: ['micromatch'],
    format: 'cjs',
    outdir: nodeModules,
    platform: 'node',
  })
  console.log(lintStaged.out)
  spawnSync(`${lintStaged.cmd} --config ${lintStaged.out}.js`)
}
