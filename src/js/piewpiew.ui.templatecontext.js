(function(PiewPiew){

  // LOCAL VARS ////////////////////////////////////////////////////////////////

  var helpers = {
    stringBundle:function() {
      return function(key, render) {
        return render(PiewPiew.StringBundle.getRawString(key));
      }
    }
  };

  // HELPER FUNCTIONS //////////////////////////////////////////////////////////

  // MODULE DEFS ///////////////////////////////////////////////////////////////

  PiewPiew.UI = PiewPiew.UI || {};

  // CLASS DEFS ////////////////////////////////////////////////////////////////

  PiewPiew.UI.TemplateContext = PiewPiew.Class({
    initialize: function(spec) {
      PiewPiew.extend(this, helpers, spec || {});
    }
  });

  PiewPiew.UI.TemplateContext.addHelpers = function(newHelpers) {
    PiewPiew
  }
})(PiewPiew);