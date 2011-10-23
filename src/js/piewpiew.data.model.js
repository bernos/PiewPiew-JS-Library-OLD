(function(PiewPiew){

  var moduleId = "piewpiew.data.Model";
  var requires = ["exports", "piewpiew", "piewpiew.Base"];

  var module = function(exports, piewpiew, base) {
    // LOCAL VARS ////////////////////////////////////////////////////////////////

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    exports.Model = piewpiew.Class(base.Base, {
    
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
    }
  };

  global.piewpiew.define(moduleId, requires, module);
  
})(typeof window === 'undefined' ? this : window);