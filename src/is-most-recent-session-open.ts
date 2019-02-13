import * as moment from 'moment'

/**
 * TODO: refactor `isMostRecentSessionOpen` with knowledge gained from
 * writing `recentSessions`
 */

export function isMostRecentSessionOpen(quantifier: number,
                                        duration: moment.unitOfTime.DurationConstructor,
                                        open: Date,
                                        from: Date) {

    const nextLargerDurationDivisor: { [key: string]: moment.unitOfTime.Base } = {
        'minutes': 'day',
        'hours': 'day',
        'day': 'year',
        'week': 'year',
        'month': 'year'
    }
    const durationDivisor = nextLargerDurationDivisor[duration]

    const now = moment.utc(from)
    const clock = now.clone().subtract(1, durationDivisor).startOf(durationDivisor)
    let clockStart = clock.clone()

    let sessions: moment.Moment[] = []
    while (quantifier <= now.diff(clock, duration) || !clock.isSame(now, durationDivisor)) {
        sessions.push(clock.clone())
        clock.add(quantifier, duration)
        if (!clock.isSame(clockStart, durationDivisor)) {
            clock.startOf(durationDivisor)
            clockStart = clock.clone()
        }
    }
    const mostRecentOpen = sessions[sessions.length-1]
    return mostRecentOpen.isSame(open)
}
