import test, { Macro } from 'ava'
import { range } from './utils'
import * as moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

const MINUTES_IN_HOUR = 60
const MINUTES_IN_DAY = 60 * 24

const isHourly = (session: number) => session >= MINUTES_IN_HOUR && session % MINUTES_IN_HOUR == 0
const beginningOfDay = moment.utc('2019-02-08T00:00:00.000Z')

/**
 * DOCUMENT
 */
export const minuteMacro: Macro<[number, moment.Moment, moment.Moment]> = (t: any, timeframe: number, open: moment.Moment, now: moment.Moment) => {
    t.true(session.isMostRecent(`${timeframe}`, open.toDate(), now.toDate()))
}
minuteMacro.title = (_ = '', timeframe, open, now) => `${now.toISOString()} last ${timeframe} open = ${open.toISOString()}`

/**
 * DOCUMENT
 */
function minuteTest(timeframe: number, startMinute: number) {
    // console.log('timeframe', timeframe, 'startMinute', startMinute)
    const now = beginningOfDay.clone().add(startMinute, 'minutes')

    const lastIncompleteSessionOpen = beginningOfDay.clone()
    let lastCompletedSessionOpen = beginningOfDay.clone()

    while (timeframe <= now.diff(lastIncompleteSessionOpen, 'minutes')) {
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'minutes')
        if (!lastCompletedSessionOpen.isSame(lastIncompleteSessionOpen, 'date')) {
            lastIncompleteSessionOpen.startOf('day')
        }
        // console.log(`${lastCompletedSessionOpen.toISOString()} + ${timeframe} minutes => ${lastIncompleteSessionOpen.toISOString()}`)
    }

    /**
     * If `lastIncompleteSessionOpen` and `now` are not on the same
     * day, there is still one more session separating them
     */
    if (!now.isSame(lastIncompleteSessionOpen, 'date')) {
        // console.log(`\`now\` is not ${timeframe} minutes away from \`lastIncompleteSessionOpen\` but are still separated by a session because of EOD`)
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'minutes').startOf('day')
    }

    // console.log(`[${timeframe}] When time is ${now.toISOString()} open of last-full session was ${lastCompletedSessionOpen.toISOString()}`)
    test(minuteMacro, timeframe, lastCompletedSessionOpen, now)
}

/**
 * DOCUMENT
 */
export function testMinuteSessions(startMinute: number, endMinute: number = startMinute) {
    range(startMinute, endMinute)
        .filter(timeframe => !isHourly(timeframe))
        .map(timeframe => range(timeframe, moment.duration(1, 'day').as('minutes') + timeframe).map(startMinute => [timeframe, startMinute]))
        .reduce((a, b) => a.concat(b))
        .forEach(t => minuteTest(t[0], t[1]))
}
