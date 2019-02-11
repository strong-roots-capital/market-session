/**
 * marketSession
 * Logic for financial-market sessions
 */

// TODO: update market-session with this format -- years is invalid

import ow from 'ow'
import is from '@sindresorhus/is'
import { ArgumentError } from './argument-error'
import moment from 'moment'
import { utcDate } from '@hamroctopus/utc-date'
import isTradingviewFormat from '@strong-roots-capital/is-tradingview-format'

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
    isMostRecent(session: string, dateOrTime: Date | number, from?: Date): boolean
}

const MINUTES_IN_HOUR = 60
const MINUTES_IN_DAY = 60 * 24
const MINUTES_IN_WEEK = 60 * 24 * 7
// TODO: verify this is the number used in each TradingView calendar month
const MINUTES_IN_MONTH = 60 * 24 * 7 * 4

const inTradingviewFormat = (s: string): boolean | string => isTradingviewFormat(s) || `Expected string ${s} to be in Trading View format`

const isNew = (duration: moment.unitOfTime.DurationConstructor, date: Date): boolean => moment.utc(date).startOf('minute').isSame(moment.utc(date).startOf(duration))
const getUTCDayIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'days')
const getUTCHoursIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'hours')
const getUTCMinutesIntoYear = (date: Date): number => moment.utc(date).diff(moment.utc(date).startOf('year'), 'minutes')

function startOfPrevious(duration: moment.unitOfTime.DurationConstructor,
                         currentDate: moment.Moment = moment.utc()) {
    return currentDate.subtract(1, duration).startOf(duration)
}

// FIXME: pull TV week code out into own module
function firstFullWeekOfNewYear() {
    let firstWeek = moment.utc().day('Monday').week(1).startOf('day')
    const nextWeek = moment.utc().day('Monday').week(2).startOf('day')
    if (firstWeek.toDate().getUTCFullYear() !== nextWeek.toDate().getUTCFullYear()) {
        firstWeek = nextWeek
    }
    return firstWeek
}

/* Zero-indexed */
function nthFullWeekOfNewYear(n: number) {
    let week = firstFullWeekOfNewYear()
    for (let i = 0; i < n; ++i) {
        week.add(1, 'week')
    }
    return week
}

function everyNthWeekOfYear(n: number) {
    let weeks = []
    let index = 0
    while (index < 52) {
        weeks.push(nthFullWeekOfNewYear(index))
        index += n
    }
    return weeks
}

const isMonthly = (session: number) => session >= MINUTES_IN_MONTH && session % MINUTES_IN_MONTH == 0
const isWeekly = (session: number) => session >= MINUTES_IN_WEEK && session % MINUTES_IN_WEEK == 0
const isDaily = (session: number) => session >= MINUTES_IN_DAY && session % MINUTES_IN_DAY == 0
const isHourly = (session: number) => session >= MINUTES_IN_HOUR && session % MINUTES_IN_HOUR == 0
const isMinutely = (session: number) => Number.isInteger(session)

/* Note: quantifiers ignored over 12 */
// TODO: implement from
const isMonthlyOpen = (session: number, open: Date, from: moment.Moment): boolean => {
    const cap = 12 // months
    const quantifier = session / MINUTES_IN_MONTH
    return quantifier >= cap
        ? startOfPrevious('month').month() === 0
        : Array.from(new Array(cap).keys()).filter(n => n % quantifier == 0).includes(open.getUTCMonth())
}

// TODO: test and fix: is the MOST RECENT candle
/* Note: quantifiers ignored over 52 */
const isWeeklyOpen = (session: number, open: Date, from: moment.Moment) => {
    const cap = 52 // weeks
    const quantifier = session / MINUTES_IN_WEEK
    // console.log('Quantifier is', quantifier)
    // console.log('everyNthWeek is', everyNthWeekOfYear(quantifier).map(m => m.toDate()))
    // console.log('open is', open)
    return quantifier >= cap
        ? firstFullWeekOfNewYear().isSame(open)
        : everyNthWeekOfYear(quantifier).filter(m => m.isSameOrBefore(from.toDate())).filter(m => m.isSame(open)).length > 0
}

// TODO: test and fix: is the MOST RECENT candle
/* Note: quantifiers ignored over 364 */
function isDailyOpen(session: number, open: Date, from: moment.Moment) {
    const cap = 366
    const quantifier = session / MINUTES_IN_DAY
    // console.log('Daily quantifier is', quantifier)
    // console.log('Day into year', getUTCDayIntoYear(open))
    return quantifier >= cap
        ? moment.utc().startOf('year').isSame(open)
        : Array.from(new Array(cap).keys()).filter(n => n % quantifier == 0).includes(getUTCDayIntoYear(open))
    // return moment.utc().subtract(1, 'day').startOf('day').isSame(open)
}

// TODO: test and fix: is the MOST RECENT candle
// TODO: test backwards across the day-boundary
function isHourlyOpen(session: number, open: Date, from: Date) {
    const quantifier = session / MINUTES_IN_HOUR
    const clock = moment.utc(from).startOf('day')
    let sessions: moment.Moment[] = []

    console.log(moment.utc(from).diff(clock, 'hours'))
    while (quantifier <= moment.utc(from).diff(clock, 'hours')) {
        console.log(clock.toDate(), moment.utc(from).diff(clock, 'hours'))
        sessions.push(clock.clone())
        clock.add(quantifier, 'hours')
    }
    console.log('>', clock.toDate(), moment.utc(from).diff(clock, 'hours'))
    console.log('Most-recent opening session since start of day', sessions[sessions.length-1].toDate())
    const mostRecentOpen = sessions[sessions.length-1]
    return mostRecentOpen.isSame(open)



    // const startOfDay = from.clone().startOf('day')
    // return moment.utc(open).diff(startOfDay, 'hours') % quantifier == 0 &&
    //     moment.utc(open).clone().startOf('hour').isSame(open)
}

// TODO: test and fix: is the MOST RECENT candle
/**
 * True if `open` is the most-recent completed `session-`minute session-open.
 * @param session - Session length in minutes
 * @param open - Date under test
 * @param from - Date used as current time, to aid with testing
 */
function isMinutelyOpen(session: number, open: Date, from: Date) {
    const quantifier = session
    const clock = moment.utc(from).subtract(1, 'day').startOf('day')
    let clockStart = clock.clone()
    const crossedDayBoundary = (m1: moment.Moment, m2: moment.Moment) => {
        // console.log('m1 day', m1.day(), 'm2 day', m2.day())
        return !m1.isSame(m2, 'day')
    }

    let sessions: moment.Moment[] = []
    // console.log(moment.utc(from).diff(clock, 'minutes'))
    while (quantifier <= moment.utc(from).diff(clock, 'minutes') || crossedDayBoundary(clock, moment.utc(from))) {
        // console.log(clock.toDate(), moment.utc(from).diff(clock, 'minutes'))
        sessions.push(clock.clone())
        clock.add(quantifier, 'minutes')
        if (crossedDayBoundary(clock, clockStart)) {
            // console.log('Resetting this clockStart')
            clock.startOf('day')
            clockStart = clock.clone()
        }
    }
    // console.log(clock.toDate(), moment.utc(from).diff(clock, 'minutes'))
    // console.log('Most-recent opening session since start of day', sessions[sessions.length-1].toDate())
    const mostRecentOpen = sessions[sessions.length-1]
    return mostRecentOpen.isSame(open)
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
 *
 * 'D'  =\> days
 *
 * 'W'  =\> weeks
 *
 * 'M'  =\> months
 *
 * 'Y'  =\> years
 *
 * Otherwise, the original session will be returned as a string.
 *
 * @param session - Timeframe expressed in number of minutes
 * @returns String-representation of `session`
 */
function toString(session: number): string {

    ow(session, ow.number.greaterThan(0))

    const translations: [(n: number) => boolean, (n: number) => string][] = [
        [isMonthly, (n) => `${n/MINUTES_IN_MONTH}M`],
        [isWeekly, (n) => `${n/MINUTES_IN_WEEK}W`],
        [isDaily, (n) => `${n/MINUTES_IN_DAY}D`],
        [isHourly, (n) => `${n/MINUTES_IN_HOUR}H`],
    ]

    for (const [predicate, translation] of translations) {
        if (predicate(session)) {
            // TODO: ow => verify isTradingviewFormat()
            return translation(session)
        }
    }

    return session.toString()
}

/**
 * Test if an opening-timestamp describes the most recently-closed
 * session.
 *
 * @remarks
 * Yearly-quantifiers are currently ignore, in accordance with
 * how Trading View handles multi-yearly periods.
 *
 * @param session - Session (in Trading View format) length in question
 * @param dateOrTime - Date or time of the open of the session in
 * question
 * @returns True if `dateOrTime` describes the open of the most
 * recently-closed candle
 */
// DISCUSS: taking session as a number also,a to avoid `1h` and `1H` inconsistencies
// TODO: hide currentDate from the exposed callable function, it is not for users but for testing stubs
function isMostRecent(session: string, dateOrTime: Date | number, from: Date = utcDate()): boolean {
    const open: Date = is.number(dateOrTime) ? new Date(dateOrTime) : dateOrTime

    ow(session, ow.string.is(inTradingviewFormat))

    const sessionLength = fromString(session)

    // FIXME: refactor this away
    const fromMoment = moment.utc(from)

    const translations: [(n: number) => boolean, (n: Date) => boolean][] = [
        [isMonthly, (open) => isMonthlyOpen(sessionLength, open, fromMoment)],
        [isWeekly, (open) => isWeeklyOpen(sessionLength, open, fromMoment)],
        [isDaily, (open) => isDailyOpen(sessionLength, open, fromMoment)],
        [isHourly, (open) => isHourlyOpen(sessionLength, open, from)],
        [isMinutely, (open) => isMinutelyOpen(sessionLength, open, from)],
    ]

    for (const [isInterval, isMostRecentInterval] of translations) {
        if (isInterval(sessionLength))
            return isMostRecentInterval(open)
    }

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
// DISCUSS: allowing sessions as string[] | number[]
const session = (date: Date, sessions: string[] = defaultSessions): number[] => {

    /* Validate parameters */
    sessions.map(fromString)

    let closed: number[] = []

    for (const rawSession of sessions) {
        const period = fromString(rawSession)
        const session = toString(period)
        const quantifier = parseInt(session)
        if (/M$/.test(session)) {
            if (isNew('month', date) && (date.getUTCMonth() % quantifier == 0 || date.getUTCMonth() == 0))
                closed.push(period)
        } else if (/W$/.test(session)) {
            if (isNew('week', date) && moment.utc(date).week() % quantifier == 0)
                closed.push(period)
        } else if (/D$/.test(session)) {
            if (isNew('day', date) && (getUTCDayIntoYear(date) % quantifier == 0 || getUTCDayIntoYear(date) == 0))
                closed.push(period)
        } else if (/H$/.test(session)) {
            if (isNew('hour', date) && (getUTCHoursIntoYear(date) % quantifier == 0 || getUTCHoursIntoYear(date) == 0))
                closed.push(period)
        } else {
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
