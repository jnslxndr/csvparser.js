(function() {
  (function(exports) {
    var EventEmitter, isArray;
    if (typeof Array.isArray !== "function") {
      Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
    }
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function(item) {
        var i, length;
        i = 0;
        length = this.length;
        while (i < length) {
          if (this[i] === item) {
            return i;
          }
          i++;
        }
        return -1;
      };
    }
    exports.EventEmitter = (function() {
      function EventEmitter() {}
      return EventEmitter;
    })();
    EventEmitter = exports.EventEmitter;
    isArray = Array.isArray;
    EventEmitter.prototype.emit = function(type) {
      var args, handler, i, l, listeners;
      if (type === "error") {
        if (!this._events || !this._events.error || (isArray(this._events.error) && !this._events.error.length)) {
          if (arguments[1] instanceof Error) {
            throw arguments[1];
          } else {
            throw new Error("Uncaught, unspecified 'error' event.");
          }
          return false;
        }
      }
      if (!this._events) {
        return false;
      }
      handler = this._events[type];
      if (!handler) {
        return false;
      }
      if (typeof handler === "function") {
        switch (arguments.length) {
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
        return true;
      } else if (isArray(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        i = 0;
        l = listeners.length;
        while (i < l) {
          listeners[i].apply(this, args);
          i++;
        }
        return true;
      } else {
        return false;
      }
    };
    EventEmitter.prototype.addListener = function(type, listener) {
      if ("function" !== typeof listener) {
        throw new Error("addListener only takes instances of Function");
      }
      if (!this._events) {
        this._events = {};
      }
      this.emit("newListener", type, listener);
      if (!this._events[type]) {
        this._events[type] = listener;
      } else if (isArray(this._events[type])) {
        this._events[type].push(listener);
      } else {
        this._events[type] = [this._events[type], listener];
      }
      return this;
    };
    EventEmitter.prototype.on_ = EventEmitter.prototype.addListener;
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.once = function(type, listener) {
      var g, self;
      self = this;
      return self.on_(type, g = function() {
        self.removeListener(type, g);
        return listener.apply(this, arguments);
      });
    };
    EventEmitter.prototype.removeListener = function(type, listener) {
      var i, list;
      if ("function" !== typeof listener) {
        throw new Error("removeListener only takes instances of Function");
      }
      if (!this._events || !this._events[type]) {
        return this;
      }
      list = this._events[type];
      if (isArray(list)) {
        i = list.indexOf(listener);
        if (i < 0) {
          return this;
        }
        list.splice(i, 1);
        if (list.length === 0) {
          delete this._events[type];
        }
      } else {
        if (this._events[type] === listener) {
          delete this._events[type];
        }
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function(type) {
      if (type && this._events && this._events[type]) {
        this._events[type] = null;
      }
      return this;
    };
    return EventEmitter.prototype.listeners = function(type) {
      if (!this._events) {
        this._events = {};
      }
      if (!this._events[type]) {
        this._events[type] = [];
      }
      if (!isArray(this._events[type])) {
        this._events[type] = [this._events[type]];
      }
      return this._events[type];
    };
  })((typeof exports === "undefined" ? window : exports));
}).call(this);
