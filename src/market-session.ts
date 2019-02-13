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
import { recentSessions } from './recent-sessions'
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

    // TODO: test where session is expressed in minutes but is a multiple of 60 (so isHourly)
    const parseIt = (s: string): number => parseInt(s) ? parseInt(s) : 1
    const translations: [(s: string) => boolean, (n: string) => number][] = [
        [isMonthly, (n) => parseIt(n) * MINUTES_IN_MONTH],
        [isWeekly, (n) => parseIt(n) * MINUTES_IN_WEEK],
        [isDaily, (n) => parseIt(n) * MINUTES_IN_DAY],
        [isHourly, (n) => parseIt(n) * MINUTES_IN_HOUR],
        [isMinutely, (n) => parseIt(n)]
    ]

    for (const [isTimeframe, translation] of translations) {
        if (isTimeframe(session))
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

    const translations: [(s: string) => boolean, (open: Date) => boolean][] = [
        [isMonthly, (open) => isMostRecentSessionOpen(parseInt(session), 'month', open, from)],
        [isWeekly, (open) => isMostRecentSessionOpen(parseInt(session), 'week', open, from)],
        [isDaily, (open) => isMostRecentSessionOpen(parseInt(session), 'day', open, from)],
        [isHourly, (open) => isMostRecentSessionOpen(parseInt(session), 'hours', open, from)],
        [isMinutely, (open) => isMostRecentSessionOpen(parseInt(session), 'minutes', open, from)],
    ]

    for (const [isTimeframe, isMostRecentInterval] of translations) {
        if (isTimeframe(session))
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

    date = moment.utc(date).startOf('minute').toDate()

    let closed: number[] = []

    // TODO: test where session is expressed in minutes but is a multiple of 60 (so isHourly)
    for (const rawSession of sessions) {
        const period = fromString(rawSession)
        const session = toString(period)

        const pushIfSessionClose = (duration: moment.unitOfTime.DurationConstructor) => {
            if (recentSessions(parseInt(session), duration, date).includes(date.getTime()))
                closed.push(period)
        }

        const translations: [(s: string) => boolean, () => void][] = [
            [isMonthly, () => pushIfSessionClose('month')],
            [isWeekly, () => pushIfSessionClose('week')],
            [isDaily, () => pushIfSessionClose('day')],
            [isHourly, () => pushIfSessionClose('hour')],
            [isMinutely, () => pushIfSessionClose('minute')],
        ]

        for (const [isTimeframe, pushIfSessionClose] of translations) {
            if (isTimeframe(session))
                pushIfSessionClose()
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
