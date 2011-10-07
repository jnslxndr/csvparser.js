(function() {
  /*
    A Port of node-csv-parser for the browser
  */
  var exports, merge;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports = exports != null ? exports : window;
  if (typeof merge === "undefined" || merge === null) {
    merge = function(obj1, obj2) {
      var key, r;
      r = obj1 || {};
      for (key in obj2) {
        r[key] = obj2[key];
      }
      return r;
    };
  }
  if (String.prototype.trimRight == null) {
    String.prototype.trimRight = function() {
      return this.replace(/\s+$/i, "");
    };
  }
  exports.csv = function() {
    var CSV, csv, flush, initial_state, parse, state, transforming, write;
    initial_state = function() {
      return {
        transformBefore: false,
        offset: 0,
        count: 0,
        countWriten: 0,
        field: "",
        line: [],
        lastC: "",
        quoted: false,
        commented: false,
        buffer: null,
        bufferPosition: 0
      };
    };
    state = initial_state();
    transforming = false;
    CSV = (function() {
      __extends(CSV, EventEmitter);
      CSV.prototype.readOptions = {};
      CSV.prototype.writeOptions = {};
      function CSV() {
        this.readOptions = {
          transformBefore: false,
          offset: 0,
          delimiter: ",",
          quote: "\"",
          escape: "\"",
          columns: null,
          flags: "r",
          encoding: "utf8",
          bufferSize: 8 * 1024 * 1024,
          trim: false,
          ltrim: false,
          rtrim: false
        };
        this.writeOptions = {
          delimiter: null,
          quote: null,
          escape: null,
          lineBreaks: null,
          flags: "w",
          encoding: "utf8",
          bufferSize: null,
          end: true
        };
      }
      CSV.prototype.from = function(data, options) {
        var self;
        if (options) {
          merge(csv.readOptions, options);
        }
        self = this;
        setTimeout((function() {
          var line, _i, _len;
          if (data instanceof Array) {
            if (csv.writeOptions.lineBreaks === null) {
              csv.writeOptions.lineBreaks = "\r\n";
            }
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              line = data[_i];
              state.line = line;
              flush();
            }
          } else {
            try {
              parse(data);
            } catch (e) {
              self.emit("error", e);
              return;
            }
          }
          return self.end();
        }), 1);
        return this;
      };
      CSV.prototype.fromStream = function(readStream, options) {
        return console.error("fromStream NOT YET IMPLEMENTED!");
      };
      CSV.prototype.fromPath = function(readStream, options) {
        return console.error("fromPath NOT YET IMPLEMENTED!");
      };
      CSV.prototype.write = function(data, preserve) {
        if (typeof data === "string" && !preserve) {
          return parse(data);
        }
        write(data, preserve);
        if (!transforming && !preserve) {
          return state.count++;
        }
      };
      CSV.prototype.end = function() {
        if (state.quoted) {
          return csv.emit("error", new Error("Quoted field not terminated"));
        } else {
          if (state.field) {
            if (csv.readOptions.trim || csv.readOptions.rtrim) {
              state.field = state.field.trimRight();
            }
            state.line.push(state.field);
            state.field = "";
          }
          if (state.line.length > 0) {
            flush();
          }
          if (csv.writeStream) {
            if (state.bufferPosition !== 0) {
              csv.writeStream.write(state.buffer.slice(0, state.bufferPosition));
            }
            if (this.writeOptions.end) {
              return csv.writeStream.end();
            } else {
              return csv.emit("end", csv.getCount());
            }
          } else {
            return csv.emit("end", csv.getCount());
          }
        }
      };
      CSV.prototype.getCount = function() {
        return state.count - (csv.readOptions.offset != null ? csv.readOptions.offset : 0);
      };
      CSV.prototype.toStream = function(writeStream, options) {
        return console.error("toStream NOT YET IMPLEMENTED!");
      };
      CSV.prototype.transform = function(callback) {
        this.transformer = callback;
        return this;
      };
      /* END CLASS */
      return CSV;
    })();
    csv = new CSV();
    write = function(line, preserve) {
      var column, columns, containsLinebreak, containsQuote, containsdelimiter, field, i, newLine, _len, _len2, _line;
      if (typeof line === "undefined" || line === null) {
        return;
      }
      if (!preserve) {
        csv.emit("data", line, state.count);
      }
      if (typeof line === "object") {
        if (!(line instanceof Array)) {
          columns = csv.writeOptions.columns || csv.readOptions.columns;
          _line = [];
          if (columns) {
            for (i = 0, _len = columns.length; i < _len; i++) {
              column = columns[i];
              _line[i] = (typeof line[column] === "undefined" || line[column] === null ? "" : line[column]);
            }
          } else {
            for (column in line) {
              _line.push(line[column]);
            }
          }
          line = _line;
          _line = null;
        }
        if (line instanceof Array) {
          newLine = (state.countWriten ? csv.writeOptions.lineBreaks || "\r" : "");
          for (i = 0, _len2 = line.length; i < _len2; i++) {
            field = line[i];
            if (typeof field === "string") {} else if (typeof field === "number") {
              field = "" + field;
            } else {
              if (field instanceof Date) {
                field = "" + field.getTime();
              }
            }
            if (field) {
              containsdelimiter = field.indexOf(csv.writeOptions.delimiter || csv.readOptions.delimiter) >= 0;
              containsQuote = field.indexOf(csv.writeOptions.quote || csv.readOptions.quote) >= 0;
              containsLinebreak = field.indexOf("\r") >= 0 || field.indexOf("\n") >= 0;
              if (containsQuote) {
                field = field.replace(new RegExp(csv.writeOptions.quote || csv.readOptions.quote, "g"), (csv.writeOptions.escape || csv.readOptions.escape) + (csv.writeOptions.quote || csv.readOptions.quote));
              }
              if (containsQuote || containsdelimiter || containsLinebreak) {
                field = (csv.writeOptions.quote || csv.readOptions.quote) + field + (csv.writeOptions.quote || csv.readOptions.quote);
              }
              newLine += field;
            }
            if (i !== line.length - 1) {
              newLine += csv.writeOptions.delimiter || csv.readOptions.delimiter;
            }
          }
          line = newLine;
        }
      }
      if (!preserve) {
        return state.countWriten++;
      }
    };
    parse = function(chars) {
      var c, i, isEscape, nextChar, _len, _results;
      state = initial_state();
      chars = '' + chars;
      _results = [];
      for (i = 0, _len = chars.length; i < _len; i++) {
        c = chars[i];
        if (!state.commented) {
          state.commented = c === '#';
        }
        switch (c) {
          case csv.readOptions.escape:
          case csv.readOptions.quote:
            if (state.commented) {
              break;
            }
            isEscape = false;
            if (c === csv.readOptions.escape) {
              nextChar = chars.charAt(i + 1);
              if (!((csv.readOptions.escape !== csv.readOptions.quote && !state.field && !state.quoted) && (csv.readOptions.escape === nextChar || nextChar === csv.readOptions.quoted))) {
                i++;
                isEscape = true;
                c = chars.charAt(i);
                state.field += c;
              }
            }
            if (!isEscape && (c === csv.readOptions.quote)) {
              if (state.field && !state.quoted) {
                state.field += c;
                break;
              }
              if (state.quoted) {
                nextChar = chars.charAt(i + 1);
                if (nextChar && nextChar !== "\r" && nextChar !== "\n" && nextChar !== csv.readOptions.delimiter) {
                  console.error("Invalid closing quote; found \"" + nextChar + "\" instead of delimiter \"" + csv.readOptions.delimiter + "\"");
                }
                state.quoted = false;
              } else {
                if (state.field === "") {
                  state.quoted = true;
                }
              }
            }
            break;
          case csv.readOptions.delimiter:
            if (state.commented) {
              break;
            }
            if (state.quoted) {
              state.field += c;
            } else {
              if (csv.readOptions.trim || csv.readOptions.rtrim) {
                state.field = state.field.trimRight();
              }
              state.line.push(state.field);
              state.field = '';
            }
            break;
          case '\n':
          case '\r':
            if (c === '\n') {
              if (state.quoted) {
                state.field += c;
                break;
              }
              if (!csv.readOptions.quoted && state.lastC === '\r') {
                break;
              }
            }
            if (c === '\r' || chars.charAt(i + 1 !== '\r')) {
              if (state.quoted) {
                state.field += c;
                break;
              }
              if (csv.writeOptions.lineBreaks == null) {
                csv.writeOptions.lineBreaks = c + (c === "\r" && chars.charAt(i + 1) === "\n" ? "\n" : "");
              }
              if (csv.readOptions.trim || csv.readOptions.rtrim) {
                state.field = state.field.trimRight();
              }
              state.line.push(state.field);
              state.field = '';
              flush();
            }
            break;
          case ' ':
            if (state.commented) {
              break;
            }
            if (state.quoted || (!csv.readOptions.trim && !csv.readOptions.ltrim) || state.field) {
              state.field += c;
            }
            break;
          default:
            if (state.commented) {
              break;
            }
            state.field += c;
        }
        csv.emit("pct", i / (chars.length - 1));
        _results.push(state.lastC = c);
      }
      return _results;
    };
    flush = function() {
      var column, empty_line, i, line, _len, _ref, _ref2;
      empty_line = state.line.join("").trim() === "";
      if (csv.readOptions.offset > state.count || state.commented || empty_line) {
        if (!(state.commented || empty_line)) {
          state.count++;
        }
        state.line = [];
        state.lastC = "";
        state.commented = false;
        return;
      }
      if (csv.readOptions.columns) {
        if (state.count === 0 && csv.readOptions.columns === true) {
          csv.readOptions.columns = state.line;
          state.line = [];
          state.lastC = "";
          return;
        }
      }
      if (csv.transformer && csv.readOptions.transformBefore) {
        transforming = true;
        state.line = csv.transformer(state.line, state.count);
        transforming = false;
      }
      if (csv.readOptions.columns) {
        line = {};
        _ref = csv.readOptions.columns;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          column = _ref[i];
          line[column] = (_ref2 = state.line[i]) != null ? _ref2 : null;
        }
        state.line = line;
        line = null;
      }
      if (csv.transformer && !csv.readOptions.transformBefore) {
        transforming = true;
        state.line = csv.transformer(state.line, state.count);
        transforming = false;
      }
      write(state.line);
      csv.emit("progress", state.line, csv.getCount());
      state.count++;
      state.line = [];
      state.lastC = "";
      return state.commented = false;
    };
    return csv;
  };
}).call(this);
