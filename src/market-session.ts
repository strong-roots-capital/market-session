/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'
import { ArgumentError } from './argument-error'

/**
 * Default session-resolutions to match against given date-times.
 */
const defaultSessions = [
    '5', '15', '30', '60', '240', '720', '1440', '1H',
    '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]


export interface Session {
    (date: Date, sessions?: string[]): number[];
    fromString(session: string): number;
}

type Translation = [RegExp, (n: string) => number]


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

    const translations: Translation[] = [
        [/^[1-9][0-9]*$/, (n: string) => parseInt(n)],
        [/^[1-9][0-9]*H$/, (n: string) => parseInt(n) * 60],
        [/^[1-9][0-9]*D$/, (n: string) => parseInt(n) * 60 * 24],
        [/^[1-9][0-9]*W$/, (n: string) => parseInt(n) * 60 * 24 * 7],
        // TODO: verify this is the number used in each TradingView calendar month
        [/^[1-9][0-9]*M$/, (n: string) => parseInt(n) * 60 * 24 * 7 * 30],
        // TODO: verify this is the number used in each TradingView calendar year
        [/^[1-9][0-9]*Y$/, (n: string) => parseInt(n) * 60 * 24 * 7 * 30 * 12],
        [/^H$/, (n: string) => 60],
        [/^D$/, (n: string) => 60 * 24],
        [/^W$/, (n: string) => 60 * 24 * 7],
        [/^M$/, (n: string) => 60 * 24 * 7 * 30],
        [/^Y$/, (n: string) => 60 * 24 * 7 * 30 * 12]
    ]

    for (const [regex, translation] of translations) {
        if (regex.test(session))
            return translation(session)
    }

    /**
     * Note: this block should never run. If you are seeing this
     * error, the argument validation above is incorrect
     */
    throw new ArgumentError(`Cannot interpret session interval '${session}'`, fromString)
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
