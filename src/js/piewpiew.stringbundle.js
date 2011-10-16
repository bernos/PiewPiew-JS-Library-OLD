/*****************************************************************************
 * The StringBundle is a useful place to store all strings and messages that
 * your application will use. Bundles can be stored in external .json files
 * and loaded at runtime using the StringBundle.load() function. The 
 * StringBundle can also handle multiple locales.
 ****************************************************************************/
(function(PiewPiew){
  
  PiewPiew.StringBundle = PiewPiew.Class(PiewPiew.Base, {

    initialize: function(spec){
      this._strings = {};
      PiewPiew.Base.prototype.initialize.apply(this, [spec]);
    
    },

    setParser: function(parser) {
      this._parser = parser;
    },

    getParser: function(){
      if (!this._parser) {
        this.setParser(PiewPiew.printf);
      }
      return this._parser;
    },

    /**
     * Add strings to the StringBundle
     * 
     * @param {object} strings
     *  An object containing keys/strings to add to the StringBundle
     * @return {object} 
     *  A reference to the StringBundle. Useful for method chaining.
     */
    setStrings: function(strings, locale) {
      if(!locale) {
        locale = PiewPiew.locale;
      }
      
      if(!this._strings[locale]) {
        this._strings[locale] = {};
      }
      
      this._strings[locale] = PiewPiew.extend(this._strings[locale], strings);
      
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
    getString: function(key, context, defaultValue, parse) {
      var p = this.getParser();

      if (this._strings[PiewPiew.locale] && this._strings[PiewPiew.locale][key]) {
        return p(this._strings[PiewPiew.locale][key], context);
      }
      
      if (defaultValue) {
        return p(defaultValue, context);
      }
      
      return key;
    },

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
    getRawString: function(key) {
      if (this._strings[PiewPiew.locale] && this._strings[PiewPiew.locale][key]) {
        return this._strings[PiewPiew.locale][key];
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
        that.addStrings(data, locale);
        if (callback) {
          callback();
        }
      });
    }
  });  
})(PiewPiew);