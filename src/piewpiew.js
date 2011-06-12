/**
 * The PiewPiew module
 */
var PiewPiew = (function() {
  
  /**
   * Internal sequence used for default ID property values
   */
  var idSequence = 1;
  
  /**
   * Default value to use for locale if one is not provided
   */
  var _defaultLocale = 'defaultLocale';
  
  /**
   * Extends one object by adding properties from another object
   * 
   * @alias PiewPiew.extend
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
  };
  
  /**
   * Creates a method delegate. Enables us to specify the scope a function 
   * should be run in when assigning and binding handlers.
   * 
   * @alias PiewPiew.createDelegate
   * @param {object} obj
   * @param {function} method
   */
  var createDelegate = function(obj, method) {
    return function() {
      method.apply(obj, arguments);
    };
  }; 
  
  var StringBundle = (function(){
    var _strings = {};
    
    return {
      /**
       * Add strings to the StringBundle
       * 
       * @param {object} strings
       *  An object containing keys/strings to add to the StringBundle
       * @return {object} 
       *  A reference to the StringBundle. Useful for method chaining.
       */
      addStrings: function(strings, locale) {
        if(!locale) {
          locale = PiewPiew.locale;
        }
        
        if(!_strings[locale]) {
          _strings[locale] = {};
        }
        
        _strings[locale] = PiewPiew.extend(_strings[locale], strings);
        
        return this;
      },
      
      /**
       * Retrieves a string from the StringBundle
       * 
       * @param {string} key
       *  Key of the string to retrieve
       * @param {string} defaultValue
       *  Default value to be returned if no string is found
       * @return {string}
       *  Either the requested string, or the default provided
       */
      getString: function(key, defaultValue) {
        if (_strings[PiewPiew.locale][key]) {
          return _strings[PiewPiew.locale][key];
        }
        
        if (defaultValue) {
          return defaultValue;
        }
        
        return key;
      }
    }
  }());
  
  /**
   * Creates a context object ready for rendering. TemplateContexts provide data
   * and helper functions to templates. New helper functions can be added by
   * calling PiewPiew.TemplateContext.addHelpers()
   */
  var TemplateContext = (function() {
    var helpers = {
      /**
       * Helper function for retrieving strings from the string bundle
       */
      s:function() {
        return function(key, render) {
/**
          var strings = PMQuizStrings;

          if (strings[key]) {
            return render(strings[key]);
          }

          return 'No copy defined for  ' + key;
          */
        }
      }
    };
    
    var templateContext = function(data) {
      return PiewPiew.extend({}, helpers, data);
    };
    
    templateContext.addHelpers = function(newHelpers) {
      PiewPiew.extend(helpers, newHelpers);
    };
    
    return templateContext;
  }());

  /**
   * Creates a View instance
   * 
   * @param {Object} spec
   *  An object containing attributes and functions to extend the View instance
   *  that will be created
   * @return {PiewPiew.View}
   *  A View object
   * @constructor
   */
  var View = function(spec) {
    /**
     * Default View parameters
     */
    var defaults = {
           id: "View" + (idSequence++),
      tagname: "div",
      classes: [],
       events: {}
    };
    
    /**
     * Internal initialiser. This gets called when the View is first created
     * We are mainly concerned with setting up any required params that have
     * not been defined in the default or spec objects, calling our 
     * overridable init() function, and returning a reference to ourself
     */
    var _initView = function(view) {
      // Set up the root DOM element for the view
      if (!view.el) {
        view.el = document.createElement(view.tagname);
        view.el.setAttribute('id', view.id);
        view.el.setAttribute('class', view.classes.join(' '));
      } 
      
      // Initialise DOM event handlers. Handlers may have been declared as 
      // either functions or strings. Strings will be interpreted the names of
      // handlers defined in the view object, and delegate functions will be
      // created to be bound to each DOM event.
      for(var selector in view.events) {
        for(var eventName in view.events[selector]) {
          var handler = view.events[selector][eventName];
          if (typeof handler == 'string' && typeof view[handler] == 'function') {
            view.events[selector][eventName] = PiewPiew.createDelegate(view, view[handler]);
          }
        }
        $(view.el).delegate(selector, view.events[selector]);    
      }
      
      view.init();
      
      return view;
    }
    
    /**
     * Extends the base View object with the defaults and spec if provided, then
     * initialises the View and returns it.
     */
    return _initView(extend({
      
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
      
    }, defaults, spec || {}));
  };

  /**
   * Return the PiewPiew module
   */
  return {
              extend: extend,
      createDelegate: createDelegate,
              locale: _defaultLocale,
        StringBundle: StringBundle,
     TemplateContext: TemplateContext,
                View: View
  };
}());



var MyViewClass = function(spec) {
  var defaults = {
    classes:['MyViewClass']
  };
  
  var view = {
    type:"MyViewClass",
    
    render: function() {
      this.el.innerHTML = "HELLO WORLD <a class='button' href='#'>click</a>";
      return this;
    },
    
    events: {
      'a.button':{
        'click': 'handleButtonClick'
      }
    },
    
    handleButtonClick: function(e) {
      console.log("click", e);
    }
  };

  return PiewPiew.View(PiewPiew.extend(view, defaults, spec));
}

var MyViewSubClass = function(spec) {
  var view = MyViewClass(PiewPiew.extend({
    subProp:"awesome"
  }, spec));

  return view;
}