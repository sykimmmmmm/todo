const moment = require('moment')

const now = moment()
console.log(now.format('dddd/MM/YYYY'))

const date = moment("2021.10.09","YYYY.MM.DD")
console.log(date.format())

const day = moment().endOf('day').format()
console.log(day)

const year = moment().startOf('year').format()
console.log(year)

const addDay = moment().add( 14 ,'days').format()
console.log(addDay)

const date1 = moment()
const date2 = moment('2023-04-27')
date1.format()
date2.format()
/* 두 날짜 사이의 차이 */
console.log(date1.diff(date2))
console.log(date1.diff(date2,'years'))
console.log(date1.diff(date2,'months'))
console.log(date1.diff(date2,'weeks'))
console.log(date1.diff(date2,'days'))
console.log(date1.diff(date2,'hours'))
console.log(date1.diff(date2,'minutes'))
console.log(date1.diff(date2,'seconds'))
console.log(date1.diff(date2,'milliseconds'))

/* fromNow - 현재부터 몇일전인지 */
console.log(moment('2024-03-17').fromNow())
console.log(moment('2021-07-09').fromNow())
console.log(moment('2023-12-13').locale('ko').fromNow())