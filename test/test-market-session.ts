import test from 'ava'
const moment = require('moment')

/**
 * Library under test
 */

import session from '../src/market-session'

const defaultSessions = [
    '5', '15', '30', '60', '240', '720', '1440', '1H',
    '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
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

test.skip("midnight on new year's should include all sessions", t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual(defaultSessions.map(session.fromString), session(date))
})

test.todo("one second past midnight on new year's should include all default sessions")

test.todo("midnight on new year's should include all sessions included in search-parameters")
