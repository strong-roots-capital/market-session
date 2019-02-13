import { MINUTES_IN_HOUR, MINUTES_IN_DAY, MINUTES_IN_WEEK, MINUTES_IN_MONTH } from './minutes'

export const isMonthly = (session: number) => session >= MINUTES_IN_MONTH && session % MINUTES_IN_MONTH == 0
export const isWeekly = (session: number) => session >= MINUTES_IN_WEEK && session % MINUTES_IN_WEEK == 0
export const isDaily = (session: number) => session >= MINUTES_IN_DAY && session % MINUTES_IN_DAY == 0
export const isHourly = (session: number) => session >= MINUTES_IN_HOUR && session % MINUTES_IN_HOUR == 0
export const isMinutely = (session: number) => Number.isInteger(session)
