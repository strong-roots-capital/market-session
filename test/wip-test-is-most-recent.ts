import test from 'ava'
import moment from 'moment'

/**
 * Library under test
 */

import session from '../src/market-session'

/*********************************************************************
 * isMostRecent Yearly tests
 *********************************************************************/

test('start of last year session should be most-recent yearly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    const lastYear = now.subtract(1, 'year').startOf('year').toDate()
    // console.log('Last year should be:', lastYear)
    t.true(session.isMostRecent('Y', lastYear))
})

/*********************************************************************
 * isMostRecent Monthly tests
 *********************************************************************/

test('start of last month session should be most-recent monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    const lastMonth = now.subtract(1, 'month').startOf('month').toDate()
    t.true(session.isMostRecent('M', lastMonth))
})

test('start of last two-month session should be most-recent bi-monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastTwoMonth = now
    while (lastTwoMonth.month() % 2 != 0) {
        lastTwoMonth = lastTwoMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('2M', lastTwoMonth.toDate(), now.toDate()))
})

test('start of last three-month session should be most-recent three-monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastThreeMonth = now
    while (lastThreeMonth.month() % 3 != 0) {
        lastThreeMonth = lastThreeMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('3M', lastThreeMonth.toDate(), now.toDate()))
})

test('start of last four-month session should be most-recent quarterly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastFourMonth = now
    while (lastFourMonth.month() % 4 != 0) {
        lastFourMonth = lastFourMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('4M', lastFourMonth.toDate(), now.toDate()))
})

test('start of last five-month session should be most-recent five-monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastFiveMonth = now
    while (lastFiveMonth.month() % 5 != 0) {
        lastFiveMonth = lastFiveMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('5M', lastFiveMonth.toDate(), now.toDate()))
})

test('start of last six-month session should be most-recent half-year open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastSixMonth = now
    while (lastSixMonth.month() % 6 != 0) {
        lastSixMonth = lastSixMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('6M', lastSixMonth.toDate(), now.toDate()))
})

test('start of last seven-month session should be most-recent seven-monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastSevenMonth = now
    while (lastSevenMonth.month() % 7 != 0) {
        lastSevenMonth = lastSevenMonth.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('7M', lastSevenMonth.toDate(), now.toDate()))
})

test('start of last 13-month session should be most-recent monthly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let last13Month = now
    while (last13Month.month() % 13 != 0) {
        last13Month = last13Month.subtract(1, 'month').startOf('month')
    }
    t.true(session.isMostRecent('13M', last13Month.toDate(), now.toDate()))
})

/*********************************************************************
 * isMostRecent Weekly tests
 *********************************************************************/

test('start of last week session should be most-recent weekly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let lastWeek = now.subtract(1, 'week').startOf('isoWeek').toDate()
    // console.log('Last week should be:', lastWeek)
    t.true(session.isMostRecent('W', lastWeek, now.toDate()))
})

function firstFullWeekOfNewYear() {
    let firstWeek = moment.utc().day('Monday').week(1).startOf('day')
    const nextWeek = moment.utc().day('Monday').week(2).startOf('day')
    if (firstWeek.toDate().getUTCFullYear() !== nextWeek.toDate().getUTCFullYear()) {
        firstWeek = nextWeek
    }
    return firstWeek
}

/* Zero-indexed */
function nthFullWeekOfNewYear(n: number) {
    let week = firstFullWeekOfNewYear()
    for (let i = 0; i < n; ++i) {
        week.add(1, 'week')
    }
    return week
}

test('start of last 61-week session should be most-recent yearly open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let last61Week = firstFullWeekOfNewYear()

    // console.log('Week number:', last61Week.isoWeek())
    // while(last61Week.isoWeek() - 1 % 61 != 0) {
    //     console.log('New week number:', last61Week.isoWeek())
    //     last61Week = last61Week.subtract(1, 'week').startOf('isoWeek')
    // }
    // console.log('Final week number:', last61Week.isoWeek())
    // console.log('Last 61 week should be:', last61Week.toDate())
    t.true(session.isMostRecent('61W', last61Week.toDate(), now.toDate()))
})

test('start of last 3-week session should be most-recent 3-week open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let last3Week = nthFullWeekOfNewYear(3)
    // while(last3Week.isoWeek() - 1 % 3 != 0) {
    //     console.log('New week number:', last3Week.isoWeek())
    //     last3Week = last3Week.add(1, 'week')
    // }
    // console.log('Final week number:', last3Week.isoWeek())
    // console.log('Last 3 week should be:', last3Week.toDate())
    t.true(session.isMostRecent('3W', last3Week.toDate(), now.toDate()))
})

test('start of last 10-week session should be most-recent 10-week open', t => {
    const now = moment.utc('2019-03-08T00:00:00.000Z')
    let last10Week = firstFullWeekOfNewYear()
    // console.log('Final week number:', last10Week.isoWeek())
    // console.log('Last 10 week should be:', last10Week.toDate())
    t.true(session.isMostRecent('10W', last10Week.toDate(), now.toDate()))
})

test('start of last 10-week session should be most-recent 10-week open from 2019-03-18', t => {
    const now = moment.utc('2019-03-20T00:00:00.000Z')
    let last10Week = nthFullWeekOfNewYear(10)
    // console.log('Final week number:', last10Week.isoWeek())
    // console.log('Last 10 week should be:', last10Week.toDate())
    t.true(session.isMostRecent('10W', last10Week.toDate(), now.toDate()))
})

test('start of last 41-week session should be most-recent 41-week open from 2019-10-20', t => {
    const now = moment.utc('2019-10-20T00:00:00.000Z')
    let last41Week = firstFullWeekOfNewYear()
    // console.log('Final week number:', last41Week.isoWeek())
    // console.log('Last 41 week should be:', last41Week.toDate())
    t.true(session.isMostRecent('41W', last41Week.toDate(), now.toDate()))
})

test('start of last 41-week session should be most-recent 41-week open from 2019-10-22', t => {
    const now = moment.utc('2019-10-22T00:00:00.000Z')
    let last41Week = nthFullWeekOfNewYear(41)
    // console.log('Final week number:', last41Week.isoWeek())
    // console.log('Last 41 week should be:', last41Week.toDate())
    t.true(session.isMostRecent('41W', last41Week.toDate(), now.toDate()))
})

test('start of last 41-week session should be most-recent 41-week open from 2019-10-21', t => {
    const now = moment.utc('2019-10-21T00:00:00.000Z')
    let last41Week = nthFullWeekOfNewYear(41)
    // console.log('Final week number:', last41Week.isoWeek())
    // console.log('Last 41 week should be:', last41Week.toDate())
    t.true(session.isMostRecent('41W', last41Week.toDate(), now.toDate()))
})

/*********************************************************************
 * isMostRecent Daily tests
 *********************************************************************/

test('start of last day session should be most-recent daily open', t => {
    const lastDay = moment.utc().subtract(1, 'day').startOf('day').toDate()
    // console.log('Last day should be:', lastDay)
    t.true(session.isMostRecent('D', lastDay))
})

test('January 1 should be most-recent daily-open 1 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last1Day = now.startOf('year').toDate()
    // console.log('Last 1-day should be:', last1Day)
    t.true(session.isMostRecent('1D', last1Day, now.toDate()))
})
test('January 1 should be most-recent daily-open 2 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last2Day = now.startOf('year').toDate()
    // console.log('Last 2-day should be:', last2Day)
    t.true(session.isMostRecent('2D', last2Day, now.toDate()))
})
test('January 1 should be most-recent daily-open 3 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last3Day = now.startOf('year').toDate()
    // console.log('Last 3-day should be:', last3Day)
    t.true(session.isMostRecent('3D', last3Day, now.toDate()))
})
test('January 1 should be most-recent daily-open 4 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last4Day = now.startOf('year').toDate()
    // console.log('Last 4-day should be:', last4Day)
    t.true(session.isMostRecent('4D', last4Day, now.toDate()))
})
test('January 1 should be most-recent daily-open 5 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last5Day = now.startOf('year').toDate()
    // console.log('Last 5-day should be:', last5Day)
    t.true(session.isMostRecent('5D', last5Day, now.toDate()))
})
test('January 1 should be most-recent daily-open 6 days into the year', t => {
    const now = moment.utc('2019-01-01T00:00:00.000Z')
    const last6Day = now.startOf('year').toDate()
    // console.log('Last 6-day should be:', last6Day)
    t.true(session.isMostRecent('6D', last6Day, now.toDate()))
})

test('start of last 2-day session should be most-recent daily-open 2 days into the year', t => {
    const now = moment.utc('2019-03-06T00:00:00.000Z')
    const last2Day = now.startOf('year').toDate()
    // console.log('Last 2-day should be:', last2Day)
    t.true(session.isMostRecent('2D', last2Day, now.toDate()))
})

test('start of last 300-day session should be start of year if less-than 300 days into the year', t => {
    const now = moment.utc('2019-10-27T00:00:00.000Z')
    const last300Day = now.startOf('year').toDate()
    // console.log('Last 300-day should be:', last300Day)
    t.true(session.isMostRecent('300D', last300Day, now.toDate()))
})
test('start of last 300-day session should be most-recent daily-open 300 days into the year when on day 300', t => {
    const now = moment.utc('2019-10-28T00:00:00.000Z')
    const last300Day = now.startOf('year').toDate()
    // console.log('Last 300-day should be:', last300Day)
    t.true(session.isMostRecent('300D', last300Day, now.toDate()))
})
test('start of last 300-day session should be most-recent daily-open 300 days into the year', t => {
    const now = moment.utc('2019-10-28T00:00:00.000Z')
    const last300Day = now.startOf('year').toDate()
    // console.log('Last 300-day should be:', last300Day)
    t.true(session.isMostRecent('300D', last300Day, now.toDate()))
})

/*********************************************************************
 * isMostRecent Hourly tests
 *********************************************************************/
