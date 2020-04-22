import Observable from 'zen-observable';

export interface ObservableState<A extends {}, S, O> {
  observable: Observable<O>;
  actions: A;
  currentState: () => S;
}
