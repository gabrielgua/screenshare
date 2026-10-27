const PRODUCTION_APP_ADDRESS = 'https://screenshare.gabrielgua.com.br'

const SIGN_IN_HOST_PATTERNS: RegExp[] = [
  /^discord\.com$/,
  /^[a-z0-9-]+\.discord\.com$/,
  /^[a-z0-9]+\.supabase\.co$/,
]

export const APP_ADDRESS = new URL(process.env.SCREENSHARE_APP_URL ?? PRODUCTION_APP_ADDRESS)

export function isAppAddress(address: string): boolean {
  return readOrigin(address) === APP_ADDRESS.origin
}

export function canOpenInsideApp(address: string): boolean {
  if (isAppAddress(address)) {
    return true
  }
  const parsedAddress = parseAddress(address)
  return (
    parsedAddress?.protocol === 'https:' &&
    SIGN_IN_HOST_PATTERNS.some((hostPattern) => hostPattern.test(parsedAddress.hostname))
  )
}

export function canOpenInBrowser(address: string): boolean {
  const protocol = parseAddress(address)?.protocol
  return protocol === 'https:' || protocol === 'http:'
}

function readOrigin(address: string): string | undefined {
  return parseAddress(address)?.origin
}

function parseAddress(address: string): URL | undefined {
  try {
    return new URL(address)
  } catch {
    return undefined
  }
}
