(function(PiewPiew) {
  
  /**
   * Helper function for creating new classes
   */
  function create() {
    var methods = null;
    
    var parent  = null;
    
    /**
     * Default constructor for our new class. All classes created using the PiewPiew.Class() method
     * will share this constructor.
     *
     */
    var klass = function() {
      this.initialize.apply(this, arguments);
    };
    
    /**
     * If the first argument is a function, assume it is the "class" from which the new class will inherit.
     * In this case the second argument is an object containing the methods and properties for the new class.
     *
     * If the first argument is not a function, then we interpret it as an object containing the methods
     * and properties of the new class
     */
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
  };
})(PiewPiew);
