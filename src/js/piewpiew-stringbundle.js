/*****************************************************************************
 * The StringBundle is a useful place to store all strings and messages that
 * your application will use. Bundles can be stored in external .json files
 * and loaded at runtime using the StringBundle.load() function. The 
 * StringBundle can also handle multiple locales.
 *
 * StringBundle also supports template strings using the templating library
 * of your choice. By default we use the Mustache templating library, but this
 * can easily be overriden by implementing an alternative version of
 * PiewPiew.parseTemplate(template,context)
 ****************************************************************************/
PiewPiew.StringBundle = (function() {
  return {
    /**
     * Add strings to the StringBundle
     * 
     * @param {object} strings
     *  An object containing keys/strings to add to the StringBundle
     * @return {object} 
     *  A reference to the StringBundle. Useful for method chaining.
     */
    addStrings: function(strings, locale) {
      if(!locale) {
        locale = PiewPiew.locale;
      }
      
      if(!_strings[locale]) {
        _strings[locale] = {};
      }
      
      _strings[locale] = PiewPiew.extend(_strings[locale], strings);
      
      return this;
    },
    
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
    getString: function(key, context, defaultValue) {
      if (_strings[PiewPiew.locale] && _strings[PiewPiew.locale][key]) {
        return PiewPiew.parseTemplate(
          _strings[PiewPiew.locale][key], 
          context
        );
      }
      
      if (defaultValue) {
        return PiewPiew.parseTemplate(defaultValue, context);
      }
      
      return key;
    },

    /**
     * Loads a string bundle from the given URL. String bundles are simple
     * JSON
     * 
     * @param {string} url
     * @param {function} callback
     * @param {string} locale
     */
    load: function(url, callback, locale) {
      var that = this;

      $.getJSON(url, function(data) {
        console.log(data);
        that.addStrings(data, locale);
        if (callback) {
          callback();
        }
      });
    }
  }
}());
  
