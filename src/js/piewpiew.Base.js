(function(global) {

  var moduleId = "piewpiew.Base";
  var requires = ["exports", "piewpiew"];

  var module   = function(exports, piewpiew) { 

    // LOCAL VARS ////////////////////////////////////////////////////////////////

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    /**
     * Helper method for determining whether an object has a dedicated getter
     * method for a named property
     *
     * @param {Object} obj
     *  The object to test
     * @param {String} prop
     *  The name of the property to test for
     * @return {Function}
     *  Either a reference to the getter method, or null if it does not exist
     */
    function findGetter(obj, prop) {
      var getter = "get" + prop.slice(0,1).toUpperCase() + prop.slice(1);

      if (typeof obj[getter] === "function") {
        return obj[getter];
      }

      return null;
    }

    /**
     * Helper method for determining whether an object has a dedicated setter
     * method for a named property
     *
     * @param {Object} obj
     *  The object to test
     * @param {String} prop
     *  The name of the property to test for
     * @return {Function}
     *  Either a reference to the setter method, or null if it does not exist
     */
    function findSetter(obj, prop) {
      var setter = "set" + prop.slice(0,1).toUpperCase() + prop.slice(1);

      if (typeof obj[setter] === "function") {
        return obj[setter];
      }

      return null;
    }

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    /**
     * This is the "base" class for the PiewPiew library. All classes in the 
     * library extend from this base class. 
     * 
     * PiewPiew.Base is where we define the event subsystem, via the bind(), 
     * unbind() and trigger() methods. This means that all classes in the library
     * support vent binding and triggering.
     *
     * @class
     */
    exports.Base = piewpiew.Class({

      // PUBLIC PROPERTIES ///////////////////////////////////////////////////////

      // GETTERS AND SETTERS /////////////////////////////////////////////////////

      /**
       * Gets the value of a particular property. If the class instance has a
       * dedicated "getter" method, it will be called. 
       *
       * @param {String} name
       *  The name of the property to get
       * @param {Object} default
       *  The default value to be returned if the requested property is not set
       * @return {Object}
       *  Either the value of the requested property, or the default.
       *
       * @name get
       * @methodOf PiewPiew.Base#
       */
      get: function(name, defaultValue) {
        var getter = findGetter(this, name);

        if (getter) {
          return getter.apply(this, [name])
        }

        var value = this._properties[name];

        return (null !== value) ? value : defaultValue;
      },

      /**
       * Sets one or more properties of a class instance. This is a convenience
       * interface that enables bulk setting of properties in a single call.
       * This method will make sure that any dedicated "setter" methods get
       * called when setting properties.
       *
       * Accepts either an object containing name/values to set, or the name
       * and value of a single property.
       *
       * <code>
       * myObject.set("name", "John");
       * myObject.set({
       *   age: 24,
       *   height: 180
       * });
       * </code>
       *
       * @name set
       * @methodOf PiewPiew.Base#
       */
      set: function() {
        var values  = {}, 
            changed = false, 
            changes = {};

        this._properties = this._properties || {};

        if (arguments.length == 2) {
          values[arguments[0]] = arguments[1];
        } else {
          values = arguments[0];
        }

        for (var name in values) {
          var setter = findSetter(this, name);

          if (setter) {
            setter.apply(this, [values[name]]);
          } else if (this._properties[name] !== values[name]) {
            this._properties[name] = values[name];
            changed = true;
            changes[name] = values[name];
          }
        }

        if (changed) {
          this.handleChanges(changes);
        }

        return this;     
      },

      // PUBLIC METHODS //////////////////////////////////////////////////////////
      
      /**
       * Initializes a PiewPiew.Base class instance. This function is called 
       * automatically during during construction of new instances. User classes
       * which override this function should call this implementation by calling 
       * <code>PiewPiew.Base.initialize.apply(this, arguments);</code>
       *
       * @param {Object} spec
       *  An object containing a set of initial values for the class instance
       *  properties. If the class instance has "setter" methods for any of these
       *  properties, they will be called. In the example below, the setModel() 
       *  method of the Car class would be called during initialisation of the 
       *  sportsCar Car instance.
       *
       *  <code>
       *  var Car = PiewPiew.Class(PiewPiew.Base, {
       *    setModel: function(model) {
       *      this._model = model;
       *      this.doOtherStuff();
       *    }
       *  });
       *
       *  var sportsCar = new Car({
       *    model: "Ferrari"
       *  });
       *  </code>
       *
       *  Any properties for which there is no "setter" method will be ignored.
       *
       * @name initialize
       * @methodOf PiewPiew.Base#
       */
      initialize: function(spec) {
        this._handlers = {};

        this.initializeWithSpec(spec || {});
      },   

      /**
       * Called during initialization, this is a good place for inheritting
       * classes to parse the spec object and handle any special cases or 
       * properties that need specialised initializing. For example we might
       * want to copy a property from the spec to a local instance property,
       * rather than letting it go through to the default set() method
       *
       * @param {Object} spec
       *
       * @name initializeWithSpec
       * @methodOf PiewPiew.Base#
       */
      initializeWithSpec: function(spec) {
        // base implementation does nothing
      },

      /**
       * Binds an event handler
       *
       * @param {String} ev
       *  Name of the event
       * @param {Function} handler
       *  Reference to the handler function
       * @return {PiewPiew.Base}
       *  A reference to the instance, useful for method chaining
       *
       * @name bind
       * @methodOf PiewPiew.Base#
       */
      bind: function(ev, handler) {
        var l = this._handlers[ev] || (this._handlers[ev] = []);
        l.push(handler);
        return this;
      },    

      /**
       * Handles property changes.
       *
       * @param {Object} changes
       *  An object containing name-value pairs of all the changed properties
       *
       * @name handleChanges
       * @methodOf PiewPiew.Base#
       */
      handleChanges: function(changes){
        // Base implementation does nothing. Inheriting classes could trigger change events
        // and so forth.
        return this;
      },

      /**
       * Triggers and event to be dispatched. Any number of parameters can
       * follow the ev param and they will be sent as arguments to the event
       * handlers.
       *
       * @param {String} ev
       *  Then name of the event to dispatch
       *
       * @name trigger
       * @methodOf PiewPiew.Base#
       */
      trigger: function(ev) {
        var l;
        if (l = this._handlers[ev]) {
          for (var i = 0, m = l.length; i < m; i++) {
            l[i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
        return this;
      },
      
      /**
       * Unbinds an event handler
       *
       * @param {String} ev
       *  Then name of the event
       * @param {Function} handler
       *  The handler to unbind
       * @return {PiewPiew.Base}
       *  A reference to the instance, useful for method chaining
       *
       * @name unbind
       * @methodOf PiewPiew.Base#
       */
      unbind: function(ev, handler) {
        if(!ev) {
          this._handlers = {};
        } else if (!handler) {
          this._handlers[ev] = [];
        } else if (this._handlers[ev]) {
          var l = this._handlers[ev];
          for (var i = l.length - 1; i > -1; i--) {
            if (l[i] === handler) {
              l.splice(i,1);
              return this;
            }
          }
        }                 
        return this;
      }

      // PRIVATE METHODS /////////////////////////////////////////////////////////
      
    });
  };

  global.piewpiew.define(moduleId, requires, module);

})(typeof window === 'undefined' ? this : window);