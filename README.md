Example
=======

A simple view
-------------

PiewPiew View objects provide a clean, lean means of encapsulating DOM 
manipulation and event handling. The PiewPiew.View() function is a factory
method that creates "generic" views. PiewPiew.View() accepts accepts a
single `options` argument, which is an object containing initialisation
options for the view object. We can create a simple view object like this:

    /**
     * Create a simple view object
     */
    var view = PiewPiew.View({
      tagname:  "div",
      id:       "my-view",
      classes:  ["noisy", "large"],
      template: "Hello World"
    });

    /**
     * Render it into the DOM
     */
    document.body.appendChild(view.render().el);

Heres a rundown of the basic options used in the above example:

* `tagname:` This determines the 'root' DOM element type of our view. This will
  default to 'div'. Specifying 'div' as in the example is not really necessary, 
  but heck, it doesn't hurt.
* `id:` This is the value of the id attribute that will be added to the root 
  DOM element of the view.
* `classes:` This is an array of extra css classes to add to the root DOM 
  element of the view
* `template:` This is the template that the view will use when being rendered.
  In our example we've used an inline string, which is pretty limited in use,
  but we'll check out how to set up templates elsewhere in our page markup, or
  even in external files later.
  





Views created this way are generally not
particularly useful as-is. We will usually create our own view types by
extending view object created by PiewPiew.View() with useful 
functionality to control the display and handle user interactions.

As an example, let's create a simple ExampleView type.

    /**
     * Create a simple view that extends PiewPiew.view
     */
    var ExampleView = PiewPiew.View.extend({
      tagname:  "div"
      id:       "ExampleView",
      classes:  ["class-one", "class-two"]
    });
    
Here we are simply creating and extending the base PiewPiew.View with some 
default property values specified. In this example we have specified

* `tagname:` This determines the 'root' DOM element type of our view. This will
  default to 'div'. Specifying 'div' as in the example is therefore not really 
  necessary, but heck, it doesn't hurt.
* `id:` This is the value of the id attribute that will be added to the root 
  DOM element of the view. In the above example we would only ever be able to
  create a single ExampleView, as each element in our DOM needs a unique id
  attribute, and our ExampleView() factory method assigns the same id value
  each time it executes. We'll look at rectifying this shortly.
* `classes:` This is an array of extra css classes to add to the root DOM 
  element of the view

Now we can create a new ExampleView by calling our custom view factory function

    var view = ExampleView();

Finally, we need to render the ExampleView, and attach it to the DOM

    document.body.appendChild(view.render().el);

Add a template to the view
--------------------------

Our ExampleView doesn't really output anything interesting. All PiewPiew view
output is generated from templates. Templates can be defined by creating a
property in our view named .template. Lets create the obligitory "Hello world"
example by extending our Example View

    /**
     * Create a simple view that extends PiewPiew.view
     */
    var ExampleView = PiewPiew.View.extend({
      tagname:  "div"
      id:       "ExampleView",
      classes:  ["class-one", "class-two"],
      template: "Hello world"
    });

    var view = ExampleView();
    document.body.appendChild(view.render().el);

Obviously, as soon as we require anything more than a trivial template string
this method of defining templates will become inadequate. In most cases it 
would be far more effective to store our template markup in exernal files and
have them loaded at runtime by our views. PiewPiew views support external
templates via the `.templateUrl` view property. All we need to do is provide
a `.templateUrl` property rather than the `.template` we just looked at. Lets 
move our Hello World example to an external template. Add the following to a new 
file named "ExampleViewTemplate.html"

    <em>Hello World!</em>

Now, update the previous example code to match the code below:

    /**
     * Create a simple view that extends PiewPiew.view
     */
    var ExampleView = PiewPiew.View.extend({
      tagname:  "div"
      id:       "ExampleView",
      classes:  ["class-one", "class-two"],
      templateUrl: "ExampleViewTemplate.html"
    });

    var view = ExampleView();
    document.body.appendChild(view.render().el);

Adding data to our templates
----------------------------

Template helpers
----------------

Can be unique to a view, or common to all views...

Templates are relatively useless without

StringBundle
============

TemplateContext and template helpers
====================================

