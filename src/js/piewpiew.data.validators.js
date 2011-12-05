(function(global){
  
  var moduleId = "piewpiew.data.validators";
  var requires = ["exports", "piewpiew"];

  var module = function(exports, piewpiew) {
    // LOCAL VARS ////////////////////////////////////////////////////////////////
    
    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    /**
     * Base validator class
     */
    exports.Validator = piewpiew.Class({
      initialize: function(spec) {
        spec = spec || {};

        for (var name in spec) {
          this[name] = spec[name];
        }

        this.messages = this.defaultMessages();

        spec.messages = spec.messages || {};

        for(var name in spec.messages) {
          this.messages[name] = spec.messages[name];
        }
      },

      defaultMessages: function() {
        return {};
      },

      /**
       * Returns an array of validation error messages. An empty array will be
       * returned if the value is valid. Validator classes should implement 
       * their own logic here.
       */
      validate: function(value) {
        return null;
      }
    });

    /**
     * Range validator class. Determines whether a numeric value is between a
     * minimum and maximum boundary.
     *
     * @property {Number} min
     *  Minimum allowed value in range
     * @property {Number} max
     *  Maximum allowed valud in range. Set this lower than min to allow 
     *  unbounded values
     *
     * Validation messages:
     *  outOfRange - Displayed when the value being validated is out of range
     */
    exports.RangeValidator = exports.Validator.extend({
      min:0,
      max:-1,

      defaultMessages: function() {
        return {
          outOfRange : "A value between ${min} and ${max} is required"
        }
      },

      validate: function(value) {
        var errors = [];

        if(this.max < this.min) {
          return errors;
        }

        if (value < this.min || value > this.max) {
          errors.push(
            piewpiew.printf(
              this.messages.outOfRange, 
              { min:this.min, max:this.max }
            )
          );
        }

        return errors;
      }
    });

    /**
     * String validator class. Ensures that a string is between a min and max
     * length
     *
     * @property {Number} minLength
     *  Minimum length for the string. Use -1 for no minimum length
     * @property {Number} maxLength
     *  Maximum length for the string. Use -1 for no maximum length
     *
     * Validation messages
     *  outOfRange - String is not between minLength and maxLength
     *  tooLongNoMinLength - String is longer than max length with no minLength
     *    specified
     *  tooShortNoMaxLength - String is shorter than min length with no maxLength
     *    specified
     */
    exports.StringValidator = exports.Validator.extend({
      minLength:-1,
      maxLength:-1,

      defaultMessages: function() {
        return {
          tooLongNoMinLength : "String must have no more than ${maxLength} characters",
          tooShortNoMaxLength : "String must have at least ${minLength} characters",
          outOfRange : "String must have between ${minLength} and ${maxLength} characters"
        }
      },

      validate: function(value) {
        var errors = [];

        if (this.maxLength > -1) {
          if (value.length > this.maxLength) {
            errors.push((this.minLength > -1) ? piewpiew.printf(this.messages.outOfRange, this) : piewpiew.printf(this.messages.tooLongNoMinLength, this));
          }
        }

        if (this.minLength > -1) {
          if (value.length < this.minLength) {
            errors.push((this.maxLength > -1) ? piewpiew.printf(this.messages.outOfRange, this) : piewpiew.printf(this.messages.tooShortNoMaxLength, this));
          }
        }

        return errors;
      }
    });

    /**
     * Regex validator. Ensures that a string matches a regular expressions
     *
     * @property {Regex} pattern
     *  The regular expression to match on
     *
     * Validation messages
     *  noMatch - Message to show when value does not match pattern
     */
    exports.RegexValidator = exports.Validator.extend({
      pattern: /.+/,
      
      defaultMessages: function() {
        return {
          noMatch: "The provided value is invalid"
        };
      },

      validate: function(value) {
        var errors = [];

        if (null == value.match(this.pattern)) {
          errors.push(this.messages.noMatch);
        }

        return errors;
      }
    });

  }

  global.piewpiew.define(moduleId, requires, module);

})(typeof window === 'undefined' ? this : window);