# ng-content

Using ng-content is simple. This is Angular's most basic way to project content into a custom component.

For detailed information about how to use this, see the following:

- [Using ng-content in a component](https://angular.dev/guide/components/content-projection#)
- [Using multiple ng-content placeholders in a component](https://angular.dev/guide/components/content-projection#multiple-content-placeholders)

In short, ng-content lets you do the following:

```html
<my-component>
  This content will be put where ng-content is put in the component
</my-component>
```

In the docs linked above, it explains how you can do the following:

```html
<custom-card>
  <card-title>Hello</card-title>
  <card-body>Welcome to the example</card-body>
</custom-card>
```

By doing this:

```html
<div class="card-shadow">
  <ng-content select="card-title"></ng-content>
  <div class="card-divider"></div>
  <ng-content select="card-body"></ng-content>
</div>
```

Something important to know is that you can use any selector. A class, an attribute, etc. I really like to use directives in this case, like so:

1. Create the directive:

```js
@Directive({ selector: 'myCustomCardItem' })
export class MyCustomCardItemDirective {}
```

1. Use that directive in the select attribute of ng-content.

```html
<div class="card-shadow">
  <ng-content select="[myCustomCardItem]"></ng-content>
</div>
```

1. This is the component ts file

```typescript
@Component({ selector: 'custom-card', ... })
public class CustomCardComponent {}
```

1. However, if you need multiple ng-contents for this component, then you can use an input with the same name as your selector to have custom props.

```typescript
@Directive({ selector: 'myCustomCardItem' })
export class MyCustomCardItemDirective {
  @Input() public myCustomCardItem: string
}
```

Then your html would look like:

```html
<div class="card-shadow">
  <ng-content select="[myCustomCardItem=title]"></ng-content>
  <div class="card-divider"></div>
  <ng-content select="[myCustomCardItem=body]"></ng-content>
</div>
```

With this, you can use this component like so:

```html
<custom-card>
  <div myCustomCardItem="title"></div>
  <div myCustomCardItem="body"></div>
</custom-card>
```

In this case, it doesn't matter if you have the element as a `div`, `ng-container`, `ng-template` or any other element. It will work as long as the directive myCustomCard item is there, and it has the right string.

In fact, this is how you could make a similar component that PrimeNG uses for their table with `ng-template`. Note that they could either use ng-content or @ContentChild (discussed in the next heading):

```html
<p-table [value]="products">
    <ng-template pTemplate="header">
        ...
    </ng-template>
    <ng-template pTemplate="body" let-product>
        ...
    </ng-template>
</p-table>
```

However, there directive is a **structural directive**, which we haven't fully covered, though you can see they use a template context. To understand how to do it like this component, see: [Structural Directives](./structural-directives.md).
