# Pass in templates into your custom component

If you need to render a block of html in your custom component, but want the consumer of your component to decide the look of that block, then you have a few options. Render your custom html by:

1. [Using ng-content](../ng-content.md)
1. Use @ContentChild and a structural directive to retrieve your ng-template
1. Passing in an ng-template as an input into your component

## Use @ContentChild and a structural directive to retrieve your ng-template

Before going into this, see [Structural Directives](./structural-directives.md). This heading assumes you know what structural directives are.

This path is VERY similar to ng-content where you organize each custom piece of your component with directives like so:

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

However, using @ContentChild and structural directives, it gives you more flexibility.

With this path, you can:

1. Let the user ignore an item. For example, they could choose to not add the `<ng-template pTemplate="body">` and we can hide that are of the component if needed.
1. Content the rendering of ng-template with `ViewContainerRef`
1. Pass in context so you can use `let-product`

If you want to define something like a table component that is easy to use, you don't want `ng-content`, but instead this path.

First lets define how we want to use this new component:

```html
<my-custom-table [value]="arr">
  <ng-template pTemplateHeader></ng-template>
  <ng-template pTemplateBody let-item></ng-template>
</my-custom-table>
```

Note that this is how you define it if you want to use ng-template. You can also use ng-container and it will give you the same result. ng-container would look like this:

```html
<my-custom-table [value]="arr">
  <ng-container *pTemplateHeader></ng-container>
  <ng-container *pTemplateBody="let item"></ng-container>
</my-custom-table>
```

With this setup, it tells us that we have one component `my-custom-table` and two directives: `pTemplateHeader` and `pTemplateBody`, and since both templates are on a template, we will need to define a structural directive.

Here are both directives. Note that the constructor is how we turn a normal directive into a structural one; by defining the TemplateRef and the ViewContainerRef is there in case we want to programmatically render the template. In our case, we will use ngTemplateOutlet to render it, so we won't programmatically do it. If we were making an ngIf directive where its conditionally shown, then we would want to use ViewContainerRef.

Also notice that we have templateRef as a public property since we will be using it in our component's html.

```typescript
@Directive({ selector: 'pTemplateHeader' })
export class PTemplateHeaderDirective {
  constructor(
    public templateRef: TemplateRef,
    private ViewContainerRef: ViewContainerRef
  ) {}
}

@Directive({ selector: 'pTemplateBody' })
export class PTemplateBodyDirective {
  constructor(
    public templateRef: TemplateRef,
    private ViewContainerRef: ViewContainerRef
  ) {}
}
```

The last thing to implement is the table component. Since the pTemplateHeader and pTemplateBody are defined by the consumer in the content of our component tag, we will need to query it as Content. Since we only need to grab one header and one body template, we will use ContentChild. If you define more than one header or body, we would need to use ContentChildren. For us, we will use ContentChild.

```typescript
@Component({ selector: 'my-custom-table' })
export class MyCustomTableComponent {
  @ContentChild(PTemplateHeaderDirective) public header: PTemplateHeaderDirective
  @ContentChild(PTemplateBodyDirective) public body: PTemplateBodyDirective
}
```

Now we use the two variables `header` and `body` in the html:

```html
<table>
  <thead>
    <ng-container *ngTemplateOutlet="header.templateRef"></ng-container>
  </thead>

  <tbody>
    <ng-container *ngTemplateOutlet="body.templateRef; context: { $implicit: value }"></ng-container>
  </tbody>
</table>
```

For this explanation, I have implemented it like PrimeNG would have. To understand how to implement it like Material's table (which makes it easy to work with), see [Angular Material Table](./advanced-structural-directives.md)

## Passing in an ng-template as an input into your component

In this case, you define a template and pass it in through an input and then use `ngTemplateOutlet` to render it in your custom component.

Probably the only time I would use this is if I need to pass this template into multiple components in the same component.

For example

```html
<ng-template #myButton>
  <button mat-button>My Button</button>
</ng-template>

<my-custom-component [buttonTemplate]="myButton"></my-custom-component>

<another-component [myButtonTemplate]="myButton"></another-component>
```

Then in `my-custom-component` ts file, we define the Input

```js
@Component({ selector: 'my-custom-component' })
public class MyCustomComponent {
  @Input() public buttonTemplate: TemplateRef<any>
}
```

And use the input in the html of that component

```html
<div class="buttons-container">
  <ng-container *ngTemplateOutlet="buttonTemplate"></ng-container>
</div>
```
