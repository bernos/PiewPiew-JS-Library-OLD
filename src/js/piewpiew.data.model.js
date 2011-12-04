(function(global){

  var moduleId = "piewpiew.data.Model";
  var requires = ["exports", "piewpiew", "piewpiew.Base"];

  var module = function(exports, piewpiew, base) {
    // LOCAL VARS ////////////////////////////////////////////////////////////////

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    exports.Model = base.Base.extend({
    
      // PUBLIC PROPERTIES ///////////////////////////////////////////////////////
    
      // GETTERS AND SETTERS /////////////////////////////////////////////////////
      set: function() {
        // TODO: could be called with name, value args, or with an object containing
        // many name, value args. In any case, consult this.fields for a field with
        // the same name as the param we are about to set. If a field exists, ask
        // it to validate the new value before setting it.
      },

      get: function(name) {
        
      },
    
      // PUBLIC METHODS //////////////////////////////////////////////////////////
      initializeWithSpec: function(spec) {
        for (var name in spec) {
          if (this.fields[name]) {
            this.set(name, spec[name]);
          }
        }
      },      

      handleChanges: function(changes){
        this.trigger(exports.Model.events.CHANGE, changes);
        return this;
      }

      // PRIVATE METHODS /////////////////////////////////////////////////////////
    
    });

    /**
     * Override the default extension method for building new model classes. We
     * do this simply to keep the model creation syntax clean, rather than having
     * to remember to assign all our field definitions to the "fields" property
     * of the new model class prototype.
     */
    exports.Model.extend = function(model) {
      return piewpiew.Class(this, {fields:model, modelName:"Fish"});
    }

    exports.Model.events = {
      CHANGE: "piewpiew.data.Model.events.CHANGE", 
    };


    exports.CharField = piewpiew.Class({
    
      initialize: function(spec) {
        for (var name in spec) {
          this[name] = spec[name];
        }
      },

      validate: function(value) {
        console.log("validating " + value);
        if (null != this.maxLength) {
          return value.length <= this.maxLength;
        }
        return true;
      }
    });

  };

  global.piewpiew.define(moduleId, requires, module);
  
})(typeof window === 'undefined' ? this : window);

