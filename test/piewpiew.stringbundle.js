/**
 * Tests for the PiewPiew.StringBundle class
 */
TestCase("StringBundleTest", {
  
  /**
   * Test the parser works correctly
   */
  testParser: function(){
    var b = new PiewPiew.StringBundle({
      strings: {
        myString: "Hello ${name}."
      }
    });

    assertEquals("Hello Brendan.", b.getString("myString", {name:"Brendan"}));
  }
});