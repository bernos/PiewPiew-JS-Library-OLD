/**
 * Base class for all views in our app. A view is responsible for
 *
 * #  Formatting data into a structure that is usable by our templates
 * #  Initialising UI event handlers by binding to DOM events
 * #  Updating the DOM when model attributes change
 *
 * The base view class is designed to be usable in conjuction with any
 * existing templating library, such as mustache or jquery templates.
 * 
 * @version $Id$
 * @author  Brendan McMahon brendan.mcmahon@publicisdigital.com
 *
 * @param {object} spec
 *  A view object to decorate with our base view properties and methods
 *
 * @return {PMQuizViewBase}
 *  A newly minted view
 */
var PMQuizViewBase = function(spec) {

  /**
   * Attributes of our view. View attributes should be retrieved/updated
   * via the get() and set() methods.
   */
  var _attributes = {};

  /**
   * Reference to our root element
   */
  var $_el   = null;

  /**
   * An unattached element used for binding and triggering events
   */
  var $_dispatcher = $('<div/>');

  return {

    __merge__: PMQuizUtils.__merge__,
    
    /**
     * Ensures that a call to init() actually returns the view instance.
     * required for method chaining
     */
    __init__: function(){
      this.initModelHandlers(this.model);
      this.initUIHandlers(this.getEl());
      return this;
    },

    /**
     * Id for the view
     */
    id: 'PMQuizView-' + Math.round((Math.random() * 10000000000)),

    /**
     * Model to provide data to the view
     */
    model: {},

    /**
     * Name of the template to render
     */
    template: null,

    /**
     * An array of extra css classes to add to our root element
     */
    classes: null,

    /**
     * Proxy for the jQuery trigger method
     *
     * @param {string} eventType
     * @param {array} extraParameters
     */
    trigger: function(eventType, extraParameters) {
      $_dispatcher.trigger(eventType, extraParameters);
    },

    /**
     * Proxy for the jQuery bind method
     *
     * @param {string} eventType
     * @param {object} eventData
     * @param {function} handler
     */
    bind: function(eventType, eventData, handler) {
      $_dispatcher.bind(eventType, eventData, handler);
    },

    /**
     * Get an attribute
     *
     * @param {string} attribute
     *  The name of the attribute to retrieve
     *
     * @return the value of the attribute
     */
    get: function(attribute) {
      return _attributes[attribute];
    },

    /**
     * Set an attribute
     *
     * @param {string} attribute
     *  The name of the attribute to set
     * @param {object} value
     *  The new value for the object
     * @param {boolean} forceChange
     *  If true, a "view:change" event will be triggered, even if the attribute
     *  value has not changed
     *
     * @return {PMQuizModelBase} The model instance. Useful for method chaining
     */
    set: function(attribute, value, forceChange, quiet) {
      var oldValue = _attributes[attribute];

      _attributes[attribute] = value;

      // Call our internal change handler, to ensure that the view's appearance
      // remains in sync
      if (oldValue != value) {
        this.handleSelfChange(attribute, oldValue, value);
      }

      // Notify any external event handlers of the change
      if ((oldValue != value || forceChange) && !quiet) {
        this.trigger(PMQuizViewBase.CHANGE, [attribute, oldValue, value]);
      }

      return this;
    },

    /**
     * Gets a reference to the root element of the view
     *
     * @return {jquery}
     *  A jquery wrapped DOM element
     */
    getEl: function() {
      if (null == $_el) {
        $_el = $('<div id="' + this.id + '"/>')
        $_el.append(this.render());

        if (this.classes) {
          $_el.addClass(this.classes.join(' '));
        }
      }
      return $_el;
    },

    /**
     * Handle a change to one of the view's attributes. Generally we will need to
     * update some markup to reflect the change. The default implementation here
     * is to simply re-render the entire template. Custom view classes should provide
     * their own implementations, preferably handling the changes in a more
     * efficient way
     *
     * @param {String} attribute
     * @param {object} oldValue
     * @param {object} newValue
     */
    handleSelfChange: function(attribute, oldValue, newValue) {
      this.refresh();
    },
 
    /**
     * Handle a change to the model. Normally we would update the view attributes
     * using the set() method, which will also take care of refreshing the template.
     * The default implementation here will update the view attribute with the same
     * name as the changed model attribute.
     *
     * @param {object} e
     *  An event object
     * @param {PMQuizModelBase} model
     *  The model which changed. Useful when using compound models in order to determine
     *  which submodel changed
     * @param {String} param
     *  The name of the param/attribute that changes
     * @param {object} oldValue
     *  The previous value of the attribute/param
     * @param {object} newValue
     *  The updated value of the attribute/param
     */
    handleModelChange: function(e, model, param, oldValue, newValue) {
      this.set(param, newValue);
    },

    /**
     * Forces a full re-render of the view. By default this occurs whenever a view
     * attribute/param is changed via a call to set();
     */
    refresh: function() {
      var content = $(this.render());

      $_el.html('');
      $_el.append(this.render());

      this.initUIHandlers(this.getEl());
    },

    /**
     * Render the view in its initial state. Your view objects should return a
     * string which represents the default state of the view. Note that the
     * model may not be populated at the time that render() is called
     *
     * @return {string}
     */
    render:function() {
      if (this.template) {
        if(ich[this.template] != null) {
          return ich[this.template](this.getTemplateData(), true);
        }
      }
      return "<div/>";
    },

    /**
     * Initialise the view with the model. Your view objects should bind model
     * events to relevant functions. By default we will bind a generic handler
     * for model change events
     *
     * @param {PMQuizModel} model
     *  The model that backs this view
     */
    initModelHandlers:function(model) {
      model.bind(PMQuizModelBase.CHANGE, PMQuizUtils.delegate(this, this.handleModelChange));
    },

    /**
     * Initialise any DOM event handlers here. Your custom views should implement
     * this function and set up all UI handlers such as click and rollover handlers
     * and so forth.
     */
    initUIHandlers: function($el) {
      return;
    },

    /**
     * Prepare data for use by the template. By default the output of toObject() is
     * used, but custom views can extend this to provide extra pre-processing and 
     * formatting of template data.
     *
     * @return {object} 
     */
    getTemplateData: function() {
      return this.toObject();
    },

    /**
     * Returns a simplified, object representation of the view, usable for serialisation
     * purposes
     */
    toObject: function() {
      var o = {
        id:       this.id,
        template: this.template,
        classes:  this.classes
      };

      for (var name in _attributes) {
        o[name] = _attributes[name];
      }

      return o;
    }
  }.__merge__(spec).__init__();
}

PMQuizViewBase.CONTINUE = "PMQuizViewBase:continue";
PMQuizViewBase.CHANGE   = "PMQuizViewBase:change";
PMQuizViewBase.CLOSE    = "PMQuizViewBase:close";