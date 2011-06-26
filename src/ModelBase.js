/**
 * Base class for all models in the app
 * 
 * @author  Brendan McMahon brendan.mcmahon@publicisdigital.com
 * @version $Id$
 *
 * @param {object} spec
 *  An object to decorate with all the base model methods and properties
 *
 * @return {PMQuizModelBase}
 *  A freshly minted model
 */
var PMQuizModelBase = function(spec) {
  /**
   * An unattached element used for binding and triggering jquery events
   */
  var $_dispatcher = $('<div/>');

  /**
   * Attributes/properties of our model
   */
  var _attributes = {};

  /**
   * Create and return the instance
   */
  return {

    __merge__: PMQuizUtils.__merge__,

    /**
     * Ensure that the model's init() method is called and that a reference
     * to itself is returned. Useful for method chaining
     *
     * @return {PMQuizModelBase}
     */
    __init__: function() {
      this.init();
      return this;
    },

    /**
     * Initialise the model
     */
    init: function() {
      
    },

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
     *  If true, a "model:change" event will be triggered, even if the attribute
     *  value has not changed
     *
     * @return {PMQuizModelBase} The model instance. Useful for method chaining
     */
    set: function(attribute, value, forceChange, quiet) {
      var oldValue = _attributes[attribute];

      _attributes[attribute] = value;

      if ((oldValue != value || forceChange) && !quiet) {
        this.trigger(PMQuizModelBase.CHANGE, [this, attribute, oldValue, value]);
      }

      return this;
    },

    addModel: function(model) {
      model.bind(PMQuizModelBase.CHANGE, PMQuizUtils.delegate(this, this.handleSubModelChange));
      return model;
    },

    handleSubModelChange: function(e, model, param, oldValue, newValue) {
      // Forward the event on...
      this.trigger(PMQuizModelBase.CHANGE, [model, param, oldValue, newValue]);  
    },

    /**
     * Returns a simple object representation of the model, for use by templates
     */
    toObject: function() {
      var o = {};

      for (var name in _attributes) {
        o[name] = _attributes[name];
      }

      return o;
    }
  }.__merge__(spec).__init__();
}

/**
 * Dispatched whenever a model attribute changes
 */
PMQuizModelBase.CHANGE = "PMQuizModelBase:change";