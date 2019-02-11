import test from 'ava'
import moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

test('here', t => {
    // RESUME: testing the hour
    t.pass()
})

// test('start of last hour session should be most-recent hourly open', t => {
//     const lastHour = moment.utc().subtract(1, 'hour').startOf('hour').toDate()
//     console.log('Last hour should be:', lastHour)
//     t.true(session.isMostRecent('H', lastHour))
// })

// test('start of last hour session should be most-recent hourly open from 2019-02-08T23:22:00', t => {
//     const now = moment.utc('2019-02-08T23:22:00.000Z')
//     const lastHour = now.clone().subtract(1, 'hour').startOf('hour').toDate()
//     console.log('Last hour should be:', lastHour)
//     t.true(session.isMostRecent('H', lastHour, now.toDate()))
// })

// test('start of last 2-hour session should be most-recent 2-hourly open from 2019-02-08T23:22:00', t => {
//     const now = moment.utc('2019-02-08T23:22:00.000Z')
//     const last2Hour = moment.utc('2019-02-08T20:00:00.000Z').toDate()
//     console.log('Last hour should be:', last2Hour)
//     t.true(session.isMostRecent('2H', last2Hour, now.toDate()))
// })

// test('start of last 2-hour session should not be most-recent 4-hourly open from 2019-02-08T23:22:00', t => {
//     const now = moment.utc('2019-02-08T23:22:00.000Z')
//     const last2Hour = now.clone().subtract(1, 'hour').startOf('hour').toDate()
//     console.log('Last hour should be:', last2Hour)
//     t.false(session.isMostRecent('4H', last2Hour, now.toDate()))
// })

// test('start of last 22-hour session should be midnight from 2019-02-08T23:22:00', t => {
//     const now = moment.utc('2019-02-08T23:22:00.000Z')
//     const last22Hour = now.clone().startOf('day').toDate()
//     console.log('Last hour should be:', last22Hour)
//     t.true(session.isMostRecent('22H', last22Hour, now.toDate()))
// })
