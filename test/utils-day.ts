import test, { Macro } from 'ava'
import { range } from './utils'
import * as moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

const beginningOfDay = moment.utc('2019-01-01T00:00:00.000Z')

/**
 * DOCUMENT
 */
export const dayMacro: Macro<[number, moment.Moment, moment.Moment]> = (t: any, timeframe: number, open: moment.Moment, now: moment.Moment) => {
    t.true(session.isMostRecent(`${timeframe}D`, open.toDate(), now.toDate()))
}
dayMacro.title = (_ = '', timeframe, open, now) => `${now.toISOString()} last ${timeframe}D open = ${open.toISOString()}`

/**
 * DOCUMENT
 */
export function dayTest(timeframe: number, startDay: number) {
    // console.log('timeframe', timeframe, 'startDay', startDay)
    const now = beginningOfDay.clone().add(startDay, 'days')

    const lastIncompleteSessionOpen = beginningOfDay.clone()
    let lastCompletedSessionOpen = beginningOfDay.clone()

    while (timeframe <= now.diff(lastIncompleteSessionOpen, 'days')) {
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'days')
        // TODO: verify that this year-wraparound works as intended
        if (!lastCompletedSessionOpen.isSame(lastIncompleteSessionOpen, 'year')) {
            lastIncompleteSessionOpen.startOf('year')
        }
        // console.log(`${lastCompletedSessionOpen.toISOString()} + ${timeframe} days => ${lastIncompleteSessionOpen.toISOString()}`)
    }

    /**
     * If `lastIncompleteSessionOpen` and `now` are not on the same
     * day, there is still one more session separating them
     */
    if (!now.isSame(lastIncompleteSessionOpen, 'year')) {
        // console.log(`\`now\` is not ${timeframe} days away from \`lastIncompleteSessionOpen\` but are still separated by a session because of EOD`)
        lastCompletedSessionOpen = lastIncompleteSessionOpen.clone()
        lastIncompleteSessionOpen.add(timeframe, 'days').startOf('day')
    }

    // console.log(`[${timeframe}] When time is ${now.toISOString()} open of last-full session was ${lastCompletedSessionOpen.toISOString()}`)
    test(dayMacro, timeframe, lastCompletedSessionOpen, now)
}

/**
 * DOCUMENT
 */
export function testDaySessions(startDay: number, endDay: number = startDay) {
    range(startDay, endDay)
        .map(timeframe => range(timeframe, moment.duration(1, 'year').as('days') + timeframe).map(startDay => [timeframe, startDay]))
        .reduce((a, b) => a.concat(b))
        .forEach(t => dayTest(t[0], t[1]))
}
