###
  A Port of node-csv-parser for the browser
###
exports = exports ? window

# Utils:
unless merge?
  merge = (obj1, obj2) ->
    r = obj1 or {}
    for key of obj2
      r[key] = obj2[key]
    r

unless String::trimRight?
  String::trimRight = () ->
    return @.replace /\s+$/i,""

exports.csv = () ->
  initial_state = ->
    transformBefore: false
    offset: 0
    count: 0
    countWriten: 0
    field: ""
    line: []
    lastC: ""
    quoted: false
    commented: false
    buffer: null
    bufferPosition: 0

  state = initial_state()

  transforming = false

  class CSV extends EventEmitter
    readOptions: {}
    writeOptions: {}
    # state: {}
    # transforming: false
    constructor: () ->
      @readOptions = 
        transformBefore: false
        offset: 0
        delimiter: ","
        quote: "\""
        escape: "\""
        columns: null
        flags: "r"
        encoding: "utf8"
        bufferSize: 8 * 1024 * 1024
        trim: false
        ltrim: false
        rtrim: false

      @writeOptions = 
        delimiter: null
        quote: null
        escape: null
        lineBreaks: null
        flags: "w"
        encoding: "utf8"
        bufferSize: null
        end: true
      
      # TODO make one class, with state and all other stuf, no statics!
      # @state = 
      #   count: 0
      #   countWriten: 0
      #   field: ""
      #   line: []
      #   lastC: ""
      #   quoted: false
      #   commented: false
      #   buffer: null
      #   bufferPosition: 0
      # 
      # @transforming = false
      
    
    # Reading API
    from: (data, options) ->
      merge csv.readOptions, options  if options
      self = this
      # defer
      setTimeout ( () ->
        if data instanceof Array
          csv.writeOptions.lineBreaks = "\r\n"  if csv.writeOptions.lineBreaks == null
          for line in data
            state.line = line
            flush()
        else
          try
            parse data
          catch e
            self.emit "error", e
            return
        self.end()
      ), 1
      return @
    
    fromStream: (readStream,options) ->
      console.error "fromStream NOT YET IMPLEMENTED!"
    fromPath: (readStream,options) ->
      console.error("fromPath NOT YET IMPLEMENTED!")
    
    # Writing API
    
    write: (data, preserve) ->
      return parse(data)  if typeof data == "string" and not preserve
      write data, preserve
      state.count++  if not transforming and not preserve
    
    end: ->
      if state.quoted
        csv.emit "error", new Error("Quoted field not terminated")
      else
        if state.field
          state.field = state.field.trimRight()  if csv.readOptions.trim or csv.readOptions.rtrim
          state.line.push state.field
          state.field = ""
        flush()  if state.line.length > 0
        if csv.writeStream
          csv.writeStream.write state.buffer.slice(0, state.bufferPosition)  if state.bufferPosition != 0
          if @writeOptions.end
            csv.writeStream.end()
          else
            # csv.emit "end", state.count
            csv.emit "end", csv.getCount()
        else
          # csv.emit "end", state.count
          csv.emit "end", csv.getCount()
    
    # get the actual count
    getCount: ->
      state.count - (if csv.readOptions.offset? then csv.readOptions.offset else 0)
    
    toStream: (writeStream, options) ->
      console.error("toStream NOT YET IMPLEMENTED!")
    
    # Transform API
    transform: (callback) ->
      @transformer = callback
      return @
    
    ### END CLASS ###
  
  
  # Init an instance:
  csv = new CSV()
  # Private API
  write = (line,preserve) ->
    return  if typeof line == "undefined" or line == null
    csv.emit "data", line, state.count  unless preserve
    if typeof line == "object"
      unless line instanceof Array
        columns = csv.writeOptions.columns or csv.readOptions.columns
        _line = []
        if columns
          for column, i in columns
            _line[i] = (if (typeof line[column] == "undefined" or line[column] == null) then "" else line[column])
        else
          for column of line
            _line.push line[column]
        line = _line
        _line = null
      
      if line instanceof Array
        newLine = (if state.countWriten then csv.writeOptions.lineBreaks or "\r" else "")
        for field, i in line
          if typeof field == "string"
            # ok
          else if typeof field == "number"
            field = "" + field
          else
            field = "" + field.getTime()  if field instanceof Date
          
          if field
            containsdelimiter = field.indexOf(csv.writeOptions.delimiter or csv.readOptions.delimiter) >= 0
            containsQuote = field.indexOf(csv.writeOptions.quote or csv.readOptions.quote) >= 0
            containsLinebreak = field.indexOf("\r") >= 0 or field.indexOf("\n") >= 0
            field = field.replace(new RegExp(csv.writeOptions.quote or csv.readOptions.quote, "g"), (csv.writeOptions.escape or csv.readOptions.escape) + (csv.writeOptions.quote or csv.readOptions.quote))  if containsQuote
            field = (csv.writeOptions.quote or csv.readOptions.quote) + field + (csv.writeOptions.quote or csv.readOptions.quote)  if containsQuote or containsdelimiter or containsLinebreak
            newLine += field
          newLine += csv.writeOptions.delimiter or csv.readOptions.delimiter  if i != line.length - 1
        
        line = newLine
    
    # Implement with Blob API for browser!
    # if state.buffer
    #   if state.bufferPosition + Buffer.byteLength(line, "utf8") > csv.readOptions.bufferSize
    #     csv.writeStream.write state.buffer.slice(0, state.bufferPosition)
    #     state.buffer = new Buffer(csv.readOptions.bufferSize)
    #     state.bufferPosition = 0
    #   state.bufferPosition += state.buffer.write(line, state.bufferPosition, "utf8")
    state.countWriten++  unless preserve
  
  
  # the parsing function
  parse = (chars) ->
    state = initial_state()
    chars = '' + chars
    for c,i in chars
      state.commented = c is '#' unless state.commented
      switch c
        # Handle esacpe and Quotes
        when csv.readOptions.escape, csv.readOptions.quote
          break if state.commented
          isEscape = false
          if c is csv.readOptions.escape
            # Make sure the escape is really here for escaping:
            # if escape is same as quote, and escape is first char of a field and it's not quoted, then it is a quote
            # next char should be an escape or a quote
            nextChar = chars.charAt i+1
            unless (csv.readOptions.escape isnt csv.readOptions.quote and !state.field and !state.quoted) and (csv.readOptions.escape is nextChar or nextChar is csv.readOptions.quoted)
              i++
              isEscape = true
              c = chars.charAt i
              state.field += c
          if not isEscape and (c == csv.readOptions.quote)
            if state.field and not state.quoted
              state.field += c
              break
            if state.quoted
              nextChar = chars.charAt(i + 1)
              console.error("Invalid closing quote; found \"" + nextChar + "\" instead of delimiter \"" + csv.readOptions.delimiter + "\"")  if nextChar and nextChar != "\r" and nextChar != "\n" and nextChar != csv.readOptions.delimiter
              state.quoted = false
            else state.quoted = true  if state.field == ""
        
        # A Delimter is found
        when csv.readOptions.delimiter
          break if state.commented
          if state.quoted
            state.field +=c
          else
            if csv.readOptions.trim or csv.readOptions.rtrim
              state.field = state.field.trimRight()
            state.line.push state.field
            state.field = ''
        
        # line endings
        when '\n','\r'
          # unix line ending
          if c is '\n'
            if state.quoted
              state.field += c
              break
            break if not csv.readOptions.quoted and state.lastC is '\r'
          # carrigae return
          if c is '\r' or chars.charAt i+1 isnt '\r'
            if state.quoted
              state.field += c
              break
            unless csv.writeOptions.lineBreaks?
              # auto discovery of lines breaks
              csv.writeOptions.lineBreaks = c + (if c == "\r" and chars.charAt(i + 1) == "\n" then "\n" else "")
          
            if csv.readOptions.trim or csv.readOptions.rtrim
              state.field = state.field.trimRight()
            state.line.push state.field
            state.field = ''
            flush()
        
        # white space
        when ' ' #,'\t'
          break if state.commented
          state.field += c  if state.quoted or (not csv.readOptions.trim and not csv.readOptions.ltrim) or state.field
        
        # default:
        else
          break if state.commented
          state.field += c
      
      # store the state
      csv.emit "pct",i/(chars.length-1)
      state.lastC = c
  
  # FLUSH
  flush = ->
    empty_line = state.line.join("").trim() is ""
    if csv.readOptions.offset > state.count or state.commented or empty_line
      unless state.commented or empty_line
        state.count++
      state.line = []
      state.lastC = ""
      state.commented = false
      return
    
    # get first rowas colume, if colums is set to true
    if csv.readOptions.columns
      if state.count == 0 and csv.readOptions.columns is true
        csv.readOptions.columns = state.line
        state.line = []
        state.lastC = ""
        return
    
    # transform before(!) applying the columns
    if csv.transformer and csv.readOptions.transformBefore
      transforming = true
      state.line = csv.transformer(state.line, state.count)
      transforming = false
      
    if csv.readOptions.columns
      line = {}
      for column, i in csv.readOptions.columns
        line[column] = state.line[i] ? null
      state.line = line
      line = null

    if csv.transformer and not csv.readOptions.transformBefore
      transforming = true
      state.line = csv.transformer(state.line, state.count)
      transforming = false
    
    write state.line
    csv.emit "progress",state.line,csv.getCount()
    # housekeeping
    state.count++
    state.line = []
    state.lastC = ""
    state.commented = false
  
  # return the object
  return csv