import { Macro } from 'ava'
import isTradingviewFormat from '@strong-roots-capital/is-tradingview-format'

/**
 * Library under test
 */

import session from '../src/market-session'

export const MINUTES_PER_YEAR = 525600

export const macroToStringProducesValidTradingviewFormat: Macro<[number]> = (t: any, n: number) => t.true(isTradingviewFormat(session.toString(n)))
macroToStringProducesValidTradingviewFormat.title = (_ = '', n: number) => `toString produces a timeframe in TradingView format for ${n}`
