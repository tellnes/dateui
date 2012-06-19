function EventEmitter() {
  this._events = {}
}

EventEmitter.prototype.on = function (type, fn) {
  if (!this._events[type]) this._events[type] = []

  this._events[type].push(fn)
  return this
}

EventEmitter.prototype.removeListener = function (type, fn) {
  var listeners = this._events[type]
  if (!listeners || !listeners.length) return

  listeners.splice(listeners.indexOf(fn), 1)

  return this
}

EventEmitter.prototype.emit = function (type) {
  var args = Array.prototype.slice.call(arguments, 1)
    , listeners = this._events[type]

  if (type === 'error' && !(listeners && listeners.length)) {
    throw args[0]
  }

  if (!listeners) return
  listeners = listeners.slice()

  for (var i = 0, len = listeners.length; i < len; i++) {
    listeners[i].apply(this, args)
  }
  return this
}

EventEmitter.prototype.once = function (type, fn) {
  this.on(type, function () {
    this.removeListener(type, fn)
    fn.apply(this, arguments)
  })
  return this
}
