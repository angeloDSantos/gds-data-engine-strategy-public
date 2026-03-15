"use client";

import { X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { providerCatalog } from "../data/provider-catalog";

interface ProviderDrawerProps {
  providerId: string | null;
  onClose: () => void;
}

export function ProviderDrawer({ providerId, onClose }: ProviderDrawerProps) {
  if (!providerId) return null;

  const provider = providerCatalog.find((p) => p.provider_id === providerId);
  if (!provider) return null;

  const pricing = provider.pricing;

  return (
    <div className="flex h-full w-72 flex-col border-l border-secondary bg-primary">
      <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
        <h3 className="text-md font-semibold text-primary">{provider.name}</h3>
        <Button color="tertiary" size="sm" onClick={onClose} aria-label="Close">
          <X className="size-5" data-icon aria-hidden />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        <section className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">Categories</h4>
          <p className="mt-1 text-secondary">
            {provider.categories.map((c) => c.replace(/_/g, " ")).join(", ")}
          </p>
        </section>

        <section className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">Pricing</h4>
          <div className="mt-1 space-y-1 text-secondary">
            {pricing.entry_monthly && (
              <p>Entry: ${pricing.entry_monthly}/mo (${(pricing.entry_monthly * 12).toLocaleString()}/yr)</p>
            )}
            {pricing.billing_notes && (
              <p className="text-xs text-tertiary">{pricing.billing_notes}</p>
            )}
            {pricing.public_available ? (
              <span className="text-[10px] text-quaternary">Public pricing</span>
            ) : (
              <span className="text-[10px] text-quaternary">Quote / manual entry</span>
            )}
          </div>
        </section>

        <section className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">Strengths</h4>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-secondary">
            {provider.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">Weaknesses</h4>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-secondary">
            {provider.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>

        {provider.confidence_effects && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary">Confidence effects</h4>
            <p className="mt-1 text-secondary">
              {Object.entries(provider.confidence_effects)
                .map(([k, v]) => `${k.replace(/_/g, " ")}: +${(v * 100).toFixed(0)}%`)
                .join(", ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
