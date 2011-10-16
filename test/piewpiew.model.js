/**
 * Tests for the PiewPiew.model class
 */
TestCase("ModelTest", {
  testChangeEvent:function() {
    var m = new PiewPiew.Model({
      name:"Tony",
      age:24
    });
    var c = {};

    m.bind(PiewPiew.Model.events.CHANGE, function(changes){
      c = changes;
    });

    m.set({
      name:"Brendan",
      age: 32
    });

    assertEquals(c.name, "Brendan");
    assertEquals(c.age, 32);
  }
});