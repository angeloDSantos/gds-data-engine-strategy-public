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
  targetScale: number;
  emailRatio: number;
  catchAllRatio: number;
  mobileRatio: number;

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
  setTargetScale: (scale: number) => void;
  setRatios: (ratios: { email?: number; catchAll?: number; mobile?: number }) => void;
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
      targetScale: 2.5,
      emailRatio: 0.65,
      catchAllRatio: 0.35,
      mobileRatio: 0.30,
 
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
      setConfidenceMode: (mode) => {
        const providers: Record<ConfidenceMode, string[]> = {
          base: ["internal", "crunchbase", "pdl", "apollo", "prospeo", "emailsearch_io", "millionverifier", "rocketreach", "hlr_lookup", "salesintel", "cloudflare_crawl", "clay"],
          conservative: ["internal", "apollo", "emailsearch_io", "millionverifier", "hlr_lookup", "cloudflare_crawl", "clay"],
          aggressive: ["internal", "zoominfo", "cognism", "lusha", "pdl", "rocketreach", "neverbounce", "salesintel", "crunchbase", "cloudflare_crawl", "clay"]
        };
        
        set((s) => {
          const nextEnabled = providers[mode];
          const updatedPreset = {
            ...s.currentPreset,
            providers_enabled: nextEnabled
          };
          return {
            confidenceMode: mode,
            currentPreset: updatedPreset,
            presets: s.presets.map(p => p.id === updatedPreset.id ? updatedPreset : p)
          };
        });
      },
      setBillingPeriod: (period) => set({ billingPeriod: period }),
      setSelectedProvider: (id) => set({ selectedProviderId: id, inspectorMode: id ? "provider" : "summary" }),
      setSelectedLayer: (id) => set({ selectedLayerId: id, selectedNodeId: id, inspectorMode: id ? "node" : "summary", costViewMode: id ? "phase" : "total" }),
      setSelectedNode: (id) => set({ selectedNodeId: id, inspectorMode: id ? "node" : "summary", costViewMode: id ? "phase" : "total" }),
      setInspectorMode: (mode) => set({ inspectorMode: mode }),
      setCostViewMode: (mode) => set({ costViewMode: mode }),
      setTargetScale: (scale) => set({ targetScale: scale }),
      setRatios: (ratios) => set((s) => ({
          emailRatio: ratios.email !== undefined ? ratios.email : s.emailRatio,
          catchAllRatio: ratios.catchAll !== undefined ? ratios.catchAll : s.catchAllRatio,
          mobileRatio: ratios.mobile !== undefined ? ratios.mobile : s.mobileRatio,
      })),
      resetToDefaults: () =>
        set({
          assumptions: defaultAssumptions,
          confidenceMode: "base",
          billingPeriod: "annual",
          targetScale: 2.5,
          emailRatio: 0.65,
          catchAllRatio: 0.35,
          mobileRatio: 0.30,
        }),
      removePreset: (id) => {
        set((s) => {
          const newPresets = s.presets.filter((p) => p.id !== id);
          const nextPreset = s.currentPreset.id === id ? newPresets[0] : s.currentPreset;
          return { presets: newPresets, currentPreset: nextPreset };
        });
      },
    }),
    { 
      name: "gds-diagram-store", 
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) return {};
        return persistedState;
      },
      partialize: (s) => ({ 
        assumptions: s.assumptions, 
        presets: s.presets,
        targetScale: s.targetScale,
        emailRatio: s.emailRatio,
        catchAllRatio: s.catchAllRatio,
        mobileRatio: s.mobileRatio
      }) 
    }
  )
);
