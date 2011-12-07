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
     * PiewPiew.Base also defines the core methods that implement our property 
     * getter and setter pattern. PiewPiew.Base offers a couple of ways to set 
     * object properties that will automatically trigger change events when values
     * are actually changed. The property management API consists of the following
     * methods
     *
     * get(name)
     *    This is the generic getter method. It returns the value of the property 
     *    identified by 'name'. If there is an explicit getter method 'getName()' 
     *    it will be called, otherwise the default getter will be called
     *
     * set(name, value)
     * set({name1:value1, name2:value2})
     *    This is the generic setter method. It allows you to set one or more 
     *    properties at a time. If any properties have explicit setter methods
     *    'setName(value)' they will be called. When a call to this method results
     *    in a property changing, the changed objects 'handleChanges()' method
     *    be called, and passed an object containing name/value pairs of all the
     *    changed properties.
     *
     * setProperty(name, value)
     *    This is an internal method that should be used by developers when
     *    implementing custom setter methods. It is also called by the set() 
     *    methods described above. This method ensures that the handleChanges
     *    method gets called correctly.
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
        var properties = this.getProperties();

        if (getter) {
          return getter.apply(this, [name])
        }

        var value = properties[name];

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
        var values  = {};

        if (arguments.length == 2) {
          values[arguments[0]] = arguments[1];
        } else {
          values = arguments[0];
        }

        // Set the _isChanging flag, to let handleChanges() know not to send
        // change notifications until after all properties have been updated
        this._isChanging = true;

        for (var name in values) {
          var setter = findSetter(this, name);

          if (setter) {
            setter.apply(this, [values[name]]);
          } else {
            setProperty(name, values[name]);
          }
        }

        this._isChanging = false;

        this.onChanged(changes);
    
        return this;     
      },

      /**
       * Sets the value of a named property. This is the foundational property
       * setting method. Any calls to set() end up here. Any user defined setXXX
       * methods should also call this method internally to set property values.
       * 
       * @property {String} name
       *  name of the property to set
       * @property {Object} value
       *  value of the property
       *
       * @name setProperty
       * @methodOf PiewPiew.Base#
       */ 
      setProperty: function(name, value) {
        var properties = this.getProperties();

        if (properties[name] != value) {
          properties[name] = value;
          this.onChanged({
            name: value
          });
        }
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
        // create private storage for properties and an accessor method for
        // retrieval
        var properties = {};

        this.getProperties = function() {
          return properties;
        }

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
       * Serialises the object to simple JSON object. By default we return
       * an object containing all properties return by our implicit and 
       * explicit getters. We do this be assuming that all methods begining
       * in 'get' containing more than 3 characters are explicit getters. 
       * Any value returned by an explicit getter method will override a
       * property of the same name returned by the getProperties() method. 
       * Custom/inheriting classes may need to override this method.
       *
       * @name toJSON
       * @methodOf PiewPiew.Base
       */
      toJSON: function() {
        var o = this.getProperties();

        for(var m in this) {
          if (typeof this[m] == 'function' && 
              m != 'getProperties' &&
              m.indexOf('get') == 0 && 
              m.length > 3) {

                var p = m.slice(3,4).toLowerCase() + m.slice(4);
                o[p] = this[m]();
              }
        }
        return o;
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
       * Called when properties have changed
       *
       * @param {Object} changes
       *  An object containing name-value pairs of all the changed properties
       *
       * @name onChanged
       * @methodOf PiewPiew.Base#
       */
      onChanged: function(changes){
        this._pendingChanges = this._pendingChanges || {};

        for (var n in changes) {
          this._pendingChanges[n] = changes[n];
        }

        if (!this._isChanging) {
          this.handleChanges(this._pendingChanges);
          this._pendingChanges = {};  
        }

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
      handleChanges: function(changes) {
        // default implementation does nothing
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