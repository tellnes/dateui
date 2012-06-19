
$.prototype.dateui = function(options) {
  var picker = new Picker(options)
  picker.assignTo(this)
  return this
}
