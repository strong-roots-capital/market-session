import test from 'ava'

/**
 * Library under test
 */

import session from '../src/market-session'

test('should throw ArgumentError when passed a number less-than one', t => {
    const testStrings = [0]
    testStrings.forEach((session) => {
        const error = t.throws(() => {
            session.toString(session)
        }, Error)
        t.is(error.name, 'RangeError')
    })
})

test('integers less-than or equal-to 60 should return the identity', t => {
    t.is('1', session.toString(1))
    t.is('5', session.toString(5))
    t.is('15', session.toString(15))
    t.is('59', session.toString(59))
})

test('integers less-than 1440 that divide evenly into 60 should return in units of hours', t => {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .forEach((hour: number) => {
            t.is(`${hour}H`, session.toString(hour * 60))
        })
})

test('integers less-than 10080 that divide evenly into 1440 should return in units of days', t => {
    for (let days = 1; days <= 30; ++days) {
        if (days % 7 == 0) { continue }
        t.is(`${days}D`, session.toString(days * 60 * 24))
    }
})

test('integers less-than 302400 that divide evenly into 10080 should return in units of weeks', t => {
    for (let weeks = 1; weeks < 4; ++weeks) {
        t.is(`${weeks}W`, session.toString(weeks * 60 * 24 * 7))
    }
})

test('integers less-than 3628800 that divide evenly into 302400 should return in units of months', t => {
    for (let months = 1; months < 12; ++months) {
        t.is(`${months}M`, session.toString(months * 60 * 24 * 7 * 4))
    }
})

test('integers that divide evenly into 3628800 should return in units of 12M', t => {
    const years = 1
    t.is(`12M`, session.toString(years * 60 * 24 * 7 * 4 * 12))
})

test('conversions fromString -> toString should remain consistent', t => {
    t.is('90', session.toString(session.fromString('90')))
    t.is('9H', session.toString(session.fromString('9H')))
})

test('conversions fromString -> toString should reduce units with higher timeframes', t => {
    t.is('1D', session.toString(session.fromString('1440')))
})
