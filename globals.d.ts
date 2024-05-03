/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/consistent-type-imports */

type ArrayString = `[${string}]`
type Platform = 'browser' | 'node'
type BoolString = 'false' | 'true'
type NodeVariables<T extends Record<number | string, string>> = Partial<T>
type BuildEntries = { in: `${string}.entry.${string}`; out: string }[]

type SetState<T> = import('react').Dispatch<import('react').SetStateAction<T>>

declare var browserWindow: import('electron').BrowserWindow

declare module NodeJS {
  interface ProcessEnv
    extends NodeVariables<
      {
        DEV_URLS: ArrayString
        ELECTRON_CMD: 'make' | 'package' | 'start'
        ENV: 'development' | 'production'
      } & { [key in 'PASSWORD' | 'USER']: string }
    > {}
}

declare module esbuild {
  const esbuild: import('esbuild')
  export default esbuild
}
