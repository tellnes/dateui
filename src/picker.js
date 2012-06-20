function InternalValue(picker) {
  var d = new Date()
  this.value = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  this.picker = picker
}
Object.defineProperties(InternalValue.prototype, {
  year: {
    get: function() {
      return this.value.getFullYear()
    },
    set: function(value) {
      this.value.setFullYear(value)
      this.check()
    }
  },
  month: {
    get: function() {
      return this.value.getMonth()
    },
    set: function(value) {
      this.value.setMonth(value)
      this.check()
    }
  },
  date: {
    get: function() {
      return this.value.getDate()
    },
    set: function(value) {
      this.value.setDate(value)
      this.check()
    }
  }
})
InternalValue.prototype.valueOf = function() {
  return toComperable(this.value)
}
InternalValue.prototype.use = function() {
  this.picker.value = new Date(this.value)
  this.picker.emit('change')
}

InternalValue.prototype.check = function() {
  var min = this.picker.min
    , max = this.picker.max
    , value = this.valueOf()

  if (min && min > value) {
    this.value = fromComperable(min)
  }

  if (max && max < value) {
    this.value = fromComperable(max)
  }
}

function Picker(options) {
  EventEmitter.call(this)

  this.options = {}

  this.iv = new InternalValue(this)

  this.setOptions(defaultOptions)
  this.setOptions(options)
}
Picker.prototype = Object.create(EventEmitter.prototype)

Object.defineProperty(Picker.prototype, 'element', {
  get: function() {
    this.update()
    return this.element
  },
  set: function(element) {
    Object.defineProperty(this, 'element', { value: element })
  },
  configurable: true
})

Picker.prototype.setOptions = function(options) {
  for(var key in options) {
    this.options[key] = options[key]
  }

  this._cnp = this.options.classNamePrefix || this.options.className + '-'

  if (this.options.value) {
    this.value = this.options.value

    if (isValidDate(this.value)) {
      this.iv.value = new Date(this.value)
      this.iv.check()
    }

    delete this.options.value
  }

  if (this.options.min) {
    this.min = toComperable(this.options.min)
    delete this.options.min
  }
  if (this.options.max) {
    this.max = toComperable(this.options.max)
    delete this.options.max
  }

  if (!this.build) this.update()
}

Picker.prototype.assignTo = function(element) {
  element = $(element)

  if (element.nodeName != 'INPUT') throw new TypeError('First argument to Picker#assignTo must be a HTMLInputElement')

  var picker = this
    , ignoreBlur = false
    , ignoreChange = false
    , wasYear = false
    , visualElement = element
    , formater = picker.options.formater

  picker.setOptions({ value: valueToDate('date', element.value)
                    , min: valueToDate('date', element.getAttribute('min'))
                    , max: valueToDate('date', element.getAttribute('max'))
                    })


  if (formater) {
    visualElement = element.cloneNode()
    element.setAttribute('type', 'hidden')

    visualElement .setAttributes( { value: formater(picker.value)
                                  , name: null
                                  })
                  .insertAfter(element)
  }

  picker.on('change', onPickerChange)

  element.on('change', onElementChange)
  visualElement.on('focus', show)
  visualElement.on('blur', onBlur)
  visualElement.on('keydown', onElementKeyDown)

  picker.on('destroy', function() {
    picker.removeListener(onPickerChange)
    element.off('change', onElementChange)
    visualElement.off('focus', show)
    visualElement.off('blur', onBlur)
    visualElement.off('keydown', onElementKeyDown)
    if (visualElement != element) {
      element.setAttribute('type', visualElement.getAttribute('type'))
      visualElement.remove()
    }
  })


  function onPickerChange() {
    if (ignoreChange) return ignoreChange = false

    var v = picker.value
    if (isValidDate(v)) {
      element.value = [ v.getFullYear()
                      , zeroFill( (v.getMonth() + 1), 2)
                      , zeroFill(v.getDate(), 2)
                      ].join('-')

      if (formater) visualElement.value = formater(v)

      ignoreChange = true
      element.fire('change')
    }

    visualElement.blur()
  }
  function onElementChange() {
    picker.iv.value = valueToDate('date', element.value)
    picker.iv.use()
  }
  function onDocumentMouseDown(event) {
    var target = $(event.target)

    if (visualElement.equal(target)) {
      return

    } else if (target.equal(picker.elements.year)) {
      ignoreBlur = wasYear = true

    } else if ( picker.element.equal( target.up('.' + picker.options.className)) ) {
      ignoreBlur = true

    }
  }

  function onBlur(event) {
    if (ignoreBlur) {
      event.preventDefault()
      if (!wasYear) visualElement.focus()

    } else {
      // Hide
      $(document).off('mousedown', onDocumentMouseDown)
      picker.elements.year.off('blur', onBlur)
      picker.element.remove()
    }

    ignoreBlur = wasYear = false
  }

  function show() {
    picker.element.setStyle({ position: 'absolute'
                            , top: (visualElement.offsetTop + visualElement.offsetHeight) + 'px'
                            , left: visualElement.offsetLeft + 'px'
                            })

    picker.element.insertAfter(visualElement)

    $(document).on('mousedown', onDocumentMouseDown)
    picker.elements.year.on('blur', onBlur)
  }

  function onElementKeyDown(event) {
    var iv = picker.iv

    switch(event.keyCode) {
    case 38: // Up
      iv.date -= 7
      break

    case 40: // Down
      iv.date += 7
      break

    case 37: // Left
      iv.date -= 1
      break

    case 39: // Right
      iv.date += 1
      break

    case 33: // Page Up
      iv.month -= 1
      break

    case 34: // Page Down
      iv.month += 1
      break

    case 13: // Enter
      iv.use()
      visualElement.blur()
      break

    default:
      return
    }

    picker.update()
  }

}

Picker.prototype.appendTo = function(element) {
  $(element).append(this.element)
}

Picker.prototype.build = function() {
  var options = this.options
    , elements = this.elements = {}
    , element
    , cnp = this._cnp
    , month = this.iv.month
    , len
    , i
    , j
    , tr
    , table
    , header

  i = options.className + ' ' + cnp + 'pick-' + options.pick
  element = this.element = $.create('div', {className: i})

  header = $.create('div', {className: cnp + 'header'})
            .appendTo(element)


  // Month left
  elements.left = $ .create('div', {className: cnp + 'month-left'})
                    //.html('&lsaquo;')
                    .html('<')
                    .on('click', this)
                    .appendTo(header)

  elements.month = $.create('div', {className: cnp + 'month'})
                    .appendTo(header)

  // Month right
  elements.right = $.create('div', {className: cnp + 'month-right'})
                    //.html('&rsaquo;')
                    .html('>')
                    .on('click', this)
                    .appendTo(header)

  // Year
  elements.year = $ .create('input', {type: 'number', min: '0', max: 9999, tabindex: '-1'})
                    .on('change', this)
                    .appendTo( $.create('div', {className: cnp + 'year' }).appendTo(header) )


  // Table

  table = elements.table = $.create('table', {className: cnp + 'table'})
                            .appendTo(element)
                            .on('click', this)


  len = 5
  if (options.showWeekends) len += 2

  tr = $.create('tr')
        .appendTo(table)

  if (options.showWeekNumbers) $.create('th', {title: i18n.week}, i18n.weekChar)
                                .appendTo(tr)

  j = options.weekStart

  for(i = 0; i < len; i++) {
    $ .create('th', { title: i18n.days[j] }, i18n.daysChar[j] )
      .appendTo(tr)

    if (j++ === 6) j = 0
  }


  if (options.showWeekNumbers) len++

  for(i = 0; i < 6; i++) {
    tr = $.create('tr').appendTo(table)

    for(j = 0; j < len; j++) {
      $ .create('td', {className: cnp + 'week'})
        .appendTo(tr)
    }
  }

  this.build = null
}

Picker.prototype.update = function() {
  if (this.build) this.build()

  var table = this.elements.table
    , tr
    , value = toComperable(this.value)
    , year = this.iv.year
    , month = this.iv.month
    , today = toComperable(new Date())
    , current
    , da
    , i
    , j
    , cn
    , len
    , options = this.options
    , cnp = this._cnp
    , A

  this.elements.month.html(i18n.months[month])
  this.elements.year.value = year

  current = new Date(year, month, 0) // setting day to 0 goes to last date of previous month

  da = current.getDay()
  if (da !== options.weekStart) {
    da -= options.weekStart

    if (da) {
      current = new Date( current.getTime() - ( da * 86400000 ) )

    } else { // if sunday
      current = new Date(year, month, 1)

    }
  }

  len = 5
  if (options.showWeekends) len += 2
  if (options.showWeekNumbers) len++


  for(i = 1; i < 7; i++) {
    tr = table._.rows[i]
    if (options.showWeekNumbers) tr.cells[0].innerHTML = getWeek(current)

    for(j = +!!options.showWeekNumbers; j < len; j++) {
      da = current.getDate()

      cn = ['day']
      if (current.getMonth() != month) cn.push('offmonth')

      A = toComperable(current)
      if (A == today) cn.push('today')
      if (A == value) cn.push('selected')
      if (A == this.iv) cn.push('current')
      if ((this.min && A < this.min) || (this.max && A > this.max)) cn.push('disabled')

      tr.cells[j].className = cnp + cn.join(' ' + cnp)

      tr.cells[j].innerHTML = da

      current.setDate(da + ( (!options.showWeekends && current.getDay() === 5) ? 3 : 1) )
    }
  }
}

Picker.prototype.handleEvent = function(event) {
  var target = $(event.target)
    , elements = this.elements

  if (target.equal(elements.year)) {
    this.iv.year = parseInt(target.value, 10)

  } else if (target.equal(elements.left)) {
    this.iv.month -= 1

  } else if (target.equal(elements.right)) {
    this.iv.month += 1

  } else if (target.classList.contains(this._cnp + 'day') && !target.classList.contains(this._cnp + 'disabled')) {
    var value = Number(target.html())

    if (target.classList.contains(this._cnp + 'offmonth')) {
      this.iv.month += (value > 20 ? -1 : 1)
    }

    this.iv.date = value

    this.value = new Date(this.iv.value)
    this.emit('change')

  }

  this.update()
}

exports.Picker = Picker
