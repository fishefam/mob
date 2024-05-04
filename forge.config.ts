/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

module.exports = {
  makers: [
    {
      config: {},
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
    },
    {
      config: {},
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
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
  outDir: '../dist',
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
} satisfies import('@electron-forge/shared-types').ForgeConfig
