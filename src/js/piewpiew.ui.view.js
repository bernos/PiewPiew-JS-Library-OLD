(function(PiewPiew){
  var __viewId = 0;

  PiewPiew.View = PiewPiew.Class(PiewPiew.Base, {
    
    getId: function() {
      var el = this.getEl();
      var id = el.getAttribute("id");

      // If no id was set on our element, we'll set one now. Just to make sure
      // that we actually have an id
      if (id == null) {
        el.setAttribute("id", "piewpiew-view-" + (__viewId++));
      }

      return el.getAttribute("id");
    },

    setId: function(id) {
      this.getEl().setAttribute("id", id);      
      return this;
    },

    getEl: function() {
      if (!this._el) {
        this._el = document.createElement(this.get("tagname"));
        this._el.setAttribute("id", this.getId());

        this.get("classes").unshift("piewpiew-view");
        this._el.setAttribute("class", this.get("classes").join(" "));
      }
      return this._el;
    },

    setEl: function(el) {
      if (null != el) {
        if (null != this._el) {
          throw new Error("Attempt to change the element associated with a PiewPiew.View instance.");
        } else {
          this._el = el;
        }
      }
    },

    initialize: function(spec) {
      // Some absolute defaults
      var base = {
        tagname: "div",
        classes: []
      };

      var merged = PiewPiew.extend(base, this.getDefaults(), spec || {});

      // If an element was provided, we'll explicitly set it now. This will 
      // avoid a situation where we inadvertantly create a new el via any 
      // indirect calls to getEl() before this._el has been initialised.
      if (null != merged.el) {
        this.setEl(merged.el);
        
        // Make sure that the provided el has an id, or that an id value has
        // been provided.
        if (null == merged.el.getAttribute("id")) {
          if (null == merged.id) {
            merged.el.setAttribute("id", "piewpiew-view-" + (__viewId++));
          } else {
            merged.el.setAttribute("id", merged.id);
          }
        }

        // Delete the provided el and id from the initialisation object otherwise
        // we'll end up attempting to set them again during the rest of the 
        // instance initialisation lifecycle.
        delete merged.el;
        delete merged.id;
      }

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

    handleChanges: function(changes) {
      console.log("View has changed",changes);
      this.render();
    },

    render: function() {
      console.log("Rendering ");
      this.getEl().innerHTML = "HELLO";
    }
  });
})(PiewPiew);