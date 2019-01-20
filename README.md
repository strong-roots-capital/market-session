# market-session [![Build Status](https://travis-ci.org/strong-roots-capital/market-session.svg?branch=master)](https://travis-ci.org/strong-roots-capital/market-session) [![npm version](https://img.shields.io/npm/v/market-session.svg)](https://npmjs.org/package/market-session) ![Code Coverage](https://img.shields.io/coveralls/github/strong-roots-capital/market-session.svg)

> Logic for financial-market sessions

## Install

``` shell
npm install market-session
```

## Use

``` typescript
import session from 'market-session'

console.log(session.fromString('D'))
//=> 1440

console.log(session.toString(1440))
//=> 1D

console.log(session(new Date('2019-01-01')))
//=> [ 5, 15, 30, 60, 240, 720, 1440, 4320, 40320, 120960, 483840 ]

console.log(session(new Date('2019-01-01')).map(session.toString))
//=> [ '5', '15', '30', '1H', '4H', '12H', '1D', '3D', '1M', '3M', '1Y' ]

console.log(session(new Date('2019-04-01'), ['3M']).map(session.toString))
//=> ['3M']
```

## Limitations

- All times are assumed to be UTC.

- Note that periods of months in excess of one-year currently resolve
  to one-year intervals. For example, `18M` is equivalent to `1Y`.
