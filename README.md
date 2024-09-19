# Angular Training

The purpose of this repo is to help anyone understand Angular in-depth so you can really use its power effectively and more efficiently.

This repo also has angular libraries that are exported into the @devcreate/* library (currently under development).

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
- [Communicating between sibling components](./docs/communicating-between-components.md)
- [Making services more than just a singleton for better data managment](./docs/services-per-component.md)
- [Better data management in Angular](./docs/data-management.md)

## Using Playwright for E2E Tests in the API and UI

- Using playwright to test both your API and UI in an effective way
  - **Use data-id** to select components for **consistency**
  - Use **playwright test generator** to quickly get the boilerplate
  - **Wait for network requests** to return and validate they give 200s
  - Connect to your **database** in Playwright so you can prepare and clean your test
  - Create an endpoint to log into app through POST request
  - Use playwright to test your API in a full e2e way (basically allowing you to automate a format like postman)
    - Make a POST request
    - Check its response
    - Go to the database to make sure the request finished with its proper result
