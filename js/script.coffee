
# use a simple defer
defer = (func,args...) -> setTimeout (->func.apply(null, args)), 100


# test defer
greet = (names...) ->
  lastname = names.pop() if names.length > 2
  names = names.join ", "
  names += " and #{lastname}" if lastname
  console.log "Hello #{names}!"

jens = "Jens"
defer(greet,jens)
defer(greet,jens,"Tim","Sue")


test = '''
id,lastname,firstname
82,Preisner,Zbigniew
94,Gainsbourg,Serge
'''

_csv = csv()
_csv.on "progress", (progress,data) -> console.log "progress: ", progress,data
_csv.on "end", () -> console.log arguments
_csv.on "error", () -> console.log "ERROR: ", arguments
_csv.from test

test = '''
id;lastname;firstname
82;Preisner;Zbigniew
# yet another
94;Gainsbourg;Serge
'''

_csv = csv()
_csv.on "progress", (progress,data) -> console.log "progress: ", progress,data
# _csv.on "pct", (pct) -> console.log pct
_csv.on "end", () -> console.log arguments
# _csv.on "data", () -> console.log arguments
_csv.on "error", () -> console.log "ERROR: ", arguments
_csv.transform (data, index) ->
  (if index > 0 then "," else "") + data[0] + ":" + data[2] + " " + data[1]
  [data[0],data[2]+" "+data[1]]
_csv.from test,
  delimiter: ';'
  columns: ['id', 'fullname']
  offset: 1
  transformBefore: true


###############################################################
$ ->
  result = []
  current_result_page = 0
  showresult = (pagenum,size) ->
    return if pagenum < 0
    return unless result instanceof Array and result.length>0
    size = 1 if 0 > size
    start = pagenum*size
    start = result.length - size if start > result.length
    end = start+size
    end = result.length if end > result.length
    
    current_result_page = pagenum if end isnt result.length
    
    $('#pagenum').html("Seite "+current_result_page)
    $('#results').html("")
    for data in result.slice(start,end)
      cells = ""
      for cell in data
        cells += "<td>"+cell+"</td>"
      $("<tr>"+cells+"</tr>").appendTo('#results')
  
  $('#prev').click (event) ->
    showresult current_result_page-1,100
  $('#next').click (event) ->
    showresult current_result_page+1,100
  
  $('#pastehere').paster (data) ->
    # console.log "FILER loaded ",name,suffix,istext,"data":data
    $('#results').html("")
    result = []
    _csv = csv()
    # _csv.on "pct", (pct) -> console.log pct
    if $('.debug:checked').size() > 0
      _csv.on "progress", (progress,data) -> console.log "progress: ", progress,data
    _csv.on "progress", (data,count) => result.push(data)
    _csv.on "end", () -> showresult(0,100)
    _csv.on "end", () -> console.log arguments
    _csv.on "error", () -> console.log "ERROR: ", arguments
    _csv.from data,
      # columns:true
      # columns:["lk","kennung","bezeichung","haendlerkennung"]
      delimiter:'\t'
      offset: 1
  
  
  $('#filehere').filer
    error: (errro) ->
      console.log "FILER error ",error
    success: (data,name,suffix,istext) =>
      # console.log "FILER loaded ",name,suffix,istext,"data":data
      $('#results').html("")
      result = []
      _csv = csv()
      # _csv.on "pct", (pct) -> console.log pct
      if $('.debug:checked').size() > 0
        _csv.on "progress", (progress,data) -> console.log "progress: ", progress,data
      _csv.on "progress", (data,count) => result.push(data)
      _csv.on "end", () -> showresult(0,100)
      _csv.on "end", () -> console.log arguments
      _csv.on "error", () -> console.log "ERROR: ", arguments
      _csv.from data, delimiter:';'
    
  $('#drophere').dropper
    error: (errro) ->
      console.log "FILER error ",error
    success: (data,name,suffix,istext) ->
      # console.log "FILER loaded ",name,suffix,istext,"data":data
      $('#results').html("")
      result = []
      _csv = csv()
      # _csv.on "pct", (pct) -> console.log pct
      if $('.debug:checked').size() > 0
        _csv.on "progress", (progress,data) -> console.log "progress: ", progress,data
      _csv.on "progress", (data,count) => result.push(data)
      _csv.on "end", () -> showresult(0,100)
      _csv.on "end", () -> console.log arguments
      _csv.on "error", () -> console.log "ERROR: ", arguments
      _csv.from data, delimiter:';'

