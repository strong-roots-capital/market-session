import test, { Macro } from 'ava'
import { range } from './utils'
import * as moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

const beginningOfWeek = moment.utc('2019-01-01T00:00:00.000Z')

/**
 * DOCUMENT
 */
export const weekMacro: Macro<[number, moment.Moment, moment.Moment]> = (t: any, timeframe: number, open: moment.Moment, now: moment.Moment) => {
    t.true(session.isMostRecent(`${timeframe}W`, open.toDate(), now.toDate()))
}
weekMacro.title = (_ = '', timeframe, open, now) => `${now.toISOString()} last ${timeframe}W open = ${open.toISOString()}`

/**
 * DOCUMENT
 */
export function weekTest(timeframe: number, startWeek: number) {
    // console.log('timeframe', timeframe, 'startWeek', startWeek)
    const now = beginningOfWeek.clone().add(startWeek, 'weeks')

    const lastIncompleteSessionOpen = beginningOfWeek.clone()
    let lastCompletedSessionOpen = beginningOfWeek.clone()

    while (timeframe <= now.diff(lastIncompleteSessionOpen, 'weeks')) {
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'weeks')
        // TODO: verify that this year-wraparound works as intended
        if (!lastCompletedSessionOpen.isSame(lastIncompleteSessionOpen, 'year')) {
            lastIncompleteSessionOpen.startOf('year')
        }
        // console.log(`${lastCompletedSessionOpen.toISOString()} + ${timeframe} weeks => ${lastIncompleteSessionOpen.toISOString()}`)
    }

    /**
     * If `lastIncompleteSessionOpen` and `now` are not on the same
     * week, there is still one more session separating them
     */
    if (!now.isSame(lastIncompleteSessionOpen, 'year')) {
        // console.log(`\`now\` is not ${timeframe} weeks away from \`lastIncompleteSessionOpen\` but are still separated by a session because of EOD`)
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'weeks').startOf('week')
    }

    // console.log(`[${timeframe}] When time is ${now.toISOString()} open of last-full session was ${lastCompletedSessionOpen.toISOString()}`)
    test(weekMacro, timeframe, lastCompletedSessionOpen, now)
}

/**
 * DOCUMENT
 */
export function testWeekSessions(startWeek: number, endWeek: number = startWeek) {
    range(startWeek, endWeek)
        .map(timeframe => range(timeframe, 52 + timeframe).map(startWeek => [timeframe, startWeek]))
        .reduce((a, b) => a.concat(b))
        .forEach(t => weekTest(t[0], t[1]))
}
