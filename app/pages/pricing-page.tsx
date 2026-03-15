"use client";

import { useMemo } from "react";
import { providerConfigs, ProviderId } from "../data/providers";
import { Coins02, Zap, Database01, HelpCircle, ShieldTick } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export function PricingPage() {
  const configs = useMemo(() => Object.values(providerConfigs), []);

  return (
    <div className="flex h-full flex-col bg-primary overflow-hidden">
      <main className="flex-1 overflow-y-auto px-8 py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <header className="border-b border-secondary pb-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Coins02 className="size-8 text-success-600" />
              Tool Pricing & Package Catalog
            </h1>
            <p className="mt-2 text-lg text-tertiary">
              Detailed unit costs vs. actual package spend and compounding efficiency modeling.
            </p>
          </header>

          {/* Compounding Efficiency Alert */}
          <section className="rounded-2xl border border-brand/20 bg-brand-secondary/10 p-6 shadow-sm ring-1 ring-brand/5">
            <div className="flex gap-4">
              <Database01 className="size-6 text-brand shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-brand">The Compounding Memory Effect</h3>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  As our internal database grows, the need to pay for external lookups vanishes. For high-volume campaigns (2.5M+ targets), up to **33%-40%** of contacts are typically already verified in our Master DB, dropping the marginal cost of subsequent campaigns toward zero.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary tracking-tight">Provider Economics</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-quaternary">
                <ShieldTick className="size-3.5 text-success-500" />
                Verified for 2026 Volume
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 border-b border-secondary">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-tertiary">Provider</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-tertiary">Tier</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-tertiary">Unit Cost (v/our model)</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-tertiary">Actual Package / Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {configs.filter(c => c.id !== 'internal').map((config) => (
                    <tr key={config.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg border border-secondary bg-primary shadow-xs">
                            <Zap className="size-4 text-brand" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-primary">{config.name}</div>
                            <div className="text-[10px] text-tertiary uppercase tracking-tighter">{config.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cx(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          config.tier === 'premium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          config.tier === 'verification' ? "bg-green-50 text-green-700 border-green-200" :
                          "bg-secondary text-primary border-secondary"
                        )}>
                          {config.tier}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-primary">
                          {config.pricingModel.type === 'usage' ? `$${config.pricingModel.unitCost.toFixed(4)}` :
                           config.pricingModel.type === 'quote' ? `$${(config.pricingModel.benchmarkUnitCost || 0).toFixed(3)}*` :
                           config.pricingModel.type === 'planCredits' ? `$${(config.pricingModel.planCost / config.pricingModel.includedUnits).toFixed(3)}` :
                           'Contract Based'}
                        </div>
                        <div className="text-[10px] text-tertiary italic">Per successful resolution</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-secondary font-medium">
                          {config.packageNote || "Custom Quote Required"}
                        </div>
                        {config.pricingModel.type === 'seatContract' && (
                          <div className="text-[10px] text-quaternary leading-tight">
                            Incl. {config.pricingModel.includedCredits?.toLocaleString()} credits/yr
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Internal Proprietary Entry */}
                  <tr className="bg-brand-secondary/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg border border-brand/20 bg-primary shadow-xs">
                          <Database01 className="size-4 text-brand" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand">GDS Internal AI Loop</div>
                          <div className="text-[10px] text-brand-secondary uppercase tracking-tighter">Proprietary</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-secondary text-brand border border-brand/20">
                        Self-Improver
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-success-600">$0.0000</div>
                      <div className="text-[10px] text-success-700 italic font-medium">Marginal cost after resolution</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-secondary italic">
                      Included in Architecture Platform
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-quaternary leading-relaxed">
              * Modeled benchmarks for high-volume enterprise contracts. Prices subject to negotiated tier and actual resolution success rates.
            </p>
          </section>

          {/* Theoretical Cost Modeling Section */}
          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-secondary p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-brand" />
                <h3 className="font-bold text-primary">Unit vs. Package Variance</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Many tools (e.g., RocketReach) list at high retail prices for small volumes. Our stack assumes a negotiated <strong>$0.05/contact</strong> efficiency rate by leveraging bulk credit purchases and internal deduplication before external triggers.
              </p>
            </div>
            <div className="rounded-xl border border-secondary p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-brand" />
                <h3 className="font-bold text-primary">Marginal Cost Zeroing</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                For every 100k mobile lookups we perform, we effectively "buy" that data once. In Year 2, the resolution occurs against our Internal Master DB, reducing the $2.5M identity resolution spend significantly as hit rates move internal.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
