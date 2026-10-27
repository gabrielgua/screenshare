const MORNING_START_HOUR = 5
const AFTERNOON_START_HOUR = 12
const EVENING_START_HOUR = 18

export function describeTimeOfDayGreeting(moment: Date): string {
  const hour = moment.getHours()
  if (hour >= MORNING_START_HOUR && hour < AFTERNOON_START_HOUR) {
    return 'Good morning'
  }
  if (hour >= AFTERNOON_START_HOUR && hour < EVENING_START_HOUR) {
    return 'Good afternoon'
  }
  return 'Good evening'
}
