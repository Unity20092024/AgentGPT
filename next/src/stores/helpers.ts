import type { StoreApi, UseBoundStore } from "zustand";

type StateKeys<S> = {
  [K in keyof S]: K;
}[keyof S];

type WithSelectors<S> = S & {
  use: {
    [K in StateKeys<S>]: () => S[K];
  };
};

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  store: S
): WithSelectors<S> => {
  const stateKeys = Object.keys(store.getState()) as StateKeys<S>[];
  const selectors = stateKeys.reduce((acc, key) => {
    acc.use[key] = () => store((state) => state[key as keyof typeof state]);
    return acc;
  }, { ...store, use: {} } as WithSelectors<S>);

  return selectors;
};
