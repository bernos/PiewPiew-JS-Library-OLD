/**
 * General utilities used by the quiz
 */
var PMQuizUtils = (function() {
  return {
    
    /**
     * Mixin. Merges properties from one object into another
     * 
     * @param {Object} spec
     *	Objec containing the properties to merge  
     */
    __merge__: function(spec) {
      for(var i in spec) {
        this[i] = spec[i];
      }
      return this;
    },

    /**
	 * Creates a method delegate. Useful when binding scoped functions as callbacks
	 *
	 * @param {object} obj
	 * @param {function} method
	 */
	delegate: function(obj, method) {
	  return function() {
	    method.apply(obj, arguments);
	  };
	}
  }
}());