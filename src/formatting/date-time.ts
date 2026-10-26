const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime))
}
