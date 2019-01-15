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

test('integers should return identity numbers', t => {
    t.is(5, session.fromString('5'))
})
