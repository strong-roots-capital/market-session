import test from 'ava'
const moment = require('moment')

/**
 * Library under test
 */

import { marketSession } from '../src/market-session'

test('one minute past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 0, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], marketSession(date))
})

test('one minute and one second past midnight should include no sessions', t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], marketSession(date))
})

test("midnight on new year's should include all sessions", t => {
    const time = [2019, 0, 1, 0, 1, 1]
    const date = new Date(moment.utc(time).format())
    t.deepEqual([], marketSession(date))
})

test.todo("one second past midnight on new year's should include all sessions")

test.todo("midnight on new year's should include only sessions included in search-parameters")

// TODO: write tests
