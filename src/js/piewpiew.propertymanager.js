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