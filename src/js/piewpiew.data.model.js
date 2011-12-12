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
        function createGetter(name) {
          return function() {
            return this.getProperties()[name];
          }
        }

        function createSetter(name) {
          return function(value) {
            var errors = this.fields[name].validate(value);
            if (errors.length == 0) {
              this.setProperty(name, value);
              return this;
            } else{
              console.log(errors);
              throw errors.join(" ");
            }  
          }
        }

        for (var field in this.fields) {
          var getter = "get" + field.slice(0,1).toUpperCase() + field.slice(1);
          var setter = "set" + field.slice(0,1).toUpperCase() + field.slice(1);

          if (null == this[getter]) {
            this[getter] = createGetter(field);
          }  

          if (null == this[setter]) {
            this[setter] = createSetter(field);            
          }                   
        }

        // Ensure that the model has an Id field
        if (!this.getId) {
          this.getId = createGetter("id");
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
      },

      save: function(callback) {
        this.constructor.objects.save(this, callback);
        return this;
      }

      // PRIVATE METHODS /////////////////////////////////////////////////////////
    
    });

    /**
     * Override the default extension method for building new model classes. Model
     * class creation has some associated setup requirements, such as provisioning
     * a ModelManager instance to look after each model class and so on.
     */
    exports.Model.extend = function(model) {
      // All models must have a modelName!
      if (!model.modelName) {
        throw "Attempt to create a model without a 'modelName' property. Ensure that your custom model has a name.";
      }

      // Create the model class
      var klass = piewpiew.Class(this, model);   
          klass.modelName = model.modelName;

      // Create a ModelManager for this model class. Attaching the Manager to the
      // prototype ensures that all instances of this model will refer to the same
      // model
      klass.objects = new exports.ModelManager({
        modelClass: klass
      });      

      return klass;
    }

    exports.Model.events = {
      CHANGE: "piewpiew.data.Model.events.CHANGE", 
    };

    /**
     * Variable to hold our storate adaptor
     */
    var adaptor = null;

    /**
     * Get the active storage adaptor
     */
    exports.Model.getStorageAdaptor = function() {
      if (!adaptor) {
        this.setStorageAdaptor(new exports.InMemoryStorageAdaptor());
      }
      return adaptor;
    };

    /**
     * Set the active storage adaptor. Allows for the creation and use of custom
     * storage adaptors.
     */
    exports.Model.setStorageAdaptor = function(newAdaptor) {
      adaptor = newAdaptor;
      return this
    };

    /**
     * Model Manager class. Each model class has associated model manager, responsible
     * for tracking, loading and saving model instances. We do not normally directly
     * instantiate models, rather we access them through model a instances "objects"
     * property.
     */
    exports.ModelManager = piewpiew.Class({
      initialize: function(spec) {
        for(var name in spec) {
          this[name] = spec[name];
        }
      },      

      // TODO: allow arg to be either a function, or 
      // some simple kind of object containing matching criteria
      filter: function(lookups) {

        // Assign the lookups arg as the "defaultFilter" of the new
        // QuerySet. This filter will get passed to the StorageAdaptor when it
        // loads Models at the begining of the Query process. Doing this means
        // that the storage adaptor can potentially perform a more efficient load
        // as it can use the default filter to load only the models we are 
        // interested in.
        return new exports.QuerySet({
          defaultFilter: lookups,
          modelManager: this
        }).filter(lookups);
      },

      all: function(callback) {
        return new exports.QuerySet({
          modelManager: this
        }).all(callback);
      },

      each: function(callback) {
        return new exports.QuerySet({
          modelManager: this
        }).each(callback);
      },

      load: function(filter, callback) {
        exports.Model.getStorageAdaptor().load(this.modelClass, filter, callback);

        return this;
      },

      // TODO: this is still temporary
      save: function(model, callback) {
        exports.Model.getStorageAdaptor().save(model, callback);

        return this;
      },

      // TODO: allow to be called with only spec or only callback
      create: function(spec, callback) {
        var model = new this.modelClass(spec);
        model.save(function(model) {
          callback(model);
        });

        return this;
      }
    });

    /**
     * A basic implementation of a storage adaptor. This one simply
     * stores models in memory
     */
    exports.InMemoryStorageAdaptor = piewpiew.Class({
      initialize: function() {
        var models = {};

        this.getModels = function() {
          return models;
        }
      },

      save: function(model, callback) {
        var modelName = model.modelName;
        var models    = this.getModels();

        model.getProperties()['id'] = models.length;

        models[modelName] = models[modelName] || [];
        models[modelName].push(model);

        if (callback) {
          callback(model);  
        }        

        return this;
      },

      load: function(modelClass, lookups, callback) {
        console.log("load", modelClass.modelName);
        var models    = this.getModels()[modelClass.modelName] || [];

        // for now we just asynchronously return the array of models
        // of the appropriate type
        setTimeout(function() { callback(models.slice(0)); }, 100);
      }
    });

    /**
     * Object to hold all our FieldLookup functions. Keeping them here
     * avoids the overhead of each QuerySet carrying around their own copies
     * Also we could add new lookup functions very easily by adding them to
     * this object
     *
     * field__exact
     * field__iexact
     * field__contains
     * field__icontains
     * field__in
     * field__gt
     * field__gte
     * field__lt
     * field__lte 
     * field__endswith
     * field__iendswith
     * field__startswith
     * field__istartswith
     * field__regex
     */
    exports.FieldLookups = {
      field__exact: function(value, criteria) {
        console.log("field__exact", value, criteria);
        return value == criteria;
      }
    }

  
    /**
     * QuerySet class.
     */
    exports.QuerySet = piewpiew.Class({
      initialize: function(options) {
        this.results = [];
        this.operations = [];

        for(var n in options) {
          this[n] = options[n];
        }
      },

      



      /**
       *
       * field__exact
       * field__iexact
       * field__contains
       * field__icontains
       * field__in
       * field__gt
       * field__gte
       * field__lt
       * field__lte 
       * field__endswith
       * field__iendswith
       * field__startswith
       * field__istartswith
       * field__regex
       */
      filter: function(lookups) {
        this.operations.push(function(query, callback){
          console.log("filter ", lookups);
          
          var results = [];

          for(var i = 0, m = query.results.length; i < m; i++) {
            for(var l in lookups) {
              var tokens  = l.split("__");
              var getter  = "get" + tokens[0].slice(0,1).toUpperCase() + tokens[0].slice(1);
              var value   = query.results [i][getter]();

              // If the lookup was in the form field__lookup, then we'll call the relevant
              // lookup function, otherwise assume we are using "__exact"
              if ((tokens.length == 2 && exports.FieldLookups['field__' + tokens[1]](value, lookups[l])) || 
                  (tokens.length == 1 && exports.FieldLookups['field__exact'](value, lookups[l]))) 
              {
                results.push(query.results[i]);
                break;
              }               
            }
          }

          query.results = results;

          setTimeout(function() { callback(query); }, 100);
        });

        return this;
      },

      all: function(callback) {
        this.operations.push(function(query){
          callback(query.results);
        });

        var self = this;

        this.modelManager.load(this.defaultFilter, function(results) {
          self.results = results;
          self.executeQuery();
        });

        return this;
      },

      each: function(callback) {
        this.operations.push(function(query){
          for(var i = 0, m = query.results.length; i < m; i++) {
            callback(query.results[i]);
          }          
        });

        var self = this;

        this.modelManager.load(this.defaultFilter, function(results) {
          self.results = results;
          self.executeQuery();
        });

        return this;
      },

      executeQuery: function() {
        console.log("executeQuery", this);
        var f = this.operations.shift();
        var q = this;

        if (f) {
          f(this, function() {
            q.executeQuery();
          });
        }
      }
    });

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

