/**
 * marketSession
 * Logic for financial-market sessions
 */

import ow from 'ow'

const defaultSessions = [
    '5', '15', '30', '60', '240', '720', '1440', '1H',
    '4H', '12H', '1D', '3D', '1W', '1M', '3M', '1Y'
]


export interface Session {
    (date: Date, sessions: string[]): number[];
    fromString(session: string): number;
}


/**
 * DOCUMENT
 */
function fromString(session: string): number {
    ow(session, ow.string.not.empty)
    ow(session, ow.string.matches(/^[1-9]?[0-9]*[HDWMY]?$/))

    let resolution: number = -1
    if (/^[1-9][0-9]*$/.test(session)) {
        resolution = parseInt(session)
    }

    else {
        // TODO: throw error here
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
    // fromString: {
    //     value: (session: string): number => {
    //         return 5
    //     }
    // }
    fromString: {
        value: fromString
    }


    //,
    // toString: {
    //     value: toString
    // }
})

export default session as Session
// export {
//     fromString,
//     toString
// }
