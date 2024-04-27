import type { StateCreator, StoreApi } from "zustand";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createSelectors } from "./helpers";
import type { ModelSettings } from "../types";
import { getDefaultModelSettings } from "../utils/constants";

const resetters = new Set<() => void>();

const initialModelSettingsState = {
  modelSettings: getDefaultModelSettings(),
} as const;

const createModelSettingsSlice: StateCreator<StoreApi<ModelSettingsSlice>> = (set) => ({
  ...initialModelSettingsState,
  updateSettings: <Key extends keyof ModelSettings>(key: Key, value: ModelSettings[Key]) => {
    set((state) => ({
      modelSettings: { ...state.modelSettings, [key]: value },
    }));
  },
});

export const useModelSettingsStore = create<ModelSettingsSlice>()(
  persist(
    (set, get) => ({
      ...createModelSettingsSlice({ set, get }),
      resetSettings: () => {
        resetters.forEach((resetter) => resetter());
        resetters.clear();
        set(initialModelSettingsState);
      },
    }),
    {
      name: "agentgpt-settings-storage-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        modelSettings: {
          ...state.modelSettings,
          customModelName: "gpt-3.5-turbo",
          maxTokens: Math.min(state.modelSettings.maxTokens, 4000),
        },
      }),
    }
  )
);

export const useResetSettings = () => {
  const { resetSettings } = useModelSettingsStore(state => state);
  return useCallback(resetSettings, [resetSettings]);
};

export const useResetModelSettingsOnUnmount = () => {
  const resetSettings = useResetSettings();
  useEffect(() => () => resetSettings(), [resetSettings]);
};
