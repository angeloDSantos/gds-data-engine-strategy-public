export interface Preset {
  id: string;
  name: string;
  description?: string;
  providers_enabled: string[];
  layer_routes?: Record<string, string[]>;
  assumptions_profile?: string;
}

export const builtInPresets: Preset[] = [
  {
    id: "gds_baseline",
    name: "GDS Recommended Baseline",
    description: "Proprietary signals + Crunchbase/CRM, PDL/Apollo identity, Prospeo/Emailsearch waterfall, MillionVerifier, RocketReach phone + HLR Lookup.",
    providers_enabled: ["internal", "crunchbase", "pdl", "apollo", "prospeo", "emailsearch_io", "millionverifier", "rocketreach", "hlr_lookup"],
    layer_routes: {
      identity: ["internal", "pdl", "apollo"],
      email_resolution: ["internal", "prospeo", "emailsearch_io", "pdl", "apollo"],
      verification: ["millionverifier"],
      phone: ["rocketreach", "apollo", "hlr_lookup"],
    },
  },
  {
    id: "lowest_cost",
    name: "Lowest Cost Wide-Net",
    description: "Apollo minimal, Emailsearch.io heavy, MillionVerifier, minimal premium fallback, no premium phone",
    providers_enabled: ["apollo", "emailsearch_io", "millionverifier", "twilio_lookup"],
    layer_routes: {
      identity: ["apollo"],
      email_resolution: ["pattern_first", "emailsearch_io"],
      verification: ["millionverifier"],
      phone: ["twilio_lookup"],
    },
  },
  {
    id: "balanced_enterprise",
    name: "Balanced Enterprise",
    description: "Apollo core, Clay orchestration, Emailsearch.io bulk, Prospeo/RocketReach fallback, MillionVerifier, Twilio for all phones",
    providers_enabled: ["apollo", "clay", "emailsearch_io", "prospeo", "rocketreach", "millionverifier", "twilio_lookup"],
    layer_routes: {
      identity: ["apollo", "pdl"],
      email_resolution: ["pattern_first", "emailsearch_io", "prospeo", "rocketreach"],
      verification: ["millionverifier"],
      phone: ["rocketreach", "twilio_lookup"],
    },
  },
  {
    id: "premium_mobile",
    name: "Premium Mobile",
    description: "Apollo core, RocketReach/Cognism premium phone, Twilio/Telesign lookup, strict SMS eligibility",
    providers_enabled: ["apollo", "rocketreach", "cognism", "twilio_lookup", "telesign", "millionverifier"],
    layer_routes: {
      identity: ["apollo"],
      email_resolution: ["apollo", "rocketreach"],
      verification: ["millionverifier"],
      phone: ["rocketreach", "cognism", "twilio_lookup", "telesign"],
    },
  },
  {
    id: "pattern_first",
    name: "Pattern-First Email Dominant",
    description: "Apollo/PDL for identity, strong internal domain + pattern DB, bulk verification, enrichment only on unresolved",
    providers_enabled: ["apollo", "pdl", "millionverifier", "emailsearch_io"],
    layer_routes: {
      identity: ["apollo", "pdl"],
      email_resolution: ["pattern_first", "emailsearch_io"],
      verification: ["millionverifier"],
      phone: ["twilio_lookup"],
    },
  },
  {
    id: "zoominfo_benchmark",
    name: "Benchmark — ZoomInfo-Like Premium",
    description: "Premium provider placeholder, high contract cost, fewer internal components",
    providers_enabled: ["zoominfo", "cognism", "millionverifier"],
    layer_routes: {
      identity: ["zoominfo"],
      email_resolution: ["zoominfo", "cognism"],
      verification: ["millionverifier"],
      phone: ["cognism"],
    },
  },
];
