/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'
import is from '@sindresorhus/is'
import * as moment from 'moment'
import { utcDate } from '@hamroctopus/utc-date'
import isTradingviewFormat from '@strong-roots-capital/is-tradingview-format'

import { ArgumentError } from './argument-error'
import { isMostRecentSessionOpen } from './is-most-recent-session-open'
import { isMinutely, isHourly, isDaily, isWeekly, isMonthly } from './is'
import { MINUTES_IN_HOUR, MINUTES_IN_DAY, MINUTES_IN_WEEK, MINUTES_IN_MONTH } from './minutes'

/**
 * Default session-resolutions to match against given date-times.
 */
const defaultSessions = [
    '5', '15', '30', '60', '4H', '12H', '1D', '3D', '1W', '1M', '3M', '12M'
]

export interface Session {
    (date: Date, sessions?: string[]): number[]
    fromString(session: string): number
    toString(session: number): string
    isMostRecent(session: string, dateOrTime: Date | number, from: Date): boolean
}

const inTradingviewFormat = (s: string): boolean | string => isTradingviewFormat(s) || `Expected string ${s} to be in Trading View format`

/**
 * Convert a string-based representation of a market session into an
 * integer describing the session length in minutes.
 *
 * Input is validated against the Trading View format, which can
 * briefly be described as a number followed by one of the following
 * suffixes: '', 'H', 'D', 'W', or 'M'.
 *
 * A string consisting only of a valid suffix-character will be
 * interpreted as having an implicit quantifier of 1.
 *
 * @remarks
 * The string-format described above is colloquially known as the
 * "Trading View" session format.
 *
 * @param session - Timeframe expressed in Trading View format.
 * @returns Number of minutes represented by `session`
 */
function fromString(session: string): number {
    ow(session, ow.string.not.empty)
    ow(session, ow.string.is(inTradingviewFormat))

    const translations: [RegExp, (n: string) => number][] = [
        [/^[1-9][0-9]*$/, (n) => parseInt(n)],
        [/^[1-9][0-9]*H$/, (n) => parseInt(n) * MINUTES_IN_HOUR],
        [/^[1-9][0-9]*D$/, (n) => parseInt(n) * MINUTES_IN_DAY],
        [/^[1-9][0-9]*W$/, (n) => parseInt(n) * MINUTES_IN_WEEK],
        [/^[1-9][0-9]*M$/, (n) => parseInt(n) * MINUTES_IN_MONTH],
        [/^H$/, () => MINUTES_IN_HOUR],
        [/^D$/, () => MINUTES_IN_DAY],
        [/^W$/, () => MINUTES_IN_WEEK],
        [/^M$/, () => MINUTES_IN_MONTH]
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
 * If the number of minutes in a session are resolvable to a higher timeframe,
 * output will consist of a suffix denoting
 *
 * 'H'  =\> hours
 * 'D'  =\> days
 * 'W'  =\> weeks
 * 'M'  =\> months
 * 'Y'  =\> years
 *
 * Otherwise, the original session will be returned as a string.
 *
 * @param session - Timeframe expressed in number of minutes
 * @returns String-representation of `session`
 */
function toString(session: number): string {

    ow(session, ow.number.greaterThan(0))
    ow(session, ow.number.lessThanOrEqual(moment.duration(1, 'year').as('minutes')))

    const translations: [(n: number) => boolean, (n: number) => string][] = [
        [isMonthly, (n) => `${n/MINUTES_IN_MONTH}M`],
        [isWeekly, (n) => `${n/MINUTES_IN_WEEK}W`],
        [isDaily, (n) => `${n/MINUTES_IN_DAY}D`],
        [isHourly, (n) => `${n/MINUTES_IN_HOUR}H`],
        [isMinutely, (n) => `${n}`]
    ]

    for (const [predicate, translation] of translations) {
        if (predicate(session)) {
            const asString = translation(session)
            if (!isTradingviewFormat(asString)) {
                console.warn(`WARNING: ${session} as a string (${asString}) is not valid Trading View format`)
            }
            return asString
        }
    }

    /**
     * Note: this statement should never run. If you are seeing this
     * error, the argument validation above is incorrect
     */
    throw new ArgumentError(`Cannot interpret session interval ${session}`, toString)
}

/**
 * Test if an opening-timestamp describes the most recently-closed
 * session.
 *
 * @remarks
 *
 * @param session - Session (in Trading View format) length in question
 * @param dateOrTime - Date or time of the open of the session in
 * question
 * @param from - Date used as current time, to aid with testing
 * @returns True if `dateOrTime` describes the open of the most
 * recently-closed candle
 */
function isMostRecent(session: string, dateOrTime: Date | number, from: Date = utcDate()): boolean {
    /**
     * There was a prior discussion around typing `session` as
     * `number | string`, and a decision made against the
     * proposal. The decision stems from a 'month' having such a
     * nebulous definition in terms of minutes.
     *
     * The `toString` function in this package shall use the
     * numeric test defined in `isMonthly` to preserve the
     * congruence in the toString(fromString('1M')) transform.
     *
     * The `isMostRecent` function however deals with _specific_
     * months and as such cannot use general approximations.
     */
    ow(session, ow.string.is(inTradingviewFormat))

    const open: Date = is.number(dateOrTime) ? new Date(dateOrTime) : dateOrTime

    const translations: [RegExp, (open: Date) => boolean][] = [
        [/M$/, (open) => isMostRecentSessionOpen(parseInt(session), 'month', open, from)],
        [/W$/, (open) => isMostRecentSessionOpen(parseInt(session), 'week', open, from)],
        [/D$/, (open) => isMostRecentSessionOpen(parseInt(session), 'day', open, from)],
        [/H$/, (open) => isMostRecentSessionOpen(parseInt(session), 'hours', open, from)],
        [/^\d+$/, (open) => isMostRecentSessionOpen(parseInt(session), 'minutes', open, from)],
    ]

    for (const [regex, isMostRecentInterval] of translations) {
        if (regex.test(session))
            return isMostRecentInterval(open)
    }

    /**
     * Note: this statement should never run. If you are seeing this
     * error, the argument validation above is incorrect
     */
    throw new ArgumentError(`Cannot interpret session interval ${session}`, isMostRecent)
}


/**
 * Return list of sessions that closed on Date (with minute-resolution).
 * List of sessions is confined to `sessions`, which may be overridden
 * with any sessions accepted by `fromString`.
 *
 * @param date - Date to test for session-closes
 * @returns List of sessions that closed on `date`
 */
// TODO: this needs to be overhauled.
const session = (date: Date, sessions: string[] = defaultSessions): number[] => {
    // DISCUSS: allowing sessions as string[] | number[]. number[] would
    // avoid ambiguity in representation

    /* Validate parameters */
    for (const session of sessions) {
        ow(session, ow.string.is(inTradingviewFormat))
    }

    let closed: number[] = []

    const isNew = (duration: moment.unitOfTime.DurationConstructor, date: Date): boolean => moment.utc(date).startOf('minute').isSame(moment.utc(date).startOf(duration))
    const getUTCDayIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'days')
    const getUTCHoursIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'hours')
    const getUTCMinutesIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'minutes')

    for (const rawSession of sessions) {
        const period = fromString(rawSession)
        const session = toString(period)
        const quantifier = parseInt(session)
        if (/M$/.test(session)) {
            if (isNew('month', date) && (date.getUTCMonth() % quantifier == 0 || date.getUTCMonth() == 0))
                closed.push(period)
        } else if (/W$/.test(session)) {
            // TODO: check TV-week (first full-week of year) is valid, iso week is not a match
            if (isNew('week', date) && moment.utc(date).week() % quantifier == 0)
                closed.push(period)
        } else if (/D$/.test(session)) {
            if (isNew('day', date) && (getUTCDayIntoYear(date) % quantifier == 0 || getUTCDayIntoYear(date) == 0))
                closed.push(period)
        } else if (/H$/.test(session)) {
            // TODO: TV would use number of hours into day
            if (isNew('hour', date) && (getUTCHoursIntoYear(date) % quantifier == 0 || getUTCHoursIntoYear(date) == 0))
                closed.push(period)
        } else {
            // TODO: TV would use number of minutes into day
            if (getUTCMinutesIntoYear(date) % period == 0)
                closed.push(period)
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
    },
    isMostRecent: {
        value: isMostRecent
    }
})

export default session as Session
