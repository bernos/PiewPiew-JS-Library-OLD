var PiewPiew = (function() {
  
  /**
   * Internal sequence used for default ID property values
   */
  var idSequence = 1;
  
  /**
   * Extends one object by adding properties from another object
   * 
   * @param {Object} object1
   *  The object to extend
   * @param {Object} object2
   *  The extension object
   * @param {Object} objectN
   *  Another extension object
   * @return {Object}
   *  The extended object
   */
  var extend = function() {
    var base = arguments[0] || {};
    
    for (var arg = 1; arg < arguments.length; arg++) {
      for(var i in arguments[arg]) {
        base[i] = arguments[arg][i];
      }  
    }
    
    return base;
  }

  /**
   * The view object
   */
  var View = function(spec) {
    /**
     * Default View parameters
     */
    var defaults = {
      id : "View" + (idSequence++)
    };
    
    return extend({
      __init__: function() {
        return this;
      }
      
    }, defaults, spec).__init__();
  };

  /**
   * Return the PiewPiew module
   */
  return {
    extend: extend,
    View: View
  };
}());

var MyViewClass = function(spec) {
  var view = PiewPiew.View(PiewPiew.extend({
    type:"MyViewClass"
  }, spec));

  return view;
}

var MyViewSubClass = function(spec) {
  var view = MyViewClass(PiewPiew.extend({
    subProp:"awesome"
  }, spec));

  return view;
}