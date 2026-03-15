export interface AssumptionSet {
  annual_target_identities: number;
  monthly_target_identities: number;
  apollo_identity_coverage: number;
  pdl_identity_lift_on_unresolved: number;
  scraped_identity_lift: number;
  domain_resolution_rate: number;
  known_pattern_coverage: number;
  pattern_generation_success_rate: number;
  smtp_verified_rate_on_generated: number;
  catch_all_rate_on_generated: number;
  fallback_enrichment_rate: number;
  fallback_email_success_rate: number;
  verification_valid_rate_on_fallback: number;
  phone_source_coverage: number;
  mobile_classification_rate: number;
  active_reachable_rate: number;
  sms_eligible_rate_after_policy: number;
  catch_all_release_rate_based_on_confidence: number;
  // Waterfall Routing Assumptions
  known_good_email_reuse_rate: number;
  cheap_pass_success_rate: number;
  cheap_pass_valid_rate: number;
  premium_fallback_success_rate: number;
  premium_fallback_valid_rate: number;
  // Internal Savings / Reuse Rates
  internal_domain_reuse_rate: number;
  internal_pattern_reuse_rate: number;
  internal_verification_reuse_rate: number;
  internal_mobile_reuse_rate: number;
  // Contract Assumptions
  annual_apollo_credits: number;
  annual_clay_actions: number;
}

export interface TierAvailability {
  has_cheap: boolean;
  has_premium: boolean;
  has_phone: boolean;
}

export const defaultAssumptions: AssumptionSet = {
  annual_target_identities: 2_500_000,
  monthly_target_identities: 208_333,
  apollo_identity_coverage: 0.72,
  pdl_identity_lift_on_unresolved: 0.12,
  scraped_identity_lift: 0.08,
  domain_resolution_rate: 0.95,
  known_pattern_coverage: 0.45,
  pattern_generation_success_rate: 0.88,
  smtp_verified_rate_on_generated: 0.65,
  catch_all_rate_on_generated: 0.15,
  fallback_enrichment_rate: 0.42,
  fallback_email_success_rate: 0.58,
  verification_valid_rate_on_fallback: 0.86,
  phone_source_coverage: 0.32,
  mobile_classification_rate: 0.72,
  active_reachable_rate: 0.85,
  sms_eligible_rate_after_policy: 0.80,
  catch_all_release_rate_based_on_confidence: 0.65,
  // Waterfall Routing Defaults
  known_good_email_reuse_rate: 0.22, // Increased reuse for "already in DB" logic
  cheap_pass_success_rate: 0.48,
  cheap_pass_valid_rate: 0.75,
  premium_fallback_success_rate: 0.38,
  premium_fallback_valid_rate: 0.90,
  // Internal Savings Defaults
  internal_domain_reuse_rate: 0.45,
  internal_pattern_reuse_rate: 0.35,
  internal_verification_reuse_rate: 0.40,
  internal_mobile_reuse_rate: 0.33, // 33% reuse (e.g. 100k out of 300k)
  // Contract Assumptions
  annual_apollo_credits: 500_000,
  annual_clay_actions: 250_000,
};

export function calculateOutputs(
  assumptions: AssumptionSet,
  identities: number = assumptions.annual_target_identities,
  availability?: TierAvailability
) {
  const {
    has_cheap = true,
    has_premium = true,
    has_phone = true
  } = availability || {};

  // 1. Email Waterfall Logic
  const known_good_emails = identities * assumptions.known_good_email_reuse_rate;
  
  const pattern_candidates = (identities - known_good_emails) * assumptions.known_pattern_coverage;
  const pattern_verified_valid = pattern_candidates * assumptions.pattern_generation_success_rate * assumptions.smtp_verified_rate_on_generated;
  const pattern_catch_all = pattern_candidates * assumptions.pattern_generation_success_rate * assumptions.catch_all_rate_on_generated;
  
  const remaining_after_pattern = identities - known_good_emails - pattern_verified_valid - pattern_catch_all;
  
  const cheap_pass_hits = has_cheap ? (remaining_after_pattern * assumptions.cheap_pass_success_rate) : 0;
  const cheap_pass_verified_valid = cheap_pass_hits * assumptions.cheap_pass_valid_rate;
  
  const remaining_after_cheap = remaining_after_pattern - cheap_pass_hits;
  const premium_fallback_hits = has_premium ? (remaining_after_cheap * assumptions.premium_fallback_success_rate) : 0;
  const premium_fallback_verified_valid = premium_fallback_hits * assumptions.premium_fallback_valid_rate;
  
  const total_verified_emails = known_good_emails + pattern_verified_valid + cheap_pass_verified_valid + premium_fallback_verified_valid;
  const total_catch_all_emails = pattern_catch_all * assumptions.catch_all_release_rate_based_on_confidence;

  // 2. Phone Waterfall Logic (Compounding Database Efficiency)
  // As volume increases, the absolute number of database hits grows, reducing marginal source costs.
  const reused_phones = identities * assumptions.internal_mobile_reuse_rate;
  const needing_source = has_phone ? (identities - reused_phones) : 0;
  
  const source_hits = needing_source * assumptions.phone_source_coverage;
  const mobile_candidates = (reused_phones + source_hits) * assumptions.mobile_classification_rate;
  const active_mobiles = mobile_candidates * assumptions.active_reachable_rate;
  const sms_eligible_mobiles = active_mobiles * assumptions.sms_eligible_rate_after_policy;

  // 3. Accuracy & Efficiency Metrics
  const total_email_resolved = total_verified_emails + total_catch_all_emails;
  const accuracy_pre_validation = total_email_resolved > 0 
    ? (known_good_emails * 0.99 + pattern_candidates * 0.85 + cheap_pass_hits * 0.72 + premium_fallback_hits * 0.88) / 
      (known_good_emails + pattern_candidates + cheap_pass_hits + premium_fallback_hits)
    : 0;

  const provider_calls_avoided = identities * (assumptions.internal_domain_reuse_rate + assumptions.internal_pattern_reuse_rate + assumptions.known_good_email_reuse_rate);

  return {
    verified_emails: Math.round(total_verified_emails),
    catch_all_emails: Math.round(total_catch_all_emails),
    sms_eligible_mobiles: Math.round(sms_eligible_mobiles),
    provider_calls_avoided: Math.round(provider_calls_avoided),
    accuracy_pre_validation: accuracy_pre_validation,
    accuracy_post_validation: 0.99,
    phone_source_hits: Math.round(source_hits),
    phone_validation_hits: Math.round(mobile_candidates),
    waterfall: {
      internal: Math.round(known_good_emails),
      pattern: Math.round(pattern_verified_valid),
      cheap: Math.round(cheap_pass_verified_valid),
      premium: Math.round(premium_fallback_verified_valid)
    }
  };
}
