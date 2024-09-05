# Better data management in Angular

If you notice, there is always a pattern when working with data in the UI.

1. Go to the server to get some list of data
1. Transform that list of data or get more data from the data, based on the first list
1. Display that data in a grid, list, table or panels

Whether or not you use a grid, list, table or panels, it is always the same way you get the data.

Instead of reinventing the wheel for every table, list or grid, lets create a reusable service that you extend whenever you need to go to the server.

Before continuing, it is important to know that if its a very basic list, like getting a list of options for a select element, then no need to use this service we will build. Using httpClient is sometimes good enough like so:

TODO

```html

```

## Using component-level services to manage data in a table-like structure

