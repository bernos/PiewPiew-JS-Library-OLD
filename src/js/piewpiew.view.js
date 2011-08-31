(function(PiewPiew){

  /**
   * Internal sequence used for default ID property values
   */
  var idSequence = 1;

  /**
   * Internal storage for cached templates
   */
  var _templateCache = {};

  PiewPiew.View = PiewPiew.Class(PiewPiew.PropertyManager, {
    initialize: function(spec) {
      // Call supers' constructor
      PiewPiew.PropertyManager.prototype.initialize.apply(this, [PiewPiew.View.events.CHANGE]);

      /**
       * Tracks whether our template is currently being loaded.
       */
      this._templateLoading = false;

      /**
       * Tracks whether we've loaded an external template for the view
       */
      this._templateLoaded = false;

      /**
       * Internal storage for our template text. This could come from parsing a 
       * DOM element, from an external file, or a literal String
       */
      this._template = null;

      /**
       * We need to use explicit getter and setter methods to handle our model
       * This way we can register/deregister handlers for model change events
       */
      this._model = null;

      /**
       * Storage for our model change handler
       */
      this._modelChangeDelegate = null;

      // Merge the provided spec with some defaults into the View instance
      PiewPiew.extend(this, this.getDefaults(), spec || {});

      if (!this.el) {
        this.el = document.createElement(this.tagname);
        this.el.setAttribute("id", this.id);

        if (this.classes.length > 0) {
          this.el.setAttribute("class", this.classes.join(" "));
        }
      }

      // View needs to listen to itself for changes and re-render
      this.bind(PiewPiew.View.events.CHANGE, PiewPiew.createDelegate(this, function(view, changes){
        this.handleSelfChange(changes);
      }));

      // Initialise DOM event handlers. Handlers may have been declared as 
      // either functions or strings. Strings will be interpreted the names of
      // handlers defined in the view object, and delegate functions will be
      // created to be bound to each DOM event.
      var delegates = {};

      for (var h in this.handlers) {
        var tokens    = h.split(" ");
        var eventName = tokens.shift();
        var selector  = tokens.join(" ");
        var handler   = this.handlers[h];
        
        delegates[selector] = delegates[selector] || {};

        if (typeof handler == 'string' && typeof this[handler] == 'function') 
        {
          delegates[selector][eventName] = PiewPiew.createDelegate(
            this, 
            this[handler]
          );
        } else {
          delegates[selector][eventName] = handler;
        }
      }

      for (var selector in delegates) {
        $(this.el).delegate(selector, delegates[selector]);   
      }

      this.set(spec.defaults || {});
    },

    getDefaults: function() {
      return {
        id:               "View" + (idSequence++),
        tagname:          "div",
        templateHelpers:  {},
        classes:          [],
        handlers:         {},
        modelInterests:   [],

        /**
         * Default view template simply renders out the view ID and each of its
         * attributes
         */
        template: function(context) {
          var t = "<div><strong>id:</strong> " + this.id + "</div>";
          for(var n in this._attributes) {
            t += "<div><strong>" + n + ":</strong> " + this._attributes[n] + "</div>"
          }
          return t;
        }
      };
    },

    getModel: function() {
      return this._model;
    },
/*
    setModel: function(model) {
      // Relase existing model, if we have one
      if (this._model && this._model.unbind) {
        this._model.unbind(PiewPiew.Model.events.CHANGE, this._modelChangeDelegate);
      }

      // Update ref to model
      this._model = model;
      this._modelChangeDelegate = null;


      // Bind to model change event
      if (this._model && this._model.bind) {
        this._modelChangeDelegate = PiewPiew.createDelegate(
          this, 
          this.handleModelChange
        );
        this._model.bind(PiewPiew.Model.events.CHANGE, this._modelChangeDelegate); 
      }

      // If we have any model interests, then we need to sync our local
      // properties with the new model now...
      var attributes = {};

      for(var i = 0, l = this.modelInterests.length; i < l; i++) {
        var n = this.modelInterests[i];
        attributes[n] = model.get(n);
      }

      console.log("NEW view will now set ", attributes);

      this.set(attributes);

      return this;        
    },*/

    renderTemplate: function(templateContext, callback) {
      // If we have already resolved our template, then we can render and 
      // return immediately
      if (this._template) {
        if (callback) {
          callback(PiewPiew.parseTemplate(this._template, templateContext));
        }
      } 
      // If we are using an external template, then load it now
      else if (this.templateUrl && !this._templateLoaded && !this._templateLoading) {
        var that = this;

        this.loadExternalTemplate(this.templateUrl, function(template) {
          if (template) {
            // Store the loaded template to speed up future calls to 
            // renderTemplate()
            that._template = template;
            
            callback(PiewPiew.parseTemplate(that._template, templateContext));
          } else {
            // TODO: error loading template needs handling
          }
        });
      } 
      // Maybe we are using a template from the DOM
      else if (this.templateSelector) {
        this._template = $(this.templateSelector).html();

        if (callback) {
          callback(PiewPiew.parseTemplate(this._template, templateContext));
        }
      }
      // Maybe our template is a string literal ...
      else if (typeof this.template == "string") {
        this._template = this.template;

        if (callback) {
          callback(PiewPiew.parseTemplate(this._template, templateContext));
        }
      } 
      // Finally it could be a function. We wont cache the return value of the
      // function in _template in this case, as the function may be designed 
      // to return different values on subsequent executions
      else if (typeof this.template == "function") {
        if (callback) {
          callback(
            PiewPiew.parseTemplate(
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
console.log("NEW context ", context);
      return context;
    },

    render: function() {
      var that = this;
      console.log("NEW rendering");

      this.renderTemplate(
        new PiewPiew.TemplateContext(this.templateContext()), 
        function(content) {
          $(that.el).html(content);    
        }
      );

      return this;
    },

    loadExternalTemplate: function(url, callback) {
      // See if we already have a cached copy of the template
      if (_templateCache[url]) {
        this._templateLoaded  = true;
        this._templateLoading = false;
        if (callback) {
          callback(_templateCache[url]);
        }
      } else {

        var that = this;

        $.ajax(url, {
          dataType:'html',
          error:function(jqXHR, textStatus, errorThrown) {
            that._templateLoaded   = true;
            that._templateLoading  = false;
            
            if (callback) {
              callback(null);
            }
          },
          success: function(data) {
            that._templateLoaded   = true;
            that._templateLoading  = false;
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
        return Array.prototype.indexOf.apply(this.modelInterests, [changedAttribute]) > -1;
      }

      for (var i = 0, l = this.modelInterests.length; i < l; i++) {
        if (this.modelInterests[i] === changedAttribute) {
          return true;
        }
      }

      return false;
    },

    handleModelChange: function(changes) {
      console.log("NEW view heard ", changes);

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
    },

    handleSelfChange: function(changes) {
      console.log("handleSelfChange", changes);
      if (changes.model) {
        // Relase existing model, if we have one
        if (this._model && this._model.unbind) {
          this._model.unbind(PiewPiew.Model.events.CHANGE, this._modelChangeDelegate);
        }

        // Update ref to model
        this._model = changes.model;
        this._modelChangeDelegate = null;

        // Bind to model change event
        if (this._model && this._model.bind) {
          this._modelChangeDelegate = PiewPiew.createDelegate(
            this, 
            function(model, changes) {
              this.handleModelChange(changes);
            }            
          );
          this._model.bind(PiewPiew.Model.events.CHANGE, this._modelChangeDelegate); 
        }

        // If we have any model interests, then we need to sync our local
        // properties with the new model now...
        var attributes = {};

        for(var i = 0, l = this.modelInterests.length; i < l; i++) {
          var n = this.modelInterests[i];
          attributes[n] = this._model.get(n);
        }

        console.log("NEW view will now set ", attributes);

        this.set(attributes);
      }

      this.render();
    }
  });

  PiewPiew.View.events = {
    CHANGE: "PiewPiew.View.events:CHANGE"
  };
})(PiewPiew);