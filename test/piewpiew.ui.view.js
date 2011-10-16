/**
 * Test cases for PiewPiew.View class
 */
TestCase("PiewPiew.View", {
  
  /**
   * Tests that the view ID property is initialised correctly when a view is
   * created without a supplied id or el attribute 
   */
  testAutoIdInitialization: function() {
    var v1 = new PiewPiew.View();
    var v2 = new PiewPiew.View();
    
    assertEquals("Incorrect id attribute was generated for view v1", "piewpiew-view-0", v1.getId());
    assertEquals("View id and view element id attribute do not match.", "piewpiew-view-0", v1.getEl().getAttribute("id"));
    
    assertEquals("View id and view element id attribute do not match.", "piewpiew-view-1", v2.getEl().getAttribute("id"));
    assertEquals("Incorrect id attribute was generated for view v2", "piewpiew-view-1", v2.getId());
  },

  /**
   * Tests that the view initializer correctly sets the view id attribute when
   * it is supplied in the initial object spec.
   */
  testExplicitIdInitialization: function(){
    var v = new PiewPiew.View({id:"MyView"});

    assertEquals("Supplied Id was not assigned to the view.", "MyView", v.getId());
    assertEquals("Supplied Id was not assigned to DOM element", "MyView", v.getEl().getAttribute("id"));
  },

  /**
   * Test that a view instantiated with an existing DOM element is correctly
   * instantiated
   */
  testInitializationWithElement: function(){
    PiewPiew.View.resetId();

    // First el will have an explicit id attribute
    var el = document.createElement("div");
        el.setAttribute("id","view-0");
    
    var v = new PiewPiew.View({el:el});

    assertEquals("view-0", v.getId());

    // Next, no id on the el
    var el = document.createElement("div");
    var v  = new PiewPiew.View({el:el});

    assertEquals("piewpiew-view-0", v.getId());
        

  },

  testElIsReadOnly: function() {
    var v = new PiewPiew.View();
    assertException(function(){
      v.set("el", document.createElement("div"));
    });
  },

  testGetTagname: function() {
    var v = new PiewPiew.View();
    assertEquals("div", v.getTagname());

    var v = new PiewPiew.View({tagname:"ul"});
    assertEquals("ul", v.getTagname());
  },

  testClasses: function(){
    var v = new PiewPiew.View({classes: ["button", "red"]});
    assertEquals(["button", "red"], v.getClasses());

    var a = v.getClasses();
    a.push("up");
    v.setClasses(a);
    assertEquals(["button", "red", "up"], v.getClasses());
  },

  testInitClasses: function(){
    var e = document.createElement("div");
    e.setAttribute("class", "button red");
    var v = new PiewPiew.View({
      el:e,
      classes: ["up"]
    });

    assertEquals(["button", "red", "up"], v.getClasses());
  }


});