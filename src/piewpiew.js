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
   * Creates a View instance
   * 
   * @param {Object} spec
   *  An object containing attributes and functions to extend the View instance
   *  that will be created
   * @return {PiewPiew.View}
   *  A View object
   */
  var View = function(spec) {
    /**
     * Default View parameters
     */
    var defaults = {
           id: "View" + (idSequence++),
      tagname: "div"
    };
    
    /**
     * Extend the base View object with the defaults and spec if provided, then
     * return it.
     */
    return extend({
      /**
       * Internal initialiser. This gets called when the View is first created
       * We are mainly concerned with setting up an required params that have
       * not been defined in the default or spec objects, calling our 
       * overridable init() function, and returning a reference to ourself
       */
      __init__: function() {
        
        if (!this.el) {
          this.el = document.createElement(this.tagname);
          this.el.setAttribute("id", this.id);
        }
        
        return this;
      },
      
      /**
       * Initialise the View. Extended Views should provide their own 
       * implementation. It is a good idea to return a reference to ourself here
       * to allow for method chaining.
       */
      init: function() {
        return this;
      },
      
      /**
       * Render the view. Generally this will involve setting the innerHTML of
       * our el. Again, it's handy to return a reference to this.
       */
      render: function() {
        return this;  
      }
      
    }, defaults, spec || {}).__init__();
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
    type:"MyViewClass",
    
    render: function() {
      this.el.innerHTML = "HELLO WORLD";
      return this;
    }
  }, spec));

  return view;
}

var MyViewSubClass = function(spec) {
  var view = MyViewClass(PiewPiew.extend({
    subProp:"awesome"
  }, spec));

  return view;
}