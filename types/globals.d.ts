/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/consistent-type-imports */

type EnvironmentVars<T extends Record<number | string, string>> = Partial<T>
type EntryPoints = { [key in 'in' | 'out']: string }[]
type BuildEntries = { paths: EntryPoints; platform: import('esbuild').Platform }

declare var appWindow: import('electron').BrowserWindow

declare module NodeJS {
  interface ProcessEnv
    extends EnvironmentVars<{
      NODE_ENV: 'development' | 'production'
    }> {}
}
