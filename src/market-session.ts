/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'

const defaultSessions = [
    '5', '15', '30', '60', '240', '720', '1440', '1H',
    '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]


/**
 * DOCUMENT
 */
function fromString(session: string): number {
    return -2
}

/**
 * DOCUMENT
 */
function toString(session: number): string {
    return '100Y'
}


/**
 * DOCUMENT
 */
const session = (date: Date, sessions: string[] = defaultSessions): number[] => {
    let closed: number[] = []
    // TODO: implement
    return closed
}

// console.log(Object.getOwnPropertyDescriptor(session, 'test'))

Object.defineProperties(session, {
    fromString: {
        value: fromString
    },
    toString: {
        value: toString
    }
})

export default session
export {
    fromString,
    toString
}
