/*****************************************************************************
   * Creates a "Watchable" object that can be mixed into any other object using
   * the PiewPiew.extend() method. Watchable object provide access to internal
   * attributes via get() and set() methods. The changeEvent param can be used 
   * to determine the type of event that should be triggered when a call to the 
   * set() method results in an attribute change
   ****************************************************************************/
(function(PiewPiew){
  PiewPiew.PropertyManager = PiewPiew.Class(PiewPiew.EventDispatcher, {
    
    /**
     * Object constructor/initializer.
     *
     * @param {String} changeEvent
     *  The event that will be dispatched when a managed property changes
     */
    initialize: function(changeEvent) {
      PiewPiew.EventDispatcher.prototype.initialize.apply(this);
      
      this._attributes = {};

      if (null == changeEvent) {
        changeEvent = PiewPiew.PropertyManager.events.CHANGE;
      }

      this.changeEvent = changeEvent;
    },

    /**
     * Return a JSON compatible representation of our object
     *
     * @return {object}
     */
    serialize: function() {
      var s = {};
      for (var n in this._attributes) {
        s[n] = this._attributes[n];
      }
      console.log("serialized ", s);
      return s;
    },

    /**
     * Gets an attribute value from the property manager
     *
     * @param {string} attribute
     *  The name of the attribute to retrieve
     * @param {string} defaultValue
     *  The default value to return if none has been set
     * @return {object}
     */
    get: function(attribute, defaultValue) {
      console.log("get ", attribute, this._attributes);
      var value = this._attributes[attribute];
      return (null != value) ? value : defaultValue;
    },

    /**
     * Sets attributes.
     *
     * @param {object} map
     *  A map of attribute names and values to set
     * @return {PiewPiew.PropertyManager}
     */
    set: function(map) {
      var changes = {};
      var changed = false;
      
      for(var name in map) {
        if (this._attributes[name] !== map[name]) {
          changed                 = true;
          this._attributes[name]  = map[name];
          changes[name]           = this._attributes[name];
        }
      }

      if (changed) {
        console.log("changed",this.changeEvent,changes);
        this.trigger(this.changeEvent, this, changes);
      }

      return this;
    }
  });

  PiewPiew.PropertyManager.events = {
    CHANGE: "PiewPiew.PropertyManager.events.CHANGE"
  }
})(PiewPiew);