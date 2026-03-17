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
    setCurrentPreset,
    setPresets,
  } = useDiagramStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  
  // Responsive handling
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobilePanels = () => {
    setIsSidebarOpen(false);
    setIsInspectorOpen(false);
  };

  return (
    <div className="flex h-full flex-col bg-secondary">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left panel - Layer tree */}
        <aside
          className={cx(
            "shrink-0 overflow-y-auto border-r border-secondary bg-primary transition-all duration-300 ease-in-out relative",
            isMobile 
              ? (isSidebarOpen ? "fixed inset-0 z-[200] w-full h-full p-4" : "w-0 opacity-0 pointer-events-none")
              : (isSidebarOpen ? "w-64 p-3 opacity-100" : "w-0 opacity-0 p-0 overflow-hidden")
          )}
        >
          {isSidebarOpen && (
            <div className={cx("flex flex-col", isMobile ? "min-h-full pb-20" : "min-w-[200px]")}>
              {isMobile && (
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="sticky top-0 left-0 z-[210] mb-4 flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-bold text-white shadow-xl ring-4 ring-brand/10 transition-transform active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                  Back to Architecture
                </button>
              )}
              
              <h3 className="mb-2 text-sm font-semibold text-primary">Stack layers</h3>
              <nav className="space-y-0.5">
                {stackLayers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => {
                      useDiagramStore.getState().setSelectedLayer(layer.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-secondary hover:bg-primary_hover hover:text-primary"
                  >
                    <ChevronRight className="size-4 shrink-0 text-quaternary" aria-hidden />
                    {layer.label}
                  </button>
                ))}
              </nav>
              <div className="mt-4 space-y-6">
                {[
                  { label: "Company Intelligence", cats: ["company_intelligence", "market_intelligence", "raw_data", "internal", "crunchbase"] },
                  { label: "Domain & Search", cats: ["search", "company_search", "cloudflare_crawl", "orchestration"] },
                  { label: "Contact Enrichment", cats: ["enrichment", "email_enrichment", "contact_data", "contact_enrichment", "identity_resolution", "email_verification"] },
                  { label: "Phone Lookup", cats: ["phone", "mobile_enrichment", "premium_mobile", "phone_validation", "line_type", "carrier"] },
                ].map((group) => {
                  const providersInGroup = providerCatalog.filter(p => 
                    p.categories.some(cat => group.cats.includes(cat)) || 
                    (group.label === "Company Intelligence" && p.provider_id === 'internal')
                  );
                  
                  if (providersInGroup.length === 0) return null;

                  return (
                    <div key={group.label}>
                      <h3 className="mb-2 text-[10px] font-bold text-quaternary uppercase tracking-wider">{group.label}</h3>
                      <div className="space-y-0.5">
                        {providersInGroup.map((provider) => {
                          const isEnabled = currentPreset.providers_enabled.includes(provider.provider_id);
                          return (
                            <button
                              key={`${group.label}-${provider.provider_id}`}
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
                                "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                                isEnabled
                                  ? "bg-brand-secondary/10 text-brand font-medium ring-1 ring-brand/10"
                                  : "text-tertiary hover:bg-primary_hover"
                              )}
                            >
                              <span>{provider.name}</span>
                              <div className={cx(
                                "size-1.5 rounded-full transition-all",
                                isEnabled ? "bg-brand scale-110 shadow-[0_0_8px_-1px_rgba(var(--brand-rgb),0.5)]" : "bg-tertiary/30"
                              )} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cx(
              "absolute z-10 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-primary shadow-sm hover:bg-primary_hover transition-all duration-300",
              isSidebarOpen ? "left-60" : "left-2"
            )}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="size-4 text-secondary" />
            ) : (
              <ChevronRight className="size-4 text-secondary" />
            )}
          </button>
        )}
        
        {isMobile && !isSidebarOpen && (
          <button
            onClick={() => { setIsSidebarOpen(true); setIsInspectorOpen(false); }}
            className="fixed bottom-6 left-6 z-[150] flex h-12 items-center gap-2 rounded-full bg-primary px-4 font-bold text-primary shadow-2xl border border-secondary active:scale-95 transition-all"
          >
            <ChevronRight className="size-5 text-brand" />
            <span>Stack Layers</span>
          </button>
        )}

        {/* Center canvas */}
        <main className="flex-1 overflow-hidden p-0 sm:p-4">
          <div className="h-full min-h-[500px]">
            <StackDiagram />
          </div>
          <p className="hidden sm:block mt-2 text-xs text-tertiary">
            Zoomable architecture map. Click a layer for details. Values blend public pricing
            where available.
          </p>
        </main>

        {/* Right panel - Dynamic Inspector */}
        <aside
          className={cx(
            "flex shrink-0 transition-all duration-300 ease-in-out border-l border-secondary bg-primary relative",
            isMobile
              ? (isInspectorOpen ? "fixed inset-0 z-[200] w-full h-full" : "w-0 overflow-hidden")
              : (isInspectorOpen ? "w-80" : "w-0 overflow-hidden")
          )}
        >
          {isInspectorOpen && (
            <div className="flex flex-col h-full w-full overflow-hidden">
              {isMobile && (
                <div className="p-4 border-b border-secondary bg-primary sticky top-0 z-[210]">
                  <button 
                    onClick={() => setIsInspectorOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-primary shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <InspectorPanel onClose={() => setIsInspectorOpen(false)} />
              </div>
            </div>
          )}

          {!isMobile && (
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
          )}
        </aside>
        
        {isMobile && !isInspectorOpen && (
          <button
            onClick={() => { setIsInspectorOpen(true); setIsSidebarOpen(false); }}
            className="fixed bottom-6 right-6 z-[150] flex h-12 items-center gap-2 rounded-full bg-brand-solid px-4 font-bold text-white shadow-2xl active:scale-95 transition-all"
          >
            <span>Economics</span>
            <ChevronLeft className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
