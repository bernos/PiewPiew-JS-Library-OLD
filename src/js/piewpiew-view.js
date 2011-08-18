var PiewPiew = (function(PP){

  /**
   * Internal sequence used for default ID property values
   */
  var idSequence = 1;

  /**
   * Internal storage for cached templates
   */
  var _templateCache = {};

  /**
   * Creates a View instance
   * 
   * @class Base view implementation
   * @param {Object} spec
   *  An object containing attributes and functions to extend the View instance
   *  that will be created
   * @return {PiewPiew.View}
   *  A View object
   * @constructor
   */
  PP.View = PP.Extendable(function(spec) {

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
     * We need to use explicit getter and setter methods to handle our model
     * This way we can register/deregister handlers for model change events
     */
    var _model = null;

    /**
     * Storage for our model change handler
     */
    var _modelChangeDelegate = null;
   
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
      view.bind(PP.View.events.CHANGE, function(view, changes) {
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

        if (typeof handler == 'string' && typeof view[handler] == 'function') 
        {
          delegates[selector][eventName] = PP.createDelegate(
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

      view.set(spec.defaults || {});

      view.init();
      
      return view;
    }
    
    /**
     * Extends the base View object with the defaults and spec if provided, then
     * initialises the View and returns it.
     */
    return _initView(PP.extend(
      new PP.EventDispatcher(), 
      PP.Watchable(_attributes, PP.View.events.CHANGE),
      spec || {},
      {
        id:               spec.id || "View" + (idSequence++),
        tagname:          spec.tagname || "div",
        templateUrl:      spec.templateUrl,
        templateSelector: spec.templateSelector,
        templateHelpers:  spec.templateHelpers || {},
        classes:          spec.classes || [],
        handlers:         spec.handlers || {},
        modelInterests:   spec.modelInterests || [],    
        el:               spec.el,
        
        /**
         * Default view template simply renders out the view ID and each of its
         * attributes
         */
        template: spec.template || function(context) {
          var t = "<div><strong>id:</strong> " + this.id + "</div>";
          for(var n in _attributes) {
            t += "<div><strong>" + n + ":</strong> " + _attributes[n] + "</div>"
          }
          return t;
        },      
        
        /**
         * Initialise the View. Extended Views should provide their own 
         * implementation. It is a good idea to return a reference to ourself here
         * to allow for method chaining.
         *
         * @memberOf PP.View#       
         */
        init: function() {
          return this;
        },

        getModel: function() {
          return _model;
        },

        setModel: function(model) {
          // Relase existing model, if we have one
          if (_model && _model.unbind) {
            _model.unbind(PP.Model.events.CHANGE, _modelChangeDelegate);
          }

          // Update ref to model
          _model = model;
          _modelChangeDelegate = null;


          // Bind to model change event
          if (_model && _model.bind) {
            _modelChangeDelegate = PP.createDelegate(
              this, 
              this.handleModelChange
            );
            _model.bind(PP.Model.events.CHANGE, _modelChangeDelegate); 
          }

          // If we have any model interests, then we need to sync our local
          // properties with the new model now...
          var attributes = {};

          for(var i = 0, l = this.modelInterests.length; i < l; i++) {
            var n = this.modelInterests[i];
            attributes[n] = model.get(n);
          }

          this.set(attributes);

          return this;
        },
        
        /**
         * Renders our template using the provided template context
         *
         * @param {PiewPiew.TemplateContext} templateContext
         * @param {function} callback
         */
        renderTemplate: function(templateContext, callback) {
          // If we have already resolved our template, then we can render and 
          // return immediately
          if (_template) {
            if (callback) {
              callback(PP.parseTemplate(_template, templateContext));
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
                
                callback(PP.parseTemplate(_template, templateContext));
              } else {
                // TODO: error loading template needs handling
              }
            });
          } 
          // Maybe we are using a template from the DOM
          else if (this.templateSelector) {
            _template = $(this.templateSelector).html();

            if (callback) {
              callback(PP.parseTemplate(_template, templateContext));
            }
          }
          // Maybe our template is a string literal ...
          else if (typeof this.template == "string") {
            _template = this.template;

            if (callback) {
              callback(PP.parseTemplate(_template, templateContext));
            }
          } 
          // Finally it could be a function. We wont cache the return value of the
          // function in _template in this case, as the function may be designed 
          // to return different values on subsequent executions
          else if (typeof this.template == "function") {
            if (callback) {
              callback(
                PP.parseTemplate(
                  this.template(templateContext), 
                  templateContext
                )
              );
            }
          }        
        },
        
        templateContext: function() {
          var context = this.serialize();

          for(var name in this.templateHelpers) {
            context[name] = this.templateHelpers[name].apply(this);
          }

          return context;
        },

        render: function() {
          var that = this;

          this.renderTemplate(
            PP.TemplateContext(this.templateContext()), 
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
          var s = {};
          for (var n in _attributes) {
            s[n] = _attributes[n];
          }
          return s;
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
        },

        hasModelInterest: function(changedAttribute) {
          if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.apply(
              this.modelInterests, 
              [changedAttribute]) > -1;
          }

          for (var i = 0, l = this.modelInterests.length; i < l; i++) {
            if (this.modelInterests[i] === changedAttribute) {
              return true;
            }
          }

          return false;
        },

        handleModelChange: function(model, changes) {
          var attributes = {};
          var trigger    = false;

          for(var changedAttribute in changes) {
            if (this.hasModelInterest(changedAttribute)) {
              trigger = true;
              attributes[changedAttribute] = changes[changedAttribute];
            }
          }

          if (trigger) {
            this.set(attributes);
          }
        }
        
      }
    ));
  });

  PP.View.events = {
    CHANGE : "PiewPiew.View:change"
  };

 

  return PP;

}(PiewPiew || {}));