(function(PiewPiew){
  PiewPiew.UI = PiewPiew.UI || {};

  PiewPiew.UI.TemplatableView = PiewPiew.Class(PiewPiew.UI.View, {
    getDefaults: function() {
      return {
        template: this.template || "no template for this view"
      };
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

        this.loadExternalTemplate(this.templateUrl, function(template) {
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
    }
  });

  PiewPiew.UI.TemplatableView.getTemplateParser = function() {
    if (null == this._templateParser) {
      this._templateParser = Mustache.to_html;
    }
    return this._templateParser;
  },

  /**
   * Parser must be a function that accepts two params: The template
   * string, and a context object.
   */
  PiewPiew.UI.TemplatableView.setTemplateParser = function(parser) {
    this._templateParser = parser;
  }
})(PiewPiew);