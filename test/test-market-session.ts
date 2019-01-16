import test from 'ava'
const moment = require('moment')

/**
 * Library under test
 */

import session from '../src/market-session'

const hourSessions = ['60', '4H', '12H']
const daySessions = ['1D', '2D', '3D', '4D', '5D', '6D']
const weekSessions = ['1W', '2W', '3w']
const monthSessions = ['1M', '3M', '6M']
const yearSessions = ['1Y', '2Y', '10Y']


// Note: `time` expressed in [Y, M, D, H, min, sec]

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

test('one hour past midnight should include sessions up to one hour', t => {
    const time = [2019, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([5, 15, 30, 60], session(date))
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
    t.deepEqual(daySessions.map(session.fromString), session(date, daySessions))
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test("midnight on new year's should include all hourly, daily, and monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions.map(session.fromString), session(date, hourSessions))
    t.deepEqual(daySessions.map(session.fromString), session(date, daySessions))
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test("one second past midnight on new year's should include all hourly, daily, and monthly sessions", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(hourSessions.map(session.fromString), session(date, hourSessions))
    t.deepEqual(daySessions.map(session.fromString), session(date, daySessions))
    t.deepEqual(monthSessions.map(session.fromString), session(date, monthSessions))
})

test.todo('daily sessions should end at midnight iff session is evenly-divisible into number of days into the year')

test.todo('weekly sessions should end on Sunday at midnight (UTC time) iff session is evenly-divisible into number of weeks into the year')

test.todo('monthly sessions should end on Sunday at midnight (UTC time) iff session is evenly-divisible into number of months into the year')

test.todo('yearly sessions should end on January 1 iff session is evenly-divisible into number of years since Christ')
