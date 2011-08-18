(function(PiewPiew){
  PiewPiew.Model = PiewPiew.Class(PiewPiew.PropertyManager, {
    initialize: function(spec) {
      PiewPiew.PropertyManager.prototype.initialize.apply(this, [PiewPiew.Model.events.CHANGE]);
      this.set(spec.defaults || {});
    }
  });

  PiewPiew.Model.events = {
    CHANGE: "PiewPiew.Model.events.CHANGE"
  };
})(PiewPiew);