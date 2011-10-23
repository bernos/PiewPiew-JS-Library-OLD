(function(global){
  
  var moduleId     = "piewpiew.StringBundle";
  var requires = ["exports", "piewpiew"];

  var module = function(exports, piewpiew) {
    
    var _strings = {};
  
    exports.setParser = function(parser) {
      this._parser = parser;
      return this;
    };

    exports.getParser = function(){
      if (!this._parser) {
        this.setParser(piewpiew.printf);
      }
      return this._parser;
    };

    /**
     * Add strings to the StringBundle
     * 
     * @param {object} strings
     *  An object containing keys/strings to add to the StringBundle
     * @return {object} 
     *  A reference to the StringBundle. Useful for method chaining.
     */
    exports.setStrings = function(strings, locale) {
      if(!locale) {
        locale = piewpiew.locale;
      }
      
      if(!_strings[locale]) {
        _strings[locale] = {};
      }
      
      _strings[locale] = piewpiew.extend(_strings[locale], strings);
      
      return this;
    };

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
    exports.getString = function(key, context, defaultValue, parse) {
      var p = this.getParser();

      if (_strings[piewpiew.locale] && _strings[piewpiew.locale][key]) {
        return p(_strings[piewpiew.locale][key], context);
      }
      
      if (defaultValue) {
        return p(defaultValue, context);
      }
      
      return key;
    };

    /**
     * Retrieves a string from the StringBundle, without parsing any template
     * data or expressions. Use this method if you need to process raw template
     * strings manually.
     *
     * @param {String} key
     *  Key of the string to retrieve
     * @return {String}
     *  The requested string or the key if the string does not exist
     */
    exports.getRawString = function(key) {
      if (_strings[piewpiew.locale] && _strings[piewpiew.locale][key]) {
        return _strings[piewpiew.locale][key];
      }
            
      return key;
    };

    /**
     * Loads a string bundle from the given URL. String bundles are simple
     * JSON
     * 
     * @param {string} url
     * @param {function} callback
     * @param {string} locale
     */
    exports.load = function(url, callback, locale) {
      var that = this;

      $.getJSON(url, function(data) {
        that.addStrings(data, locale);
        if (callback) {
          callback();
        }
      });
    };
  };

  global.piewpiew.define(moduleId, requires, module);
})(typeof window === 'undefined' ? this : window);