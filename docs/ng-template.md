# ng-template

See the [docs](https://angular.dev/api/core/ng-template#) for a basic understanding.

## ng-template origins

`ng-template` is a wrapper around the HTML Tag `template`.

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

Third, Grab the template tag and tell the browser to show the template by calling `cloneNode` and `appendChild`

```html
<script>
function showContent() {
  let temp = document.getElementsByTagName("template")[0];
  let clone = temp.content.cloneNode(true);
  document.body.appendChild(clone);
}
</script>
```

`ng-template` does the same thing in the background. It uses a template, and then allows you to add directives and attributes to it.

## Why use ng-template?

ng-template is more useful than a plain html template, because you don't need to locate the template and clone a node and append it somewhere, Angular takes care of that for you.

## ng-template Usage

`ng-template` has many uses, but it is most useful for 3 things. Click on the links to learn more about them.

- [**Reusing code within the same component**](./ng-template-docs/reusing-code-within-same-component.md): When you need to reuse code within the same component and don't need to make another component for it

- [**Show content programmatically**](./ng-template-docs/show-content-programmatically.md): When you want to show content programmatically (i.e. show a modal when a button is clicked)

- [**Pass in templates into your custom component**](./ng-template-docs/pass-templates-into-custom-component.md): When you want make your component more customizable by passing that template into the component to render in a spot
