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

test('should throw ArgumentError when given non-sensical timeframes', t => {
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

test.todo('should interpret an implicit 1 preceding a high-timeframe resolution')
