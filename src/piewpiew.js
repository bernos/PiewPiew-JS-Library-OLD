var PiewPiew = (function() {
  
  /**
   * Internal sequence used for default ID property values
   */
  var idSequence = 1;
  
  /**
   * Extends one object by adding properties from another object
   * 
   * @param {Object} base
   *  The object to extend
   * @param {Object} extension
   *  The extension object
   * @return {Object}
   *  The extended object
   */
  var extend = function(base, extension) {
    for(var i in extension) {
      base[i] = extension[i];
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
    
    return {
      __init__: function(spec) {
        extend(this, spec);
        return this;
      }
      
    }.__init__(extend(defaults, spec));
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