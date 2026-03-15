"use client";

import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { StackExplorerPage } from "./pages/stack-explorer-page";
import { AgentExplorerPage } from "./pages/agent-explorer-page";
import { DocsPage } from "./pages/docs-page";
import { PricingPage } from "./pages/pricing-page";
import { cx } from "@/utils/cx";
import { useDiagramStore } from "./store/diagram-store";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { Plus, Trash01, Settings01 } from "@untitledui/icons";

export function App() {
  return (
    <div className="flex h-screen flex-col bg-secondary">
      <Header />

      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<StackExplorerPage />} />
          <Route path="/agent" element={<AgentExplorerPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </div>
    </div>
  );
}

function Header() {
  const location = useLocation();
  const isExplorer = location.pathname === "/";
  
  const { 
    presets, 
    currentPreset, 
    setCurrentPreset, 
    duplicatePreset, 
    removePreset,
    confidenceMode,
    setConfidenceMode 
  } = useDiagramStore();

  const handlePresetAction = (id: string) => {
    if (id === "new_preset") {
      duplicatePreset(currentPreset);
    } else {
      const p = presets.find(p => p.id === id);
      if (p) setCurrentPreset(p);
    }
  };

  const isCustom = !currentPreset.id.startsWith("gds_") && 
                   !currentPreset.id.startsWith("lowest_") &&
                   !currentPreset.id.startsWith("balanced_") &&
                   !currentPreset.id.startsWith("premium_") &&
                   !currentPreset.id.startsWith("pattern_") &&
                   !currentPreset.id.startsWith("zoominfo_");

  return (
    <nav className="flex shrink-0 items-center justify-between border-b border-secondary bg-primary px-4 py-2">
      <div className="flex items-center gap-6">
        <div className="flex flex-col pr-4 border-r border-secondary">
          <h1 className="text-sm font-bold text-primary tracking-tight">GDS Data Engine</h1>
          <p className="text-[9px] text-tertiary uppercase font-medium">Strategic Architecture</p>
        </div>
        
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-secondary text-brand-secondary" : "text-tertiary hover:bg-primary_hover hover:text-primary"
              )
            }
          >
            Explorer
          </NavLink>
          <NavLink
            to="/agent"
            className={({ isActive }) =>
              cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-secondary text-brand-secondary" : "text-tertiary hover:bg-primary_hover hover:text-primary"
              )
            }
          >
            Agent
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-secondary text-brand-secondary" : "text-tertiary hover:bg-primary_hover hover:text-primary"
              )
            }
          >
            Docs
          </NavLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-secondary text-brand-secondary" : "text-tertiary hover:bg-primary_hover hover:text-primary"
              )
            }
          >
            Pricing
          </NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isExplorer && (
          <>
            <div className="flex items-center gap-2 border-r border-secondary pr-4">
              {presets.length <= 1 ? (
                <Button 
                  size="sm" 
                  color="secondary"
                  iconLeading={Plus} 
                  onClick={() => duplicatePreset(currentPreset)}
                >
                  New+
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Select
                    size="sm"
                    className="min-w-[180px]"
                    selectedKey={currentPreset.id}
                    onSelectionChange={(k) => k && handlePresetAction(String(k))}
                    items={[
                      ...presets.map(p => ({ id: p.id, label: p.name })),
                      { id: "new_preset", label: "New+", icon: <Plus className="size-3.5" /> }
                    ]}
                  >
                    {(item: any) => (
                      <Select.Item id={item.id} label={item.label} icon={item.icon} />
                    )}
                  </Select>
                  {isCustom && (
                    <Button
                      size="sm"
                      color="tertiary-destructive"
                      className="px-2"
                      onClick={() => removePreset(currentPreset.id)}
                    >
                      <Trash01 className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Select
                size="sm"
                className="w-32"
                selectedKey={confidenceMode}
                onSelectionChange={(k) => k && setConfidenceMode(k as any)}
                items={[
                  { id: "conservative", label: "Conservative" },
                  { id: "base", label: "Base" },
                  { id: "aggressive", label: "Aggressive" },
                ]}
              >
                {(item: any) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
