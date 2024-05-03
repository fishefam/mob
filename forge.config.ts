import type { ForgeConfig } from '@electron-forge/shared-types'

import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

const forgeConfig: ForgeConfig = {
  makers: [
    {
      config: {},
      name: '@electron-forge/maker-squirrel',
    },
    {
      config: {},
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      config: {},
      name: '@electron-forge/maker-deb',
    },
    {
      config: {},
      name: '@electron-forge/maker-rpm',
    },
  ],
  packagerConfig: {
    asar: true,
  },
  plugins: [
    {
      config: {},
      name: '@electron-forge/plugin-auto-unpack-natives',
    },
    new FusesPlugin({
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.RunAsNode]: false,
      version: FuseVersion.V1,
    }),
  ],
  rebuildConfig: {},
}

export default forgeConfig
