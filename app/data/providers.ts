export type ProviderId =
    | "apollo"
    | "pdl"
    | "emailsearch_io"
    | "rocketreach"
    | "prospeo"
    | "millionverifier"
    | "neverbounce"
    | "zerobounce"
    | "twilio_lookup"
    | "telesign"
    | "cognism"
    | "lusha"
    | "uplead"
    | "zoominfo"
    | "internal"
    | "clay"
    | "crunchbase"
    | "hlr_lookup"
    | "salesintel";

export type RoleInLayer = {
    role: string;
    costEffect: "low" | "medium" | "high";
    confidenceEffect: "low" | "medium" | "high" | "very_high";
    description: string;
};

export type PricingModel =
  | { type: "usage"; unitCost: number }
  | { type: "seatContract"; annualContract: number; seats: number; includedCredits?: number }
  | { type: "planCredits"; planCost: number; includedUnits: number }
  | { type: "quote"; benchmarkUnitCost?: number }
  | { type: "internalNearZero"; infraNote: string };

export type PricingTruthLevel =
  | "official_public"
  | "official_partial"
  | "manual_quote_required"
  | "derived_efficiency_estimate"
  | "internal_benchmark_only";

export interface ProviderConfig {
    id: ProviderId;
    name: string;
    website: string;
    category: "all-in-one" | "enrichment" | "verification" | "phone" | "internal" | "orchestration";
    tier: "pattern" | "cheap" | "mid" | "premium" | "verification" | "phone" | "internal";
    pricingModel: PricingModel;
    truthLevel: PricingTruthLevel;
    strengths: string[];
    weaknesses: string[];
    packageNote?: string;
    accuracyPercent?: number;
    rolesByLayer: Partial<Record<string, RoleInLayer>>;
}

export const providerConfigs: Record<ProviderId, ProviderConfig> = {
    apollo: {
        id: "apollo",
        name: "Apollo",
        website: "https://apollo.io",
        category: "all-in-one",
        tier: "cheap",
        pricingModel: { type: "usage", unitCost: 0.02 }, // Updated from seatContract to usage benchmark as per CSV
        truthLevel: "derived_efficiency_estimate",
        accuracyPercent: 80,
        strengths: ["Massive database", "Strong filtering", "Cost-effective"],
        weaknesses: ["Email accuracy can vary", "Mobile data is secondary"],
        rolesByLayer: {
            layer_1: { role: "Primary Discovery", costEffect: "low", confidenceEffect: "medium", description: "Base layer for company and contact discovery." },
            layer_2: { role: "Identity Verification", costEffect: "low", confidenceEffect: "medium", description: "Verifies current employment status." },
            layer_5: { role: "First-pass Enrichment", costEffect: "low", confidenceEffect: "medium", description: "Provides candidates for pattern engine or verification." },
        },
    },
    pdl: {
        id: "pdl",
        name: "People Data Labs",
        website: "https://peopledatalabs.com",
        category: "enrichment",
        tier: "mid",
        pricingModel: { type: "usage", unitCost: 0.12 },
        truthLevel: "official_partial",
        accuracyPercent: 85,
        strengths: ["Developer-grade API", "Deep identity graph", "Resume history"],
        weaknesses: ["Requires technical integration", "No built-in UI"],
        rolesByLayer: {
            layer_2: { role: "Identity Graph", costEffect: "medium", confidenceEffect: "very_high", description: "Resolves identities via historical resume data." },
            layer_5: { role: "Deep Enrichment", costEffect: "high", confidenceEffect: "high", description: "Resolves missing professional emails." },
        },
    },
    rocketreach: {
        id: "rocketreach",
        name: "RocketReach",
        website: "https://rocketreach.co",
        category: "enrichment",
        tier: "mid",
        pricingModel: { type: "quote", benchmarkUnitCost: 0.16 },
        truthLevel: "internal_benchmark_only",
        packageNote: "$2099 for 10k lookups for mobile",
        accuracyPercent: 85,
        strengths: ["High-quality mobile data", "Browser extension", "Wide social coverage"],
        weaknesses: ["More expensive per lead", "Lower bulk throughput"],
        rolesByLayer: {
            layer_2: { role: "Social Identity Lead", costEffect: "medium", confidenceEffect: "high", description: "Syncs identities via LinkedIn/social profiles." },
            layer_8: { role: "Primary Mobile Provider", costEffect: "high", confidenceEffect: "very_high", description: "Top-tier mobile phone resolution." },
        },
    },
    prospeo: {
        id: "prospeo",
        name: "Prospeo",
        website: "https://prospeo.io",
        category: "enrichment",
        tier: "cheap",
        pricingModel: { type: "usage", unitCost: 0.005 },
        truthLevel: "derived_efficiency_estimate",
        accuracyPercent: 90,
        strengths: ["Highest email accuracy", "Catch-all resolution", "LinkedIn focus"],
        weaknesses: ["Strictly professional email", "Credit burn rate"],
        rolesByLayer: {
            layer_5: { role: "Premium Resolution", costEffect: "high", confidenceEffect: "very_high", description: "Industry-leading email accuracy via multi-signal bounce detection." },
        },
    },
    emailsearch_io: {
        id: "emailsearch_io",
        name: "Emailsearch.io",
        website: "https://emailsearch.io",
        category: "enrichment",
        tier: "cheap",
        pricingModel: { type: "usage", unitCost: 0.0001 }, // Unlimited $249/mo modeled as near-zero marginal
        truthLevel: "official_public",
        packageNote: "$249/mo Unlimited Plan",
        accuracyPercent: 78,
        strengths: ["Unlimited lookups", "Budget leader", "Search by social"],
        weaknesses: ["Lower accuracy than Prospeo"],
        rolesByLayer: {
            layer_5: { role: "High-Volume Pass", costEffect: "low", confidenceEffect: "medium", description: "Bypasses credit-burn for high-volume sweeps." },
        },
    },
    millionverifier: {
        id: "millionverifier",
        name: "MillionVerifier",
        website: "https://millionverifier.com",
        category: "verification",
        tier: "verification",
        pricingModel: { type: "usage", unitCost: 0.0015 },
        truthLevel: "official_public",
        packageNote: "$1500 for 1M verification credits",
        strengths: ["Massive volume pricing", "Custom catch-all classification"],
        weaknesses: ["Slower than high-cost competitors"],
        rolesByLayer: {
            layer_6: { role: "Mass Verification", costEffect: "low", confidenceEffect: "high", description: "Primary bulk verification pass." },
        },
    },
    neverbounce: {
        id: "neverbounce",
        name: "NeverBounce",
        website: "https://neverbounce.com",
        category: "verification",
        tier: "verification",
        pricingModel: { type: "usage", unitCost: 0.001 },
        truthLevel: "internal_benchmark_only",
        accuracyPercent: 99.1,
        strengths: ["Gold standard accuracy", "Enterprise integration"],
        weaknesses: ["High cost", "No catch-all classification"],
        rolesByLayer: {
            layer_6: { role: "Gold Standard Pass", costEffect: "high", confidenceEffect: "very_high", description: "Final quality check for high-value leads." },
        },
    },
    zerobounce: {
        id: "zerobounce",
        name: "ZeroBounce",
        website: "https://zerobounce.net",
        category: "verification",
        tier: "verification",
        pricingModel: { type: "usage", unitCost: 0.005 },
        truthLevel: "internal_benchmark_only",
        accuracyPercent: 98,
        strengths: ["High accuracy", "AI-driven scoring"],
        weaknesses: ["Expensive at scale"],
        rolesByLayer: {
            layer_6: { role: "Alternative Verification", costEffect: "medium", confidenceEffect: "high", description: "Supplemental verification for edge cases." },
        },
    },
    cognism: {
        id: "cognism",
        name: "Cognism",
        website: "https://cognism.com",
        category: "enrichment",
        tier: "premium",
        pricingModel: { type: "usage", unitCost: 0.12 }, // Updated from 0.65 to 0.12 based on CSV
        truthLevel: "manual_quote_required",
        accuracyPercent: 90,
        strengths: ["Compliant European data", "High-quality phone numbers"],
        weaknesses: ["Very high cost", "Strict usage policies"],
        rolesByLayer: {
            layer_8: { role: "Premium Phone Resolution", costEffect: "high", confidenceEffect: "very_high", description: "European mobile data specialist." },
            layer_5: { role: "Last-resort Enrichment", costEffect: "high", confidenceEffect: "high", description: "Final pass for hard-to-reach targets." },
        },
    },
    lusha: {
        id: "lusha",
        name: "Lusha",
        website: "https://lusha.com",
        category: "enrichment",
        tier: "premium",
        pricingModel: { type: "usage", unitCost: 0.04 }, // Updated from 0.55 to 0.04 based on CSV
        truthLevel: "manual_quote_required",
        accuracyPercent: 85,
        strengths: ["Excellent mobile data", "Browser extension"],
        weaknesses: ["Expensive", "Database can be outdated"],
        rolesByLayer: {
            layer_8: { role: "Alternative Mobile Data", costEffect: "high", confidenceEffect: "high", description: "Secondary high-quality mobile source." },
        },
    },
    twilio_lookup: {
        id: "twilio_lookup",
        name: "Twilio Lookup",
        website: "https://twilio.com",
        category: "phone",
        tier: "phone",
        pricingModel: { type: "usage", unitCost: 0.004 },
        truthLevel: "official_public",
        accuracyPercent: 95,
        strengths: ["Carrier-level data", "Line type identification"],
        weaknesses: ["Does not provide the number, only validates existing"],
        rolesByLayer: {
            layer_8: { role: "Line Validation", costEffect: "low", confidenceEffect: "high", description: "Identifies mobile vs landline for compliance." },
        },
    },
    telesign: {
        id: "telesign",
        name: "Telesign",
        website: "https://telesign.com",
        category: "phone",
        tier: "phone",
        pricingModel: { type: "usage", unitCost: 0.006 }, // Updated from 0.02 to 0.006 (HLR lookup)
        truthLevel: "manual_quote_required",
        accuracyPercent: 97,
        strengths: ["Global coverage", "Risk scoring"],
        weaknesses: ["Complex API pricing"],
        rolesByLayer: {
            layer_8: { role: "Mobile Risk Pass", costEffect: "medium", confidenceEffect: "high", description: "High-confidence line verification." },
        },
    },
    clay: {
        id: "clay",
        name: "Clay",
        website: "https://clay.com",
        category: "orchestration",
        tier: "internal",
        pricingModel: { type: "seatContract", annualContract: 6000, seats: 5 },
        truthLevel: "official_public",
        strengths: ["API Orchestration", "Powerful data waterfall logic"],
        weaknesses: ["Steep learning curve", "Requires existing API keys"],
        rolesByLayer: {
            layer_10: { role: "Orchestration Layer", costEffect: "medium", confidenceEffect: "high", description: "Manages the complex waterfall across all providers." },
        },
    },
    uplead: {
        id: "uplead",
        name: "UpLead",
        website: "https://uplead.com",
        category: "enrichment",
        tier: "mid",
        pricingModel: { type: "usage", unitCost: 0.35 },
        truthLevel: "official_public",
        accuracyPercent: 95,
        strengths: ["Verified records in real-time"],
        weaknesses: ["Smaller database size"],
        rolesByLayer: {},
    },
    zoominfo: {
        id: "zoominfo",
        name: "ZoomInfo",
        website: "https://zoominfo.com",
        category: "all-in-one",
        tier: "premium",
        pricingModel: { type: "usage", unitCost: 1.25 }, // Email contact base
        truthLevel: "manual_quote_required",
        accuracyPercent: 88,
        strengths: ["Vast enterprise database"],
        weaknesses: ["Very expensive", "Aggressive sales"],
        rolesByLayer: {},
    },
    internal: {
        id: "internal",
        name: "GDS Proprietary Tools",
        website: "",
        category: "internal",
        tier: "pattern",
        pricingModel: { type: "internalNearZero", infraNote: "Included in platform/compute" },
        truthLevel: "internal_benchmark_only",
        strengths: ["Custom rules", "Proprietary pattern DB", "No external cost"],
        weaknesses: ["Maintenance required"],
        rolesByLayer: {
            layer_4: { role: "Pattern Engine", costEffect: "low", confidenceEffect: "high", description: "Learns company naming conventions to bypass enrichment spend." },
            layer_7: { role: "Catch-all Policy", costEffect: "low", confidenceEffect: "medium", description: "Applies zero-cost resolution to verify company intelligence signals." },
        },
    },
    crunchbase: {
        id: "crunchbase",
        name: "Crunchbase",
        website: "https://crunchbase.com",
        category: "enrichment",
        tier: "mid",
        pricingModel: { type: "usage", unitCost: 0.02 },
        truthLevel: "official_partial",
        accuracyPercent: 90,
        strengths: ["Funding data", "Company signals", "Growth triggers"],
        weaknesses: ["Contact data secondary"],
        rolesByLayer: {
            layer_1: { role: "Market Intelligence", costEffect: "medium", confidenceEffect: "high", description: "Provides financial and growth indicators for company scoring." },
        },
    },
    hlr_lookup: {
        id: "hlr_lookup",
        name: "HLR Lookup Tools",
        website: "",
        category: "phone",
        tier: "phone",
        pricingModel: { type: "usage", unitCost: 0.0045 }, // $0.015 - 70% discount as per user
        truthLevel: "internal_benchmark_only",
        strengths: ["Real-time connectivity check", "Network status"],
        weaknesses: ["Latency"],
        rolesByLayer: {
            layer_8: { role: "Connectivity Check", costEffect: "low", confidenceEffect: "very_high", description: "Performs real-time HLR lookup to verify if a line is active." },
        },
    },
    salesintel: {
        id: "salesintel",
        name: "SalesIntel",
        website: "https://salesintel.io",
        category: "enrichment",
        tier: "mid",
        pricingModel: { type: "usage", unitCost: 0.10 },
        truthLevel: "derived_efficiency_estimate",
        accuracyPercent: 92,
        strengths: ["High-quality direct dials", "Strong research team", "Cost-effective mobile data"],
        weaknesses: ["Smaller database than ZoomInfo", "B2B focused"],
        rolesByLayer: {
            layer_8: { role: "Direct Dial Focus", costEffect: "medium", confidenceEffect: "very_high", description: "Primary source for high-accuracy direct dial campaigns." },
        },
    },
};
