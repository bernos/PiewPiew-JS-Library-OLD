(function(global){

  var moduleId = "piewpiew.data.list";
  var requires = ["exports", "piewpiew", "piewpiew.Base"];

  var module = function(exports, piewpiew, base) {
    // LOCAL VARS ////////////////////////////////////////////////////////////////

    // HELPER FUNCTIONS //////////////////////////////////////////////////////////

    // MODULE DEFS ///////////////////////////////////////////////////////////////

    // CLASS DEFS ////////////////////////////////////////////////////////////////

    exports.List = piewpiew.Class(base.Base, {
    
      // PUBLIC PROPERTIES ///////////////////////////////////////////////////////

      // PRIVATE PROPERTIES ///////////////////////////////////////////////////////
        
      // GETTERS AND SETTERS /////////////////////////////////////////////////////  
    
      // PUBLIC METHODS //////////////////////////////////////////////////////////
      initialize: function(items) {
        this._items = items || [];
        base.Base.prototype.initialize.apply(this, [items]);
      },
      
      length: function() {
        return this._items.length;
      },

      each: function(callback) {
        for (var i = 0; i < this.length; i++) {
          callback(this.item(i));
        }
        return this;
      },

      item: function(index) {
        return this._items[index];
      },

      addItem: function(item, index) {
        return this.addItems([item], index);
      },

      removeItem: function(item) {
        return this.removeItems([item]);
      },

      removeItemAt: function(index) {
        if (index < this.length()) {
          this._items.splice(index, 1);
        }
        return this;
      },

      addItems: function(items, index) {
        if (null == index) {
          index = this.length();
        }
        for(var i = 0, m = items.length; i < m; i++) {
          this._items[index + i] = items[i];
        }
        return this;
      },

      removeItems: function(items) {
        for (var i = 0, im = items.length; i < im; i++) {
          for (var j = this._items.length - 1; j > -1; j--) {
            if (this._items[j] == items[i]) {
              this._items.splice(j,1);
              break;
            }
          }
        }
        return this;
      },

      indexOf: function(item) {
        for (var i = 0, m = this._items.length; i < m; i++) {
          if (item = this._items[i]) {
            return i;
          }
        }
        return -1;
      }
      // PRIVATE METHODS /////////////////////////////////////////////////////////
    
    });
  };
  
  global.piewpiew.define(moduleId, requires, module);

})(typeof window === 'undefined' ? this : window);