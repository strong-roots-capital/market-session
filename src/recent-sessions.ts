import * as moment from 'moment'

function firstFullWeekOfYear(year: number) {
    let firstWeek = moment.utc({year: year}).day('Monday').week(1)
    const nextWeek = firstWeek.clone().add(1, 'week')
    if (firstWeek.toDate().getUTCFullYear() !== nextWeek.toDate().getUTCFullYear()) {
        firstWeek = nextWeek
    }
    // console.log('>>> First full week of the year is', firstWeek)
    return firstWeek
}


/**
 * DOCUMENT
 */
export function recentSessions(quantifier: number,
                               duration: moment.unitOfTime.DurationConstructor,
                               from: Date) {

    console.log(`Looking for ${quantifier} ${duration} sessions leading up to ${from.toISOString()}`)

    const nextLargerDurationDivisor: { [key: string]: moment.unitOfTime.Base } = {
        'minute': 'day',
        'hour': 'day',
        'day': 'year',
        'week': 'week',
        'month': 'year'
    }
    const durationDivisor = nextLargerDurationDivisor[duration]

    const now = moment.utc(from)
    let clock = duration === 'week'
        ? firstFullWeekOfYear(from.getFullYear())
        : now.clone().subtract(1, durationDivisor).startOf(durationDivisor)
    let clockStart = clock.clone()

    let sessions: Date[] = []
    while (clock.isSameOrBefore(now)) {
        sessions.push(clock.toDate())
        duration === 'week'
            ? clock.add(quantifier * 7, 'days')
            : clock.add(quantifier, duration)
        // console.log('Clock is now', clock.toDate())
        if (duration !== 'week' && !clock.isSame(clockStart, durationDivisor)) {
            clock.startOf(durationDivisor)
            clockStart = clock.clone()
        }
    }
    // console.log('Stopping here at', clock.toDate())
    console.log('Sessions are:\n', sessions)
    return sessions.map(d => d.getTime())
}
