"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { StackDiagram } from "../components/stack-diagram/stack-diagram";
import { InspectorPanel } from "../components/inspector-panel";
import { useDiagramStore } from "../store/diagram-store";
import { stackLayers } from "../components/stack-diagram/stack-layers";
import { providerCatalog } from "../data/provider-catalog";
import { cx } from "@/utils/cx";
import { ChevronLeft, ChevronRight, Copy01, Save01, Coins01, HelpCircle, X, Activity, Zap } from "@untitledui/icons";

const confidenceItems = [
  { id: "conservative", label: "Conservative" },
  { id: "base", label: "Base" },
  { id: "aggressive", label: "Aggressive" },
];

export function StackExplorerPage() {
  const {
    currentPreset,
    presets,
    assumptions,
    confidenceMode,
    billingPeriod,
    selectedProviderId,
    setCurrentPreset,
    setAssumptions,
    setConfidenceMode,
    setBillingPeriod,
    setSelectedProvider,
    duplicatePreset,
    setPresets,
  } = useDiagramStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  return (
    <div className="flex h-full flex-col bg-secondary">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left panel - Layer tree */}
        <aside
          className={cx(
            "shrink-0 overflow-y-auto border-r border-secondary bg-primary p-3 transition-all duration-300 ease-in-out relative",
            isSidebarOpen ? "w-56 opacity-100" : "w-0 opacity-0 p-0"
          )}
        >
          {isSidebarOpen && (
            <div className="min-w-[200px]">
              <h3 className="mb-2 text-sm font-semibold text-primary">Stack layers</h3>
              <nav className="space-y-0.5">
                {stackLayers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => useDiagramStore.getState().setSelectedLayer(layer.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-secondary hover:bg-primary_hover hover:text-primary"
                  >
                    <ChevronRight className="size-4 shrink-0 text-quaternary" aria-hidden />
                    {layer.label}
                  </button>
                ))}
              </nav>
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-primary">Contact data providers</h3>
                <div className="space-y-1">
                  {providerCatalog.map((provider) => {
                    const isEnabled = currentPreset.providers_enabled.includes(provider.provider_id);
                    return (
                      <button
                        key={provider.provider_id}
                        type="button"
                        onClick={() => {
                          const nextEnabled = isEnabled
                            ? currentPreset.providers_enabled.filter((id) => id !== provider.provider_id)
                            : [...currentPreset.providers_enabled, provider.provider_id];

                          const updatedPreset = {
                            ...currentPreset,
                            providers_enabled: nextEnabled,
                          };

                          setCurrentPreset(updatedPreset);
                          setPresets(
                            presets.map((p) => (p.id === currentPreset.id ? updatedPreset : p)),
                          );
                        }}
                        className={cx(
                          "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs",
                          isEnabled
                            ? "bg-brand-secondary text-brand-secondary"
                            : "text-tertiary hover:bg-primary_hover"
                        )}
                      >
                        <span>{provider.name}</span>
                        <span className="text-[10px] text-quaternary">
                          {isEnabled ? "On" : "Off"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cx(
            "absolute z-10 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-primary shadow-sm hover:bg-primary_hover transition-all duration-300",
            isSidebarOpen ? "left-52" : "left-2"
          )}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="size-4 text-secondary" />
          ) : (
            <ChevronRight className="size-4 text-secondary" />
          )}
        </button>

        {/* Center canvas */}
        <main className="flex-1 overflow-hidden p-4">
          <div className="h-full min-h-[500px]">
            <StackDiagram />
          </div>
          <p className="mt-2 text-xs text-tertiary">
            Zoomable architecture map. Click a layer for details. Hover edges for data flow. Values blend public pricing
            where available—replace with internal benchmarks as data becomes available.
          </p>
        </main>

        {/* Right panel - Dynamic Inspector */}
        <aside
          className={cx(
            "flex shrink-0 transition-all duration-300 ease-in-out border-l border-secondary bg-primary relative",
            isInspectorOpen ? "w-80" : "w-0"
          )}
        >
          {isInspectorOpen && (
            <div className="flex flex-col h-full w-80 overflow-hidden">
              <InspectorPanel onClose={() => setIsInspectorOpen(false)} />
            </div>
          )}

          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={cx(
              "absolute z-10 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-primary shadow-sm hover:bg-primary_hover transition-all duration-300",
              isInspectorOpen ? "-left-4" : "-left-10"
            )}
            aria-label={isInspectorOpen ? "Collapse inspector" : "Expand inspector"}
          >
            {isInspectorOpen ? (
              <ChevronRight className="size-4 text-secondary" />
            ) : (
              <ChevronLeft className="size-4 text-secondary" />
            )}
          </button>
        </aside>
      </div>
    </div>
  );
}
