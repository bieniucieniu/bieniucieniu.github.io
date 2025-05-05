import { useCallback, useState, useSyncExternalStore } from "react";

class Pocket<T> {
  private listeners: Set<() => void>;
  state: T;
  constructor(state: T) {
    this.state = state;
    this.listeners = new Set();
  }
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  dispach() {
    dispatch(this.listeners);
  }
}
export type { Pocket };

export function createPocket<T>(state: T): Pocket<T> {
  return new Pocket(state);
}

export function useCreatePocket<T>(state: T, use?: false): Pocket<T>;
export function useCreatePocket<T>(
  state: T,
  use: true,
): [T, (state: T) => void];

export function useCreatePocket<T>(state: T, use?: boolean) {
  const p = useState(() => createPocket(state))[0];
  if (use) {
    return [
      usePocketState(p),
      useCallback((s: T) => updatePocketState(p, s), [p]),
    ];
  }
  return p;
}

export function usePocketState<T>(o: Pocket<T>): T {
  return useSyncExternalStore(
    (fn) => o.subscribe(fn),
    () => o.state,
    () => o.state,
  );
}

export function updatePocketState<T>(o: Pocket<T>, state: T) {
  if (o.state !== state) {
    o.state = state;
    o.dispach();
  }
}

function dispatch<Fn extends (...arg: any[]) => any>(
  entries: Iterable<Fn>,
  ...args: Parameters<Fn>
) {
  for (const fn of entries) fn?.(...args);
}
