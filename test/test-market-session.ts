import test from 'ava'
import * as moment from 'moment'
import { range } from './utils'

/**
 * Library under test
 */

import session from '../src/market-session'

// Note: tests the implicit-1's
const hourSessions = ['60', '4H', '12H'].map(session.fromString)
const daySessions = ['D', '2D', '3D', '4D', '5D', '6D'].map(session.fromString)
// TODO: write a test for weekly sessions
const weekSessions = ['W', '2W', '3W'].map(session.fromString)
const monthSessions = ['M', '3M', '6M'].map(session.fromString)


// Note: `time` expressed in [M, D, H, min, sec]

test("midnight on new year's should include all hourly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions, session(date, hourSessions))
})

test("midnight on new year's should include all hourly sessions, even non-standard ones", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(['9H'], session(date, ['9H']))
})

test("nine hours after midnight on new year's should include the nine hour session", t => {
    const time = [2019, 0, 1, 9, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(['9H'], session(date, ['9H']))
})

test("midnight on new year's should include all daily sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(daySessions, session(date, daySessions))
})

test("midnight on new year's should include all monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(monthSessions, session(date, monthSessions))
})

test('one minute past midnight should include no default-sessions', t => {
    const time = [2019, 0, 1, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test('one minute past midnight should include the one-minute session', t => {
    const time = [2019, 0, 1, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(['1'], session(date, ['1']))
})

test('one minute and one second past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test('one minute and one second past midnight should include one-minute session when added to search-able sessions', t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(['1'], session(date, ['1']))
})

test('one hour past midnight should include sessions up to one hour', t => {
    const time = [2019, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([5, 15, 30, 60].map(session.toString), session(date))
})

test('3 hours past midnight should include the 1h and 3h sessions', t => {
    const time = [2019, 0, 1, 3]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60, 180].map(session.toString), session(date, ['1H', '3H', '12H']))
})

test('twelve hours past midnight should include the 1h, 4h, 12h sessions', t => {
    const time = [2019, 0, 1, 12]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60, 240, 720].map(session.toString), session(date, ['1H', '4H', '12H']))
})

test('twelve hours past midnight should include the 1h, 4h, 12h sessions when expressed in minutes', t => {
    const time = [2019, 0, 1, 12]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60, 240, 720].map(session.toString), session(date, ['60', '240', '720']))
})

test('one hour and one minute and one second past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 1, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test('returned sessions should include only hourly sessions included in search-parameters', t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions, session(date, hourSessions))
})

test('returned sessions should include only monthly sessions included in search-parameters', t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(monthSessions, session(date, monthSessions))
})

test("one second past midnight on new year's should include all hourly, daily, and monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions, session(date, hourSessions))
    t.deepEqual(daySessions, session(date, daySessions))
    t.deepEqual(monthSessions, session(date, monthSessions))
})

test('weekly sessions should end on Sunday at midnight (UTC time) iff session is evenly-divisible into number of weeks into the year', t => {
    // 2019: Jan 1 => Tuesday
    t.deepEqual([], session(moment.utc([2019, 0, 1, 0, 0]).toDate(), ['1W']))
    // 2018: Jan 1 => Monday
    t.deepEqual(['1W'], session(new Date(moment.utc([2018, 0, 1, 0, 0]).format()), ['1W']))
    // 2017: Jan 1 => Sunday
    t.deepEqual([], session(new Date(moment.utc([2017, 0, 1, 0, 0]).format()), ['1W']))
})

test('second quarterly session should begin on April first', t => {
    t.deepEqual(['3M'], session(new Date(moment.utc([2019, 3, 1, 0, 0]).format()), ['3M']))
})

test('third quarterly session should begin on July first', t => {
    t.deepEqual(['3M'], session(new Date(moment.utc([2019, 6, 1, 0, 0]).format()), ['3M']))
})

test('fourth quarterly session should begin on October first', t => {
    t.deepEqual(['3M'], session(new Date(moment.utc([2019, 9, 1, 0, 0]).format()), ['3M']))
})

test('six-month session should begin on July first', t => {
    t.deepEqual(['6M'], session(new Date(moment.utc([2019, 6, 1, 0, 0]).format()), ['6M']))
})


const shouldThrowArgumentErrorOnInvalidInput = (t: any, timeframe: string) => {
    const error = t.throws(() => session(new Date(), [timeframe]), Error)
    t.is(error.name, 'ArgumentError')
}
shouldThrowArgumentErrorOnInvalidInput.title = (_ = '', timeframe: string) => `should throw ArgumentError on invalid timeframe '${timeframe}'`

const invalidTimeframes = ['5b', '1!1', '.,', 'pumba', 'Y', '1Y']
invalidTimeframes.forEach(timeframe => test(shouldThrowArgumentErrorOnInvalidInput, timeframe))


const dailySessionsEndAtMidnight = (t: any, day: number) => {
    t.deepEqual([`${day}D`], session(new Date(moment.utc([2019, 0, day+1, 0, 0]).format()), [`${day}D`]))
    t.deepEqual([], session(new Date(moment.utc([2019, 0, day, 0, 0]).format()), [`${day}D`]))
}
dailySessionsEndAtMidnight.title = (_ = '', day: number) => `${day}D session ends at midnight if evenly divisible into number of days into the year`

for (const day of range(2, 30)) {
    if (day % 7 == 0) { continue }
    test(dailySessionsEndAtMidnight, day)
}
