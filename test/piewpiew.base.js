/**
 * Tests for the PiewPiew.Base class
 */
TestCase("BaseTest", {

  /**
   * Tests class initialiser
   */
  testInitialiser: function(){
    var c = new PiewPiew.Base({
      name:"Brendan",
      age: 32
    });

    assertTrue((c.get("name") == "Brendan" && c.get("age") == 32));
  },

  /**
   * Tests event binding
   */
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