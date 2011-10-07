(function() {
  var defer, greet, jens, test, _csv;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  defer = function() {
    var args, func;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return setTimeout((function() {
      return func.apply(null, args);
    }), 100);
  };
  greet = function() {
    var lastname, names;
    names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (names.length > 2) {
      lastname = names.pop();
    }
    names = names.join(", ");
    if (lastname) {
      names += " and " + lastname;
    }
    return console.log("Hello " + names + "!");
  };
  jens = "Jens";
  defer(greet, jens);
  defer(greet, jens, "Tim", "Sue");
  test = 'id,lastname,firstname\n82,Preisner,Zbigniew\n94,Gainsbourg,Serge';
  _csv = csv();
  _csv.on("progress", function(progress, data) {
    return console.log("progress: ", progress, data);
  });
  _csv.on("end", function() {
    return console.log(arguments);
  });
  _csv.on("error", function() {
    return console.log("ERROR: ", arguments);
  });
  _csv.from(test);
  test = 'id;lastname;firstname\n82;Preisner;Zbigniew\n# yet another\n94;Gainsbourg;Serge';
  _csv = csv();
  _csv.on("progress", function(progress, data) {
    return console.log("progress: ", progress, data);
  });
  _csv.on("end", function() {
    return console.log(arguments);
  });
  _csv.on("error", function() {
    return console.log("ERROR: ", arguments);
  });
  _csv.transform(function(data, index) {
    (index > 0 ? "," : "") + data[0] + ":" + data[2] + " " + data[1];
    return [data[0], data[2] + " " + data[1]];
  });
  _csv.from(test, {
    delimiter: ';',
    columns: ['id', 'fullname'],
    offset: 1,
    transformBefore: true
  });
  $(function() {
    var current_result_page, result, showresult;
    result = [];
    current_result_page = 0;
    showresult = function(pagenum, size) {
      var cell, cells, data, end, start, _i, _j, _len, _len2, _ref, _results;
      if (pagenum < 0) {
        return;
      }
      if (!(result instanceof Array && result.length > 0)) {
        return;
      }
      if (0 > size) {
        size = 1;
      }
      start = pagenum * size;
      if (start > result.length) {
        start = result.length - size;
      }
      end = start + size;
      if (end > result.length) {
        end = result.length;
      }
      if (end !== result.length) {
        current_result_page = pagenum;
      }
      $('#pagenum').html("Seite " + current_result_page);
      $('#results').html("");
      _ref = result.slice(start, end);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        cells = "";
        for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
          cell = data[_j];
          cells += "<td>" + cell + "</td>";
        }
        _results.push($("<tr>" + cells + "</tr>").appendTo('#results'));
      }
      return _results;
    };
    $('#prev').click(function(event) {
      return showresult(current_result_page - 1, 100);
    });
    $('#next').click(function(event) {
      return showresult(current_result_page + 1, 100);
    });
    $('#pastehere').paster(function(data) {
      $('#results').html("");
      result = [];
      _csv = csv();
      if ($('.debug:checked').size() > 0) {
        _csv.on("progress", function(progress, data) {
          return console.log("progress: ", progress, data);
        });
      }
      _csv.on("progress", __bind(function(data, count) {
        return result.push(data);
      }, this));
      _csv.on("end", function() {
        return showresult(0, 100);
      });
      _csv.on("end", function() {
        return console.log(arguments);
      });
      _csv.on("error", function() {
        return console.log("ERROR: ", arguments);
      });
      return _csv.from(data, {
        delimiter: '\t',
        offset: 1
      });
    });
    $('#filehere').filer({
      error: function(errro) {
        return console.log("FILER error ", error);
      },
      success: __bind(function(data, name, suffix, istext) {
        $('#results').html("");
        result = [];
        _csv = csv();
        if ($('.debug:checked').size() > 0) {
          _csv.on("progress", function(progress, data) {
            return console.log("progress: ", progress, data);
          });
        }
        _csv.on("progress", __bind(function(data, count) {
          return result.push(data);
        }, this));
        _csv.on("end", function() {
          return showresult(0, 100);
        });
        _csv.on("end", function() {
          return console.log(arguments);
        });
        _csv.on("error", function() {
          return console.log("ERROR: ", arguments);
        });
        return _csv.from(data, {
          delimiter: ';'
        });
      }, this)
    });
    return $('#drophere').dropper({
      error: function(errro) {
        return console.log("FILER error ", error);
      },
      success: function(data, name, suffix, istext) {
        $('#results').html("");
        result = [];
        _csv = csv();
        if ($('.debug:checked').size() > 0) {
          _csv.on("progress", function(progress, data) {
            return console.log("progress: ", progress, data);
          });
        }
        _csv.on("progress", __bind(function(data, count) {
          return result.push(data);
        }, this));
        _csv.on("end", function() {
          return showresult(0, 100);
        });
        _csv.on("end", function() {
          return console.log(arguments);
        });
        _csv.on("error", function() {
          return console.log("ERROR: ", arguments);
        });
        return _csv.from(data, {
          delimiter: ';'
        });
      }
    });
  });
}).call(this);
