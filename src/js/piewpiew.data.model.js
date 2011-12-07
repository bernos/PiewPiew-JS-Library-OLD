(function(global){

  var moduleId = "piewpiew.data.model";
  var requires = ["exports", "piewpiew", "piewpiew.Base", "piewpiew.data.validators"];

  var module = function(exports, piewpiew, base, validators) {
    // LOCAL VARS ////////////////////////////////////////////////////////////////

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    exports.Model = base.Base.extend({
    
      // PUBLIC PROPERTIES ///////////////////////////////////////////////////////
    
      // GETTERS AND SETTERS /////////////////////////////////////////////////////

    
      // PUBLIC METHODS //////////////////////////////////////////////////////////
      initialize: function(spec) {
        // Create default getters and setters for our fields
        for (var field in this.fields) {
          var getter = "get" + field.slice(0,1).toUpperCase() + field.slice(1);
          var setter = "set" + field.slice(0,1).toUpperCase() + field.slice(1);

          if (null == this[getter]) {
            this[getter] = function() {
              return this.getProperties()[field];
            }
          }  

          if (null == this[setter]) {
            this[setter] = function(value) {
              var errors = this.fields[field].validate(value);
              if (errors.length == 0) {
                this.setProperty(field, value);
                return this;
              } else{
                console.log(errors);
                throw errors.join(" ");
              }              
            }            
          }                   
        }

        base.Base.prototype.initialize.apply(this, arguments);
      },

      initializeWithSpec: function(spec) {
        for (var name in spec) {

          if (this.fields[name]) {
            this.set(name, spec[name]);
          }
        }
      },      

      handleChanges: function(changes){
        this.trigger(exports.Model.events.CHANGE, changes);
        return this;
      }

      // PRIVATE METHODS /////////////////////////////////////////////////////////
    
    });

    /**
     * Override the default extension method for building new model classes. We
     * do this simply to keep the model creation syntax clean, rather than having
     * to remember to assign all our field definitions to the "fields" property
     * of the new model class prototype.
     */
    exports.Model.extend = function(model) {
      return piewpiew.Class(this, {fields:model, modelName:"Fish"});
    }

    exports.Model.events = {
      CHANGE: "piewpiew.data.Model.events.CHANGE", 
    };

    /**
     * Base class for all model field types
     */
    exports.Field = piewpiew.Class({
      required: false,
      requiredMessage: "This is a required field",
      invalidTypeMessage: "The value of this field is invalid",

      initialize: function(spec) {
        spec = spec || {};

        for (var name in spec) {
          this[name] = spec[name];
        }

        this.validators = spec.validators || {};
      },

      validate: function(value) {
        // First validate the datatype
        if (!this.validateType(value)) {
          return [this.invalidTypeMessage];
        }
              
        if (this.required && !this.validateRequired(value)) {
          return [this.requiredMessage];
        }
         
        var errors = [];

        for (var v in this.validators) {
          errors = errors.concat(this.validators[v].validate(value));
        }

        return errors;        
      },

      validateType: function(value) {
        return true;  
      },

      validateRequired: function(value) {
        if (null == value) {
          return false;
        }
        return true;
      }
    });

    /**
     * CharField Class.
     */
    exports.CharField = exports.Field.extend({
      invalidTypeMessage: "The value of this field must be a string",

      validateType: function(value) {
        return typeof value == "string";
      },
      validateRequired: function(value) {
        return value.length > 0;
      }
    });

    exports.NumberField = exports.Field.extend({
      invalidTypeMessage: "The value of this field must be a number",

      validateType: function(value) {
        return !isNaN(value);
      }
    })
    

  };

  global.piewpiew.define(moduleId, requires, module);
  
})(typeof window === 'undefined' ? this : window);

