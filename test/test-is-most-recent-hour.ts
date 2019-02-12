import { hourMacro, testHourSessions } from './utils-hour'

const HOURS_IN_DAY = 24

testHourSessions(1, HOURS_IN_DAY)

/**
 * The trouble children.
 */
// import test from 'ava'
// import moment from 'moment'
// test(hourMacro, 5, moment.utc('2019-02-09T00:00:00.000Z'), moment.utc('2019-02-09T05:00:00.000Z'))
// test(hourMacro, 5, moment.utc('2019-02-08T00:00:00.000Z'), moment.utc('2019-02-08T05:00:00.000Z'))
