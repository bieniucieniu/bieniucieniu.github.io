import { createContext, use } from "react";
import { type Pocket, createPocket } from "..";

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
): Pocket<T>;
export function useStorePocket<T = unknown>(
  key: any,
  state: T,
  pStore?: Store,
): Pocket<T> {
  const store = pStore || use(context);

  let s: Pocket<any> = store.get(key);
  if (!s) {
    store.set(key, (s = createPocket(state)));
  }

  return s;
}

export const Provider = context.Provider;
