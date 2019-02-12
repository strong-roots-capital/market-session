import { minuteMacro, testMinuteSessions } from './utils-minute'

testMinuteSessions(1, 60)

/**
 * The trouble children
 */
// import test from 'ava'
// import moment from 'moment'
// test(minuteMacro, 7, moment.utc('2019-02-08T23:55:00.000Z'), moment.utc('2019-02-09T00:00:00.000Z'))
// test(minuteMacro, 7, moment.utc('2019-02-08T00:00:00.000Z'), moment.utc('2019-02-08T00:07:01.000Z'))
