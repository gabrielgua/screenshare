interface LockableScreenOrientation {
  lock?(orientation: 'landscape'): Promise<void>
  unlock?(): void
}

function readScreenOrientation(): LockableScreenOrientation | undefined {
  return typeof screen === 'undefined'
    ? undefined
    : (Reflect.get(screen, 'orientation') as LockableScreenOrientation | undefined)
}

export async function lockScreenToLandscape() {
  try {
    await readScreenOrientation()?.lock?.('landscape')
  } catch {
    return
  }
}

export function unlockScreenOrientation() {
  try {
    readScreenOrientation()?.unlock?.()
  } catch {
    return
  }
}
