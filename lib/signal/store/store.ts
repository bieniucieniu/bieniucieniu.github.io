import { createContext, use } from "react";
import { type SharedState, createSharedState } from "..";

interface GetSet<K, V> {
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
}

type Store = GetSet<any, any>;

const globalStore: Store = new Map();
const context = createContext<Store>(globalStore);
export function useStorePocket<T = unknown>(
  key: any,
  state: T,
  store?: Store,
): SharedState<T>;
export function useStorePocket<T = unknown>(
  key: any,
  state: T,
  pStore?: Store,
): SharedState<T> {
  const store = pStore || use(context);

  let s: SharedState<any> = store.get(key);
  if (!s) {
    store.set(key, (s = createSharedState(state)));
  }

  return s;
}

export const Provider = context.Provider;
