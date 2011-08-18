/**
 * The PiewPiew module
 */

(function(global) {
  var PiewPiew = pp = module = {
    VERSION: '0.0.1'
  };

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
  module.extend = function(obj) {
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
  module.createDelegate = function(obj, method) {
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
  module.parseTemplate = function(template, context) {
    return Mustache.to_html(template, context);
  };

  

  module.Extendable = function(baseType) {
    baseType.extend = function(spec) {
      var newType = function(options) {
        return baseType(module.extend({}, spec, options));
      }

      module.Extendable(newType);
      
      return newType;
    };
    return baseType;
  };
  
  /*****************************************************************************
   * Creates a "Watchable" object that can be mixed into any other object using
   * the PiewPiew.extend() method. Watchable object provide access to internal
   * attributes via get() and set() methods. The changeEvent param can be used 
   * to determine the type of event that should be triggered when a call to the 
   * set() method results in an attribute change
   ****************************************************************************/
  module.Watchable = module.Extendable(function(attributes, changeEvent) {
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
  });
  
  
  /*****************************************************************************
   * Creates a context object ready for rendering. TemplateContexts provide data
   * and helper functions to templates. New helper functions can be added by
   * calling PiewPiew.TemplateContext.addHelpers()
   *
   * @constructor
   ****************************************************************************/
  module.TemplateContext = (function() {
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
  
  

  module.List = function(items) {
    var _items = (items || []).slice(0);

    return extend({
      length: 0,

      getItems: function() {
        return _items;
      },

      getItemAt: function(index) {
        return _items[index];
      },

      addItem: function(item) {
        _items.push(item);
        this.length = _items.length;
        this.trigger(PiewPiew.List.events.ITEM_ADDED, this, item);
        return this;
      },

      addItemAt: function(item, index) {
        _items.splice(index, 0, item);
        this.length = _items.length;
        this.trigger(PiewPiew.List.events.ITEM_ADDED, this, item);
        return this;
      },

      removeItem: function(item) {
        var i = this.indexOf(item);

        if (i > -1) {
          _items.splice(i, 1);
          this.length = _items.length;
          this.trigger(PiewPiew.List.events.ITEM_REMOVED, this, item);
          return item;
        }

        return null;
      },

      removeItemAt: function(index) {
        if (index > -1 && index < _items.length) {
          var item = _items.splice(index, 1)[0];
          this.length = _items.length;
          this.trigger(PiewPiew.List.events.ITEM_REMOVED, this, item);
          return item;
        }
        return null;
      },

      each: function(callback) {
        for (var i = 0, l = _items.length; i < l; i++) {
          callback.apply(_items[i]);
        }
        return this;
      },

      indexOf: function(item) {
        if (_items.indexOf) {
          return _items.indexOf(item);
        }

        for (var i = 0, l = _items.length; i < l; i++) {
          if (_items[i] === item) {
            return i;
          }
        }

        return -1;
      }
    
    }, new PiewPiew.EventDispatcher());
  }

  module.List.events = {
    ITEM_ADDED:   "PiewPiew.model.events.ITEM_ADDED",
    ITEM_REMOVED: "PiewPiew.model.events.ITEM_REMOVED" 
  };

  

  module.ListView = function(spec) {
    var _model = null;

    var _itemAddedHandler = null;

    return PiewPiew.View(extend({
      itemContainer: '',
      tagname: 'ul',
      itemView: PiewPiew.View,

      setModel: function(model) {
        var that = this;
        // unlike regular views we are really only interested in add and remove
        // events.

        _model = model;

        _itemAddedHandler = PiewPiew.createDelegate(this, function(list, item) {
          console.log("added", list, item);
          that.appendItem(item);
        });

        _model.bind(PiewPiew.List.events.ITEM_ADDED, _itemAddedHandler);
      },

      appendItem: function(item) {
        // instantiate the appropriate view type, set item as the views model
        // then render the view, and append to our itemContainer
        var view = PiewPiew.View({
          tagname:"li"
        });
        view.setModel(item);

        $(this.el).append(view.render().el);
      }
    }, spec || {}));
  };


  if (global.PiewPiew) {
    throw new Error("PiewPiew has already been defined.");
  } else {
    global.PiewPiew = PiewPiew;
  }
})(typeof window === 'undefined' ? this : window);

