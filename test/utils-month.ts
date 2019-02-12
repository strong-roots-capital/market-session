import test, { Macro } from 'ava'
import { range } from './utils'
import * as moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

const beginningOfMonth = moment.utc('2019-01-01T00:00:00.000Z')

/**
 * DOCUMENT
 */
export const monthMacro: Macro<[number, moment.Moment, moment.Moment]> = (t: any, timeframe: number, open: moment.Moment, now: moment.Moment) => {
    t.true(session.isMostRecent(`${timeframe}M`, open.toDate(), now.toDate()))
}
monthMacro.title = (_ = '', timeframe, open, now) => `${now.toISOString()} last ${timeframe}M open = ${open.toISOString()}`

/**
 * DOCUMENT
 */
export function monthTest(timeframe: number, startMonth: number) {
    // console.log('timeframe', timeframe, 'startMonth', startMonth)
    const now = beginningOfMonth.clone().add(startMonth, 'months')

    const lastIncompleteSessionOpen = beginningOfMonth.clone()
    let lastCompletedSessionOpen = beginningOfMonth.clone()

    while (timeframe <= now.diff(lastIncompleteSessionOpen, 'months')) {
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'months')
        // TODO: verify that this year-wraparound works as intended
        if (!lastCompletedSessionOpen.isSame(lastIncompleteSessionOpen, 'year')) {
            lastIncompleteSessionOpen.startOf('year')
        }
        // console.log(`${lastCompletedSessionOpen.toISOString()} + ${timeframe} months => ${lastIncompleteSessionOpen.toISOString()}`)
    }

    /**
     * If `lastIncompleteSessionOpen` and `now` are not on the same
     * month, there is still one more session separating them
     */
    if (!now.isSame(lastIncompleteSessionOpen, 'year')) {
        // console.log(`\`now\` is not ${timeframe} months away from \`lastIncompleteSessionOpen\` but are still separated by a session because of EOD`)
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'months').startOf('month')
    }

    // console.log(`[${timeframe}] When time is ${now.toISOString()} open of last-full session was ${lastCompletedSessionOpen.toISOString()}`)
    test(monthMacro, timeframe, lastCompletedSessionOpen, now)
}

/**
 * DOCUMENT
 */
export function testMonthSessions(startMonth: number, endMonth: number = startMonth) {
    range(startMonth, endMonth)
        .map(timeframe => range(timeframe, 12 + timeframe).map(startMonth => [timeframe, startMonth]))
        .reduce((a, b) => a.concat(b))
        .forEach(t => monthTest(t[0], t[1]))
}
