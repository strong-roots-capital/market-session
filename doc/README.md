
market-session [![Build Status](https://travis-ci.org/strong-roots-capital/market-session.svg?branch=master)](https://travis-ci.org/strong-roots-capital/market-session) [![npm version](https://img.shields.io/npm/v/market-session.svg)](https://npmjs.org/package/market-session) [![Code coverage](https://img.shields.io/codecov/c/github/strong-roots-capital/market-session.svg)](https://codecov.io/gh/strong-roots-capital/market-session)
===================================================================================================================================================================================================================================================================================================================================================================================================================================================

> Logic for financial-market sessions

Note: all times assumed to be UTC

Install
-------

```shell
npm install market-session
```

Use
---

```typescript
import session from 'market-session'

console.log(session.fromString('D'))
//=> 1440

console.log(session.toString(1440))
//=> 1D

console.log(session(new Date('2019-01-01')))
//=> [ '5', '15', '30', '1H', '4H', '12H', '1D', '3D', '1M', '3M', '1Y' ]

console.log(session(new Date('2019-04-01'), ['3M']))
//=> ['3M']

console.log(session(new Date('2019-01-01')).map(session.fromString))
//=> [ 5, 15, 30, 60, 240, 720, 1440, 4320, 40320, 120960, 483840 ]
```

Related
-------

*   [is-tradingview-format](https://github.com/strong-roots-capital/is-tradingview-format)
*   [get-recent-sessions](https://github.com/strong-roots-capital/get-recent-sessions)

## Index

### Interfaces

* [Session](interfaces/session.md)

---

