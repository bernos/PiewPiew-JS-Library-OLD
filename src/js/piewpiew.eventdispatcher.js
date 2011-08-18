(function(PiewPiew) {
  PiewPiew.EventDispatcher = PiewPiew.Class({
    
    initialize: function() {
      this._handlers = {};
    },
    
    /**
     * Bind a handler to an event
     *
     * @param {String} ev
     *  Name of the event to bind to
     * @param {Function} handler
     *  The handler function
     */
    bind: function(ev, handler) {
      var l = this._handlers[ev] || (this._handlers[ev] = []);
      l.push(handler);
      return this;
    },

    /**
     * Unbinds a handler from an event
     *
     * @param {String} ev
     *  The name of the event
     * @param {Function} handler
     *  The handler to unbind
     */
    unbind: function(ev, handler) {
      if (!ev) {
        this._handlers = {};
      } else if (!handler) {
        this._handlers[ev] = [];
      } else if (this._handlers[ev]) {
        var l = this._handlers[ev];
        var m = l.length - 1;
        for (var i = m; i > -1; i--) {
          if (l[i] === handler) {
            l.splice(i,1);
            return this;
          }
        }
      }
      return this;
    },

    /**
     * Triggers an event to be dispatched. Any number of parameters can follow the
     * ev param and they will be sent as arguments to the event handlers.
     *
     * @param {String} ev
     *  The name of the event to dispatch
     */
    trigger: function(ev) {
      var l;
      console.log("trigger ", ev, this._handlers[ev]);
      if (l = this._handlers[ev]) {
        for (var i = 0, m = l.length; i < m; i++) {
          l[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      return this;
    }
  });
})(PiewPiew);