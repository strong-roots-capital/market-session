import test from 'ava'

/**
 * Library under test
 */

import session from '../src/market-session'

test('integers should return identity numbers', t => {
    t.is(5, session.fromString('5'))
})
