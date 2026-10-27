export function describeWhoIsSharing(sharerNames: string[]): string | undefined {
  const [firstSharerName, secondSharerName] = sharerNames
  if (!firstSharerName) {
    return undefined
  }
  if (sharerNames.length === 1) {
    return `${firstSharerName} is sharing their screen`
  }
  if (sharerNames.length === 2) {
    return `${firstSharerName} and ${secondSharerName} are sharing`
  }
  return `${firstSharerName} and ${sharerNames.length - 1} others are sharing`
}
