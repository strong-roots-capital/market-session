import is from '@sindresorhus/is'

import { MINUTES_IN_HOUR,
         MINUTES_IN_DAY,
         MINUTES_IN_WEEK,
         MINUTES_IN_MONTH } from './minutes'

export function isMonthly(session: number | string): boolean {
    return is.number(session)
        ? session >= MINUTES_IN_MONTH && session % MINUTES_IN_MONTH == 0
        : /M$/.test(session)
}

export function isWeekly(session: number | string): boolean {
    return is.number(session)
        ? session >= MINUTES_IN_WEEK && session % MINUTES_IN_WEEK == 0
        : /W$/.test(session)
}

export function isDaily(session: number | string): boolean {
    return is.number(session)
        ? session >= MINUTES_IN_DAY && session % MINUTES_IN_DAY == 0
        : /D$/.test(session)
}

export function isHourly(session: number | string): boolean {
    return is.number(session)
        ? session >= MINUTES_IN_HOUR && session % MINUTES_IN_HOUR == 0
        : /H$/.test(session)
}

// TODO: test where session is expressed in minutes but is a multiple of 60 (so isHourly)
export function isMinutely(session: number | string): boolean {
    return is.number(session)
        ? Number.isInteger(session)
        : /^\d+$/.test(session)
}
