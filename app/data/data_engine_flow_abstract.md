# GDS Data Engine: Detailed Procedural Abstract

This document outlines the step-by-step technical and operational flow of the GDS Data Engine. The system is designed as a modular, tiered resolution framework that prioritizes internal intelligence and cost-efficiency before triggering paid vendor credits.

## Phase 1: Company Intelligence & Master Graphing
**Objective:** Identify the target organization and prevent redundant ingestion.
1.  **Ingestion:** Raw company signals (Crunchbase, LinkedIn, PDL) are analyzed.
2.  **Internal Lookup:** The system checks the **Master Company Graph** to see if the entity already exists.
3.  **Deduplication:** Subsidiaries and alias domains (e.g., `google.com` vs `youtube.com`) are mapped to a single unified account record.
4.  **Signal Capture:** If new, a high-fidelity company profile is created, capturing HQ locations and operating regions.

## Phase 2: Identity Resolution
**Objective:** Pinpoint the specific professional and confirm current employment.
1.  **Identity Matching:** The system merges historical resume data with live social signals (LinkedIn).
2.  **Employment Confidence:** It verifies the target is still active in the role via recent social activity or news signals.
3.  **Entity Mapping:** A stable Professional Profile is generated, linked to the Master Company Graph.

## Phase 3: Domain Intelligence
**Objective:** Map the technical infrastructure of the target company.
1.  **Resolver Loop:** Using **Clearbit**, **Datablist**, and internal DNS probes, the system identifies all active root domains.
2.  **MX Lookup:** Mail server records are analyzed to detect the email provider (e.g., Google Workspace, O365).
3.  **Infrastructure Shield:** Catch-all status is detected at the domain level to prepare the resolution waterfall.

## Phase 4: Intelligence Compounding (Pattern Engine)
**Objective:** Resolve the "Identity-to-Email" link for $0.
1.  **Pattern Inference:** The engine analyzes the company's naming convention (e.g., `f.last@domain.com`).
2.  **Seniority Weighting:** Logic distinguishes between C-Suite (often `first@`) and Management (often `firstlast@`).
3.  **Internal Resolution:** If a pattern is discovered with >90% confidence, a candidate email is generated without calling external APIs.

## Phase 5: The Waterfall Resolution Pipeline
**Objective:** Resolve emails for misses in the pattern engine at the lowest possible cost.
1.  **Tier 1 (Cheap Pass):** The system queries high-volume, low-cost vendors like **Apollo** or **Emailsearch.io**.
2.  **Tier 2 (Mid-Market):** If Tier 1 fails, it triggers **Prospeo** or **Prospeo** for specialized LinkedIn resolution.
3.  **Tier 3 (Premium Fallback):** For critical leads, the system uses high-accuracy providers like **PDL** or **RocketReach**.

## Phase 6: Verification & Catch-all Classification
**Objective:** Protect sender reputation and classify deliverability.
1.  **SMTP Handshake:** Multi-provider verification (**NeverBounce**, **MillionVerifier**) performs a deep server handshake.
2.  **Classification:** Results are tiered into *Deliverable*, *Invalid*, or *Catch-all*.
3.  **Pattern Feedback:** Verified "Hits" are fed back into Phase 4 to improve future pattern accuracy.

## Phase 7: Catch-all Management Loop
**Objective:** Intelligently route "unverifiable" domains.
1.  **Confidence Ladder:** Catch-alls are scored based on historical deliverability to that specific domain.
2.  **Restricted Routing:** High-confidence catch-alls are moved to specific campaign tracks, while risky ones are suppressed.

## Phase 8: Phone & Mobile Resolution
**Objective:** Enrich high-intent leads with verified mobile numbers.
1.  **Resolution:** Mobile data is pulled from **RocketReach**, **Lusha**, or **SalesIntel**.
2.  **Validation:** **Twilio** and **HLR Lookups** verify the line type (Mobile vs. Landline) and connectivity status.
3.  **Compliance Guard:** Only SMS-eligible mobile numbers are promoted to final lists.

## Phase 9: Compliance & Shield (The Final Filter)
**Objective:** Ensure every outreach meets strict legal and ethical standards.
1.  **Legitimate Interest Check:** The lead is verified against the policy (e.g., Executives with a networking interest).
2.  **Suppression Sync:** The CRM is queried for existing customers, active opportunities, or professional competitors.
3.  **Opt-out Scrub:** The system cross-references the global and internal opt-out master lists.

## Phase 10: Sync & Feedback
**Objective:** Close the loop and update the master database.
1.  **CRM Write:** Compliant, enriched records are synchronized to the CRM.
2.  **Intelligence Update:** Every successful resolution result is stored, effectively "locking in" the data so future lookups for that identity cost $0.
