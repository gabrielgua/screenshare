const TOUCH_ONLY_DEVICE_QUERY = '(hover: none) and (pointer: coarse)'

export function isTouchOnlyDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(TOUCH_ONLY_DEVICE_QUERY).matches
}
