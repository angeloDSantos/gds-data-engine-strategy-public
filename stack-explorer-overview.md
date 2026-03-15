## Data Engine Stack Explorer – Concept Overview

This app is a **visual model of a data engine** that turns noisy external data into a high‑quality, routing‑ready contact database. It focuses on:

- **How different providers and internal systems combine into a single stack**
- **How the database created by this stack continuously improves the stack itself**
- **How smarter routing and verification make downstream tools cheaper and more effective**

The diagram is not “just architecture”; it’s a **map of how dollars turn into durable data assets**, and how those assets feed back to reduce marginal cost over time.

---

## High‑Level Story: From raw signals to durable assets

At the highest level, the app portrays a pipeline that:

1. **Ingests raw company and person data** from multiple 3rd‑party vendors.
2. **Resolves identities and domains**, and infers email and phone patterns.
3. **Builds a high‑confidence database** of:
   - Verified emails
   - High‑confidence catch‑all emails
   - SMS‑eligible mobiles
4. **Attaches suppression and compliance rules** so the database is safe to use.
5. **Feeds outcomes back into the system**, improving:
   - Pattern accuracy
   - Provider routing rules
   - Cost per usable contact over time

The **Stack Explorer** page shows this as a series of **layers** (top‑to‑bottom overview), each with its own internal sub‑steps (zoom‑in view). The **Cost Summary** panel quantifies the cost side of the story.

---

## Layer‑by‑Layer Narrative

Each layer in the diagram represents a **conceptual phase** in the data engine. Below is what each layer does, and how it contributes to building and improving the database.

### 1. Company Intelligence

**Goal:** Build a clean, unified view of target companies.

- **Inputs:**
  - Company lists from enrichment tools (e.g. Apollo, PDL, Emailsearch)
  - Custom account lists from sales/marketing
- **Core actions:**
  - **Company record ingestion:** Pull in raw org records from multiple vendors.
  - **Dedupe:** Merge different representations of the same company (name variants, subsidiaries, etc.).
  - **Domain resolution seed:** Identify the canonical web domain(s) per company.

**Why it matters:**  
Downstream identity and email work is only as good as your company graph. A clean company layer reduces waste (e.g. not buying the same record multiple times) and improves pattern inference accuracy later.

**Database effect:**  
Creates a **master company table**: one row per real company, with stable IDs and normalized domains. This is the base key for everything else.

---

### 2. Identity Resolution

**Goal:** Attach accurate person records (executives, buyers) to each company.

- **Inputs:**
  - Person/role data from multiple vendors (Apollo, PDL, RocketReach, etc.)
- **Core actions:**
  - **Merge by name/company/title:** Combine records that appear to represent the same person.
  - **Employment confidence:** Score whether a person is currently at the company.
  - **Title taxonomy:** Normalize titles into structured roles (e.g. “VP Sales” -> “Sales leadership”).

**Why it matters:**  
Most vendor records are noisy and stale. You don’t just want *more* leads; you want **verified employment at target accounts** and a normalized role taxonomy for precise targeting.

**Database effect:**
- Builds a **people table** keyed by a stable person ID, linked to the master company.
- Stores **employment confidence** and **role classification** that can later drive routing (e.g. “only current execs”, “sales leadership only”).

---

### 3. Domain Intelligence

**Goal:** Understand each company’s email sending surface and constraints.

- **Inputs:**
  - Company domains from Layer 1
  - DNS/MX data and historic sending results
- **Core actions:**
  - **Root domain resolution:** Standardize `www.example.com`, `app.example.com` → `example.com`.
  - **MX lookup:** Discover actual mail servers.
  - **Catch‑all flagging:** Classify whether the domain’s MX accepts all addresses.
  - **Pattern history:** Track which email patterns and providers have historically worked here.

**Why it matters:**  
This layer determines **how risky and expensive** email resolution will be on a per‑domain basis. Catch‑all domains require different handling and verification strategy.

**Database effect:**
- Populates a **domain intelligence table**:
  - MX records
  - Catch‑all flags
  - Historical deliverability patterns
- This becomes a key input for the **Email Pattern Engine** and **Verification** layers.

---

### 4. Email Pattern Engine

**Goal:** Infer and maintain email naming conventions per company.

- **Inputs:**
  - Company and person graph
  - Domain intelligence + historic sends
- **Core actions:**
  - **Pattern suggestion:** Derive likely patterns (e.g. `first.last@company.com`, `flast@company.com`).
  - **Confidence scoring:** Score patterns per domain based on historical success.
  - **Exception detection:** Track special cases and override defaults when necessary.

**Why it matters:**  
Patterns are a **multiplicative force**:
- Once a pattern is known and stable, you can generate **new valid emails at near‑zero marginal cost**.
- Good patterns reduce reliance on per‑record lookups from expensive vendors.

**Database effect:**
- Maintains a **pattern DB** keyed by domain:
  - Primary pattern(s)
  - Alternate patterns
  - Confidence / last‑verified timestamps
- This DB is what makes the **database an asset**: every successful send makes patterns more accurate, which reduces future spend.

---

### 5. Email Resolution Pipeline

**Goal:** For each target person, decide the cheapest, most reliable way to get a usable email.

- **Inputs:**
  - People records
  - Pattern DB
  - Provider catalog and pricing
- **Core actions:**
  - **Pattern‑first:** Try to generate an email using the highest‑confidence pattern.
  - **Provider fallback:** If pattern confidence is low or domain is problematic, route to providers (Apollo, Prospeo, Emailsearch, PDL, RocketReach, etc.).
  - **Routing logic:** Optimize across accuracy, latency, and cost (e.g. cheaper provider first, then more expensive, respecting caps).

**Why it matters:**  
This layer is where **the business value shows up**:
- For “easy” domains, you rely mostly on your internal pattern DB → **cheaper over time**.
- For “hard” or high‑value targets, you spend selectively across providers.

**Database effect:**
- Writes **resolved email candidates** for each person:
  - Source (pattern vs provider)
  - Confidence scores
  - Cost attribution (which vendor, at what price)
- Captures **routing logs**, which can be used to refine the provider strategy over time.

---

### 6. Verification / Catch‑All Classification

**Goal:** Turn candidate emails into **deployable** addresses with known deliverability.

- **Inputs:**
  - Candidate emails from the resolution pipeline
  - Domain intelligence (catch‑all flags)
- **Core actions:**
  - **SMTP handshake:** Check if the mailbox appears to exist.
  - **Catch‑all classification:** Distinguish between:
    - Standard domains (reliable mailbox existence checks)
    - Catch‑all domains (MX accepts everything)
  - **Confidence scoring:** Combine provider signals + handshake results into a final deliverability rating.

**Why it matters:**  
You don’t just want **any** email—you want:
- Consistent **inbox placement**
- **Low bounce rates** to protect sender reputation
- **Predictable cost per verified** address

**Database effect:**
- Produces a **verified emails table** with:
  - Verification status
  - Confidence scores
  - Reason codes (e.g. “SMTP OK”, “catch‑all, high risk”, “mailbox full”, etc.)
- Updates **domain‑level intelligence** (improves future decisions about which domains are risky).

---

### 7. Catch‑All Email Pipeline

**Goal:** Turn catch‑all domains from “unusable risk” into a **managed, tiered asset**.

- **Inputs:**
  - Emails at catch‑all domains
  - Engagement / reply signals
- **Core actions:**
  - **Confidence ladder:** Define tiers for catch‑all addresses (e.g. pattern + strong prior, pattern + weak prior, etc.).
  - **Send policy:** Decide which tiers are allowed to send, at what volume and cadence.
  - **Reply feedback loop:** Use replies + engagement as implicit verification signals for catch‑all addresses.

**Why it matters:**  
Many valuable B2B domains are catch‑all. Fully excluding them throws away **huge surface area**. This layer allows you to:
- Use catch‑all traffic **selectively and safely**
- Turn engagement data into additional **validation signals** for your pattern and verification models

**Database effect:**
- Maintains a **catch‑all pool** with:
  - Tier/segment labels
  - Policy flags (e.g. “allowed for campaigns X/Y”, “throttled”)
  - Feedback‑derived quality scores
- These quality scores feed **back into the pattern engine and domain intelligence**, refining risk models.

---

### 8. Phone / Mobile Resolution

**Goal:** Build a pool of **SMS‑eligible mobile numbers** linked to your target identities.

- **Inputs:**
  - Phone data from providers (RocketReach, Apollo, Cognism, Twilio Lookup, Telesign, etc.)
- **Core actions:**
  - **E.164 normalization:** Standardize number formats globally.
  - **Line type detection:** Landline vs mobile vs VoIP, etc.
  - **Carrier lookup:** Identify carriers and routes.
  - **SMS eligibility:** Apply policies to decide which numbers are safe and viable for SMS.

**Why it matters:**  
Multi‑channel outreach is dramatically more effective. However, SMS has:
- Carrier rules
- Regulatory constraints
- Higher sensitivity to spam/abuse

You need a **curated, policy‑aware mobile pool**, not just “a phone number on file”.

**Database effect:**
- Creates an **SMS‑eligible mobile pool**:
  - Per‑number eligibility flags
  - Confidence scores and carrier metadata
- Integrates with **suppression/compliance** to respect opt‑outs and legal constraints.

---

### 9. Suppression / Compliance

**Goal:** Ensure the database is **safe and compliant** for real‑world use.

- **Inputs:**
  - DNC lists, local regulations
  - Unsubscribes and internal opt‑outs
  - CRM state (e.g. closed‑lost, legal hold)
- **Core actions:**
  - **DNC lists:** Remove or flag records that must not be contacted via specific channels.
  - **Opt‑out handling:** Record email/SMS/channel‑specific opt‑outs.
  - **CRM sync:** Ensure suppression state is consistent with CRM and MAP systems.
  - **Audit trail:** Maintain a log of why a record is suppressed.

**Why it matters:**  
A database only has value if you can **safely use it at scale**. Suppression protects:
- Legal compliance
- Brand reputation
- Deliverability and phone sender reputation

**Database effect:**
- Maintains a **suppression table** keyed by identity + channel (email, SMS, phone).
- Applies suppression state across all downstream outputs and routing decisions.

---

### 10. Middleware / Confluence / CRM Sync

**Goal:** Tie everything together into a **living data system** instead of a static snapshot.

- **Inputs:**
  - Events from sends, opens, clicks, replies, bounces
  - Updates from CRM/Confluence/etc.
- **Core actions:**
  - **Event bus:** Capture and normalize activity events (e.g. “email verified”, “hard bounce”, “reply with job change”).
  - **Confidence updates:** Use events to update confidence scores for patterns, domains, and identities.
  - **Pattern DB updates:** When outcomes contradict the pattern DB, adjust patterns or mark exceptions.

**Why it matters:**  
This is where the **feedback loop** happens. The more the system is used:

- The **better the pattern DB becomes**
- The **smarter the routing logic becomes**
- The **cheaper each additional contact becomes**

**Database effect:**
- Continuously **re‑writes and improves**:
  - Pattern entries
  - Domain risk scores
  - Provider routing rules
- Turns the database into a **compounding asset**.

---

### 11. Final Outputs

**Goal:** Expose clean, tiered outputs that GTM teams can actually use.

The stack produces several key output pools:

- **Verified Email Pool**
  - Highest deliverability tier
  - Safe for high‑intensity campaigns and critical programs
- **Catch‑all High‑Confidence Pool**
  - Managed via tiered policies
  - Powerful for expanding reach on catch‑all domains
- **SMS‑Eligible Mobile Pool**
  - Numbers that pass normalization, line‑type, and compliance checks
- **Premium Multi‑Channel Pool**
  - Records with multiple validated, compliant channels (email + SMS + possibly phone)

These pools are **GTM‑ready abstractions**:
- Sales/marketing doesn’t need to care which provider or pattern produced the address.
- They only need to know the **tier**, **channel**, and **policy** for usage.

---

## What the UI Specifically Portrays

### Overview diagram (full stack)

- Shows a **top‑to‑bottom map** of all layers described above.
- Each node represents a **major phase in the pipeline**, with a quick description and provider tags.
- Edges indicate **data flow**, not necessarily real‑time; it’s a conceptual graph.

This is meant to answer:  
**“What does our data engine actually look like end‑to‑end?”**

### Zoomed‑in diagrams (per layer)

- Clicking a layer (in the diagram or left sidebar) zooms into a **sub‑diagram**:
  - Sub‑steps (e.g. “MX lookup”, “catch‑all classification”, “confidence ladder”)
  - Still uses the same visual language, but focused on one phase.
- A **Back** control returns to the overview.

This is meant to answer:  
**“If we say ‘Email Pattern Engine’, what do we actually mean operationally?”**

### Cost & Output Summary panel

- Computes approximate **stack cost** (annual vs monthly) based on:
  - Which providers are enabled in the preset
  - Simplified pricing assumptions
- Derives:
  - **Verified emails/year**
  - **Catch‑all usable/year**
  - **SMS‑ready mobiles/year**
  - **Cost per verified email**
  - **Cost per SMS‑ready mobile**

This is meant to answer:  
**“Given our assumptions and routing strategy, what is our cost per usable outcome?”**

---

## How the Database Makes Tools Cheaper Over Time

The central thesis the app portrays is:

> **Using the stack creates data that improves the stack.**

Concretely:

- Every **verified email** strengthens the underlying **pattern and domain models**, reducing your reliance on paid lookups.
- Every **reply, bounce, or engagement event** feeds back into:
  - Pattern DB (better patterns)
  - Domain intelligence (better risk estimates)
  - Routing (smarter provider selection)
- Over time, more and more of your output comes from:
  - **Internal pattern inference**
  - **Internal verification logic**
rather than from expensive external calls.

This drives:

- **Lower marginal cost** per verified contact.
- **Higher coverage** (you can safely utilize catch‑all domains and SMS with more nuance).
- **Compounding value** of the core database: the more you send, the more valuable the database becomes.

---

## How to Read / Use This Document

You can treat this markdown as:

- A **narrative companion** to the Stack Explorer UI.
- A **design doc** for how the engine should conceptually behave.
- A **starting point** for adding:
  - More detailed math for cost modeling
  - Concrete provider pricing examples
  - SLA and latency considerations
  - Specific rules/guidelines for when to change a provider, pattern, or policy

If you share a more detailed vision or specific guidelines (e.g. exact routing logic, cost thresholds, or risk tolerances), this doc can be extended into a stricter spec with pseudo‑algorithms, more diagrams, and implementation notes.

