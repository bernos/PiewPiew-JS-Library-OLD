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
   * Internal storage for StringBundle
   */
  var _strings = {};
  
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

  /**
   * Parses a template string with the provided context. By default the PiewPiew
   * library uses the Mustache templating library. Other templating libraries 
   * can easily be supported by overriding PiewPiew.parseTemplate
   *
   * @param {string} template
   *  The template string to parse
   * @param {object} context
   *  A context object containing variables and helper functions to use when
   *  parsing the template
   * @return {string}
   *  The generated template output
   */
   var parseTemplate = function(template, context) {
     return Mustache.to_html(template, context);
   }
  
  /*****************************************************************************
   * The StringBundle is a useful place to store all strings and messages that
   * your application will use. Bundles can be stored in external .json files
   * and loaded at runtime using the StringBundle.load() function. The 
   * StringBundle can also handle multiple locales.
   *
   * StringBundle also supports template strings using the templating library
   * of your choice. By default we use the Mustache templating library, but this
   * can easily be overriden by implementing an alternative version of
   * PiewPiew.parseTemplate(template,context)
   ****************************************************************************/
  var StringBundle = (function(){
        
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
       * @param {object} context
       *  A context object containing variables to be used in cases where the
       *  requested string is a template string
       * @param {string} defaultValue
       *  Default value to be returned if no string is found
       * @return {string}
       *  Either the requested string, or the default provided
       */
      getString: function(key, context, defaultValue) {
        if (_strings[PiewPiew.locale] && _strings[PiewPiew.locale][key]) {
          return PiewPiew.parseTemplate(
            _strings[PiewPiew.locale][key], 
            context
          );
        }
        
        if (defaultValue) {
          return PiewPiew.parseTemplate(defaultValue, context);
        }
        
        return key;
      },

      /**
       * Loads a string bundle from the given URL. String bundles are simple
       * JSON
       * 
       * @param {string} url
       * @param {function} callback
       * @param {string} locale
       */
      load: function(url, callback, locale) {
        var that = this;

        $.getJSON(url, function(data) {
          console.log(data);
          that.addStrings(data, locale);
          if (callback) {
            callback();
          }
        });
      }
    }
  }());
  
  /*****************************************************************************
   * Creates a context object ready for rendering. TemplateContexts provide data
   * and helper functions to templates. New helper functions can be added by
   * calling PiewPiew.TemplateContext.addHelpers()
   *
   * @constructor
   ****************************************************************************/
  var TemplateContext = (function() {
    var helpers = {
      /**
       * Helper function for retrieving strings from the string bundle
       */
      s:function() {
        return function(key, render) {
          if (_strings[PiewPiew.locale] && _strings[PiewPiew.locale][key]) {
            return render(_strings[PiewPiew.locale][key]);
          }
          
          return key;
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
     * Tracks whether we've loaded an external template for the view
     */
    var _templateLoaded = false;

    /**
     * Default View parameters
     */
    var defaults = {
      id:       "View" + (idSequence++),
      tagname:  "div",
      template: "",
      classes:  [],
      events:   {}
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
            view.events[selector][eventName] = PiewPiew.createDelegate(
              view, 
              view[handler]
            );
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
        if (this.templateUrl && !_templateLoaded) {
          this.loadExternalTemplate(this.templateUrl);
        } else {
          this.el.innerHTML = PiewPiew.parseTemplate(
            this.template, 
            PiewPiew.TemplateContext(this.getTemplateContext())
          );
        }

        if (typeof this.template == "string") {
          this.el.innerHTML = PiewPiew.parseTemplate(
            this.template, 
            PiewPiew.TemplateContext(this.getTemplateContext())
          );
        } else if (typeof this.template == "function") {
          this.template();
        }        

        return this;  
      },

      /**
       * Return a context object to be rendered by our template. This function
       * should be overridden when creating custom views. The object returned
       * here will be merged with any registered helpers via a call to 
       * PiewPiew.TemplateContext()
       *
       * @return {object}
       */
      getTemplateContext: function() {
        return {};
      },

      loadExternalTemplate: function(url) {
        var that = this;

        $.ajax(url, {
          dataType:'html',
          error:function(jqXHR, textStatus, errorThrown) {
            _templateLoaded = true;
          },
          success: function(data) {
            _templateLoaded = true;
            that.template = data;
            that.render();    
          }
        });        
      }
      
    }, defaults, spec || {}));
  };

  /**
   * Return the PiewPiew module
   */
  return {
    extend:           extend,
    createDelegate:   createDelegate,
    locale:           _defaultLocale,
    parseTemplate:    parseTemplate,
    StringBundle:     StringBundle,
    TemplateContext:  TemplateContext,
    View:             View
  };
}());



var ExampleView = function(spec) {
  var _count = 0;

  return PiewPiew.View(PiewPiew.extend({
   
    templateUrl: 'ExampleView.html',

    events: {
      '#increment':{
        click:'increment'
      },
      '#decrement':{
        click:'decrement'
      }
    },

    increment: function(e) {
      _count++;
      this.render();
      e.preventDefault();
    },

    decrement: function(e) {
      _count--;
      this.render();
      e.preventDefault();
    },

    getTemplateContext: function() {
      return {
        count:_count
      }
    }

  }), spec);
}

// Test out the StringBundle

PiewPiew.StringBundle.addStrings({
  "mysample.title": "This is the title - {{name}}",
  "mysample.body":  "This is the <strong>body</strong> here"
});

console.log(Mustache.to_html("Here is a {{#s}}mysample.title{{/s}}", PiewPiew.TemplateContext({name:"Tony"})));