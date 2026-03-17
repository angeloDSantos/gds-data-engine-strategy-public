import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  ReactFlowProvider,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "../../store/diagram-store";
import { cx } from "@/utils/cx";
import { ErrorBoundary } from "../error-boundary";
import { LayerNode } from "./layer-node";
import { buildLayerDetailDiagram, buildOverviewDiagram, stackLayers } from "./stack-layers";
import { ChevronLeft, ChevronRight, MarkerPin01, Play } from "@untitledui/icons";

const nodeTypes: NodeTypes = { layerNode: LayerNode };

function StackDiagramInner() {
  const { selectedLayerId, setSelectedLayer, setSelectedNode } = useDiagramStore();
  const [activeStageId, setActiveStageId] = useState<string>("layer_1");
  const [diagramError, setDiagramError] = useState<Error | null>(null);

  const isDetailView = !!selectedLayerId;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (isDetailView && selectedLayerId ? buildLayerDetailDiagram(selectedLayerId) : buildOverviewDiagram()),
    [isDetailView, selectedLayerId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();

  // Navigation Logic
  // Navigation Logic
  const allLayers = useMemo(() => stackLayers, []);
  const allLayerIds = useMemo(() => allLayers.map(l => l.id), [allLayers]);
  const currentIndex = allLayerIds.indexOf(activeStageId);
  const activeLayer = useMemo(() => {
    const id = isDetailView ? selectedLayerId : activeStageId;
    if (!id) return null;
    return allLayers.find((l) => l.id === id) || null;
  }, [selectedLayerId, isDetailView, activeStageId, allLayers]);

  // Derived phase info for display
  const maxPhases = useMemo(() => Math.max(...allLayers.map(l => l.phaseNumber || 0)), [allLayers]);
  const currentPhase = activeLayer?.phaseNumber || 0;

  const goToStage = useCallback((id: string) => {
    setActiveStageId(id);
    setSelectedNode(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      reactFlow.fitView({
        nodes: [node],
        duration: 800,
        padding: 2.0,
      });
    }
  }, [nodes, reactFlow, setSelectedNode]);

  const locateActiveStage = useCallback(() => {
    const node = nodes.find(n => n.id === activeStageId);
    if (node) {
      reactFlow.fitView({
        nodes: [node],
        duration: 800,
        padding: 2.0,
      });
    }
  }, [nodes, reactFlow, activeStageId]);

  const nextStage = () => {
    // If we have distinct paths, clicking "Next Stage" should follow the first logical path
    // if not already handled by path buttons
    if (nextStages.length === 1) {
      goToStage(nextStages[0]);
    } else if (currentIndex < allLayerIds.length - 1) {
      // Fallback to array order if no explicit edge found
      goToStage(allLayerIds[currentIndex + 1]);
    }
  };

  const prevStage = () => {
    if (currentIndex > 0) {
      goToStage(allLayerIds[currentIndex - 1]);
    }
  };

  // Responsive check for diagram padding
  const isMobile = useMemo(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false, []);

  useEffect(() => {
    try {
      setNodes(initialNodes);
      setEdges(initialEdges);

      const timer = setTimeout(() => {
        try {
          if (isDetailView) {
            reactFlow.fitView({ padding: isMobile ? 0.05 : 0.15, duration: 400 });
          } else {
            const startNode = initialNodes.find(n => n.id === "layer_1");
            if (startNode) {
              reactFlow.fitView({
                nodes: [startNode],
                padding: isMobile ? 0.4 : 0.8,
                duration: 400,
              });
            }
          }
        } catch (e) {
          setDiagramError(e as Error);
        }
      }, 50);

      return () => clearTimeout(timer);
    } catch (e) {
      setDiagramError(e as Error);
    }
  }, [initialNodes, initialEdges, isDetailView, isMobile, reactFlow, setNodes, setEdges]);

  const handleBackToOverview = useCallback(() => {
    const prevLayerId = selectedLayerId;
    setSelectedLayer(null);
    
    if (prevLayerId) {
      setTimeout(() => {
        const node = reactFlow.getNode(prevLayerId);
        if (node) {
          reactFlow.fitView({
            nodes: [node],
            duration: 600,
            padding: 2.0,
          });
        }
      }, 50);
    }
  }, [selectedLayerId, setSelectedLayer, reactFlow]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
      setActiveStageId(node.id);
      
      const nodeObj = nodes.find(n => n.id === node.id);
      if (nodeObj && !isDetailView) {
        reactFlow.fitView({
          nodes: [nodeObj],
          duration: 600,
          padding: 2.0,
        });
      }
    },
    [isDetailView, setSelectedNode, nodes, reactFlow]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      if (node.id.startsWith("layer_")) {
        setSelectedLayer(node.id);
      }
    },
    [setSelectedLayer]
  );

  const { setSelectedProvider } = useDiagramStore();

  const enrichedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onProviderClick: (pid: string) => {
          setSelectedProvider(pid);
        }
      }
    }));
  }, [nodes, setSelectedProvider]);

  const nextStages = useMemo(() => {
    // Find targets connected from the active stage
    return edges
      .filter(e => e.source === activeStageId)
      .map(e => e.target)
      .filter(id => allLayerIds.includes(id));
  }, [edges, activeStageId, allLayerIds]);

  const activeLayerLabel = activeLayer?.label ?? null;
  const activeLayerPurpose = activeLayer?.purpose ?? null;
  const activeLayerNarrative = activeLayer?.narrative ?? null;

  return (
    <div className="h-full w-full rounded-lg border border-secondary bg-secondary_subtle overflow-hidden relative">
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <button
          onClick={locateActiveStage}
          title="Locate Current Stage"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary bg-primary text-secondary shadow-lg transition-all hover:bg-secondary_subtle hover:text-primary active:scale-95"
        >
          <MarkerPin01 className="size-5" />
        </button>
      </div>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          setTimeout(() => {
            const nodes = instance.getNodes();
            const startNode = nodes.find(n => n.id === "layer_1");
            if (startNode) {
              instance.fitView({
                nodes: [startNode],
                padding: isMobile ? 0.4 : 0.8,
                duration: 400
              });
            } else {
              instance.fitView({ padding: 0.15, duration: 300 });
            }
          }, 50);
        }}
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "var(--color-utility-gray-300)", strokeWidth: 2 },
        }}
      >
        <Background color="var(--color-utility-gray-100)" gap={20} size={1} />

        {/* Storyteller Navigation Overlay (Overview Only) */}
        {!isDetailView && (
          <Panel position="bottom-center" className="mb-4 w-full max-w-xl px-2 sm:px-4 z-[100]">
            <div className="flex flex-col gap-2 sm:gap-3 rounded-2xl border border-brand/20 bg-primary/95 p-3 sm:p-4 shadow-2xl backdrop-blur-md ring-4 ring-brand/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-brand">
                    Phase {currentPhase} of {maxPhases}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-primary leading-tight">{activeLayerLabel}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevStage}
                    disabled={currentIndex === 0}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-secondary bg-primary text-secondary transition-all hover:bg-secondary_subtle disabled:opacity-30"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  {nextStages.length > 1 ? (
                    <div className="flex gap-2">
                      {nextStages.map((targetId) => {
                        const targetLayer = stackLayers.find(l => l.id === targetId);
                        return (
                          <button
                            key={targetId}
                            onClick={() => goToStage(targetId)}
                            className="flex h-9 sm:h-10 px-3 sm:px-4 gap-2 items-center justify-center rounded-xl bg-brand-solid text-white text-[10px] sm:text-[11px] font-bold shadow-lg transition-all hover:bg-brand-solid_hover hover:scale-105 active:scale-95"
                          >
                            <span className="hidden sm:inline">Path: {targetLayer?.label}</span>
                            <span className="sm:hidden">Next</span>
                            <ChevronRight className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={nextStage}
                      disabled={currentIndex === allLayerIds.length - 1}
                      className="flex h-9 sm:h-10 px-4 sm:px-6 gap-2 items-center justify-center rounded-xl bg-brand-solid text-white text-xs sm:text-sm font-bold shadow-lg transition-all hover:bg-brand-solid_hover hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <span>Next</span>
                      <ChevronRight className="size-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedLayer(activeStageId)}
                    className="flex h-9 sm:h-10 items-center gap-1.5 rounded-xl bg-brand-secondary px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold text-brand transition-all hover:bg-brand-secondary/80 active:scale-95"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span className="hidden xs:inline">Info</span>
                  </button>
                </div>
              </div>

              {activeLayerNarrative && !isMobile && (
                <p className="text-[11px] leading-relaxed text-secondary italic border-t border-secondary pt-2">
                  {activeLayerNarrative}
                </p>
              )}
            </div>
          </Panel>
        )}

        {isDetailView && (
          <Panel
            position="top-left"
            className="m-4 flex flex-col gap-1 rounded-xl border border-secondary bg-primary/95 p-4 shadow-xl backdrop-blur"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-quaternary">
              <span className="text-tertiary">Full Stack</span>
              <ChevronRight className="size-3" />
              <span className="text-brand">{activeLayerLabel || "Layer Details"}</span>
            </div>

            <button
              type="button"
              onClick={handleBackToOverview}
              className="mt-1 flex items-center gap-1.5 text-xs font-bold text-primary hover:text-brand transition-colors group"
            >
              <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Back
            </button>

            {activeLayerPurpose && (
              <p className="mt-1 max-w-[300px] text-xs text-tertiary font-medium italic">
                {activeLayerPurpose}
              </p>
            )}
          </Panel>
        )}

        {diagramError && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center bg-primary/20 backdrop-blur-sm">
            <div className="p-4 rounded-xl border border-secondary bg-primary shadow-2xl text-center">
              <p className="text-sm font-bold text-primary">Diagram Error</p>
              <p className="text-xs text-secondary mt-1">Failed to render diagram view.</p>
              <button 
                onClick={() => { setDiagramError(null); window.location.reload(); }}
                className="mt-4 px-4 py-2 bg-brand-solid text-white text-xs font-bold rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}

export function StackDiagram() {
  return (
    <ErrorBoundary 
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-secondary_subtle border border-secondary rounded-lg p-8 text-center">
          <div className="max-w-xs space-y-4">
            <div className="text-sm font-bold text-primary">Diagram Visualization Unstable</div>
            <p className="text-xs text-secondary">The technical engine for this visualization encountered a rendering error. Our team has been notified.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs font-bold text-brand hover:underline"
            >
              Refresh View
            </button>
          </div>
        </div>
      }
    >
      <ReactFlowProvider>
        <StackDiagramInner />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}

