# Structural Directives

## Docs

Before going advanced, learn about structural directives. They are the stepping stone to creating beautiful, customizable components that end up speeding up your development game.

- [Angular's Docs about structural directives](https://angular.dev/guide/directives/structural-directives)

## Advanced Structural Directives: Angular Material Table

Using multiple structural directives to manage multiple templates can get complex, but in the end, they have basic principles.

First, lets look at how the Material table is used:

```html
<table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
  <!-- Define the header and cell rows -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>

  <!-- Name Column -->
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef> Name </th>
    <td mat-cell *matCellDef="let element"> {{element.name}} </td>
  </ng-container>
</table>
```

In this, we have a directive that manages everything called `mat-table`.
Then we have the following helper directives:

- `mat-header-row`, `mat-row`, and `mat-footer-row`
  - Used to help us define which rows are headers and which rows are for non-headers.

- `matHeaderRowDef`, `matRowDef` and `matFooterRowDef` which are structural directives that asks for columns
  - Each of these definition directives will manage the columns it renders.
    - This is helpful because footer rows may span multiple columns. See [Footer Rows](https://material.angular.io/components/table/overview#footer-row) to learn more.

- `mat-header-cell`, `mat-cell` and `mat-footer-cell`
  - Tables generally define a column by its header and its cell, but sometimes your table may not have a header. In this case, you just don't define the mat-header-row tr element.
  - mat-header-cell is just defining the header of one column defined in `matHeaderCellDef`
  - mat-cell is just defining one cell on a certain row of one column defined in `matCellDef`
  - mat-footer-cell is just defining one footer cell on a certain row of the columns defined in `matFooterCellDef`

### Creating mat-table from scratch

First we define the mat-table. We need to gather up all the trs that our consumer has defined, as well as all the matColumn definitions.

```typescript
@Directive({ selector: 'mat-table' })
export class MatTableDirective {
  ...
}
```

In our case, we have 3 types of trs. matHeaderRowDef, matRowDef and matFooterRowDef. This will help us define the table rows like so:

```typescript
  @ContentChild(MatHeaderRowDefDirective) public headerRow: MatHeaderRowDefDirective
  @ContentChild(MatRowDefDirective) public row: MatRowDefDirective
  @ContentChild(MatFooterRowDefDirective) public footerRow: MatFooterRowDefDirective
```

#### Word of Caution

We will be focusing on advanced topics from here on out. Make sure your ready.

This is the perfect example of using directives without html to make angular feel more natural. Angular material tries to use html elements more than its own custom components.

Notice how material uses directives more than components. Why? Because they want to keep using normal html elements like the `button` element and `table` element. And instead, directives just add to its functionality. They do this because browsers work best with normal elements, so styling and functionality are similar and work better.

```html
<button mat-button></button>
<table mat-table></table>
<!-- etc -->
```

Because material does this, they need to ONLY use directives (not components that use html). This is why we are explaining this in the advanced section. Its a lot more dynamic and programmatic and we avoid using html at all. But we do this so its easier and more dynamic for the consumer using this directive.

Before continuing, make sure you understand [showing content programmatically](./ng-template-docs/show-content-programmatically.md). Otherwise, you will get lost.

### Creating the initial Definition Directives

We are going to create the boilerplates for each directive so they can be used as a structural directive.

Remember, each row definition requires columns. Here is the html again:

```html
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  <tr mat-footer-row *matFooterRowDef="let row; columns: displayedColumns;"></tr>
```

Notice Header row passes in columns directly, so we need columns defined as an input that is the same name as the directive name. I'm using an alias so I can name the variable `columns`, so I'm putting `'matHeaderRowDef'` as the name we use when we give the input.

Also, we have set viewContainerRef as public so that we can access these in the mat-table directive.

```typescript
@Directive({ selector: 'matHeaderRowDef' })
export class MatHeaderRowDefDirective {
  @Input('matHeaderRowDef') public columns: string[] = []

  constructor(
    public templateRef: TemplateRef,
    public viewContainerRef: ViewContainerRef
  ) {}
}
```

The footer and row need information for each row since it will show each cell. So that means it will use context for the `let` variable when we render the content, and we have `columns` as an input, but we must name it with the selector name. See the input below

```typescript
@Directive({ selector: 'matFooterRowDef' })
export class MatFooterRowDefDirective {
    @Input("matFooterRowDefColumns") public columns: string[] = []
    constructor(
        public templateRef: TemplateRef,
        public viewContainerRef: ViewContainerRef
    ) {}
}
```

Same for the row definition.

```typescript
@Directive({ selector: 'matRowDef' })
export class MatRowDefDirective {
  // This shows
  @Input("matRowDefColumns") public columns: string[] = []

  constructor(
    public templateRef: TemplateRef,
    public viewContainerRef: ViewContainerRef
  ) {}
}
```

For now, we will not render these directives. These are boilerplate.

Now to go back to the `mat-table` directive. We have the 3 content child variables defined:

```typescript
 @Directive({ selector: 'mat-table' })
export class MatTableDirective {
  @ContentChild(MatHeaderRowDefDirective) public headerRow: MatHeaderRowDefDirective
  @ContentChild(MatRowDefDirective) public row: MatRowDefDirective
  @ContentChild(MatFooterRowDefDirective) public footerRow: MatFooterRowDefDirective

  public ngOnInit() {
    // TODO: Now we can render the footer, cells and headers accordingly
  }
}
```

In order to render each cell, we need to find each column defined.

As a reminder, when we use the mat-table, we define columns like so:

```html
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef> Name </th>
    <td mat-cell *matCellDef="let element"> {{element.name}} </td>
  </ng-container>
```

### Creating the MatColumnDefDirective and associated structural directives

Before moving forward, we need to define the matColumnDef and its child content (matHeaderCellDef and matCellDef).

TODO
