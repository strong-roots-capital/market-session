/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'
import is from '@sindresorhus/is'
import moment from 'moment'
import getRecentSessions from '@strong-roots-capital/get-recent-sessions'
import isTradingviewFormat, {
    inTradingviewFormat,
    isTradingviewFormatMinutes,
    isTradingviewFormatHours,
    isTradingviewFormatDays,
    isTradingviewFormatWeeks,
    isTradingviewFormatMonths
} from '@strong-roots-capital/is-tradingview-format'

import { ArgumentError } from './argument-error'

const MINUTES_IN_MONTH = 60 * 24 * 7 * 4
const MINUTES_IN_WEEK = 60 * 24 * 7
const MINUTES_IN_DAY = 60 * 24
const MINUTES_IN_HOUR = 60

/**
 * Default session-resolutions to match against given date-times.
 */
const defaultSessions = [
    '5', '15', '30', '60', '4H', '12H', '1D', '3D', '1W', '1M', '3M', '12M'
]

export interface Session {
    (date: Date, sessions?: string[]): string[]
    (date: Date, sessions?: number[]): number[]
    fromString(session: string): number
    toString(session: number): string
}

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

    const parseIt = (s: string): number => parseInt(s) ? parseInt(s) : 1
    const translations: [(s: string) => boolean, (n: string) => number][] = [
        [isTradingviewFormatMonths, (n) => parseIt(n) * MINUTES_IN_MONTH],
        [isTradingviewFormatWeeks, (n) => parseIt(n) * MINUTES_IN_WEEK],
        [isTradingviewFormatDays, (n) => parseIt(n) * MINUTES_IN_DAY],
        [isTradingviewFormatHours, (n) => parseIt(n) * MINUTES_IN_HOUR],
        [isTradingviewFormatMinutes, (n) => parseIt(n)]
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
        [(n) => n >= MINUTES_IN_MONTH && n % MINUTES_IN_MONTH == 0, (n) => `${n/MINUTES_IN_MONTH}M`],
        [(n) => n >= MINUTES_IN_WEEK && n % MINUTES_IN_WEEK == 0, (n) => `${n/MINUTES_IN_WEEK}W`],
        [(n) => n >= MINUTES_IN_DAY && n % MINUTES_IN_DAY == 0, (n) => `${n/MINUTES_IN_DAY}D`],
        [(n) => n >= MINUTES_IN_HOUR && n % MINUTES_IN_HOUR == 0, (n) => `${n/MINUTES_IN_HOUR}H`],
        [Number.isInteger, (n) => `${n}`]
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
 * Return list of sessions that closed on Date (with minute-resolution).
 * List of sessions to check is confined to `sessions`
 *
 * @remarks
 *`sessions` may be expressed as a number[], representing number of
 * minutes in each timeframe, or as a string[], with timeframes
 * represented in Trading View format. The return-value will be
 * expressed in the same manner as `sessions`.
 *
 * @param date - Date to test for session-closes
 * @param sessions - List of session-lengths to check
 * @returns List of sessions that closed on `date`
 */
function session(date: Date, sessions?: string[]): string[];
function session(date: Date, sessions?: number[]): number[];
function session(date: Date, sessions: string[] | number[] = defaultSessions): string[] | number[] {

    let timeframes: string[] = []
    for (const session of sessions) {
        timeframes.push(is.number(session) ? toString(session) : session)
    }

    timeframes.forEach(timeframe => ow(timeframe, ow.string.is(inTradingviewFormat)))

    date = moment.utc(date).startOf('minute').toDate()

    let closedStrings: string[] = []
    let closedNumbers: number[] = []

    for (const rawTimeframe of timeframes) {
        /* normalize timeframe */
        const period = fromString(rawTimeframe)
        const timeframe = toString(period)

        if (getRecentSessions(timeframe, date).includes(date.getTime())) {
            closedNumbers.push(period)
            closedStrings.push(timeframe)
        }
    }

    return is.number(sessions[0]) ? closedNumbers : closedStrings
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

//  LocalWords:  marketSession
