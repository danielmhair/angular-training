# Angular Training

The purpose of this training is to help anyone understand Angular in-depth so you can really use its power effectively and more efficiently.

If you want to utilize Angular at its fullest, first understand the basics, then the advanced basics.

However, keep in mind that this training is a lot more thorough. It will go into the origins of these, and explain why they are needed in the first place.

## The Basics

First and formost, take time to understand the basics. Angular's new tutorial playground is very helpful.

- Getting Started
  - https://angular.dev/tutorials

- In-depth Guides
  - https://angular.dev/overview

- Additional tidbits I have found useful over the years
  - [Injection Tokens to configure reusable components](https://angular.dev/guide/di/dependency-injection-providers#using-an-injectiontoken-object)
  - Turning a pipe into a service for code reuse
  - Use Observables, Subjects, and BehaviorSubjects - Use takeUntilDestroyed() operator (v16+)
  - Use directives more than components
  - View Queries: ViewChild and ViewChildren
  - Content Queries: ContentChild and Content Children
  - Use Host controls to clean your component: HostListener, HostBinding

## Advanced Concepts

- [ng-template](./docs/ng-template.md)
- [ng-container](./docs/ng-container.md)
- [ng-content](./docs/ng-content.md)
- [Structural Directives](./docs/structural-directives.md)

### Communicating between sibling components - Panels that close if another opens

TODO

### Overriding Services in Components and Modules

If Singletons are not enough for a service

TODO

### Better data management in Angular

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

#### Using component-level services to manage data in a table

TODO
