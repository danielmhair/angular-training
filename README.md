# Angular Training

## ng-template

### ng-template origins

`ng-template` is a wrapper about the HTML Tag `template`.

See [HTML Template Tag](https://www.w3schools.com/tags/tag_template.asp)

In short, the content within the template html tag will not show until you tell the template to show.

To do this, you would first define the template:

```html
<template>Only show when the user clicks the 'show' button</template>
```

Second, Create a button to show the content:

```html
<button onclick="showContent()">Show hidden content</button>
```

Third, Grab the template tag and tell the browser to show the template

```html
<script>
function showContent() {
  let temp = document.getElementsByTagName("template")[0];
  let clon = temp.content.cloneNode(true);
  document.body.appendChild(clon);
}
</script>
```

`ng-template` does the same thing in the background. It uses a template, and then allows you to add directives and attributes to it.

### Why use ng-template?

This allows us to reuse code. For example, lets say you want to create...
### TODO

## ng-container

### TODO

### ng-container origins

### TODO

### Why use ng-container?

### TODO

### What is the difference between ng-container and ng-template?

### TODO

## Directives

### TODO

### Origins

### TODO

### When to use it instead of a component?

### TODO

## Component

A component IS a directive, but with html and css.
