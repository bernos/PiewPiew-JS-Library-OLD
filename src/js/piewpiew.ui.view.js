(function(PiewPiew){
  var __viewId = 0;

  PiewPiew.UI = PiewPiew.UI || {};

  PiewPiew.UI.View = PiewPiew.Class(PiewPiew.Base, {
    /**
     * Get the css classes for the view
     *
     * @return {array}
     */
    getClasses: function() {
      var a = this.getEl().getAttribute("class");
      console.log(a);
      if (typeof a == "string") {
        return a.split(" ");
      }

      return [];
    },

    /**
     * Set the css classes for the view
     *
     * @param {array} classes
     * @return {PiewPiew.View}
     */
    setClasses: function(classes){
      this.getEl().setAttribute("class", classes.join(" "));
      return this;
    },

    /**
     * Gets the root DOM element of the view
     *
     * @return {DOMElement}
     */
    getEl: function() {
      return this._el;
    },

    /**
     * Gets the id of the view
     *
     * @return {string}
     */
    getId: function() {
      return this.getEl().getAttribute("id");
    },

    /**
     * Sets the id of the view
     *
     * @param {string} id
     * @return {PiewPiew.View}
     */
    setId: function(id) {
      this.getEl().setAttribute("id", id);      
      return this;
    },

    /**
     * Gets the tag name of the DOM element of the view
     *
     * @return {string}
     */
    getTagname: function() {
      return this._el.nodeName.toLowerCase();
    },

    /**
     * Initialise the View instance
     *
     * @param {object} spec
     * @return {PiewPiew.View}
     */
    initialize: function(spec) {
      // Some absolute defaults. Some defaults such as handlers and classes may
      // come from properties set on the actual class prototype itself.
      var base = {
        tagname:  "div",
        classes:  this.classes || [],
        handlers: this.handlers || []
      };

      var merged = PiewPiew.extend(base, this.getDefaults(), spec || {});

      // Set up the DOM element for the view as early as possible...
      if (null == merged.el) {
        merged.el = document.createElement(merged.tagname);
      }

      this._el = merged.el;

      // Make sure that the el has an id, or that an id value has been provided.
      if (null == this._el.getAttribute("id")) {
        if (null == merged.id) {
          this._el.setAttribute("id", "piewpiew-view-" + (__viewId++));
        } else {
          this._el.setAttribute("id", merged.id);
        }
      }

      // Merge any classes that may already be set on the el with classes from
      // the spec
      var current = this.getClasses();
      this.setClasses(current.concat(merged.classes));

      // Delete the provided el and id from the initialisation object otherwise
      // we'll end up attempting to set them again during the rest of the 
      // instance initialisation lifecycle.
      delete merged.el;
      delete merged.id;
      delete merged.tagname;
      delete merged.classes;

      PiewPiew.Base.prototype.initialize.apply(this, [merged]);   
    },

    /**
     * Returns sensible defaults for all view properties. Classes that extend 
     * PiewPiew.View should override this implementation and return their own 
     * defaults
     *
     * @return {Object}
     */
    getDefaults: function(){
      return {};
    },

    /**
     * Change handler. This is fired each time one of our view properties 
     * changes. By default we simply re-render the view to ensure that the 
     * display stays in sync with the view state.
     *
     * @param {Object} changes
     *  Object containing key-value pairs of all the changed params
     */
    handleChanges: function(changes) {
      this.render();
    },

    /**
     * Renders the view. Custom view types should override this method
     */
    render: function() {
      this.getEl().innerHTML = PiewPiew.printf(
        "<div><strong>id:</strong> ${id}</div>",
        {id:this.getId()}
      );
    },
    
    _initializeEl: function() {
      
    },
    
    setHandlers: function(handlers) {
      console.log("setHandlers",handlers);
      var delegates = {};
      var el        = $(this.getEl());

      var createDelegate = function(e,o,h) {
        return function() {
          if (typeof o[h] == 'function') {
            o[h].apply(o, arguments);
          } else {
            throw new Error("Handler '"+h+"' for event '"+e+"' does not exist in view "+o.getId());
          }
        }
      }

      for (var i in handlers) {
        var t = i.split(" "),
            e = t.shift(),
            s = t.join(" "),
            h = handlers[i];

        delegates[s] = delegates[s] || {};

        if (typeof h == 'string') {         
          delegates[s][e] = createDelegate(e,this,h);
        } else if (typeof h == 'function') {
          delegates[s][e] = h;
        } else {
          throw new Error("Handler for event '"+e+"' must be a string or a function.");
        }
      }

      for (var s in delegates) {
        console.log(s);
        el.delegate(s, delegates[s]);
      }

      this._handlers = handlers;
    },
    
    getHandlers: function() {
      return this._handlers || {};
    }   
  });

  /**
   * Only used by unit tests. Resets the internal view id counter
   */
  PiewPiew.UI.View.resetId = function() {
    __viewId = 0;
  }
})(PiewPiew);