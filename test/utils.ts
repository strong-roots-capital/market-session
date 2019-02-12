/**
 * Return an array of numbers between `low` and `high`, inclusive.
 */
export function range(low: number, high: number): number[] {
    let arr = []
    let c = high - low + 1
    while (c--) {
        arr[c] = high--
    }
    return arr
}
