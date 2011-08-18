var PiewPiew = (function(PP){
  PP.Model = function(spec) {
    var _attributes = {};

    function _initModel(model) {
      model.set(spec.defaults || {});

      return model;
    }

    var model = PiewPiew.extend(
      new PiewPiew.PropertyManager("PiewPiew.model.events:CHANGE"), 
      //PiewPiew.Watchable(_attributes, PiewPiew.Model.events.CHANGE),
      spec || {}
    );

    return _initModel(model);
  };

  PP.Model.events = {
    CHANGE: "PiewPiew.model.events:CHANGE"
  };

  PP.Extendable(PP.Model);

  return PP;
}(PiewPiew || {}));