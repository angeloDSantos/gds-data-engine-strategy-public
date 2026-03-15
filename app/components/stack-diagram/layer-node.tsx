"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cx } from "@/utils/cx";
export const LayerNode = memo(function LayerNode({ data, selected }: any) {
  const { isOverview, narrative, outputSpec, isCRM } = data;
  const isInput = data.label?.toLowerCase().includes("input");
  const isOutput = data.label?.toLowerCase().includes("output");
  const isFinal = data.label?.toLowerCase().includes("final");

  return (
    <div
      className={cx(
        "rounded-2xl border-2 bg-primary px-6 py-5 shadow-sm transition-all duration-300 relative group",
        isOverview ? "min-w-[500px] max-w-[600px]" : "min-w-[260px]",
        selected
          ? "border-brand ring-8 ring-brand/10 shadow-xl"
          : "border-secondary hover:border-brand/40 hover:bg-primary_hover",
        (isInput || isOutput) && !isOverview && "border-dashed opacity-90 scale-95",
        isCRM && "bg-secondary_subtle border-dashed !py-3 !px-4"
      )}
      style={data.style}
    >
      {/* Step Number Badge */}
      {data.phaseNumber && (
        <div className="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-brand bg-primary font-bold text-brand shadow-lg transition-transform group-hover:scale-110">
          {data.phaseNumber}
        </div>
      )}

      {/* Handles logic: Vertical for Overview, Horizontal for Drill-ins */}
      <Handle
        type="target"
        position={isOverview ? Position.Top : Position.Left}
        className={cx(
          "!h-4 !w-4 !border-2 !border-brand !bg-primary transition-transform group-hover:scale-125",
          isOverview ? "!-top-[8px]" : "!-left-2"
        )}
      />

      <div className="flex items-center justify-between mb-2">
        <div className={cx(
          "font-bold text-primary tracking-tight",
          isOverview ? "text-xl" : "text-sm"
        )}>
          {data.label}
        </div>
        {(isFinal || isOverview) && (
          <span className="rounded-full bg-brand-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            {isOverview ? "Stage" : "End State"}
          </span>
        )}
      </div>

      {data.purpose && (
        <div className={cx(
          "leading-relaxed text-tertiary",
          isOverview ? "text-sm font-medium mb-4" : "text-xs mt-1"
        )}>
          {data.purpose}
        </div>
      )}

      {isOverview && narrative && (
        <div className="mt-4 p-4 rounded-xl bg-secondary_subtle border border-secondary text-sm leading-relaxed text-secondary">
          {narrative}
        </div>
      )}

      {outputSpec && (
        <div className={cx(
          "mt-4 p-3 rounded-lg bg-brand-secondary/30 border border-brand/20 font-bold text-brand italic",
          isOverview ? "text-xs" : "text-[10px]"
        )}>
          Output: {outputSpec}
        </div>
      )}

      {data.providers?.length > 0 && (
        <div className={cx(
          "flex flex-wrap gap-2",
          isOverview ? "mt-6" : "mt-3"
        )}>
          <div className="w-full text-[10px] font-bold uppercase tracking-widest text-quaternary mb-1">
            Technology Partners
          </div>
          {data.providers.slice(0, 6).map((p: any) => (
            <button
              key={p}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                data.onProviderClick?.(p);
              }}
              className="inline-flex items-center rounded-lg border border-secondary bg-primary px-3 py-1 text-[11px] font-semibold text-secondary transition-all hover:border-brand/30 hover:shadow-sm"
            >
              {p === "internal" ? "GDS Proprietary Tools" : p.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={isOverview ? Position.Bottom : Position.Right}
        className={cx(
          "!h-4 !w-4 !border-2 !border-brand !bg-primary transition-transform group-hover:scale-125",
          isOverview ? "!-bottom-[8px]" : "!-right-2"
        )}
      />
    </div>
  );
});

