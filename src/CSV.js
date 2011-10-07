(function() {
  window.CSV = (function() {
    function CSV() {}
    CSV.prototype.delimiters = {
      COMMA: ",",
      TAB: '\t',
      SEMICOLON: ";",
      COLON: ":"
    };
    CSV.prototype.parseLine = function(delimiter, comment_char) {
      var chunk, i, j, line, quote;
      comment_char = (void 0 === comment_char ? "#" : comment_char);
      if (this.substr(0, 1) === "#") {
        return [];
      }
      delimiter = (void 0 === delimiter ? "," : delimiter);
      line = this.split(delimiter);
      i = 0;
      while (i < line.length) {
        chunk = line[i].replace(/^[\s]*|[\s]*$/g, "");
        quote = "";
        if (chunk.charAt(0) === "\"" || chunk.charAt(0) === "'") {
          quote = chunk.charAt(0);
        }
        if (quote !== "" && chunk.charAt(chunk.length - 1) === quote) {
          quote = "";
        }
        if (quote !== "") {
          j = i + 1;
          if (j < line.length) {
            chunk = line[j].replace(/^[\s]*|[\s]*$/g, "");
          }
          while (j < line.length && chunk.charAt(chunk.length - 1) !== quote) {
            line[i] += "," + line[j];
            line.splice(j, 1);
            chunk = line[j].replace(/[\s]*$/g, "");
          }
          if (j < line.length) {
            line[i] += "," + line[j];
            line.splice(j, 1);
          }
        }
        i++;
      }
      i = 0;
      while (i < line.length) {
        line[i] = line[i].replace(/^[\s]*|[\s]*$/g, "");
        if (line[i].charAt(0) === "\"") {
          line[i] = line[i].replace(/^"|"$/g, "");
        } else {
          if (line[i].charAt(0) === "'") {
            line[i] = line[i].replace(/^'|'$/g, "");
          }
        }
        i++;
      }
      return line;
    };
    return CSV;
  })();
  String.prototype.saneParam = function(tolower) {
    var sane;
    sane = this.replace(/^\s+/, "").replace(/ä+/, "ae").replace(/ö+/, "oe").replace(/ü+/, "ue").replace(/Ä+/, "Ae").replace(/Ö+/, "Oe").replace(/Ü+/, "Ue").replace(/ß+/, "ss").replace(/\s+$/, "_").replace(/[^A-z0-9]+/g, "");
    if (tolower) {
      return sane.toLowerCase();
    } else {
      return sane;
    }
  };
  String.prototype.csvToJson = function(options) {
    var comment_char, csvRows, csvText, delimiter, error, fields, fill_empty, headers, i, jsonText, ob_index, objArr, oncomplete, onerror, onprogress, over_all_index;
    delimiter = options["delimiter"] || ",";
    comment_char = options["comment_char"] || "#";
    fill_empty = options["fill_empty"] || true;
    onprogress = options["onprogress"] || void 0;
    onerror = options["onerror"] || void 0;
    oncomplete = options["oncomplete"] || void 0;
    headers = options["headers"] || void 0;
    csvRows = [];
    objArr = [];
    error = false;
    csvText = this;
    jsonText = "";
    if (csvText === "") {
      error = true;
      jsonText = this;
    }
    if (!error) {
      csvRows = csvText.split(/[\r\n]/g);
      i = 0;
      while (i < csvRows.length) {
        if (csvRows[i].replace(/^[\s]*|[\s]*$/g, "") === "") {
          csvRows.splice(i, 1);
          i--;
        }
        i++;
      }
      if (csvRows.length > 2) {
        objArr = [];
        fields = null;
        ob_index = 0;
        over_all_index = 0;
        csvRows.map(function(row, index, source) {
          var frag, j, result;
          row = row.parseCSVLine(delimiter);
          result = true;
          if (row.trim().length <= 0) {
            result = false;
          }
          if (result && !(fields != null)) {
            fields = (row.hasEmptyCells() ? null : row);
            result = false;
          }
          if (result && fields.hasEmptyCells()) {
            result = false;
            throw new Error(fields);
          }
          frag = {};
          if (result) {
            j = 0;
            while (j < fields.length) {
              frag[fields[j].saneParam(true)] = row[j];
              j++;
            }
            objArr.push(frag);
            result = JSON.stringify(frag) !== "{}";
            ob_index++;
          }
          if (void 0 !== onprogress && typeof onprogress === "function") {
            onprogress(over_all_index / (source.length - 1), frag, result);
          }
          onprogress({
            current_row: result === false && void 0 !== onerror && typeof onerror === "function" ? row : void 0
          });
          return over_all_index++;
        });
        if (void 0 !== oncomplete && typeof oncomplete === "function") {
          oncomplete();
        }
        jsonText = (void 0 === fill_empty ? objArr.FILL() : objArr);
      }
    }
    return jsonText;
  };
  Array.prototype.trim = function() {
    return this.filter(function(el) {
      return el.trim();
    });
  };
  Array.prototype.hasEmptyCells = function() {
    return this.length !== this.trim().length;
  };
  Array.prototype.FILL = function() {
    var prev_object;
    prev_object = null;
    this.map(function(current_object) {
      var key;
      for (key in current_object) {
        if (current_object[key] === "" && prev_object.hasOwnProperty(key) && prev_object[key] !== "") {
          current_object[key] = prev_object[key];
        }
      }
      prev_object = current_object;
      return current_object;
    });
    delete prev_object;
    return this;
  };
}).call(this);
