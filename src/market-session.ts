/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'
import { ArgumentError } from './argument-error'

const defaultSessions = [
    '5', '15', '30', '60', '240', '720', '1440', '1H',
    '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]


export interface Session {
    (date: Date, sessions: string[]): number[];
    fromString(session: string): number;
}


/**
 * Convert a string-based representation of a market session into an
 * integer describing the session length in minutes.
 *
 * Valid input consists of a number followed by one of the following
 * suffixes: '', 'H', 'D', 'W', 'M', or 'Y'.
 *
 * A string consisting only of a valid suffix-character will be
 * interpreted as having an implicit quantifier of 1.
 */
function fromString(session: string): number {
    ow(session, ow.string.not.empty)
    ow(session, ow.string.matches(/^[1-9]?[0-9]*[HDWMY]?$/))

    let resolution: number = -1

    if (/^[1-9][0-9]*$/.test(session)) {
        resolution = parseInt(session)
    }
    else if (/^[1-9][0-9]*H$/.test(session)) {
        resolution = parseInt(session) * 60
    }
    else if (/^[1-9][0-9]*D$/.test(session)) {
        resolution = parseInt(session) * 60 * 24
    }
    else if (/^[1-9][0-9]*W$/.test(session)) {
        resolution = parseInt(session) * 60 * 24 * 7
    }
    else if (/^[1-9][0-9]*M$/.test(session)) {
        // TODO: verify this is the number used in each TradingView calendar month
        resolution = parseInt(session) * 60 * 24 * 7 * 30
    }
    else if (/^[1-9][0-9]*Y$/.test(session)) {
        // TODO: verify this is the number used in each TradingView calendar year
        resolution = parseInt(session) * 60 * 24 * 7 * 30 * 12
    }
    /* handle the implicit-1 scenario */
    else if (/^H$/.test(session)) {
        resolution = 60
    }
    else if (/^D$/.test(session)) {
        resolution = 60 * 24
    }
    else if (/^W$/.test(session)) {
        resolution = 60 * 24 * 7
    }
    else if (/^M$/.test(session)) {
        resolution = 60 * 24 * 7 * 30
    }
    else if (/^Y$/.test(session)) {
        resolution = 60 * 24 * 7 * 30 * 12
    }
    // Note: this block should never run. If you are seeing this
    // error, the argument validation above is incorrect
    else {
        throw new ArgumentError(`Cannot interpret session interval '${session}'`, fromString)
    }

    return resolution
}

/**
 * DOCUMENT
 */
// function toString(session: number): string {
//     // TODO: implement
//     return '100Y'
// }


/**
 * DOCUMENT
 */
const session = (date: Date, sessions: string[] = defaultSessions): number[] => {
    let closed: number[] = []
    // TODO: implement
    return closed
}


Object.defineProperties(session, {
    fromString: {
        value: fromString
    }
    //,
    // toString: {
    //     value: toString
    // }
})

export default session as Session
