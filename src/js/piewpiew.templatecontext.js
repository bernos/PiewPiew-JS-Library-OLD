(function(PiewPiew){
  var helpers = {
    /**
     * Helper function for retrieving strings from the string bundle
     */
    s:function() {
      return function(key, render) {
        return render(PiewPiew.StringBundle.getRawString(key));
      }
    }
  };

  PiewPiew.TemplateContext = PiewPiew.Class({
    initialize: function(spec) {
      PiewPiew.extend(this, helpers, spec);
    }
  });

  PiewPiew.TemplateContext.addHelpers = function(newHelpers) {
    PiewPiew.extend(helpers, newHelpers);
  }
})(PiewPiew);