(function(PiewPiew){

  // LOCAL VARS ////////////////////////////////////////////////////////////////
  
  var _templateCache = {};

  // HELPER FUNCTIONS //////////////////////////////////////////////////////////

  // MODULE DEFS ///////////////////////////////////////////////////////////////

  PiewPiew.UI = PiewPiew.UI || {};

  // CLASS DEFS ////////////////////////////////////////////////////////////////

  PiewPiew.UI.TemplatableView = PiewPiew.Class(PiewPiew.UI.View, {

    // PUBLIC PROPERTIES ///////////////////////////////////////////////////////

    template: "View: {{id}}",

    // GETTERS AND SETTERS /////////////////////////////////////////////////////
/*
    getTemplate: function() {
      if (null == this._tmpl) {
        this._tmpl = "no template for this view";
      }
      return this._tmpl;
    },

    setTemplate: function(tmpl) {
      this._clearTemplate();
      this._tmpl = tmpl;
      this.render();
    },

    getTemplateUrl: function() {
      return this._templateUrl;
    },

    setTemplateUrl: function(url) {
      this._clearTemplate();
      this._templateUrl = url;

      // TODO: stop loading existing template url

      this.render();
    },

    getTemplateSelector: function() {
      return this._templateSelector;
    },

    setTemplateSelector: function(selector) {
      this._clearTemplate();
      this._templateSelector = selector;
      this.render();
    },*/

    // PUBLIC METHODS //////////////////////////////////////////////////////////

    initializeWithSpec: function(spec) {
      this.template         = spec.template || this.template;
      this.templateSelector = spec.templateSelector || this.templateSelector;
      this.templateUrl      = spec.templateUrl || this.templateUrl;

      delete spec.template;
      delete spec.templateSelector;
      delete spec.templateUrl;

      PiewPiew.UI.View.prototype.initializeWithSpec.apply(this, [spec]);
    },

    render: function() {
      var that = this;

      this.renderTemplate(this.toJSON(), function(content) {
        that.getEl().innerHTML = content;
      })
    },

    renderTemplate: function(context, callback) {
      var p = PiewPiew.UI.TemplatableView.getTemplateParser();

      // If we have already resolved our template, then we can render and 
      // return immediately
      if (this._template) {
        if (callback) {
          callback(p(this._template, context));
        }
      } 
      // If we are using an external template, then load it now
      else if (this.templateUrl && !this._templateLoaded && !this._templateLoading) {
        var that = this;

        this._loadExternalTemplate(this.templateUrl, function(template) {
          if (template) {
            // Store the loaded template to speed up future calls to 
            // renderTemplate()
            that._template = template;
            
            callback(p(that._template, context));
          } else {
            // TODO: error loading template needs handling
          }
        });
      } 
      // Maybe we are using a template from the DOM
      else if (this.templateSelector) {
        this._template = $(this.templateSelector).html();

        if (callback) {
          callback(p(this._template, context));
        }
      }
      // Maybe our template is a string literal ...
      else if (typeof this.template == "string") {
        this._template = this.template;

        if (callback) {
          callback(p(this._template, context));
        }
      } 
      // Finally it could be a function. We wont cache the return value of the
      // function in _template in this case, as the function may be designed 
      // to return different values on subsequent executions
      else if (typeof this.template == "function") {
        if (callback) {
          callback(p(this.template(context),context));
        }
      }
    },

    // PRIVATE METHODS /////////////////////////////////////////////////////////

    _clearTemplate: function(){
      this._template = null;
    },

    _loadExternalTemplate: function(url, callback) {
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
    }

  });

  /**
   * Gets the template parser
   *
   * @return {Function}
   */
  PiewPiew.UI.TemplatableView.getTemplateParser = function() {
    if (null == this._templateParser) {
      this._templateParser = Mustache.to_html;
    }
    return this._templateParser;
  },

  /**
   * Parser must be a function that accepts two params: The template
   * string, and a context object.
   *
   * @param {Function} parser
   *  Template parser function. Must accept the the following params
   *  - template {String} the unparsed template
   *  - context {Object} a context object containing name/value pairs to be
   *    used when rendering the template
   */
  PiewPiew.UI.TemplatableView.setTemplateParser = function(parser) {
    this._templateParser = parser;
  }
})(PiewPiew);