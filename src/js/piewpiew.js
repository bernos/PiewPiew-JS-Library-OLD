(function(global) {

  /**
   * Define the PiewPiew module
   */
  var mod = function(exports) {

    exports.VERSION = "0.0.1";
    exports.define  = define;
    exports.require = require;
    exports.modules = _modules;

    /**
     * Simple string formatting function. Replaces all occurances of ${token}
     * with values from a context object.
     *
     * @param {String} str
     *  The input string, containing tokens to be replace.
     * @param {Object} o
     *  Token values to be substituted into the input string.
     * @return {String}
     */
    exports.printf = function(str, o) {
      for (var t in o) {
        str = str.replace("${" + t + "}", o[t]);
      }
      return str;
    };

    /**
     * Extends one object by adding properties from another object
     * 
     * @alias PiewPiew.extend
     * 
     * @param {Object} object1
     *  The object to extend
     * @param {Object} object2
     *  The extension object
     * @param {Object} objectN
     *  Another extension object
     * @return {Object}
     *  The extended object
     */
    exports.extend = function(obj) {
      var extensions = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < extensions.length; i++) {
        for (var prop in extensions[i]) {
          obj[prop] = extensions[i][prop];
        }
      }    
      return obj;
    };

    exports.Class = function() {
      var methods = null,
          parent  = null;
      
      /**
       * Default constructor for our new class. All classes created using the PiewPiew.Class() method
       * will share this constructor.
       */
      var klass = function() {
        this.initialize.apply(this, arguments);
      };
      
      /**
       * If the first argument is a function, assume it is the "class" from which the new class will inherit.
       * In this case the second argument is an object containing the methods and properties for the new class.
       *
       * If the first argument is not a function, then we interpret it as an object containing the methods
       * and properties of the new class
       */
      if (typeof arguments[0] === 'function') {
        parent = arguments[0];
        methods = arguments[1];
      } else {
        methods = arguments[0];
      }


      if (parent) {
        klass.prototype = new parent();
        //extend(klass.prototype, parent.prototype);
      }

      piewpiew.extend(klass.prototype, methods);
      klass.prototype.constructor = klass;

      if (!klass.prototype.initialize) {
        klass.prototype.initialize = function(){};
      } 

      return klass;
    };

    /**
     * Creates a method delegate. Enables us to specify the scope a function 
     * should be run in when assigning and binding handlers.
     * 
     * @alias PiewPiew.createDelegate
     * @param {object} obj
     * @param {function} method
     */
    exports.createDelegate = function(obj, method) {
      return function() {
        method.apply(obj, arguments);
      };
    };

    if (global.piewpiew) {
      throw new Error("PiewPiew has already been defined.");
    } else {
      global.piewpiew = exports;
    }

  };

  /**
   * Storage for tracking module dependencies
   */
  var _dependencyMap = [];

  /**
   * Storage for loaded piewpiew modules
   */
  var _modules = {

  };

  /**
   * Processes the dependency map. Compares the loaded modules against
   * the dependencies defined in the dependency map.
   */
  function resolveModuleDependencies() {
    for (var i = 0, m = _dependencyMap.length; i < m; i++) {
      if (_dependencyMap[i]) {
        // if all dependencies for the current cb are defined, then
        // execute the callback, and remove this entry from the
        // dependencymap...
        var deps        = _dependencyMap[i]['dependencies'];
        var callback    = _dependencyMap[i]['callback'];
        var loadedDeps  = [];

        for (var j = 0, jm = deps.length; j < jm; j++) {
          // There are some special cases for dependencies in the AMD
          // specification. These are the "require", "exports" and "module"
          // dependencies.
          if (deps[j] == "exports") {
            loadedDeps.push({});
          } else if (deps[j] == "require") {
            loadedDeps.push(require);
          } else if (deps[j] == "module") {
            //
          } else if (null != _modules[deps[j]] && _modules[deps[j]]['status'] == "LOADED") {
            loadedDeps.push(_modules[deps[j]]['exports']);
          }
        }

        if (loadedDeps.length == deps.length) {          
          // All deps are loaded, so we can call the callback now
          // remove the object from the dependencyMap
          _dependencyMap.splice(i,1);
          callback.apply(this, loadedDeps);
        }
      }     
    }
  }



  function require(modules, callback) {
    console.log("require", modules);
    
    if (typeof modules == "string") {
      if (_modules[modules]) {
        return _modules[modules]['exports'];
      }
      return null;
    }

    _dependencyMap.push({
      callback:callback, 
      dependencies:modules
    });

    for(var i = 0, m = modules.length; i < m; i++) {
      var mod = modules[i];

      // TODO: if mod is require or exports or module
      // dont load it as an external script...

      if (mod != "require" && mod != "exports" && mod != "module" && !_modules[mod]) {
        _modules[mod] = {
          status: "LOADING"
        };   
        console.log("modules = ", _modules);

        // Attach script element here...
        var s = document.createElement("script");
        s.setAttribute("type","text/javascript");

        // TODO: Base path should be changeable
        s.setAttribute("src", "js/" + mod + ".js");

        document.getElementsByTagName("head")[0].appendChild(s);
      }      
    }

    // Check module dependencies
    resolveModuleDependencies(); 
  };



  function define(id, dependencies, factory) {
    require(dependencies, function() {
      var exports = null;

      for (var i = 0, m = dependencies.length; i < m; i++) {
        if (dependencies[i] == "exports") {
          exports = arguments[i];
          break;
        }
      }

      _modules[id] = {
        status:  "LOADED",
        exports: exports
      };

      factory.apply(factory, arguments);

      resolveModuleDependencies();
    });   
  };  

  define("piewpiew", ["exports"], mod);

  
})(typeof window === 'undefined' ? this : window);

