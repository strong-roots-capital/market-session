import test, { Macro } from 'ava'
import { range } from './utils'
import moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

const HOURS_IN_DAY = 24

const beginningOfDay = moment.utc('2019-02-08T00:00:00.000Z')

/**
 * DOCUMENT
 */
export const hourMacro: Macro<[number, moment.Moment, moment.Moment]> = (t: any, timeframe: number, open: moment.Moment, now: moment.Moment) => {
    t.true(session.isMostRecent(`${timeframe}H`, open.toDate(), now.toDate()))
}
hourMacro.title = (_ = '', timeframe, open, now) => `${now.toISOString()} last ${timeframe}H open = ${open.toISOString()}`

/**
 * DOCUMENT
 */
function hourTest(timeframe: number, startHour: number) {
    // console.log('timeframe', timeframe, 'startHour', startHour)
    const now = beginningOfDay.clone().add(startHour, 'hours')

    const lastIncompleteSessionOpen = beginningOfDay.clone()
    let lastCompletedSessionOpen = beginningOfDay.clone()

    while (timeframe <= now.diff(lastIncompleteSessionOpen, 'hours')) {
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'hours')
        if (!lastCompletedSessionOpen.isSame(lastIncompleteSessionOpen, 'date')) {
            lastIncompleteSessionOpen.startOf('day')
        }
        // console.log(`${lastCompletedSessionOpen.toISOString()} + ${timeframe} hours => ${lastIncompleteSessionOpen.toISOString()}`)
    }

    /**
     * If `lastIncompleteSessionOpen` and `now` are not on the same
     * day, there is still one more session separating them
     */
    if (!now.isSame(lastIncompleteSessionOpen, 'date')) {
        // console.log(`\`now\` is not ${timeframe} hours away from \`lastIncompleteSessionOpen\` but are still separated by a session because of EOD`)
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'hours').startOf('day')
    }

    // console.log(`[${timeframe}] When time is ${now.toISOString()} open of last-full session was ${lastCompletedSessionOpen.toISOString()}`)
    test(hourMacro, timeframe, lastCompletedSessionOpen, now)
}

/**
 * DOCUMENT
 */
export function testHourSessions(startHour: number, endHour: number = startHour) {
    range(startHour, endHour)
        .map(timeframe => range(timeframe, HOURS_IN_DAY + timeframe).map(startHour => [timeframe, startHour]))
        .reduce((a, b) => a.concat(b))
        .forEach(t => hourTest(t[0], t[1]))
}
