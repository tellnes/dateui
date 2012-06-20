
// http://stackoverflow.com/a/1267338
function zeroFill(number, width) {
  width -= number.toString().length
  if (width > 0) {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number
  }
  return number.toString()
}




/**
 * Date.prototype.getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com
 * http://www.meanfreepath.com/support/getting_iso_week.html
 */
/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
function getWeek(date, dowOffset) {
  var newYear, day, daynum, weeknum;
  dowOffset = typeof dowOffset == 'number' ? dowOffset : 0; //default dowOffset to zero

  newYear = new Date(date.getFullYear(),0,1);
  day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  daynum = Math.floor((date.getTime() - newYear.getTime() -
  (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;

  //if the year starts before the middle of a week
  if(day < 4) {
    weeknum = Math.floor((daynum+day-1)/7) + 1;
    if(weeknum > 52) {
      var nYear, nDay;
      nYear = new Date(date.getFullYear() + 1,0,1);
      nDay = nYear.getDay() - dowOffset;
      nDay = nDay >= 0 ? nDay : nDay + 7;
      // if the next year starts before the middle of the week, it is week #1 of that year
      weeknum = nDay < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum+day-1)/7);
    if (weeknum < 1) { weeknum = 53; }
  }
  return weeknum;
}

function isValidDate(date) {
  return date && !isNaN(date.getTime())
}

function valueToDate(type, date) {
  if (!date) return null

  var a

  switch(type) {
  case 'date':
    a = date.split('-')
    return new Date(Date.UTC(a[0], a[1]-1, a[2]))

  case 'month':
    a = date.split('-')
    return new Date(Date.UTC(a[0], a[1]-1))

  case 'week':
    a = new Date(Date.UTC(date.substr(0, 4), 1, 1, 1))
    a.setWeek(Number(date.substr(6)), 1)
    return a

  case 'time':
    a = date.split(':')
    return new Date(Date.UTC(1970,0,1, a[0], a[1], a[2] || 0))

  case 'datetime':
//      2001-11-18T21:05:40.3Z

    a = date.length-21
    a = zeroFill( date.substr(20, a), a )

    return new Date(Date.UTC(date.substr(0, 4) // year
                            , Number(date.substr(5, 2))-1 // month
                            , date.substr(8, 2) // date
                            , date.substr(11, 2) // houre
                            , date.substr(14, 2) // min
                            , date.substr(17, 2) // sec
                            , a // microsec
                            ))

  default:
    return a
  }

}

function valueToNumber(type, value) {
  var d

  switch(type) {
  case 'number': // fall through
  case 'range':
    return parseFloat(value)

  case 'month':
    d = valueToDate(type, value)
    return d ? (d.getFullYear() - 1970) * 12 + d.getMonth() - 1 : NaN

  case 'datetime': // fall through
  case 'date': // fall through
  case 'week': // fall through
  case 'time': // fall through
    d = valueToDate(type, value)
    return d ? d.getTime() : NaN

  case 'datetime-local':
    if (!value) return NaN

    var ms = value.length - 21
    ms = Number(zeroFill(value.substr(20, ms), 3))

    d = new Date(Date.UTC ( d.substr(0, 4) // year
                          , Number(d.substr(5, 2))-1 // month
                          , d.substr(8, 2) // date
                          , d.substr(11, 2) // hours
                          , d.substr(14, 2) // minutes
                          , d.substr(17, 2) // seconds
                          , ms // milliseconds
                          ) )

    return d.getTime()

  }

  return null
}

function toComperable(date) {
  if (!date) return null
  if (!isValidDate(date)) return NaN
  var n = 0

  n += date.getFullYear() * 10000
  n += date.getMonth() * 100
  n += date.getDate()

  return n
}

function fromComperable(n) {
  if (!n) return null

  return new Date(  parseInt(n / 10000, 10)
                  , parseInt(n % 10000 / 100, 10)
                  , parseInt(n % 10000 % 100), 10)
}

exports.valueToDate = valueToDate
exports.valueToNumber = valueToNumber
