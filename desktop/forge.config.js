const { MakerSquirrel } = require('@electron-forge/maker-squirrel')

const PACKAGED_PATH_PATTERNS = [
  /^\/package\.json$/,
  /^\/build(\/(main|preload)\.cjs)?$/,
  /^\/assets(\/screenshare\.ico)?$/,
  /^\/native(\/application-audio(\/build(\/Release(\/application_audio\.node)?)?)?)?$/,
]

const INSTALLER_ICON_ADDRESS =
  'https://raw.githubusercontent.com/gabrielgua/screenshare/main/desktop/assets/screenshare.ico'

module.exports = {
  packagerConfig: {
    name: 'Screenshare',
    executableName: 'Screenshare',
    icon: 'assets/screenshare',
    appCopyright: 'gabrielgua',
    asar: { unpack: '**/*.node' },
    ignore: (packagedPath) =>
      packagedPath !== '' &&
      !PACKAGED_PATH_PATTERNS.some((pathPattern) => pathPattern.test(packagedPath)),
  },
  makers: [
    new MakerSquirrel({
      name: 'Screenshare',
      setupExe: 'ScreenshareSetup.exe',
      setupIcon: 'assets/screenshare.ico',
      iconUrl: INSTALLER_ICON_ADDRESS,
    }),
  ],
}
