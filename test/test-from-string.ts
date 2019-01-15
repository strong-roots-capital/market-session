import test from 'ava'

/**
 * Library under test
 */

import session from '../src/market-session'

// test('should throw ArgumentError when given an empty string', t => {
//     const error = t.throws(() => {
//         session.fromString('')
//     }, ArgumentError)
//     console.log('Error:')
//     console.log(error)
//     // t.is()
// })

test('integers should return identity numbers', t => {
    t.is(5, session.fromString('5'))
})
