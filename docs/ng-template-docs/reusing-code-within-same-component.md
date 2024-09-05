# Reusing code within the same component

## Relating ng-templates to other programming things**

ng-template is to html like functions are to programming. Functions are meant to be reused. With functions you can also pass in parameters and then get an output. ng-templates allow you to pass in parameters through its context, and you can render this template as many times as you'd like, just like how you can call functions as many times as you'd like.

ng-template is to html like callbacks are to NodeJS. Callbacks allowed you to pass in a function as a parameter and this way you can hide to complicated code, and make your code cleaner. ng-template are callbacks, but for html.

### Example

You have a component that is used in 2 pages. One page has 3 columns. The other page has two columns, but both have the same div. Its styling is the same. The only difference is where its displayed. In this case, we would define the ng-template, and then use `*ngTemplateOutlet` directive to instantly render that template. We will explain `ngTemplateOutlet` directive soon.

First, create the template.

Notice below, I create a variable on my ng-template with the `#mySharedTemplate`. `mySharedTemplate` can be renamed to anything you want.

Next, if its page 1, show the template in "column-3". If its page 2, show the template in "column-2".

```html

<ng-template #mySharedTemplate>
  <div class="container">My Shared HTML code</div>
</ng-template>

@if (isPage1) {
  <div class="column-1"></div>
  <div class="column-2"></div>
  <div class="column-3">
    <!-- show mySharedTemplate immediately in this spot if its page 1 -->
    <ng-container *ngTemplateOutlet="mySharedTemplate"></ng-container>
  </div>
} @else {
  <div class="column-1"></div>
  <div class="column-2">
    <!-- show mySharedTemplate immediately in this spot if its not page 1 -->
    <ng-container *ngTemplateOutlet="mySharedTemplate"></ng-container>
  </div>
}
```

However, this is a simple case. What if your ng-template needed to pass in information. For example, what if these columns were in a list. For example, if you had to repeat things columns for X items in a list. How would it know which item you are on? This is where `ngTemplateOutlet`'s context comes in.

When you want to render your content, you can pass in a `context` like so:

```html
<ng-container *ngTemplateOutlet="mySharedTemplate; context: { $implicit: myItem }"></ng-container>
```

To explain this in simple terms, lets say we want to go through a for loop

```html
@for (myItem of ['one', 'two', 'three']; track myItem) {
  <ng-container *ngTemplateOutlet="mySharedTemplate; context: { $implicit: myItem }"></ng-container>
}
```

> What is the `$implicit` property? That looks weird.

Yes, your right, it does. But this property is telling the ng-template that this is the main parameter your passing in. When we pass this into `$implicit`, you can use the let keyword in the ng-template like so:

```html
<ng-template let-myItem>{{ myItem }}</ng-template>
```

Now our ng-template has context for what its displaying. It has the variable myItem. Keep in mind that let-myItem can be renamed to anything, as long as it starts with `let-`.

In fact, this is how the old ngFor worked:

```html
<div class="my-class" *ngFor="let item of items">
  {{item}}
</div>
```

When you add the `*` to any element tag (except for ng-template), it is called a structural element. The `*` is just shorthand for and ng-template. Doing this on a div is the same things as doing this:

```html
<ng-template ngFor let-item [ngForOf]="items">
  <div class="my-class">
    {{item}}
  </div>
</ng-template>
```

So the full code would look like this in our initial example (with a for loop)

```html
<ng-template #mySharedTemplate let-myItem>
  <div class="container">My Shared HTML code with a parameter: {{ myItem }}</div>
</ng-template>

@for (item of items; track items) {
  <div class="my-container">
    @if (isPage1) {
      <div class="column-1"></div>
      <div class="column-2"></div>
      <div class="column-3">
        <!-- show mySharedTemplate immediately in this spot if its page 1 -->
        <ng-container *ngTemplateOutlet="mySharedTemplate; context: { $implicit: item }"></ng-container>
      </div>
    } @else {
      <div class="column-1"></div>
      <div class="column-2">
        <!-- show mySharedTemplate immediately in this spot if its not page 1 -->
        <ng-container *ngTemplateOutlet="mySharedTemplate; context: { $implicit: item }"></ng-container>
      </div>
    }
  </div>
}
```

Is this not enough? There is so much more to structural directives and passing context into the ngTemplateContext. See `Structural Directives (TODO)`.
