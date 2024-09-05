# ng-container

[Angular's Docs regarding ng-container](https://angular.dev/api/core/ng-container#)

## Why use ng-container?

The purpose of ng-container is so you can use structural directives without adding more elements to your page.

## What is the difference between ng-container and ng-template?

ng-container is a lot like ng-template. The element itself is not shown in the DOM once its rendered.

Instead, ng-container automatically renders whatever it inside its contents

For example, this angular html:

```html
<ng-container><div>I have content</div></ng-container>
```

Will end up in the browser's DOM as:

```html
<div>I have content</div>
```

## Why use ng-container then?

Sometimes you want to add a directive without affecting the resulting DOM.

For example, lets use the old `*ngIf` as an example (note, this concept is still useful when you make your own structural directives - see [structural directives](./structural-directives.md)):

```html
<div *ngIf="myValue">Show me</div>
```

In this case, the resulting DOM in the browser will render (when myValue is true):

```html
<div>Show me</div>
```

But if you use ng-container, it will only show:

```html
Show me
```

This is very helpful when you use flexbox and any other display type that relies on the structure of html.
