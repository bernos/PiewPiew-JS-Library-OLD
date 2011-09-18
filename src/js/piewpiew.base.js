/**
 * This is the "base" class for the PiewPiew library.
 */
(function(PiewPiew) {

  PiewPiew.Base = PiewPiew.Class({
    
    /**
     * Initializes a PiewPiew.Base class instance. This function is called 
     * automatically during during construction of new instances. User classes
     * which override this function should call this implementation by calling 
     * <code>PiewPiew.Base.initialize.apply(this, arguments);</code>
     *
     * @param {Object} initialProperties
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
     */
    initialize: function(initialProperties) {
      for (var o in initialProperties) {
        var setter = "set" + o.slice(0,1).toUpperCase() + o.slice(1);
        if (typeof this[setter] === 'function') {
          this[setter](initialProperties[o]);
        }        
      }
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
     */
    set: function() {
      if (null === this._properties) {
        this._properties = {};
      }

      var values = {};

      if (arguments.length == 2) {
        values[arguments[0]] = arguments[1];
      } else {
        values = arguments[0];
      }

      for (var name in values) {
        var setter = "set" + name.slice(0,1).toUpperCase() + name.slice(1);

        if (typeof this[setter] === "function") {
          this[setter](values[name]);
        } else if (this._properties[name] !== values[name]) {
          this._properties[name] = values[name];
        }
      }

      return this;     
    },

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
     */
    get: function(name, defaultValue) {
      var getter = "get" + name.slice(0,1).toUpperCase() + name.slice(1);

      if (typeof this[getter] === "function") {
        return this[getter]();
      }

      var value = this._properties[name];

      return (null !== value) ? value : defaultValue;
    } 
  });
})(PiewPiew);

