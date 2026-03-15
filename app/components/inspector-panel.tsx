"use client";

import { X, ChevronRight, HelpCircle, Coins01, Activity, Zap, ChevronDown } from "@untitledui/icons";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { useDiagramStore } from "../store/diagram-store";
import { providerConfigs, ProviderId } from "../data/providers";
import { stackLayers } from "./stack-diagram/stack-layers";
import { CostSummaryPanel } from "./cost-summary-panel";
import { cx } from "@/utils/cx";

export function InspectorPanel({ onClose }: { onClose?: () => void }) {
    const {
        inspectorMode,
        selectedNodeId,
        selectedProviderId,
        setSelectedNode,
        setSelectedProvider,
        setInspectorMode,
    } = useDiagramStore();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInspectorMode("summary");
            setSelectedNode(null);
            setSelectedProvider(null);
        }
    };

    // 1. PROVIDER DETAIL MODE
    if (inspectorMode === "provider" && selectedProviderId) {
        const config = providerConfigs[selectedProviderId as keyof typeof providerConfigs];
        return (
            <div className="flex h-full w-full flex-col bg-primary border-l border-secondary">
                <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Zap className="size-4 text-brand" />
                        <h3 className="text-sm font-bold text-primary">{config?.name || selectedProviderId}</h3>
                    </div>
                    <Button color="tertiary" size="sm" onClick={handleClose}>
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary">Provider Overview</h4>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-secondary text-primary">
                                {config?.tier.replace("_", " ")} Tier
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-secondary text-brand">
                                {config?.pricingModel.type === 'usage' ? `$${config.pricingModel.unitCost.toFixed(4)} / credit` : 
                                 config?.pricingModel.type === 'seatContract' ? 'Seat-based' :
                                 config?.pricingModel.type === 'planCredits' ? 'Plan-based' : 'Quote required'}
                            </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-secondary italic">
                            {config?.tier === 'premium' ? 'Enterprise fallback' : 'Scalable enrichment'} source specializing in {config?.category} resolution.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary mb-2">Strengths & Weaknesses</h4>
                        <div className="space-y-3">
                            <div className="rounded-lg bg-success-50 p-2 border border-success-100">
                                <p className="text-[10px] font-bold text-success-700 uppercase">Strengths</p>
                                <ul className="mt-1 list-inside list-disc text-[11px] text-success-800 space-y-0.5">
                                    {config?.strengths.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="rounded-lg bg-error-50 p-2 border border-error-100">
                                <p className="text-[10px] font-bold text-error-700 uppercase">Weaknesses</p>
                                <ul className="mt-1 list-inside list-disc text-[11px] text-error-800 space-y-0.5">
                                    {config?.weaknesses.map(w => <li key={w}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary mb-2">Role in Stack</h4>
                        <div className="space-y-2">
                            {config && Object.entries(config.rolesByLayer).map(([layerId, role]) => {
                                if (!role) return null;
                                return (
                                    <div key={layerId} className="rounded-lg border border-secondary p-2 bg-secondary_subtle">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-primary">{stackLayers.find(l => l.id === layerId)?.label || layerId}</span>
                                            <span className={cx(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                role.confidenceEffect === "very_high" ? "bg-brand-secondary text-brand" : "bg-secondary text-tertiary"
                                            )}>
                                                {role.confidenceEffect.replace("_", " ")} Impact
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-tertiary">{role.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t border-secondary bg-secondary_subtle">
                    <Button color="primary" className="w-full justify-center">Toggle Provider</Button>
                </div>
            </div>
        );
    }

    // 2. NODE DETAIL MODE
    if (inspectorMode === "node" && selectedNodeId) {
        // Search top-level layers first
        let layer = stackLayers.find(l => l.id === selectedNodeId);

        // If not found, search in sub-layers (handles both subLayers string array and subLayersFlow)
        if (!layer) {
            for (const l of stackLayers) {
                // Check subLayersFlow
                const subFlow = l.subLayersFlow?.find(s => s.id === selectedNodeId);
                if (subFlow) {
                    layer = { label: subFlow.label, purpose: subFlow.purpose, providers: subFlow.providers || [] } as any;
                    break;
                }
                // Check subLayers string array (if applicable)
                if (l.subLayers) {
                    const subIndex = l.subLayers.findIndex((_, idx) => `${l.id}_sub_${idx}` === selectedNodeId);
                    if (subIndex !== -1) {
                        layer = { label: l.subLayers[subIndex], purpose: `Phase ${subIndex + 1}`, providers: l.providers } as any;
                        break;
                    }
                }
            }
        }

        return (
            <div className="flex h-full w-80 flex-col bg-primary border-l border-secondary">
                <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Activity className="size-4 text-brand" />
                        <h3 className="text-sm font-bold text-primary truncate max-w-[180px]">{layer?.label || selectedNodeId}</h3>
                    </div>
                    <Button color="tertiary" size="sm" onClick={handleClose}>
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary">Module Purpose</h4>
                        <p className="mt-2 text-xs leading-relaxed text-secondary">
                            {layer?.purpose || "Processing step within the data resolution pipeline."}
                        </p>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary mb-2">Enabled Providers</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {layer?.providers.map(pid => {
                                const pConfig = providerConfigs[pid as keyof typeof providerConfigs];
                                return (
                                    <button
                                        key={pid}
                                        onClick={() => setSelectedProvider(pid)}
                                        className="flex items-center justify-between rounded-lg border border-secondary p-2 text-left hover:border-brand/40 hover:bg-secondary_subtle transition-all"
                                    >
                                        <div>
                                            <div className="text-[11px] font-bold text-primary">{pConfig?.name === "Internal Logic" ? "GDS Proprietary Tools" : (pConfig?.name || pid)}</div>
                                            <div className="text-[10px] text-tertiary">{pConfig?.category || "Enrichment"}</div>
                                        </div>
                                        <ChevronRight className="size-3 text-quaternary" />
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-quaternary mb-2">Economic Impact</h4>
                        <div className="space-y-2 rounded-lg bg-secondary_subtle p-3 border border-secondary">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-tertiary">Layer Cost Contribution</span>
                                <span className="font-bold text-primary">
                                    {(() => {
                                        const layerProviders = layer?.providers.map(id => providerConfigs[id as ProviderId]).filter(Boolean) || [];
                                        const sum = layerProviders.reduce((acc, p) => {
                                            const pm = p.pricingModel;
                                            if (pm.type === 'usage') return acc + pm.unitCost;
                                            if (pm.type === 'quote') return acc + (pm.benchmarkUnitCost || 0);
                                            if (pm.type === 'planCredits') return acc + (pm.planCost / pm.includedUnits);
                                            if (pm.type === 'seatContract' && pm.includedCredits) return acc + (pm.annualContract / pm.includedCredits);
                                            return acc;
                                        }, 0);
                                        return sum > 0 ? `$${sum.toFixed(4)} / contact` : "Near-zero marginal";
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-tertiary">Combined Accuracy</span>
                                <span className="font-bold text-success-600">
                                    {(() => {
                                        const layerProviders = layer?.providers.map(id => providerConfigs[id as ProviderId]).filter(Boolean) || [];
                                        const withAccuracy = layerProviders.filter(p => p.accuracyPercent);
                                        if (withAccuracy.length === 0) return "—";
                                        const avg = withAccuracy.reduce((acc, p) => acc + (p.accuracyPercent || 0), 0) / withAccuracy.length;
                                        return `${avg.toFixed(1)}%`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // 3. SUMMARY MODE (Default)
    const { costViewMode, setCostViewMode } = useDiagramStore();

    return (
        <div className="flex h-full w-full flex-col bg-primary border-l border-secondary">
            <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
                <div className="flex items-center gap-2">
                    <Coins01 className="size-4 text-success-600" />
                    <h3 className="text-sm font-bold text-primary">Economics</h3>
                </div>
                
                <div className="flex bg-secondary_subtle rounded-lg p-0.5 border border-secondary shadow-sm">
                  <button
                    onClick={() => setCostViewMode("total")}
                    className={cx(
                      "px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-tight",
                      costViewMode === "total" ? "bg-primary text-primary shadow-xs" : "text-tertiary hover:text-secondary"
                    )}
                  >
                    Global
                  </button>
                  <button
                    onClick={() => selectedNodeId && setCostViewMode("phase")}
                    disabled={!selectedNodeId}
                    className={cx(
                      "px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-tight",
                      costViewMode === "phase" ? "bg-primary text-primary shadow-xs" : "text-tertiary hover:text-secondary",
                      !selectedNodeId && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    Phase
                  </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto relative" id="inspector-scroll-container">
                <CostSummaryPanel />
                <ScrollDownHint containerId="inspector-scroll-container" />
            </div>
        </div>
    );
}

function ScrollDownHint({ containerId }: { containerId: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const container = document.getElementById(containerId);
        if (!container) return;
        containerRef.current = container;

        const checkScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const canScrollDown = scrollHeight > clientHeight + scrollTop + 10;
            setIsVisible(canScrollDown);
        };

        container.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        // Initial check
        setTimeout(checkScroll, 100);

        return () => {
            container.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [containerId]);

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand text-white text-[10px] font-bold shadow-lg hover:bg-brand/90 transition-all animate-bounce ring-4 ring-primary/20"
        >
            <ChevronDown className="size-3" />
            More Details
        </button>
    );
}
