import test from 'ava'
const moment = require('moment')

/**
 * Library under test
 */

import session from '../src/market-session'

// Note: tests the implicit-1's
const hourSessions = ['60', '4H', '12H']
const daySessions = ['D', '2D', '3D', '4D', '5D', '6D']
const weekSessions = ['W', '2W', '3w']
const monthSessions = ['M', '3M', '6M']
const yearSessions = ['Y', '2Y', '10Y']


// Note: `time` expressed in [Y, M, D, H, min, sec]

test("midnight on new year's should include all hourly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions.map(session.fromString), session(date, hourSessions))
})

test("midnight on new year's should include all hourly sessions, even non-standard ones", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60 * 36], session(date, ['36H']))
})

test("thirty-six hours after midnight on new year's should include the thirty-six hour session", t => {
    const time = [2019, 0, 2, 12, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60 * 36], session(date, ['36H']))
})

test("midnight on new year's should include all daily sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(daySessions.map(session.fromString), session(date, daySessions))
})

test("midnight on new year's should include all monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test('one minute past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test('one minute and one second past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test('one minute and one second past midnight should include one-minute session when added to search-able sessions', t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([1], session(date, ['1']))
})

test('one hour past midnight should include sessions up to one hour', t => {
    const time = [2019, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([5, 15, 30, 60], session(date))
})

test('3 hours past midnight should include the 1h and 3h sessions', t => {
    const time = [2019, 0, 1, 3]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60, 180], session(date, ['1H', '3H', '12H']))
})

test('twelve hours past midnight should include the 1h, 4h, 12h sessions', t => {
    const time = [2019, 0, 1, 12]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([60, 240, 720], session(date, ['1H', '4H', '12H']))
})

test('one hour and one minute and one second past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 1, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], session(date))
})

test("returned sessions should include only sessions included in search-parameters", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions.map(session.fromString), session(date, hourSessions))
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test("one second past midnight on new year's should include all hourly, daily, and monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions.map(session.fromString), session(date, hourSessions))
    t.deepEqual(daySessions.map(session.fromString), session(date, daySessions))
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test('daily sessions should end at midnight iff session is evenly-divisible into number of days into the year', t => {
    // t.deepEqual([session.fromString('2D')], session(new Date(moment.utc([2019, 0, 1 + 2, 0, 0]).format()), ['2D']))
    // t.deepEqual([session.fromString('3D')], session(new Date(moment.utc([2019, 0, 1 + 3, 0, 0]).format()), ['3D']))
    // t.deepEqual([session.fromString('4D')], session(new Date(moment.utc([2019, 0, 1 + 4, 0, 0]).format()), ['4D']))
    // t.deepEqual([session.fromString('5D')], session(new Date(moment.utc([2019, 0, 1 + 5, 0, 0]).format()), ['5D']))
    // t.deepEqual([session.fromString('6D')], session(new Date(moment.utc([2019, 0, 1 + 6, 0, 0]).format()), ['6D']))
    // t.deepEqual([session.fromString('8D')], session(new Date(moment.utc([2019, 0, 1 + 8, 0, 0]).format()), ['8D']))
    // t.deepEqual([session.fromString('9D')], session(new Date(moment.utc([2019, 0, 1 + 9, 0, 0]).format()), ['9D']))
    for (let day = 2; day < 31; ++day) {
        if (day % 7 == 0) { continue }
        t.deepEqual([session.fromString(`${day}D`)], session(new Date(moment.utc([2019, 0, day+1, 0, 0]).format()), [`${day}D`]))
        t.deepEqual([], session(new Date(moment.utc([2019, 0, day, 0, 0]).format()), [`${day}D`]))
    }
})

test('weekly sessions should end on Sunday at midnight (UTC time) iff session is evenly-divisible into number of weeks into the year', t => {
    // 2019: Jan 1 => Tuesday
    t.deepEqual([], session(new Date(moment.utc([2019, 0, 1, 0, 0]).format()), ['1W']))
    // 2018: Jan 1 => Monday
    t.deepEqual([], session(new Date(moment.utc([2018, 0, 1, 0, 0]).format()), ['1W']))
    // 2017: Jan 1 => Sunday
    t.deepEqual([60 * 24 * 7], session(new Date(moment.utc([2017, 0, 1, 0, 0]).format()), ['1W']))
})

test('yearly sessions should end on January 1 iff session is evenly-divisible into number of years since Christ', t => {
    t.deepEqual([session.fromString('Y')], session(new Date(moment.utc([2019, 0, 1, 0, 0]).format()), ['Y']))
    t.deepEqual([session.fromString('1Y')], session(new Date(moment.utc([2019, 0, 1, 0, 0]).format()), ['Y']))
    t.deepEqual([], session(new Date(moment.utc([2019, 0, 1, 0, 0]).format()), ['2Y']))
    t.deepEqual([session.fromString('2Y')], session(new Date(moment.utc([2020, 0, 1, 0, 0]).format()), ['2Y']))
    t.deepEqual([session.fromString('3Y')], session(new Date(moment.utc([2019, 0, 1, 0, 0]).format()), ['3Y']))
})

test('second quarterly session should begin on April first', t => {
    t.deepEqual([session.fromString('3M')], session(new Date(moment.utc([2019, 3, 1, 0, 0]).format()), ['3M']))
})

test('third quarterly session should begin on July first', t => {
    t.deepEqual([session.fromString('3M')], session(new Date(moment.utc([2019, 6, 1, 0, 0]).format()), ['3M']))
})

test('fourth quarterly session should begin on October first', t => {
    t.deepEqual([session.fromString('3M')], session(new Date(moment.utc([2019, 9, 1, 0, 0]).format()), ['3M']))
})

test('six-month session should begin on July first', t => {
    t.deepEqual([session.fromString('6M')], session(new Date(moment.utc([2019, 6, 1, 0, 0]).format()), ['6M']))
})

test('should throw ArgumentError when given invalid sessions', t => {
    const error = t.throws(() => {
        session(new Date(), ['5b'])
    }, Error)
})
