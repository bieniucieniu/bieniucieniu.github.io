import { useState, useSyncExternalStore } from "react";

class Pocket<T> {
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
export type { Pocket };

export function createPocket<T>(state: T): Pocket<T> {
  return new Pocket(state);
}

export function usePocket<T>(p: Pocket<T>): [state: T, setter: Setter<T>] {
  return [usePocketState(p), p.update];
}

export function useCreatePocket<T>(state: T): Pocket<T> {
  return useState(() => createPocket(state))[0];
}

export function usePocketState<T>(o: Pocket<T>): T {
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
