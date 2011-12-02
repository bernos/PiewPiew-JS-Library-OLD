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
    
      // PUBLIC METHODS //////////////////////////////////////////////////////////
      
      handleChanges: function(changes){
        this.trigger(exports.Model.events.CHANGE, changes);
        return this;
      }

      // PRIVATE METHODS /////////////////////////////////////////////////////////
    
    });

    exports.Model.events = {
      CHANGE: "piewpiew.data.Model.events.CHANGE", 
    };

    exports.BuildModel = function(model) {
      return base.Base.extend({
        initialize: function(spec) {
          for (var name in model) {
            this[name] = model[name]();

            if (spec[name]) {
              this[name].value = spec[name];
              delete spec[name];
            }
          }  


        }
      });
    };

    exports.CharField = function(opts) {
      return function() {
        return {
          value:null,
          maxLength:opts.maxLength
        }
      }
    };
  };

  global.piewpiew.define(moduleId, requires, module);
  
})(typeof window === 'undefined' ? this : window);

