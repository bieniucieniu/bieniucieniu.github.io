import {
  createContext,
  use,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type StoreEntrie = {
  listeners: Set<() => void>;
  state: any;
};
type Store = Map<any, StoreEntrie | undefined>;
const globalStore: Store = new Map();
const context = createContext<Store>(globalStore);

export function useListenToState<T>(
  key: PropertyKey,
  withGlobal = true,
): T | undefined {
  const store = use(context);
  const tracker: StoreEntrie | undefined =
    store.get(key) || (withGlobal ? globalStore.get(key) : undefined);
  return useSyncExternalStore(
    (onChange) => subscribe(tracker, onChange),
    () => tracker?.state,
    () => undefined,
  );
}

export function useEmitState<T>(key: PropertyKey, state: T) {
  const store = use(context);
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  const o: StoreEntrie = useMemo(() => {
    let s = store.get(key);
    if (!s) {
      store.set(
        key,
        (s = {
          listeners: new Set(),
          state: state,
        }),
      );
    }
    return s;
  }, [store, key]);
  useEffect(() => {
    if (o.state !== state) {
      o.state = state;
      dispatch(o.listeners);
    }
  }, [state, o]);
}
function dispatch<Fn extends (...arg: any[]) => any>(
  entries: Iterable<Fn>,
  ...args: Parameters<Fn>
) {
  for (const fn of entries) fn?.(...args);
}

function subscribe(
  tracker: StoreEntrie | undefined,
  onChange: () => void,
): () => void {
  console.log("subscribe to", tracker);
  tracker?.listeners.add(onChange);

  return () => {
    console.log("unsubscribe to", tracker);
    tracker?.listeners.delete(onChange);
  };
}
