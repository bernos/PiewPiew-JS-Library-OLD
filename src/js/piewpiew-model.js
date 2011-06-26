var PiewPiew = (function(PP){
  PP.Model = function(spec) {
    var _attributes = {};

    function _initModel(model) {
      // The model may have been created with custom attributes. If this is the
      // case these attributes need to be passed to model.set()
      if (model.attributes) {
        model.set(model.attributes);
        model.attributes = null;
      }

      return model;
    }

    var model = PiewPiew.extend(
      {}, 
      PiewPiew.EventDispatcher(), 
      PiewPiew.Watchable(_attributes, PiewPiew.Model.events.CHANGE),
      spec || {}
    );

    return _initModel(model);
  };

  PP.Model.extend = function(spec) {
    return function(options) {
      return PiewPiew.Model(PiewPiew.extend({}, spec, options));
    }
  };

  PP.Model.events = {
    CHANGE: "PiewPiew.model.events:CHANGE"
  };

  return PP;
}(PiewPiew || {}));