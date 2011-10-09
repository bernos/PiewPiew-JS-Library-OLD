(function(PiewPiew){
  PiewPiew.Model = PiewPiew.Class(PiewPiew.Base, {
    handleChanges: function(changes){
      this.trigger(PiewPiew.Model.events.CHANGE, changes);
      return this;
    }
  });

  PiewPiew.Model.events = {
    CHANGE: "PiewPiew.Model.events.CHANGE"
  };
})(PiewPiew);