/**
 * A Basic CSV Parser
 */


// some regex patterns:
// ^(("(?:[^"]|"")*"|[^,]*)(,("(?:[^"]|"")*"|[^,]*))*)$

String.prototype.parseCSVLine = function(delimiter,comment_char) {
	comment_char = (undefined==comment_char)?"#":comment_char;

	// check, if line is a comment:
	if (this.substr(0,1) == "#") return []; // return an empty array, if so
	
	delimiter = (undefined==delimiter)?",":delimiter;
	var line = this.split(delimiter);

	// check for splits performed inside quoted strings and correct if needed
	for (var i = 0; i < line.length; i++) {
		var chunk = line[i].replace(/^[\s]*|[\s]*$/g, "");
		var quote = "";
		if (chunk.charAt(0) == '"' || chunk.charAt(0) == "'")
			quote = chunk.charAt(0);
		if (quote != "" && chunk.charAt(chunk.length - 1) == quote)
			quote = "";

		if (quote != "") {
			var j = i + 1;

			if (j < line.length)
				chunk = line[j].replace(/^[\s]*|[\s]*$/g, "");

			while (j < line.length && chunk.charAt(chunk.length - 1) != quote) {
				line[i] += ',' + line[j];
				line.splice(j, 1);
				chunk = line[j].replace(/[\s]*$/g, "");
			}

			if (j < line.length) {
				line[i] += ',' + line[j];
				line.splice(j, 1);
			}
		}
	}

	for (var i = 0; i < line.length; i++) {
		// remove leading/trailing whitespace
		line[i] = line[i].replace(/^[\s]*|[\s]*$/g, "");

		// remove leading/trailing quotes
		if (line[i].charAt(0) == '"')
			line[i] = line[i].replace(/^"|"$/g, "");
		else if (line[i].charAt(0) == "'")
			line[i] = line[i].replace(/^'|'$/g, "");
	}
	
	return line;
}

String.prototype.saneParam = function(tolower) {
	var sane = this.replace(/^\s+/, '').
				replace (/ä+/, 'ae').
				replace (/ö+/, 'oe').
				replace (/ü+/, 'ue').
				replace (/Ä+/, 'Ae').
				replace (/Ö+/, 'Oe').
				replace (/Ü+/, 'Ue').
				replace (/ß+/, 'ss').
				replace (/\s+$/, '_').
				replace(/[^A-z0-9]+/gi,'');
		return tolower ? sane.toLowerCase():sane;
}


String.prototype.csvToJson = function (options) {
	var delimiter    = options['delimiter']    || ",";
	var comment_char = options['comment_char'] || "#";
	var fill_empty   = options['fill_empty']   || true;
	var onprogress   = options['onprogress']   || undefined;
	var onerror      = options['onerror']      || undefined;
	var oncomplete   = options['oncomplete']   || undefined;
	var headers      = options['headers']      || undefined;
	
	var csvRows = [];
	var objArr = [];
	var error = false;
	var csvText = this;
	var jsonText = "";

	if (csvText == "") {
		error = true;
		jsonText=this;
	}

	if (!error) {
		csvRows = csvText.split(/[\r\n]/g); // split into rows
		
		// get rid of empty rows
		for (var i = 0; i < csvRows.length; i++) {
			if (csvRows[i].replace(/^[\s]*|[\s]*$/g, '') == "") {
				csvRows.splice(i, 1);
				i--;
			}
		}

		if (csvRows.length > 2) {
			objArr = [];
			var fields = null;
			var ob_index = 0;
			var over_all_index = 0;
			csvRows.map(function(row,index,source){
				row = row.parseCSVLine(delimiter);

        var result = true;
        
        if (row.trim().length <= 0)
        {
          result = false; // check for sane row
        }
        
				if (result && fields==null)
				{
				  fields = row.hasEmptyCells()?null:row; // set the fields from the first valid row
				  result = false;
				} 
				
				if (result && fields.hasEmptyCells()){
				  result = false;
				  throw new Error(fields);
				} 
				
  			var frag = {};
				if(result)
				{
				  // We are save to parse:
  				for (var j = 0; j < fields.length; j++) {
  					// objArr[ob_index][fields[j].saneParam()] = row[j];
  				  frag[fields[j].saneParam(true)] = row[j];
  				}
  				objArr.push(frag);
					result = JSON.stringify(frag)!=='{}';
  				ob_index++;
			  }
			  
				if(undefined!=onprogress && typeof onprogress == "function")
				{
				  onprogress(over_all_index/(source.length-1),frag,result)
				}
				
				if(result===false && undefined!=onerror && typeof onerror == "function")
				{
				  onprogress({current_row:row})
				}
			  
			  over_all_index++;
			});
			
			if(undefined!=oncomplete && typeof oncomplete == "function")
			{
			  oncomplete()
			}
			
			jsonText = (undefined==fill_empty)?objArr.FILL():objArr; // FIXED logic error
		}
	}

	return jsonText;
}

Array.prototype.trim = function(){
  return this.filter(function(el){
    return el.trim();
  })
}

Array.prototype.hasEmptyCells = function(){
  return this.length!=this.trim().length;
}


/**
 * The Filler
 * ----------
 *
 * Fill up empty values of objects with values of
 * the preceeding object in a collection of concurrend
 * models.
 */
Array.prototype.FILL = function() {
	var prev_object = null;
	this.map( function(current_object) {
		for (var key in current_object) {
			if (current_object[key]=="" &&
				prev_object.hasOwnProperty(key) &&
				prev_object[key]!="") {
				current_object[key] = prev_object[key];
			}
		}
		prev_object = current_object;
		return current_object;
	})
	delete prev_object;
	return this;
}

