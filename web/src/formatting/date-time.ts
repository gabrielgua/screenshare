const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime))
}

const calendarDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatCalendarDate(isoDateTime: string): string {
  return calendarDateFormatter.format(new Date(isoDateTime))
}
