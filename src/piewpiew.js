var PiewPiew = (function() {
  
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
  var __extend__ = function(base, extension) {
    for(var i in extension) {
      base[i] = extension[i];
    }
    return base;
  }


  var View = function(spec) {

    return {
      __init__: function(spec) {
        __extend__(this, spec);
        return this;
      }
      
    }.__init__(spec);
  };

  return {
    extend: __extend__,
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