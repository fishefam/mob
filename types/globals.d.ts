/* eslint-disable @typescript-eslint/consistent-type-imports */

type EnvironmentVars<T extends Record<number | string, string>> = Partial<T>
type EntryPoints = { in: `src/${string}`; out: string }[]
type BuildEntries = { paths: EntryPoints; platform: import('esbuild').Platform }

declare module NodeJS {
  interface ProcessEnv
    extends EnvironmentVars<{
      NODE_ENV: 'development' | 'production'
    }> {}
}
