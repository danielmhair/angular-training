import { DataSource } from '@angular/cdk/collections'
import { CollectionViewer } from '@angular/cdk/collections'
import {BehaviorSubject, mergeWith, switchMap, takeUntil} from 'rxjs'
import { Observable } from 'rxjs'
import { of } from 'rxjs'
import {DestroyObservable} from "./destroy-observable";
import {PageableResult} from "./data-sources.model";

/**
 * Base class to manage lists we retrieve from the server.
 * Dao stands for Data Access Object, implying that this is where we store the data.
 * This allows us to keep the data in one place and manage it in a consistent way through all our components.
 * You can extend this class to provide the specific data retrieval and transformation logic for your data.
 *
 * This is used in the app-side-table component and Material Components that require a DataSource like MatTable.
 *
 * By extending this class, you can pass this into the mat-table like so:
 * ```html
 * <table mat-table [dataSource]="dao"> ... </table>
 */
export abstract class BaseDataSource<GetDataItemsT = any, FinalDataItemsT = GetDataItemsT> extends DestroyObservable implements DataSource<FinalDataItemsT> {
  public data$ = new BehaviorSubject<FinalDataItemsT[]>([])
  public count$ = new BehaviorSubject<number>(0)
  public initialized = false
  public loading$ = new BehaviorSubject(false)
  public itemLoading$ = new BehaviorSubject(false)

  public get actualDataLength(): number {
    return this.data$.value.filter(a => !!a).length
  }

  public abstract allowLocalFilter: boolean
  public filter$ = new BehaviorSubject<string>("")
  public filteredData$: Observable<FinalDataItemsT[]>

  constructor() {
    super()
    this.initializeFiltering()
  }

  /**
   * This is added functionality on top of the DataSource object that Material provides.
   *
   * You can use this data source in any Material CDK component that requires a DataSource.
   * You can also use it in a normal for loop like so:
   *
   * ```html
   * <div *ngFor="let item of dao.filteredData$ | async"></div>
   * ```
   *
   * connect and disconnect functions are needing implemented to have the DataSource work.
   *
   * Since this is the base dao, we only have it return the filteredData$ observable.
   *
   * See {InfiniteSideTableBaseApiDao} for an example of how to use with paging.
   *
   * @returns An observable of the data we want to display
   */
  public connect(collectionViewer: CollectionViewer): Observable<readonly FinalDataItemsT[]> {
      return this.filteredData$.pipe(takeUntil(this.destroy$))
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.onDestroy()
    this.data$.complete()
    this.itemLoading$.complete()
    this.loading$.complete()
  }

  /**
   * Initializes the filtering of your data
   */
  public initializeFiltering() {
    const dataOrFilterChanges$ = this.filter$.pipe(
      mergeWith(this.data$),
      switchMap(() => of({ data: this.data$.value, filterValue: this.filter$.value }))
    )

    this.filteredData$ = dataOrFilterChanges$.pipe(
      switchMap(({ data, filterValue }) => {
        if (!filterValue || !this.allowLocalFilter) {
          return of(data)
        }
        return of(data.filter(item => item && this.filterPredicate(item, filterValue)))
      })
    )
  }

  /**
   * Call this in your ngOnInit function to initialize the data of your Dao.
   */
  public async initialize() {
    this.initialized = true
    try {
      this.loading$.next(true)
      await this.initializeData()
    } finally {
      this.loading$.next(false)
    }
  }

  /**
   * Resets the data and count to empty.
   */
  public reset() {
    this.data$.next([])
    this.count$.next(0)
  }

  /**
   * When we do local filtering, we need to convert the value to a string to compare it to the filter string.
   * Override this method to provide custom string conversion for your data.
   *
   * For example:
   *
   * ```typescript
   * public propToString(key: keyof FinalDataItemsT, value: any): string {
   *   if (key === "date") {
   *     return new Date(value).toLocaleDateString()
   *   }
   *   return value.toString()
   * }
   * ```
   * @param key The name of the key in the data object (FinalDataItemsT[key])
   * @param value The value of the key in the data object (FinalDataItemsT[key])
   */
  public propToString(key: keyof FinalDataItemsT, value: any): string {
    if (value == null) { return "" }
    return value.toString()
  }

  /**
   * Adapted from Angular Material's MatTableDataSource, but allows more flexibility by exposing a propToString method.
   * See: https://github.com/angular/components/blob/04ce4d2648004e970bc864962e6ec12e92f27698/src/material/table/table-data-source.ts#L231
   *
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has
   * at least one occurrence in that string. By default, the filter string has its whitespace
   * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
   * filter matching.
   *
   * @param data Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   *
   * @returns Whether the filter matches against the data
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

  /**
   * This is called in the initialize function to retrieve and transform the data.
   * Use `retrieveDataItems` to get the data from the server or local storage.
   * Use `transformDataItems` to transform the data into the format you want.
   *
   * @param overrideParams Any parameters to override the set {this.params} object
   */
  public async retrieveFinalData(paramOverrides?: any): Promise<PageableResult<FinalDataItemsT>> {
    const pagedDataItems = await this.retrieveDataItems(paramOverrides)
    return await this.transformDataItems(pagedDataItems)
  }

  /**
   * This is meant to be called in the component we use the dao so the component controls when the data loads
   */
  public async initializeData(): Promise<PageableResult<FinalDataItemsT>> {
    const transformedData = await this.retrieveFinalData()
    this.data$.next(transformedData.results)
    this.count$.next(transformedData.count || transformedData.results.length)
    return transformedData
  }

  /**
   * This is called when dao.initialize() is called to get the data (whether from the server or somewhere else).
   * This is the function that should be overridden to get the data from the server.
   * If you don't need paged data, just do something like
   * ```typescript
   *   return { count: data.length, results: data }
   * ```
   *
   * @param overrideParams Any parameters to override the set {this.params} object
   */
  public abstract retrieveDataItems(paramOverrides?: any): Promise<PageableResult<GetDataItemsT>>

  /**
   * This is meant to be called to be overridden if needed to handle retrieval items of data.
   *
   * This is very helpful if you need to transform the data into some ViewModel for your page/component.
   *
   * @param data The data retrieved from the server
   * @returns The data in the format you want
   */
  public async transformDataItems(data: PageableResult<GetDataItemsT>): Promise<PageableResult<FinalDataItemsT>> {
    return data as unknown as PageableResult<FinalDataItemsT>
  }

  /**
   * Refreshes the dao by calling getDataItems. The purpose of this is the update params or some other item in the dao, then call refresh.
   */
  public async refresh(): Promise<PageableResult<FinalDataItemsT>> {
    this.loading$.next(true)
    const results = await this.initializeData()
    this.loading$.next(false)
    return results
  }

}
