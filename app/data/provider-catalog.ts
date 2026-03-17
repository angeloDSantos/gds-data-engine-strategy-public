export interface ProviderPricing {
  type: string;
  public_available: boolean;
  entry_monthly?: number;
  entry_annual?: number;
  billing_notes?: string;
  manual_enterprise_override?: boolean;
  unit_cost_per_identity?: number;
  unit_cost_per_email?: number;
  unit_cost_per_verification?: number;
  unit_cost_per_phone_lookup?: number;
}

export interface Provider {
  provider_id: string;
  name: string;
  categories: string[];
  pricing: ProviderPricing;
  strengths: string[];
  weaknesses: string[];
  confidence_effects?: Record<string, number>;
  best_use_cases?: string[];
  regions_strength?: string[];
}

export const providerCatalog: Provider[] = [
  {
    provider_id: "apollo",
    name: "Apollo",
    categories: ["company_intelligence", "identity_resolution", "contact_data", "enrichment"],
    pricing: {
      type: "seat_plus_credits",
      public_available: true,
      entry_monthly: 49,
      entry_annual: 588,
      billing_notes: "Basic billed annually, 30,000 credits/user/year",
      manual_enterprise_override: true,
      unit_cost_per_identity: 0.015,
      unit_cost_per_email: 0.04,
    },
    strengths: ["company filtering", "identity discovery", "base prospecting"],
    weaknesses: ["not sufficient alone for best-in-class email/mobile accuracy"],
    confidence_effects: { identity_confidence_boost: 0.18, email_confidence_boost: 0.08 },
  },
  {
    provider_id: "clay",
    name: "Clay",
    categories: ["orchestration", "enrichment_workflow"],
    pricing: {
      type: "tiered",
      public_available: true,
      entry_monthly: 185,
      entry_annual: 2220,
      billing_notes: "Launch: 2,500 credits, 15,000 actions. Growth: $495/mo, 6,000 credits",
      manual_enterprise_override: true,
    },
    strengths: ["orchestration", "fallback engine", "workflow UI", "private API reduces credit burn"],
    weaknesses: ["not a database substitute by itself"],
  },
  {
    provider_id: "prospeo",
    name: "Prospeo",
    categories: ["email_enrichment", "mobile_enrichment", "api"],
    pricing: {
      type: "tiered",
      public_available: true,
      entry_monthly: 37,
      entry_annual: 444,
      billing_notes: "Starter $37, Growth $74, Pro $149/mo annual equivalent",
      manual_enterprise_override: true,
    },
    strengths: ["fallback enrichment", "API-first"],
    weaknesses: ["better used selectively than universally"],
  },
  {
    provider_id: "emailsearch_io",
    name: "Emailsearch.io",
    categories: ["search", "enrichment", "verification", "company_search"],
    pricing: {
      type: "tiered",
      public_available: true,
      entry_monthly: 29,
      entry_annual: 348,
      billing_notes: "Basic $29/1k searches, Pro $49/5k, Expert $99/20k, Agency $279 unlimited",
      manual_enterprise_override: true,
    },
    strengths: ["low-cost bulk pass", "cheap wide-net discovery"],
    weaknesses: ["accuracy assumptions conservative until benchmarked"],
  },
  {
    provider_id: "pdl",
    name: "People Data Labs",
    categories: ["company_intelligence", "identity_resolution", "raw_data"],
    pricing: {
      type: "usage",
      public_available: true,
      entry_monthly: 100,
      entry_annual: 1200,
      billing_notes: "1,000 monthly records base, enterprise quote-based",
      manual_enterprise_override: true,
      unit_cost_per_identity: 0.02,
    },
    strengths: ["raw infrastructure", "identity graph", "custom internal systems"],
    weaknesses: ["duplicates cost again unless internally deduped"],
  },
  {
    provider_id: "rocketreach",
    name: "RocketReach",
    categories: ["contact_enrichment", "email", "phone"],
    pricing: {
      type: "quote",
      public_available: false,
      manual_enterprise_override: true,
      unit_cost_per_email: 0.08,
      unit_cost_per_phone_lookup: 0.15,
    },
    strengths: ["direct email/phone lookup", "high-value phone fallback"],
    weaknesses: ["should not be relied on alone for final truth"],
  },
  {
    provider_id: "millionverifier",
    name: "MillionVerifier",
    categories: ["email_verification"],
    pricing: {
      type: "volume",
      public_available: true,
      entry_monthly: 59,
      billing_notes: "~100k for ~$149, ~1M for ~$449. Vendor claims 99%+ accuracy",
      unit_cost_per_verification: 0.0015,
    },
    strengths: ["bulk verification economics", "core verification provider"],
    weaknesses: ["vendor claims; mark as vendor claim until benchmarked"],
  },
  {
    provider_id: "neverbounce",
    name: "NeverBounce",
    categories: ["email_verification"],
    pricing: { type: "quote", public_available: false, manual_enterprise_override: true },
    strengths: ["MillionVerifier alternative"],
    weaknesses: ["benchmark mode unless internal pricing secured"],
  },
  {
    provider_id: "zerobounce",
    name: "ZeroBounce",
    categories: ["email_verification"],
    pricing: { type: "quote", public_available: false, manual_enterprise_override: true },
    strengths: ["MillionVerifier alternative"],
    weaknesses: ["benchmark mode unless internal pricing secured"],
  },
  {
    provider_id: "twilio_lookup",
    name: "Twilio Lookup",
    categories: ["phone_validation", "line_type", "carrier"],
    pricing: {
      type: "usage",
      public_available: true,
      billing_notes: "Line type: $0.008/request. Line status tiered $0.007–$0.00385",
      unit_cost_per_phone_lookup: 0.008,
    },
    strengths: ["phone validation", "line type classification", "essential for SMS eligibility"],
    weaknesses: ["not a phone finder, use post-source"],
  },
  {
    provider_id: "telesign",
    name: "Telesign",
    categories: ["phone_validation", "line_intelligence"],
    pricing: { type: "quote", public_available: false, manual_enterprise_override: true },
    strengths: ["premium alternative to Twilio"],
    weaknesses: ["quote/custom by default"],
  },
  {
    provider_id: "cognism",
    name: "Cognism",
    categories: ["contact_data", "phone", "premium_mobile"],
    pricing: { type: "quote", public_available: false, manual_enterprise_override: true },
    strengths: ["premium mobile benchmark"],
    weaknesses: ["high cost"],
  },
  {
    provider_id: "lusha",
    name: "Lusha",
    categories: ["contact_data", "phone"],
    pricing: { type: "quote", public_available: false, manual_enterprise_override: true },
    strengths: ["premium phone option"],
    weaknesses: ["high cost"],
  },
  {
    provider_id: "zoominfo",
    name: "ZoomInfo",
    categories: ["company_intelligence", "contact_data", "phone", "premium"],
    pricing: {
      type: "quote",
      public_available: false,
      manual_enterprise_override: true,
      unit_cost_per_identity: 0.3,
      unit_cost_per_email: 0.3,
    },
    strengths: ["comprehensive B2B database", "high accuracy"],
    weaknesses: ["extremely expensive"],
  },
];
