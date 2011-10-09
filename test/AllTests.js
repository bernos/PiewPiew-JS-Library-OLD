TestCase("BaseTest", {
  setup: function(){
    
  },

  tearDown: function(){
      
  },

  testInitialiser: function(){
    var c = new PiewPiew.Base({
      name:"Brendan",
      age: 32
    });

    assertTrue((c.get("name") == "Brendan" && c.get("age") == 32));
  },

  testEventBinding: function(){
    var c = new PiewPiew.Base();
    var e = null;

    c.bind("TestEvent", function(data) {
      e = data;
    });

    c.trigger("TestEvent", "data");

    assertEquals(e, "data");
  }
});

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

TestCase("StringBundleTest", {
  testParser: function(){
    var b = new PiewPiew.StringBundle({
      strings: {
        myString: "Hello ${name}."
      }
    });

    assertEquals("Hello Brendan.", b.getString("myString", {name:"Brendan"}));
  }
});