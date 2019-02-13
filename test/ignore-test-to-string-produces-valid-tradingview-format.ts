/**
 * This file is ignored because certain outputs are impossible to put
 * into TradingView format, e.g. 1441 => '1441'.
 *
 * This package will not prevent users from converting a session of
 * desired length into a string of invalid TradingView format.
 */

import test from 'ava'

import { range } from './utils'
import { macroToStringProducesValidTradingviewFormat,
         MINUTES_PER_YEAR } from './utils-to-string'

/**
 * Only up to MINUTES_PER_YEAR/2 because of heap overflow
 */
range(1, MINUTES_PER_YEAR/2).map(n => test(macroToStringProducesValidTradingviewFormat, n))
