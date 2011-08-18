(function(PiewPiew) {
  
  /**
   * Helper function for creating new classes
   */
  function create() {
    var methods = null;
    
    var parent  = null;
    
    /**
     * A default constructor
     */
    var klass   = function() {
      this.$super = function(method, args) {
        return this.$parent[method].apply(this, args);
      }
      this.initialize.apply(this, arguments);
    };

    if (typeof arguments[0] === 'function') {
      parent = arguments[0];
      methods = arguments[1];
    } else {
      methods = arguments[0];
    }

    if (parent) {
      extend(klass.prototype, parent.prototype);
      klass.prototype.$parent = parent.prototype;
    }

    extend(klass.prototype, methods);
    klass.prototype.constructor = klass;

    if (!klass.prototype.initialize) {
      klass.prototype.initialize = function(){};
    } 

    return klass;
  }

  /**
   * Helper function for merging methods to prototypes
   */
  function extend(destination, source) {
    for (var p in source) {
      destination[p] = source[p];
    }
    return destination;
  }  

  PiewPiew.Class = function() {
    return create.apply(this, arguments);  
  }
})(PiewPiew);