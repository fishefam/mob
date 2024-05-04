import { spawnSync } from 'child_process'
import { buildSync } from 'esbuild'

import { getDirs } from './libs/constants'
import { resolveRelative } from './libs/utils'

main()

function main() {
  const { nodeModules, scripts } = getDirs()
  const lintStaged = { cmd: <BinCmds>'lint-staged', out: <BinCmds>'lint-staged' + '.config' }
  buildSync({
    bundle: true,
    entryPoints: [{ in: resolveRelative(scripts, 'lint-staged.ts'), out: lintStaged.out }],
    external: ['micromatch'],
    format: 'cjs',
    platform: 'node',
  })
  spawnSync(`${lintStaged.cmd} --config ${resolveRelative(nodeModules, lintStaged.out)}`)
}
