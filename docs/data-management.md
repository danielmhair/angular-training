# Better data management in Angular

When working with data in Angular, the purpose for that data ends up showing in a list of some kind. You then display that data in either a table, list, grid or some other component. This document shows how you can easily implement a data source to manage your data. Its purpose is to work off of the ideas that Angular Material shows through its `MatTableDataSource` class, but takes it a step further.

Before building this DataSource, we need to understand the use cases for it.

1. We need to get the data from an API
1. Sometimes after we get that data, we may need to get more data from the server, or transform it
1. The data is usually displayed in a grid, list, table or panels, so we want a consistent workflow for all these types of components
1. We want to display this with Angular Material, their CDK Infinite Scroller or any ngFor loop so that our retrieval of data is ALWAYS consistent
1. Instead of reinventing the wheel for every table, list or grid, lets create a reusable class that you extend whenever you need to go to the server.

# Usage

Imagine you want to display data from your API using an Angular Material table.
After understanding this document, you will be able to do it with a few simple steps:

1. Get your data from a relative path
   
```typescript

@Injectable()
export class ResourcesDataSource extends BaseApiDataSource<Resource> {
  public relativePath: string = '/api/resources'
  public allowLocalFilter = true

  constructor(http: HttpClient, userService: UserService) {
    super(http, userService);
    this.params.type = 'random'
  }
}
```

1. Inject your DataSource service into your component

```typescript
@Component({
  providers: [ResourcesDataSource],
})
export class ResourcesPageComponent implements OnInit {
    constructor(private dataSource: ResourcesDataSource) {}
}
```

1. Display your data in the table

```html
<table mat-table [dataSource]="dataSource">
  ...
</table>
```


# Implementing it

Before continuing, it is important to remember to not overcomplicate a solution. There are 3 ways to implement what you need if you just need an array that is used, or want local searching, paging or sorting:
- [Just use an observable or a promise](#dont-overcomplicate-solutions-if-needed).
- Use MatTableDataSource which already allows for sorting and filtering in a local array. See this [example](https://material.angular.io/components/table/overview#table-pagination)


## Supporting `MatTableDataSource` from an API

To quote [Advanced Data Source usage](https://material.angular.io/components/table/overview#advanced-data-sources) from Material:

> For most real-world applications, providing the table a DataSource instance will be the best way to manage data. The DataSource is meant to serve as a place to encapsulate any sorting, filtering, pagination, and data retrieval logic specific to the application.
>
> A DataSource is simply a class that has at a minimum the following methods: connect and disconnect. The connect method will be called by the table to provide an Observable that emits the data array that should be rendered. The table will call disconnect when the table is destroyed, which may be the right time to clean up any subscriptions that may have been registered in the connect method.
>
> Although Angular Material provides a ready-made table DataSource class, MatTableDataSource, you may want to create your own custom DataSource class for more complex use cases. This can be done by extending the abstract DataSource class with a custom DataSource class that then implements the connect and disconnect methods. For use cases where the custom DataSource must also inherit functionality by extending a different base class, the DataSource base class can be implemented instead (MyCustomDataSource extends SomeOtherBaseClass implements DataSource) to respect Typescript's restriction to only implement one base class.

Understanding both [`MatTableDataSource`](https://github.com/angular/components/blob/main/src/material/table/table-data-source.ts) and `DataSource`, since they both are `DataSource`. We will use `connect` and `disconnect` in our implementation.

For better understanding of the DataSource, feel free to go through this [Angular University blog post](https://blog.angular-university.io/angular-material-data-table/#breaking-down-the-design-of-an-angular-cdk-data-source).

In our case, we will have 3 different `DataSource` classes:

- `BaseDataSource` - `MatTableDataSource` is really nice and most of the BaseDataSource functionality comes from this data source. **However**, the data source is meant to be easily overridable for all your table needs. Sadly, MatTableDataSource is basic.
- `BaseApiDataSource` - This will handle all your API calls, and will add sorting, paging, filtering and searching to the API call. It extends `BaseDataSource`. This requires a consistent way of paging, searching, sorting and filtering.
- `BaseApiInfiniteScrollDataSource` - This allows you to use the `*cdkVirtualFor` and `cdk-virtual-scroll-viewport` for infinite scrolling

## BaseDataSource

We first want to implement the `DataSource` so we can use mat-table and other components in Material that supports it (including infinite scrolling too).

### Connect and Disconnect methods

This requires us to implement the `connect` and `disconnect` methods.

```typescript
export abstract class BaseApiDataSource implements DataSource {
    public data$ = new BehaviorSubject<any[]>([])

    public connect(collectionViewer: CollectionViewer): Observable<readonly any[]> {
        return this.data$.asObservable()
    }

    public disconnect(collectionViewer: CollectionViewer): void {
        this.data$.complete()
    }
}
```

The `connect` method is called when mat-table is initialized. It expects an observable to be returned. In our case, we
return the `data$` as an observable.

The `disconnect` method is called when mat-table is destroyed. In this case, we need to complete the `data$` observable so that it doesn't keep subscribing. This is important to prevent memory leaks.

### `data$` class member
For our data source, we need a way to manage the data. We will use a [BehaviorSubject](https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject)
to manage the data for multiple reasons:
1. To work nicely with Material's `DataSource`
2. To manage the data easier through the `async` pipe when we use the data source in other places.
3. You can also extend the observable through pipes to manage local filtering.

Why use `BehaviorSubject` instead of an `Observable`. `Observable objects cannot view previously emitted values, but
`BehaviorSubject does.

For all observable-like values, we add `$` to the end of the variable name. So we have added the `data$` variable to
manage our array of data.

### Ensure typing with generics

We want to ensure typing is in place for our data, so we will use generics.

```typescript
export abstract class BaseDataSource<GetDataItemsT, TransformedDataItemsT = GetDataItemsT> {
    public data$ = new BehaviorSubject<TransformedDataItemsT[]>([])

    public connect(collectionViewer: CollectionViewer): Observable<readonly TransformedDataItemsT[]> {
        return this.data$.asObservable()
    }

    public disconnect(collectionViewer: CollectionViewer): void {
        this.data$.complete()
    }
}
```

Notice that we have two types `GetDataItemsT` and `TransformedDataItemsT`. This allows us to have a type for the server
data and a type for the transformed data. The end type will always be `TransformedDataItemsT`, and its default is
`GetDataItemsT` if the server data is the same as the transformed data. But its crucial to have both.

### The `initialize` method

We need a way to initialize the data when we use it in a component like so:

```typescript
@Component({..., providers: [MyDataSource]})
export class MyComponent {
    constructor(public dataSource: MyDataSource) {

    }

    public async ngOnInit() {
        await this.dataSource.initialize()
    }
}
```

This `initialize` method will:
1. Set the `loading$` to true so we can show a loading spinner when our data is loading. This will be a BehaviorSubject.
2. Initialize the data through 2 methods called within `initializeData`:
    1. `retrieveDataItems` - Get the data from the server
    2. `transformDataItems` - Transform the data if we need to
3. Set the `loading$` to false when the data is done loading to hide the loading spinner.

```typescript
  export abstract class BaseDataSource /* ... */ {
    public initialized = false
    public loading$ = new BehaviorSubject(false)

    public async initialize() {
        this.initialized = true
        try {
            this.loading$.next(true)
            await this.initializeData()
        } finally {
            this.loading$.next(false)
        }
    }

    public abstract retrieveDataItems(paramOverrides?: any): Promise<GetDataItemsT[]>
    public async transformDataItems(data: GetDataItemsT[]): Promise<TransformedDataItemsT[]> {
        return data
    }

    public async initializeData(): Promise<TransformedDataItemsT[]> {
        const transformedData = await this.retrieveFinalData()
        this.data$.next(transformedData)
        return transformedData
    }

    public async retrieveFinalData(paramOverrides?: any): Promise<TransformedDataItemsT[]> {
        const pagedDataItems = await this.retrieveDataItems(paramOverrides)
        return await this.transformDataItems(pagedDataItems)
    }

    // Add to disconnect method
    public disconnect(collectionViewer: CollectionViewer): void {
        // ...
        this.loading$.complete()
    }
}
```

You might notice we have multiple functions here:
1. `initializeData` - retrieves the data then sets `data$` to the results.
2. `retrieveFinalData` - retrieves the data and transforms the data.
    - You may question why we have 2 functions. The reason is that we want to separate the concerns of retrieval/transformation and setting the data. This allows us to easily override these methods in our other data sources.
3. `retrieveDataItems` - This is the method that you will implement to get the data.
4. `transformDataItems` - This is the method that you will override to transform the data if you need to.

### `reset` and `refresh` methods

Reset is meant to clean the data for the data.
Refresh is meant to get the data from the server again, and refresh the data

```typescript
export abstract class BaseDataSource/* ... */ {
    public reset() {
        this.data$.next([])
    }

    public async refresh(): Promise<FinalDataItemsT> {
        this.loading.next(true)
        const results = await this.initializeData()
        this.loading.next(false)
        return results
    }
}
```

### Allow local filtering

If you want to allow local filtering, we need to support a `filter$` observable and a `filteredData$` observable.

The filter$ is a string that will trigger the data to filter based on that string. The `filteredData$` will come begin
from the `data$` you already have, and continuously filter it based on the `filter$` string.

So we first initialize the filtering by listening to the `filter$` observable and then feed that, and the `data$` into
an observable called `filteredData$`.

```typescript
export abstract class BaseDataSource /* ... */ {
    public abstract allowLocalFilter: boolean
    public filter$ = new BehaviorSubject<string>("")
    public filteredData$: Observable<FinalDataItemsT[]>

    constructor() {
        this.initializeFiltering()
    }

    public initializeFiltering() {
        // Whenever the filter$ or data$ changes, we want to filter the data
        const dataOrFilterChanges$ = this.filter$.pipe(
            mergeWith(this.data$),
            switchMap(() => of({data: this.data$.value, filterValue: this.filter$.value}))
        )

        // Whenever the data or filter changes, filter that data and return the resulting array
        this.filteredData$ = dataOrFilterChanges$.pipe(
            switchMap(({data, filterValue}) => {
                if (!filterValue || !this.allowLocalFilter) {
                    return of(data)
                }
                // The actual filtering happens here
                return of(data.filter(item => item && this.filterPredicate(item, filterValue)))
            })
        )
    }

    /**
     * Adapted from Angular Material's MatTableDataSource but allows overriding changing each property you filter to a string so that filtering can be customized.
     * See: https://github.com/angular/components/blob/04ce4d2648004e970bc864962e6ec12e92f27698/src/material/table/table-data-source.ts#L231
     */
    protected filterPredicate(data: FinalDataItemsT, filter: string): boolean {
        // Transform the data into a lowercase string of all property values.
        const dataStr = Object.keys(data)
            .reduce((currentTerm: string, key: string) => {
                // Use an obscure Unicode character to delimit the words in the concatenated string.
                // This avoids matches where the values of two columns combined will match the user's query
                // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                // that has a very low chance of being typed in by somebody in a text field. This one in
                // particular is "White up-pointing triangle with dot" from
                // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                const nextValue = data[key]
                return currentTerm + this.propToString(key as keyof FinalDataItemsT, nextValue) + '◬';
            }, '')
            .toLowerCase();

        // Transform the filter by converting it to lowercase and removing whitespace.
        const transformedFilter = filter.trim().toLowerCase();

        return dataStr.indexOf(transformedFilter) != -1;
    }
}
```

### Paging and Sorting

TODO


### Final Solution

This is the end solution: [base.data-source.ts](../app/projects/data-sources/src/lib/base.data-source.ts)

This is a library that can be used with @devcrate/data-sources. It is a library that can be used to manage data in a
table-like structure. See [Using these data sources in your application](#using-these-data-sources-in-your-application).

## BaseApiDataSource

### Our End Goal

This is a data source that makes it easier to get data from the server complete with paging, sorting, filtering, 
searching, and local filtering. It extends the `BaseDataSource`.

Our end goal is to have a base api data source like this:

```typescript
export class MyDataSource extends BaseApiDataSource<MyData> {
    public relativePath = '/api/my-data'
    public allowLocalFilter = true
   
    constructor(http: HttpClient) { super(http) }
}
```

We also want the ability to change the data we get from the server.

Lets say we have a data structure from the server like this:

```typescript
export interface MyData {
    id: number
    name: string
    description: string
}
```

But our component requires the data to add an included prop like so:
```typescript
export interface MyDataView extends MyData {
    itemNo: number
}
```

This is easy, just override the `transformDataItems` method and the second generic type.


```typescript
// Add MyDataView as the second generic type
export class MyDataSource extends BaseApiDataSource<MyData, MyDataView> {
    // ...
    
    public async transformDataItems(data: MyData[]): Promise<MyData[]> {
        return data.map((item, index) => {
            return {
                ...item,
                itemNo: index + 1,
            }
        })
    }
}
```

Finally, we want to get more data from the server once we get the list of data before giving it to our table. This is 
also easy!

```typescript
export class MyDataSource extends BaseApiDataSource<MyData, MyDataView> {
    // ...
    
    public async transformDataItems(data: MyData[]): Promise<MyData[]> {
        const itemNos = this.http.get<number[]>('/api/item-nos', {
            params: { ids: data.map(item => item.id) }
        })
        
        return data.map((item, index) => {
            const itemNo = itemNos[index]
            if (!itemNo) { return item }
            item.itemNo = itemNo
            return item
        })
    }
}
```

### Implementing the BaseApiDataSource

To implement this, we will do the following:

1. Extend the `BaseDataSource`
2. Use the `HttpClient` to get the data from the server. 
3. Define a `relativePath` which will make a `GET` request to that endpoint with the same domain as the app.
4. Allow overriding a `params` object to easily add paging, sorting, and other params to the `GET` request. 
5. Add another generic to allow typing to allowed params.
6. Override the `retrieveDataItems` to get the data from the server.
7. (Optional) Though it's not required, we added the ability to get the total count of the data if it's a paged amount of data.


```typescript
export abstract class ApiBaseDataSource<
  GetDataItemsT, FinalDataItemsT = GetDataItemsT, AllowedParamsT = any
> extends BaseDataSource<GetDataItemsT, FinalDataItemsT> {
   public abstract relativePath: string
   public params: Partial<AllowedParamsT> = {}

   protected constructor(protected httpClient: HttpClient) { super() }

  public async retrieveDataItems(overrideParams: any = null): Promise<GetDataItemsT[]> {
    const response = await firstValueFrom(this.httpClient.get<GetDataItemsT[]>(this.relativePath, {
        params: overrideParams || this.params as any,
        observe: 'response',
    }))

    return response.body
  }
}
```

Since we extend the `BaseDataSource`, it's really simple to make an Api version of this.

### Final Solution

This is the end solution: [api-base.data-source.ts](../app/projects/data-sources/src/lib/api-base.data-source.ts)

This is a library that can be used with @devcrate/data-sources. It is a library that can be used to manage data in a
table-like structure. See [Using these data sources in your application](#using-these-data-sources-in-your-application).

## Using these data sources in your application

```bash
npm i @devcrate/data-sources
```

Create your DataSource:

```typescript
import {BaseDataSource} from '@devcrate/data-sources'

export class MyDataSource extends BaseApiDataSource<MyData> {
    public relativePath = '/api/my-data'
    public allowLocalFilter = true
   
    constructor(http: HttpClient) {
        super(http)
    }

    public async retrieveDataItems(paramOverrides?: any): Promise<MyData[]> {
        return this.myService.getData(paramOverrides)
    }

    public async transformDataItems(data: MyData[]): Promise<MyData[]> {
        return data.map(item => {
            return {
                ...item,
                // Transform the data here
            }
        })
    }
}
```

Add the data source service into your component

```typescript
import { MyDataSource } from '../my.data-source'
@Component({
    // ...
    providers: [MyDataSource]
})
export class MyComponent {
    constructor(public dataSource: MyDataSource) {}
}
```

Then use the data source in multiple ways:

1. In mat-table:
```html
<mat-progress-bar *ngIf="dataSource.loading$ | async; else loading"></mat-progress-bar>
<table mat-table [dataSource]="dataSource">
    <!-- ... -->
</table>
```

2. In a for loop:
```html
<mat-progress-bar *ngIf="dataSource.loading$ | async; else loading"></mat-progress-bar>
<div *ngFor="let item of dataSource.data$ | async">
    <!-- ... -->
</div>
```

## BaseApiInfiniteScrollDataSource

This extends the BaseApiDataSource to allow the same functionality in a virtual, infinite scroller.

TODO

## Using component-level services to manage data in a table-like structure

Services are generally singletons for the entire application, meaning that if you inject it into two different classes, it will remain the same class instance across both. However, there are many times that you may reuse the these services to manage data in the UI. For this reason, I suggest that you provide the service at a component-level.

For example, if you had a service class called `MyData`, then in the component definition that you want to use it, add it to the component definition like so:

```typescript
@Component({
    // ...
    providers: [MyData]
})
export class MyComponent {
    constructor(public myData: MyData) {}
}
```

Doing this allows you to ensure that you have a separate service that other components won't get. Its basically a singleton for that specific component, but anywhere else will have a separate instance of that service.


## Don't overcomplicate solutions if needed

```typescript
const items$ = this.http.get('/api/items')
```

then

```html
<div *ngFor="let item of items$ | async"></div>
```

OR

```typescript
const items = await firstValueFrom(this.http.get('/api/items))
```

Then

```html
<div *ngFor="let item of items"></div>
```



