import test from 'ava'

/**
 * Library under test
 */

import session from '../src/market-session'

test('should throw ArgumentError when given an empty string', t => {
    const error = t.throws(() => {
        session.fromString('')
    }, Error)
    t.is(error.message, '[NOT] Expected string to be empty, got ``')
})

test('should throw ArgumentError when given nonsensical timeframes', t => {
    const testStrings = ['5B', '5d', 'p', 'D4', '!!', 'H4']
    testStrings.forEach((str) => {
        const error = t.throws(() => {
            session.fromString(str)
        }, Error)
        t.is(0, error.message.indexOf('Expected string to match'))
    })
})

test('integers should return identity numbers', t => {
    t.is(5, session.fromString('5'))
    t.is(15, session.fromString('15'))
    t.is(60, session.fromString('60'))
    t.is(240, session.fromString('240'))
    t.is(1440, session.fromString('1440'))
})

test('hours should return associated integer times numbers', t => {
    t.is(120, session.fromString('2H'))
    t.is(240, session.fromString('4H'))
    t.is(720, session.fromString('12H'))
    t.is(1440, session.fromString('24H'))
})

test('days should return associated integer times numbers', t => {
    t.is(2880, session.fromString('2D'))
    t.is(10080, session.fromString('7D'))
})

test('weeks should return associated integer times numbers', t => {
    t.is(20160, session.fromString('2W'))
})

test('months should return associated integer times numbers', t => {
    t.is(604800, session.fromString('2M'))
})

test('years should return associated integer times numbers', t => {
    t.is(7257600, session.fromString('2Y'))
})

test('should interpret an implicit 1 preceding a high-timeframe resolution', t => {
    t.is(60, session.fromString('H'))
    t.is(1440, session.fromString('D'))
    t.is(10080, session.fromString('W'))
    t.is(302400, session.fromString('M'))
    t.is(3628800, session.fromString('Y'))
})
