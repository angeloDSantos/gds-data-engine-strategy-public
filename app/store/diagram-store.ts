import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssumptionSet } from "../data/assumptions";
import { defaultAssumptions } from "../data/assumptions";
import type { Preset } from "../data/presets";
import { builtInPresets } from "../data/presets";

export type ConfidenceMode = "conservative" | "base" | "aggressive";
export type BillingPeriod = "annual" | "monthly";
export type InspectorMode = "summary" | "node" | "provider";

interface DiagramState {
  currentPreset: Preset;
  presets: Preset[];
  assumptions: AssumptionSet;
  confidenceMode: ConfidenceMode;
  billingPeriod: BillingPeriod;
  selectedProviderId: string | null;
  selectedLayerId: string | null;
  selectedNodeId: string | null;
  inspectorMode: InspectorMode;
  costViewMode: "total" | "phase";

  setCurrentPreset: (preset: Preset) => void;
  setPresets: (presets: Preset[]) => void;
  duplicatePreset: (preset: Preset) => void;
  setAssumptions: (partial: Partial<AssumptionSet>) => void;
  setConfidenceMode: (mode: ConfidenceMode) => void;
  setBillingPeriod: (period: BillingPeriod) => void;
  setSelectedProvider: (id: string | null) => void;
  setSelectedLayer: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  setInspectorMode: (mode: InspectorMode) => void;
  setCostViewMode: (mode: "total" | "phase") => void;
  resetToDefaults: () => void;
  removePreset: (id: string) => void;
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      currentPreset: builtInPresets[0],
      presets: builtInPresets,
      assumptions: defaultAssumptions,
      confidenceMode: "base",
      billingPeriod: "annual",
      selectedProviderId: null,
      selectedLayerId: null,
      selectedNodeId: null,
      inspectorMode: "summary",
      costViewMode: "total",

      setCurrentPreset: (preset) => set({ currentPreset: preset }),
      setPresets: (presets) => set({ presets }),
      duplicatePreset: (preset) => {
        const customCount = get().presets.filter(p => !builtInPresets.find(bp => bp.id === p.id)).length;
        const newPreset: Preset = {
          ...preset,
          id: `custom_${Date.now()}`,
          name: `Stack Explorer ${customCount + 1}`,
        };
        set((s) => ({
          presets: [...s.presets, newPreset],
          currentPreset: newPreset,
        }));
      },
      setAssumptions: (partial) =>
        set((s) => ({
          assumptions: { ...s.assumptions, ...partial },
        })),
      setConfidenceMode: (mode) => set({ confidenceMode: mode }),
      setBillingPeriod: (period) => set({ billingPeriod: period }),
      setSelectedProvider: (id) => set({ selectedProviderId: id, inspectorMode: id ? "provider" : "summary" }),
      setSelectedLayer: (id) => set({ selectedLayerId: id, selectedNodeId: id, inspectorMode: id ? "node" : "summary", costViewMode: id ? "phase" : "total" }),
      setSelectedNode: (id) => set({ selectedNodeId: id, inspectorMode: id ? "node" : "summary", costViewMode: id ? "phase" : "total" }),
      setInspectorMode: (mode) => set({ inspectorMode: mode }),
      setCostViewMode: (mode) => set({ costViewMode: mode }),
      resetToDefaults: () =>
        set({
          assumptions: defaultAssumptions,
          confidenceMode: "base",
          billingPeriod: "annual",
        }),
      removePreset: (id) => {
        set((s) => {
          const newPresets = s.presets.filter((p) => p.id !== id);
          const nextPreset = s.currentPreset.id === id ? newPresets[0] : s.currentPreset;
          return { presets: newPresets, currentPreset: nextPreset };
        });
      },
    }),
    { name: "gds-diagram-store", partialize: (s) => ({ assumptions: s.assumptions, presets: s.presets }) }
  )
);
