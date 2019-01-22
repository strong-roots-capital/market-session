/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'
import { ArgumentError } from './argument-error'
import moment from 'moment'

/**
 * Default session-resolutions to match against given date-times.
 */
const defaultSessions = [
    '5', '15', '30', '60', '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]


export interface Session {
    (date: Date, sessions?: string[]): number[]
    fromString(session: string): number
    toString(session: number): string
}

const MINUTES_IN_HOUR = 60
const MINUTES_IN_DAY = 60 * 24
const MINUTES_IN_WEEK = 60 * 24 * 7
// TODO: verify this is the number used in each TradingView calendar month
const MINUTES_IN_MONTH = 60 * 24 * 7 * 4
// TODO: verify this is the number used in each TradingView calendar year
const MINUTES_IN_YEAR = 60 * 24 * 7 * 4 * 12


function isMidnight(date: Date): boolean {
    return date.getUTCHours() == 0 && date.getUTCMinutes() == 0
}

function isNewYear(date: Date): boolean {
    return date.getUTCDate() == 1
        && date.getUTCMonth() == 0
        && date.getUTCDate() == 1
        && isMidnight(date)
}

function isNewWeek(date: Date): boolean {
    return isMidnight(date) && date.getUTCDay() == 0
}

function isNewMonth(date: Date): boolean {
    return date.getUTCDate() == 1 && isMidnight(date)
}

/**
 * Returns the number of complete days that have already passed this year
 */
function getUTCDayIntoYear(date: Date): number {
    return ((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
             - Date.UTC(date.getUTCFullYear(), 0, 0)) / 24 / 60 / 60 / 1000) - 1
}

function getUTCHoursIntoYear(date: Date): number {
    return getUTCDayIntoYear(date) * 24 + date.getUTCHours()
}

function getUTCMinutesIntoYear(date: Date): number {
    return date.getUTCMonth() * MINUTES_IN_MONTH
        + (date.getUTCDate()-1) * MINUTES_IN_DAY
        + date.getUTCHours() * MINUTES_IN_HOUR
        + date.getUTCMinutes()
}

function onTheHour(date: Date): boolean {
    return date.getUTCMinutes() == 0
}


/**
 * Convert a string-based representation of a market session into an
 * integer describing the session length in minutes.
 *
 * Valid input consists of a number followed by one of the following
 * suffixes: '', 'H', 'D', 'W', 'M', or 'Y'.
 *
 * A string consisting only of a valid suffix-character will be
 * interpreted as having an implicit quantifier of 1.
 */
// DISCUSS: how to handle '31D'?
function fromString(session: string): number {
    ow(session, ow.string.not.empty)
    ow(session, ow.string.matches(/^[1-9]?[0-9]*[HDWMY]?$/))

    const translations: [RegExp, (n: string) => number][] = [
        [/^[1-9][0-9]*$/, (n: string) => parseInt(n)],
        [/^[1-9][0-9]*H$/, (n: string) => parseInt(n) * MINUTES_IN_HOUR],
        [/^[1-9][0-9]*D$/, (n: string) => parseInt(n) * MINUTES_IN_DAY],
        [/^[1-9][0-9]*W$/, (n: string) => parseInt(n) * MINUTES_IN_WEEK],
        [/^[1-9][0-9]*M$/, (n: string) => parseInt(n) * MINUTES_IN_MONTH],
        [/^[1-9][0-9]*Y$/, (n: string) => parseInt(n) * MINUTES_IN_YEAR],
        [/^H$/, (n: string) => MINUTES_IN_HOUR],
        [/^D$/, (n: string) => MINUTES_IN_DAY],
        [/^W$/, (n: string) => MINUTES_IN_WEEK],
        [/^M$/, (n: string) => MINUTES_IN_MONTH],
        [/^Y$/, (n: string) => MINUTES_IN_YEAR]
    ]

    for (const [regex, translation] of translations) {
        if (regex.test(session))
            return translation(session)
    }

    /**
     * Note: this statement should never run. If you are seeing this
     * error, the argument validation above is incorrect
     */
    throw new ArgumentError(`Cannot interpret session interval '${session}'`, fromString)
}

/**
 * Convert a numeric representation of a market session into a human-readable
 * string describing the session.
 *
 * If the number of minutes in a session are resolvable to a higher-timeframe,
 * output will consist of a suffix denoting
 *
 * 'H'  => hours
 * 'D'  => days
 * 'W'  => weeks
 * 'M'  => months
 * 'Y'  => years
 *
 * Otherwise, the original session will be returned as a string.
 */
function toString(session: number): string {
    ow(session, ow.number.greaterThan(0))

    const translations: [(n: number) => boolean, (n: number) => string][] = [
        [(n: number) => n >= MINUTES_IN_YEAR && n % MINUTES_IN_YEAR == 0, (n: number) => `${session/MINUTES_IN_YEAR}Y`],
        [(n: number) => n >= MINUTES_IN_MONTH && n % MINUTES_IN_MONTH == 0, (n: number) => `${session/MINUTES_IN_MONTH}M`],
        [(n: number) => n >= MINUTES_IN_WEEK && n % MINUTES_IN_WEEK == 0, (n: number) => `${session/MINUTES_IN_WEEK}W`],
        [(n: number) => n >= MINUTES_IN_DAY && n % MINUTES_IN_DAY == 0, (n: number) => `${session/MINUTES_IN_DAY}D`],
        [(n: number) => n >= MINUTES_IN_HOUR && n % MINUTES_IN_HOUR == 0, (n: number) => `${session/MINUTES_IN_HOUR}H`],
    ]

    for (const [predicate, translation] of translations) {
        if (predicate(session))
            return translation(session)
    }

    return session.toString()
}


/**
 * Return list of sessions that closed on Date (with minute-resolution).
 * List of sessions is confined to `sessions`, which may be overridden
 * with any sessions accepted by `fromString`.
 */
// DISCUSS: allowing sessions as string[] | number[]
const session = (date: Date, sessions: string[] = defaultSessions): number[] => {

    // console.log("Date is:", date, 'looking for sessions', sessions)

    /**
     * Validate parameters
     */
    sessions.map(fromString)

    let closed: number[] = []

    for (const rawSession of sessions) {
        const period = fromString(rawSession)
        const session = toString(period)
        if (/Y$/.test(session)) {
            const years = parseInt(session)
            // console.log('>>> comparing to session', session, 'currently', date.getUTCFullYear(), 'looking for', years)
            if (isNewYear(date) && date.getUTCFullYear() % years == 0) { closed.push(period) }
        } else if (/M$/.test(session)) {
            const months = parseInt(session)
            // console.log('~~~ comparing to session', session, 'currently', date.getUTCMonth(), 'looking for', months)
            if (isNewMonth(date) && (date.getUTCMonth() % months == 0 || date.getUTCMonth() == 0)) { closed.push(period) }
        } else if (/W$/.test(session)) {
            const weeks = parseInt(session)
            // console.log('--- comparing to session', session, 'currently', moment.utc(date).week(), 'looking for', weeks)
            if (isNewWeek(date) && moment.utc(date).week() % weeks == 0) { closed.push(period) }
        } else if (/D$/.test(session)) {
            const days = parseInt(session)
            // console.log('^^^ comparing to the day session:', session, 'currently', getUTCDayIntoYear(date), 'looking for', days)
            if (isMidnight(date) && (getUTCDayIntoYear(date) % days == 0 || getUTCDayIntoYear(date) == 0)) { closed.push(period) }
        } else if (/H$/.test(session)) {
            const hours = parseInt(session)
            // console.log('!!! comparing to the hour session:', session, 'currently', getUTCHoursIntoYear(date), 'looking for', hours)
            if (onTheHour(date) && (getUTCHoursIntoYear(date) % hours == 0 || getUTCHoursIntoYear(date) == 0)) { closed.push(period) }
        } else {
            if (getUTCMinutesIntoYear(date) % period == 0) { closed.push(period) }
        }
    }

    // console.log('Closed sessions:', closed)
    return closed
}


Object.defineProperties(session, {
    fromString: {
        value: fromString
    },
    toString: {
        value: toString
    }
})

export default session as Session
