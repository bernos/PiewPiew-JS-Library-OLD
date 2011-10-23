(function(global){
  
  var moduleId = "piewpiew.ui.TemplateContext"
  var requires = ["exports", "piewpiew", "piewpiew.StringBundle"];

  var module = function(exports, piewpiew, stringBundle) {
    
    // LOCAL VARS ////////////////////////////////////////////////////////////////

    var helpers = {
      stringBundle:function() {
        return function(key, render) {
          return render(stringBundle.getRawString(key));
        }
      }
    };

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    exports.TemplateContext = piewpiew.Class({
      initialize: function(spec) {
        piewpiew.extend(this, helpers, spec || {});
      }
    });

    exports.TemplateContext.addHelpers = function(newHelpers) {
      piewpiew
    }
  };

  global.piewpiew.define(moduleId, requires, module);

})(typeof window === 'undefined' ? this : window);