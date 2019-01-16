import test from 'ava'
const moment = require('moment')

/**
 * Library under test
 */

import session from '../src/market-session'

const defaultSessions = [
    '5', '15', '30', '60', '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]

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

// FIXME: this may or may-not include the 3D
test("midnight on new year's should include all sessions", t => {
    const time = [2019, 0, 1, 0, 0, 0]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(defaultSessions.map(session.fromString), session(date))
})

// FIXME: this may or may-not include the 3D
test("one second past midnight on new year's should include all sessions", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(defaultSessions.map(session.fromString), session(date))
})

test("midnight on new year's should include all sessions included in search-parameters", t => {
    const time = [2019, 0, 1, 0, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(defaultSessions.filter((s: string) => s.indexOf('H') > 0).map(session.fromString),
                session(date, defaultSessions.filter((s: string) => s.indexOf('H') > 0)))
})

// TODO: test for even-resolution of 3D
// TODO: test for even-resolution of 1W
