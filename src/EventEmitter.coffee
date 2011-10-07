((exports) ->
  
  if typeof Array.isArray != "function"
    Array.isArray = (obj) ->
      Object::toString.call(obj) == "[object Array]"
  unless Array::indexOf
    Array::indexOf = (item) ->
      i = 0
      length = @length
      
      while i < length
        return i  if this[i] == item
        i++
      -1
  
  class exports.EventEmitter
    
  EventEmitter = exports.EventEmitter # = process.EventEmitter
  
  isArray = Array.isArray
  EventEmitter::emit = (type) ->
    if type == "error"
      if not @_events or not @_events.error or (isArray(@_events.error) and not @_events.error.length)
        if arguments[1] instanceof Error
          throw arguments[1]
        else
          throw new Error("Uncaught, unspecified 'error' event.")
        return false
    return false  unless @_events
    handler = @_events[type]
    return false  unless handler
    if typeof handler == "function"
      switch arguments.length
        when 1
          handler.call this
        when 2
          handler.call this, arguments[1]
        when 3
          handler.call this, arguments[1], arguments[2]
        else
          args = Array::slice.call(arguments, 1)
          handler.apply this, args
      true
    else if isArray(handler)
      args = Array::slice.call(arguments, 1)
      listeners = handler.slice()
      i = 0
      l = listeners.length
      
      while i < l
        listeners[i].apply this, args
        i++
      true
    else
      false
  
  EventEmitter::addListener = (type, listener) ->
    throw new Error("addListener only takes instances of Function")  if "function" != typeof listener
    @_events = {}  unless @_events
    @emit "newListener", type, listener
    unless @_events[type]
      @_events[type] = listener
    else if isArray(@_events[type])
      @_events[type].push listener
    else
      @_events[type] = [ @_events[type], listener ]
    this
  
  EventEmitter::on_ = EventEmitter::addListener
  EventEmitter::on = EventEmitter::addListener
  EventEmitter::once = (type, listener) ->
    self = this
    self.on_ type, g = ->
      self.removeListener type, g
      listener.apply this, arguments
  
  EventEmitter::removeListener = (type, listener) ->
    throw new Error("removeListener only takes instances of Function")  if "function" != typeof listener
    return this  if not @_events or not @_events[type]
    list = @_events[type]
    if isArray(list)
      i = list.indexOf(listener)
      return this  if i < 0
      list.splice i, 1
      delete @_events[type]  if list.length == 0
    else delete @_events[type]  if @_events[type] == listener
    this
  
  EventEmitter::removeAllListeners = (type) ->
    @_events[type] = null  if type and @_events and @_events[type]
    this
  
  EventEmitter::listeners = (type) ->
    @_events = {}  unless @_events
    @_events[type] = []  unless @_events[type]
    @_events[type] = [ @_events[type] ]  unless isArray(@_events[type])
    @_events[type]
) (if (typeof exports == "undefined") then window else exports)