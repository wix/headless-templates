export type ReadOnlySignal<T> = {
  get: () => T;
  peek: () => T;
  subscribe: (fn: (value: T) => void) => () => void;
  id: string;
  isSignal: boolean;
};
export type Signal<T> = ReadOnlySignal<T> & {
  set: (newValue: T) => void;
};
