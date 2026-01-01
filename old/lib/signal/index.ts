import { useState, useSyncExternalStore } from "react";

class SharedState<T> {
  private listeners: Set<() => void>;
  state: T;
  constructor(state: T) {
    this.state = state;
    this.listeners = new Set();
  }
  subscribe(fn: () => void): () => boolean {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  dispach(): void {
    dispatch(this.listeners);
  }

  update<U extends T>(state: U) {
    if (this.state !== state) {
      this.state = state;
      this.dispach();
    }
  }
}
export type Setter<T> = <U extends T>(v: U) => void;
export type { SharedState };

export function createSharedState<T>(state: T): SharedState<T> {
  return new SharedState(state);
}

export function useShared<T>(p: SharedState<T>): [state: T, setter: Setter<T>] {
  return [useSharedState(p), p.update];
}

export function useCreateSharedState<T>(state: T): SharedState<T> {
  return useState(() => createSharedState(state))[0];
}

export function useSharedState<T>(o: SharedState<T>): T {
  return useSyncExternalStore(
    (fn) => o.subscribe(fn),
    () => o.state,
    () => o.state,
  );
}

function dispatch<Fn extends (...arg: any[]) => any>(
  entries: Iterable<Fn>,
  ...args: Parameters<Fn>
) {
  for (const fn of entries) fn?.(...args);
}
