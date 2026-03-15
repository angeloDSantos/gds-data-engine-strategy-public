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
import { LayerNode } from "./layer-node";
import { buildLayerDetailDiagram, buildOverviewDiagram, stackLayers } from "./stack-layers";
import { ChevronLeft, ChevronRight, MarkerPin01, Play } from "@untitledui/icons";

const nodeTypes: NodeTypes = { layerNode: LayerNode };

function StackDiagramInner() {
  const { selectedLayerId, setSelectedLayer, setSelectedNode } = useDiagramStore();
  const [activeStageId, setActiveStageId] = useState<string>("layer_1");

  const isDetailView = !!selectedLayerId;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (isDetailView && selectedLayerId ? buildLayerDetailDiagram(selectedLayerId) : buildOverviewDiagram()),
    [isDetailView, selectedLayerId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();

  // Navigation Logic
  const allLayerIds = useMemo(() => stackLayers.map(l => l.id), []);
  const currentIndex = allLayerIds.indexOf(activeStageId);

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
    if (currentIndex < allLayerIds.length - 1) {
      goToStage(allLayerIds[currentIndex + 1]);
    }
  };

  const prevStage = () => {
    if (currentIndex > 0) {
      goToStage(allLayerIds[currentIndex - 1]);
    }
  };

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    requestAnimationFrame(() => {
      if (isDetailView) {
        reactFlow.fitView({ padding: 0.15, duration: 400 });
      } else {
        // Find layer_1 and focus it initially with a tight, premium zoom
        const startNode = initialNodes.find(n => n.id === "layer_1");
        if (startNode) {
          reactFlow.fitView({ nodes: [startNode], padding: 0.8, duration: 400 });
        }
      }
    });
  }, [initialNodes, initialEdges, reactFlow, setEdges, setNodes, isDetailView, activeStageId]);

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

  const activeLayer = useMemo(() => {
    const id = isDetailView ? selectedLayerId : activeStageId;
    if (!id) return null;
    return stackLayers.find((l) => l.id === id) || null;
  }, [selectedLayerId, isDetailView, activeStageId]);

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

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedLayer(node.id);
    },
    [setSelectedLayer]
  );

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
          <Panel position="bottom-center" className="mb-4 w-full max-w-xl px-4 z-[100]">
            <div className="flex flex-col gap-3 rounded-2xl border border-brand/20 bg-primary/95 p-4 shadow-2xl backdrop-blur-md ring-4 ring-brand/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand">
                    Phase {currentIndex + 1} of {allLayerIds.length}
                  </span>
                  <h2 className="text-lg font-bold text-primary leading-tight">{activeLayerLabel}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevStage}
                    disabled={currentIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary bg-primary text-secondary transition-all hover:bg-secondary_subtle disabled:opacity-30"
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
                            className="flex h-10 px-4 gap-2 items-center justify-center rounded-xl bg-brand-solid text-white text-[11px] font-bold shadow-lg transition-all hover:bg-brand-solid_hover hover:scale-105 active:scale-95"
                          >
                            <span>Path: {targetLayer?.label}</span>
                            <ChevronRight className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={nextStage}
                      disabled={currentIndex === allLayerIds.length - 1}
                      className="flex h-10 px-6 gap-2 items-center justify-center rounded-xl bg-brand-solid text-white text-sm font-bold shadow-lg transition-all hover:bg-brand-solid_hover hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <span>Next Stage</span>
                      <ChevronRight className="size-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedLayer(activeStageId)}
                    className="ml-2 flex h-10 items-center gap-1.5 rounded-xl bg-brand-secondary px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand-secondary/80 active:scale-95"
                  >
                    <Play className="size-3.5 fill-current" />
                    More Info
                  </button>
                </div>
              </div>

              {activeLayerNarrative && (
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
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setSelectedLayer(null)}
                className="font-semibold text-tertiary hover:text-primary transition-colors"
              >
                Full Stack
              </button>
              <ChevronRight className="size-4 text-quaternary" />
              <span className="font-bold text-brand">{activeLayerLabel}</span>
            </div>

            {activeLayerPurpose && (
              <p className="mt-1 max-w-[300px] text-xs text-tertiary font-medium italic">
                {activeLayerPurpose}
              </p>
            )}
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function StackDiagram() {
  return (
    <ReactFlowProvider>
      <StackDiagramInner />
    </ReactFlowProvider>
  );
}

