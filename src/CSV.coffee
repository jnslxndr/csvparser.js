class window.CSV
  delimiters:
    COMMA:","
    TAB: '\t'
    SEMICOLON: ";"
    COLON: ":"
  
  
  parseLine: (delimiter, comment_char) ->
    comment_char = (if (undefined == comment_char) then "#" else comment_char)
    return []  if @substr(0, 1) == "#"
    delimiter = (if (undefined == delimiter) then "," else delimiter)
    line = @split(delimiter)
    i = 0
  
    while i < line.length
      chunk = line[i].replace(/^[\s]*|[\s]*$/g, "")
      quote = ""
      quote = chunk.charAt(0)  if chunk.charAt(0) == "\"" or chunk.charAt(0) == "'"
      quote = ""  if quote != "" and chunk.charAt(chunk.length - 1) == quote
      unless quote == ""
        j = i + 1
        chunk = line[j].replace(/^[\s]*|[\s]*$/g, "")  if j < line.length
        while j < line.length and chunk.charAt(chunk.length - 1) != quote
          line[i] += "," + line[j]
          line.splice j, 1
          chunk = line[j].replace(/[\s]*$/g, "")
        if j < line.length
          line[i] += "," + line[j]
          line.splice j, 1
      i++
    i = 0
  
    while i < line.length
      line[i] = line[i].replace(/^[\s]*|[\s]*$/g, "")
      if line[i].charAt(0) == "\""
        line[i] = line[i].replace(/^"|"$/g, "")
      else line[i] = line[i].replace(/^'|'$/g, "")  if line[i].charAt(0) == "'"
      i++
    line

String::saneParam = (tolower) ->
  sane = @replace(/^\s+/, "").replace(/ä+/, "ae").replace(/ö+/, "oe").replace(/ü+/, "ue").replace(/Ä+/, "Ae").replace(/Ö+/, "Oe").replace(/Ü+/, "Ue").replace(/ß+/, "ss").replace(/\s+$/, "_").replace(/[^A-z0-9]+/g, "")
  (if tolower then sane.toLowerCase() else sane)

String::csvToJson = (options) ->
  delimiter = options["delimiter"] or ","
  comment_char = options["comment_char"] or "#"
  fill_empty = options["fill_empty"] or true
  onprogress = options["onprogress"] or undefined
  onerror = options["onerror"] or undefined
  oncomplete = options["oncomplete"] or undefined
  headers = options["headers"] or undefined
  csvRows = []
  objArr = []
  error = false
  csvText = this
  jsonText = ""
  if csvText == ""
    error = true
    jsonText = this
  unless error
    csvRows = csvText.split(/[\r\n]/g)
    i = 0
    
    while i < csvRows.length
      if csvRows[i].replace(/^[\s]*|[\s]*$/g, "") == ""
        csvRows.splice i, 1
        i--
      i++
    if csvRows.length > 2
      objArr = []
      fields = null
      ob_index = 0
      over_all_index = 0
      csvRows.map (row, index, source) ->
        row = row.parseCSVLine(delimiter)
        result = true
        result = false  if row.trim().length <= 0
        if result and not fields?
          fields = (if row.hasEmptyCells() then null else row)
          result = false
        if result and fields.hasEmptyCells()
          result = false
          throw new Error(fields)
        frag = {}
        if result
          j = 0
          
          while j < fields.length
            frag[fields[j].saneParam(true)] = row[j]
            j++
          objArr.push frag
          result = JSON.stringify(frag) != "{}"
          ob_index++
        onprogress over_all_index / (source.length - 1), frag, result  if undefined != onprogress and typeof onprogress == "function"
        onprogress current_row: row  if result == false and undefined != onerror and typeof onerror == "function"
        over_all_index++
      
      oncomplete()  if undefined != oncomplete and typeof oncomplete == "function"
      jsonText = (if (undefined == fill_empty) then objArr.FILL() else objArr)
  jsonText

Array::trim = ->
  @filter (el) ->
    el.trim()

Array::hasEmptyCells = ->
  @length != @trim().length

Array::FILL = ->
  prev_object = null
  @map (current_object) ->
    for key of current_object
      current_object[key] = prev_object[key]  if current_object[key] == "" and prev_object.hasOwnProperty(key) and prev_object[key] != ""
    prev_object = current_object
    current_object
  
  delete prev_object
  
  this
