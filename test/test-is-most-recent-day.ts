import * as moment from 'moment'
import { testDaySessions } from './utils-day'

testDaySessions(1, moment.duration(1, 'year').as('days'))
