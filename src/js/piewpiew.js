/**
 * The PiewPiew module
 */
var PiewPiew = (function(module) {
  
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
   * Internal storage for cached templates
   */
  var _templateCache = {};
  
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
  var extend = function(obj) {
    var extensions = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < extensions.length; i++) {
      for (var prop in extensions[i]) {
        obj[prop] = extensions[i][prop];
      }
    }    
    return obj;
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
  };

  /*****************************************************************************
   * Creates an EventDispatcher object that can be mixed into any other object
   * using the PiewPiew.extend() method
   ****************************************************************************/
  var EventDispatcher = function() {
    var _handlers = {};
         
    return {
      bind: function(ev, handler) {
        var l = _handlers[ev] || (_handlers[ev] = []);
        l.push(handler);
        return this;
      },

      unbind: function(ev, handler) {
        if (!ev) {
          _handlers = {};
        } else if (!handler) {
          _handlers[ev] = [];
        } else if (_handlers[ev]) {
          var l = _handlers[ev];
          var m = l.length - 1;
          for (var i = m; i > -1; i--) {
            if (l[i] === handler) {
              l.splice(i,1);
              return this;
            }
          }
        }
        return this;
      },

      trigger: function(ev) {
        var l;
        if (l = _handlers[ev]) {
          for (var i = 0, m = l.length; i < m; i++) {
            l[i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
        return this;
      }
    };
  };
  
  /*****************************************************************************
   * Creates a "Watchable" object that can be mixed into any other object using
   * the PiewPiew.extend() method. Watchable object provide access to internal
   * attributes via get() and set() methods. The changeEvent param can be used to 
   * determine the type of event that should be triggered when a call to the 
   * set() method results in an attribute change
   ****************************************************************************/
  var Watchable = function(attributes, changeEvent) {
    return {
      /**
       * Gets an attribute value from the view
       *
       * @param {string} attribute
       *  The name of the attribute to retrieve
       * @param {string} defaultValue
       *  The default value to return if none has been set
       * @return {object}
       */
      get: function(attribute, defaultValue) {
        var value = attributes[attribute];
        return (null != value) ? value : defaultValue;
      },

      /**
       * Sets view attributes. The view will call its render() function if any
       * attributes change as a result of this call.
       *
       * @param {object} map
       *  A map of attribute names and values to set
       * @return {PiewPiew.View}
       */
      set: function(map) {
        var changes = {};
        var changed = false;
        
        for(var name in map) {
          if (attributes[name] !== map[name]) {
            changed           = true;
            attributes[name]  = map[name];
            changes[name]     = attributes[name];
          }
        }

        if (changed) {
          this.trigger(changeEvent, this, changes);
        }

        return this;
      }      
    }
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
  
  /*****************************************************************************
   * Creates a Model instance
   ****************************************************************************/
  var Model = function(spec) {
    var _attributes = {};

    function _initModel(model) {
      // The model may have been created with custom attributes. If this is the
      // case these attributes need to be passed to model.set()
      if (model.attributes) {
        model.set(model.attributes);
        model.attributes = null;
      }

      return model;
    }

    var model = extend({           
    }, EventDispatcher(), Watchable(_attributes, PiewPiew.Model.events.CHANGE));

    return _initModel(model);
  };

  Model.extend = function(spec) {
    return function(options) {
      return PiewPiew.Model(PiewPiew.extend({}, spec, spec.defaults || {}, options));
    }
  };

  Model.events = {
    CHANGE: "PiewPiew.model.events:CHANGE"
  };

  /*****************************************************************************
   * Creates a View instance
   * 
   * @param {Object} spec
   *  An object containing attributes and functions to extend the View instance
   *  that will be created
   * @return {PiewPiew.View}
   *  A View object
   * @constructor
   ****************************************************************************/
  var View = function(spec) {

    /**
     * Tracks whether our template is currently being loaded.
     */
    var _templateLoading = false;

    /**
     * Tracks whether we've loaded an external template for the view
     */
    var _templateLoaded = false;

    /**
     * Internal storage for our template text. This could come from parsing a 
     * DOM element, from an external file, or a literal String
     */
    var _template = null;

    /**
     * Storage for our view's attributes
     */
    var _attributes = {};
   
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
        if (view.classes.length > 0) {
          view.el.setAttribute('class', view.classes.join(' '));
        }
      } 

      // View needs to listen to itself for changes and re-render
      view.bind(PiewPiew.View.events.CHANGE, function(view, changes) {
        view.render();  
      });

      // Initialise DOM event handlers. Handlers may have been declared as 
      // either functions or strings. Strings will be interpreted the names of
      // handlers defined in the view object, and delegate functions will be
      // created to be bound to each DOM event.
      var delegates = {};

      for (var h in view.handlers) {
        var tokens    = h.split(" ");
        var eventName = tokens.shift();
        var selector  = tokens.join(" ");
        var handler   = view.handlers[h];
        
        delegates[selector] = delegates[selector] || {};

        if (typeof handler == 'string' && typeof view[handler] == 'function') {
          delegates[selector][eventName] = PiewPiew.createDelegate(
            view, 
            view[handler]
          );
        } else {
          delegates[selector][eventName] = handler;
        }
      }

      for (var selector in delegates) {
        $(view.el).delegate(selector, delegates[selector]);   
      }

      // The view may have been created with custom attributes. If this is the
      // case these attributes need to be passed to view.set()
      if (view.attributes) {
        view.set(view.attributes);
        view.attributes = null;
      }

      view.init();
      
      return view;
    }
    
    /**
     * Extends the base View object with the defaults and spec if provided, then
     * initialises the View and returns it.
     */
    return _initView(extend({
      id:               "View" + (idSequence++),
      tagname:          "div",
      template:         "",
      templateUrl:      null,
      templateSelector: null,
      classes:          [],
      handlers:         {},
            
      /**
       * Initialise the View. Extended Views should provide their own 
       * implementation. It is a good idea to return a reference to ourself here
       * to allow for method chaining.
       */
      init: function() {
        return this;
      },
      
      /**
       * Renders our template using the provided template context
       *
       * @param {PiewPiew.TemplateContext} templateContext
       * @param {function} callback
       */
      renderTemplate: function(templateContext, callback) {
        // If we have already resolved our template, then we can render and return
        // immediately
        if (_template) {
          if (callback) {
            callback(PiewPiew.parseTemplate(_template, templateContext));
          }
        } 
        // If we are using an external template, then load it now
        else if (this.templateUrl && !_templateLoaded && !_templateLoading) {
          var that = this;

          this.loadExternalTemplate(this.templateUrl, function(template) {
            if (template) {
              // Store the loaded template to speed up future calls to 
              // renderTemplate()
              _template = template;
              
              callback(PiewPiew.parseTemplate(_template, templateContext));
            } else {
              // TODO: error loading template needs handling
            }
          });
        } 
        // Maybe we are using a template from the DOM
        else if (this.templateSelector) {
          _template = $(this.templateSelector).html();

          if (callback) {
            callback(PiewPiew.parseTemplate(_template, templateContext));
          }
        }
        // Maybe our template is a string literal ...
        else if (typeof this.template == "string") {
          _template = this.template;

          if (callback) {
            callback(PiewPiew.parseTemplate(_template, templateContext));
          }
        } 
        // Finally it could be a function. We wont cache the return value of the
        // function in _template in this case, as the function may be designed to
        // return different values on subsequent executions
        else if (typeof this.template == "function") {
          if (callback) {
            callback(PiewPiew.parseTemplate(this.template(), templateContext));
          }
        }        
      },

      render: function() {
        var that = this;

        this.renderTemplate(
          PiewPiew.TemplateContext(this.serialize()), 
          function(content) {
            $(that.el).html(content);    
          }
        );

        return this;
      },

      /**
       * Return a JSON compatible representation of our object
       *
       * @return {object}
       */
      serialize: function() {
        return _attributes;
      },

      /**
       * Asynchronously loads a template from an external URL
       *
       * @param {string} url
       * @param {function} callback
       */
      loadExternalTemplate: function(url, callback) {
        // See if we already have a cached copy of the template
        if (_templateCache[url]) {
          _templateLoaded  = true;
          _templateLoading = false;
          if (callback) {
            callback(_templateCache[url]);
          }
        } else {

          var that = this;

          $.ajax(url, {
            dataType:'html',
            error:function(jqXHR, textStatus, errorThrown) {
              _templateLoaded   = true;
              _templateLoading  = false;
              
              if (callback) {
                callback(null);
              }
            },
            success: function(data) {
              _templateLoaded   = true;
              _templateLoading  = false;
              _templateCache[url] = data;

              if (callback) {
                callback(data);
              }
            }
          });        
        }
      }
      
    }, EventDispatcher(), Watchable(_attributes, PiewPiew.View.events.CHANGE), spec || {}));
  };

  View.extend = function(spec) {
    return function(options) {
      return PiewPiew.View(PiewPiew.extend({}, spec, options));
    }
  };

  View.events = {
    CHANGE : "PiewPiew.View:change"
  }

  /**
   * Return the PiewPiew module
   */
  return extend(module, {
    extend:           extend,
    createDelegate:   createDelegate,
    locale:           _defaultLocale,
    parseTemplate:    parseTemplate,
    EventDispatcher:  EventDispatcher, 
    Model:            Model,
    StringBundle:     StringBundle,
    TemplateContext:  TemplateContext,
    View:             View
  });
}(PiewPiew || {}));















var ExampleView = PiewPiew.View.extend(
{
    template: '#ExampleViewTemplate',

    attributes: {
      count: 0  
    },

    handlers: {
      "click button.increment" : 'increment',
      "click button.decrement" : 'decrement'
    },

    increment: function(e) {
      this.set({count: this.get("count", 0) + 1});
      this.trigger("increment", this.get("count"));
      e.preventDefault();
    },

    decrement: function(e) {
      this.set({count: this.get("count", 0) - 1});
      this.trigger("decrement", this.get("count"));
      e.preventDefault();
    },

    modelBindings: {
      "name" : "name",
      "age"  : function(value) {
        this.set({age: value});
      }
    }
  }
);




// Test out the StringBundle

PiewPiew.StringBundle.addStrings({
  "mysample.title": "This is the title - {{name}}",
  "mysample.body":  "This is the <strong>body</strong> here"
});

console.log(Mustache.to_html("Here is a {{#s}}mysample.title{{/s}}", PiewPiew.TemplateContext({name:"Tony"})));


