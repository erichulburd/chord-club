import Observable from 'zen-observable';

export interface ObservableState<A extends {}, S, E> {
  observable: Observable<E>;
  actions: A;
  currentState: () => S;
}
