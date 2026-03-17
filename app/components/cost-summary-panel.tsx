"use client";

import { useMemo, useState } from "react";
import { useDiagramStore } from "../store/diagram-store";
import { calculateOutputs } from "../data/assumptions";
import { providerConfigs, ProviderId } from "../data/providers";
import { Settings01, X, Zap } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

function RatioSettingsPopover({ 
  ratios, 
  setRatios 
}: { 
  ratios: { email: number; catchAll: number; mobile: number }; 
  setRatios: (ratios: any) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        size="sm"
        color="tertiary"
        className="px-2"
        onClick={() => setIsOpen(!isOpen)}
        title="Ratio Management"
      >
        <Settings01 className="size-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-[100] w-64 rounded-xl border border-secondary bg-primary p-4 shadow-xl ring-1 ring-primary/10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-secondary">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Session Ratios (%)</h4>
            <button onClick={() => setIsOpen(false)} className="text-tertiary hover:text-primary">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-tertiary uppercase">Emails</label>
                <span className="text-[10px] font-bold text-brand">{(ratios.email * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                className="w-full accent-brand"
                value={ratios.email}
                onChange={(e) => setRatios({ email: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-tertiary uppercase">Catch-Alls</label>
                <span className="text-[10px] font-bold text-brand">{(ratios.catchAll * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                className="w-full accent-brand"
                value={ratios.catchAll}
                onChange={(e) => setRatios({ catchAll: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-tertiary uppercase">Mobiles</label>
                <span className="text-[10px] font-bold text-brand">{(ratios.mobile * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                className="w-full accent-brand"
                value={ratios.mobile}
                onChange={(e) => setRatios({ mobile: parseFloat(e.target.value) })}
              />
            </div>
            
            <p className="text-[9px] text-tertiary italic leading-tight pt-1">
              Adjusting these ratios overrides the bottom-up probability model for the current session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CostSummaryPanel() {
  const { 
    assumptions, 
    currentPreset, 
    billingPeriod, 
    costViewMode, 
    selectedNodeId,
    targetScale,
    emailRatio,
    catchAllRatio,
    mobileRatio,
    setRatios
  } = useDiagramStore();

  const metrics = useMemo(() => {
    const enabledIds = currentPreset.providers_enabled as ProviderId[];
    const enabledConfigs = enabledIds.map(id => providerConfigs[id]).filter(Boolean);

    // Group by tier
    const byTier = {
      pattern: enabledConfigs.filter(c => c.tier === "pattern"),
      cheap: enabledConfigs.filter(c => c.tier === "cheap"),
      mid: enabledConfigs.filter(c => c.tier === "mid"),
      premium: enabledConfigs.filter(c => c.tier === "premium"),
      verification: enabledConfigs.filter(c => c.tier === "verification"),
      phone: enabledConfigs.filter(c => c.tier === "phone"),
    };

    const availability = {
      has_cheap: byTier.cheap.length > 0,
      has_premium: byTier.mid.length > 0 || byTier.premium.length > 0,
      has_phone: byTier.phone.length > 0,
      max_cheap_accuracy: Math.max(0, ...byTier.cheap.map(c => c.accuracyPercent || 0)),
      max_premium_accuracy: Math.max(0, ...[...byTier.mid, ...byTier.premium].map(c => c.accuracyPercent || 0)),
      max_phone_accuracy: Math.max(0, ...byTier.phone.map(c => c.accuracyPercent || 0)),
      max_verification_accuracy: Math.max(0, ...byTier.verification.map(c => c.accuracyPercent || 0))
    };

    const identities = targetScale * 1_000_000;
    const overrides = { emailRatio, catchAllRatio, mobileRatio };
    const outputs = calculateOutputs(assumptions, identities, overrides, availability);

    let subscriptionTotal = 0;
    let waterfallUsageTotal = 0;
    let identityBoost = 0;
    let emailBoost = 0;
    let phoneBoost = 0;

    // 1. Subscriptions & Base Costs
    enabledConfigs.forEach(config => {
      const pm = config.pricingModel;
      if (pm.type === "seatContract") {
        subscriptionTotal += pm.annualContract;
      } else if (pm.type === "planCredits") {
        subscriptionTotal += pm.planCost;
      }
    });

    const getMinUnitCost = (configs: typeof enabledConfigs) => {
      if (configs.length === 0) return 0;
      const costs = configs.map(c => {
        const pm = c.pricingModel;
        if (pm.type === "usage") return pm.unitCost;
        if (pm.type === "quote") return pm.benchmarkUnitCost || 0;
        if (pm.type === "planCredits") return pm.planCost / pm.includedUnits;
        if (pm.type === "seatContract") {
          return pm.annualContract / (pm.includedCredits || (targetScale * 1_000_000));
        }
        return 0;
      }).filter(cost => cost > 0);
      
      return costs.length > 0 ? Math.min(...costs) : 0;
    };

    const avgVerifyCost = getMinUnitCost(byTier.verification) || 0.0015;
    const cheapCost = getMinUnitCost(byTier.cheap);
    const midCost = getMinUnitCost(byTier.mid);
    const premiumCost = getMinUnitCost(byTier.premium);

    // 2. Waterfall Usage Logic
    const vLoad = outputs.waterfall.pattern + outputs.waterfall.cheap + outputs.waterfall.premium;
    const verificationTotal = vLoad * avgVerifyCost * 1.2;
    
    let cheapTotal = 0;
    if (cheapCost > 0) cheapTotal = outputs.waterfall.cheap * cheapCost;

    const avgPremium = ((midCost || 0) + (premiumCost || 0)) / ((midCost > 0 && premiumCost > 0) ? 2 : (midCost > 0 || premiumCost > 0 ? 1 : 1));
    const finalPremium = (midCost > 0 || premiumCost > 0) ? avgPremium : 0;
    let premiumTotal = 0;
    if (finalPremium > 0) premiumTotal = outputs.waterfall.premium * finalPremium;

    // Pull phone costs from config if possible
    const rrConfig = providerConfigs.rocketreach;
    const hlrConfig = providerConfigs.hlr_lookup;
    const phoneSourceCost = rrConfig.pricingModel.type === 'quote' ? (rrConfig.pricingModel.benchmarkUnitCost || 0.16) : 0.16;
    const phoneValidationCost = hlrConfig.pricingModel.type === 'usage' ? hlrConfig.pricingModel.unitCost : 0.0045;
    
    const phoneSourceTotal = outputs.phone_source_hits * phoneSourceCost;
    const phoneValidationTotal = outputs.phone_validation_hits * phoneValidationCost;
    const phoneTotal = phoneSourceTotal + phoneValidationTotal;

    const internalSavings = outputs.provider_calls_avoided * (cheapCost || 0.02);

    // 3. Score Modeling
    enabledConfigs.forEach(config => {
      Object.entries(config.rolesByLayer).forEach(([_, role]) => {
        if (!role) return;
        const boostMap: Record<string, number> = { low: 0.05, medium: 0.1, high: 0.18, very_high: 0.3 };
        const val = boostMap[role.confidenceEffect] || 0;
        if (config.category === "all-in-one" || config.category === "enrichment") {
          identityBoost += val / 4;
          emailBoost += val / 3;
        } else if (config.category === "verification") {
          emailBoost += val;
        } else if (config.category === "phone") {
          phoneBoost += val;
        }
      });
    });

    const normalize = (value: number) => Math.max(0, Math.min(1, value));
    
    // 4. Scoping for Phase Focus
    let displayCost = subscriptionTotal + cheapTotal + premiumTotal + verificationTotal + phoneTotal;
    let displaySavings = internalSavings;
    let focusLabel = "Global Stack Summary";

    if (costViewMode === "phase" && selectedNodeId) {
      const isLayer5 = selectedNodeId === "layer_5"; 
      const isLayer6 = selectedNodeId === "layer_6"; 
      const isLayer8 = selectedNodeId === "layer_8"; 
      const isLayer4 = selectedNodeId === "layer_4" || selectedNodeId === "layer_7"; 

      if (isLayer5) {
        displayCost = cheapTotal + premiumTotal;
        focusLabel = "Email Resolution Pass Costs";
      } else if (isLayer6) {
        displayCost = verificationTotal;
        focusLabel = "Verification Infrastructure Spend";
      } else if (isLayer8) {
        displayCost = phoneTotal;
        focusLabel = "Mobile Enrichment & HLR Costs";
      } else if (isLayer4) {
        displayCost = subscriptionTotal * 0.1; 
        displaySavings = internalSavings * 0.8;
        focusLabel = "Proprietary Logic Economics";
      } else {
        displayCost = (cheapTotal + premiumTotal) * 0.05;
        focusLabel = `${selectedNodeId.replace('_', ' ').toUpperCase()} Focus`;
      }
    }

    const annualTotal = displayCost;
    const periodCost = billingPeriod === "monthly" ? annualTotal / 12 : annualTotal;

    return {
      ...outputs,
      focusLabel,
      costEstimate: periodCost,
      internalSavings: billingPeriod === "monthly" ? displaySavings / 12 : displaySavings,
      identityScore: Math.min(0.95, normalize(0.65 + identityBoost)),
      emailScore: Math.min(0.95, normalize(0.55 + emailBoost)),
      phoneScore: Math.min(0.95, normalize(0.40 + phoneBoost)),
      cheapTotal,
      premiumTotal,
      verificationTotal,
      phoneTotal
    };
  }, [currentPreset, billingPeriod, assumptions, costViewMode, selectedNodeId, targetScale, emailRatio, catchAllRatio, mobileRatio]);

  const {
      verified_emails,
      catch_all_emails,
      sms_eligible_mobiles,
      internalSavings,
      accuracy_pre_validation,
      accuracy_post_validation,
      identityScore,
      emailScore,
      phoneScore,
      costEstimate,
      focusLabel
  } = metrics;

  const costPerVerified = verified_emails > 0 ? costEstimate / verified_emails : 0;
  const costPerSms = sms_eligible_mobiles > 0 ? costEstimate / sms_eligible_mobiles : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary">{focusLabel}</h3>
        <RatioSettingsPopover 
          ratios={{ email: emailRatio, catchAll: catchAllRatio, mobile: mobileRatio }} 
          setRatios={setRatios} 
        />
      </div>
      <p className="text-[11px] text-tertiary leading-tight">
        Based on selected providers, assumptions, and routing rules. Accuracy scores are relative, modeled from provider mix.
      </p>

      <div className="grid gap-3">
        <MetricCard
          label="Estimated stack cost"
          value={
            billingPeriod === "annual"
              ? `$${(costEstimate / 1000).toFixed(0)}k/yr`
              : `$${(costEstimate / 1000).toFixed(1)}k/mo`
          }
          subtext="Contract + usage + platform"
          highlight
        />
        <MetricCard
          label="Internal lookup savings"
          value={
            billingPeriod === "annual"
              ? `$${(internalSavings / 1000).toFixed(0)}k/yr`
              : `$${(internalSavings / 1000).toFixed(1)}k/mo`
          }
          subtext="Modeled avoided provider calls"
          theme="success"
        />
        <MetricCard
          label="Verified emails/year"
          value={verified_emails.toLocaleString()}
          subtext="SMTP-verified deliverable"
        />
        <MetricCard
          label="Catch-all usable/year"
          value={catch_all_emails.toLocaleString()}
          subtext="High-confidence pattern pool"
        />
        <MetricCard
          label="SMS-ready mobiles/year"
          value={sms_eligible_mobiles.toLocaleString()}
          subtext="Line type + active + policy"
        />
        <MetricCard
          label="Cost per verified email"
          value={`$${costPerVerified.toFixed(4)}`}
          subtext="Modeled estimate"
        />
        <MetricCard
          label="Cost per SMS-ready mobile"
          value={`$${costPerSms.toFixed(2)}`}
          subtext="Modeled estimate"
        />
        <MetricCard
          label="Accuracy Before Verification"
          value={`${(accuracy_pre_validation * 100).toFixed(1)}%`}
          subtext="Modeled raw source quality"
          theme={accuracy_pre_validation < 0.75 ? "warning" : "default"}
        />
        <MetricCard
          label="Accuracy Post-Verification"
          value={`${(accuracy_post_validation * 100).toFixed(1)}%`}
          subtext="After SMTP validation cleanup"
          theme="success"
        />
        <MetricCard
          label="Mobile Accuracy (Raw)"
          value={`${((metrics as any).accuracy_phone_pre * 100).toFixed(1)}%`}
          subtext="Modeled source quality"
          theme={(metrics as any).accuracy_phone_pre < 0.7 ? "warning" : "default"}
        />
        <MetricCard
          label="Mobile Accuracy (Verified)"
          value={`${((metrics as any).accuracy_phone_post * 100).toFixed(1)}%`}
          subtext="After HLR & carrier check"
          theme="success"
        />
        <MetricCard
          label="Identity data accuracy"
          value={`${(identityScore * 100).toFixed(0)}%`}
          subtext="Coverage of people + companies"
        />
        <MetricCard
          label="Email accuracy"
          value={`${(emailScore * 100).toFixed(0)}%`}
          subtext="Relative accuracy after verification. Premium stacks typically peak at 90-95%."
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  highlight,
  theme = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  theme?: "default" | "success" | "warning";
}) {
  const themeClasses = {
    default: "border-secondary bg-primary",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  };

  return (
    <div className={`rounded-lg border p-3 ${themeClasses[theme]} ${highlight ? 'ring-1 ring-primary/10' : ''}`}>
      <div className="text-xs font-medium text-tertiary">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${theme === 'success' ? 'text-green-600' : 'text-primary'}`}>{value}</div>
      {subtext && <div className="mt-0.5 text-[10px] text-quaternary">{subtext}</div>}
    </div>
  );
}
