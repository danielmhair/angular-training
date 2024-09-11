import {Subject} from "rxjs";

export class DestroyObservable {
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public onDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
