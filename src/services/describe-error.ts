export function describeError(unknownError: unknown, fallbackMessage: string): string {
  if (unknownError instanceof Error && unknownError.message) {
    return unknownError.message
  }
  if (
    typeof unknownError === 'object' &&
    unknownError !== null &&
    'message' in unknownError &&
    typeof unknownError.message === 'string' &&
    unknownError.message
  ) {
    return unknownError.message
  }
  return fallbackMessage
}
