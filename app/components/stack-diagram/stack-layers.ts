import type { Node, Edge } from "@xyflow/react";

export interface SubLayerDef {
  id: string;
  label: string;
  kind: "input" | "process" | "decision" | "output";
  purpose: string;
  providers?: string[];
  outputSpec?: string;
  crmInteraction?: "input" | "output" | "both" | "none";
}

export interface StackLayerDef {
  id: string;
  label: string;
  purpose: string;
  providers: string[];
  /**
   * Executive narrative explaining what happens at this stage.
   */
  narrative: string;
  /**
   * High-level phases that make up this layer.
   * Used to construct the zoomed-in diagram for a single layer.
   */
  subLayers?: string[];
  /**
   * explicit output format for display
   */
  outputSpec?: string;
  /**
   * rich process flow for the zoomed-in diagram
   */
  subLayersFlow?: SubLayerDef[];
  /**
   * CRM interaction type for visual indicator
   */
  crmInteraction?: "input" | "output" | "both" | "none";
  inputChecks?: string[];
  outputWrites?: string[];
  phaseNumber?: number;
  partnersNote?: string;
}

export const stackLayers: StackLayerDef[] = [
  {
    id: "layer_1",
    label: "Company Intelligence",
    purpose: "Identify target companies, create master company graph",
    narrative: "Checks master database for existing matching companies before ingesting market signals. Excludes existing records and adds new, validated company profiles to the deduplicated master graph.",
    providers: ["crunchbase", "linkedin", "internal"],
    subLayers: ["company record ingestion", "dedupe", "domain resolution seed"],
    outputSpec: "{Company Name - HQ Location - Operating Locations}",
    crmInteraction: "input",
    inputChecks: ["known account", "existing alias", "mapped domain"],
    outputWrites: ["unified company profile", "dedupe event"],
    phaseNumber: 1,
    subLayersFlow: [
      { id: "l1_i1", label: "External Signals", kind: "input", purpose: "Apollo, PDL raw org records" },
      { id: "l1_p1", label: "Check Known Company?", kind: "process", purpose: "Consult internal master graph before spend", providers: ["internal"] },
      { id: "l1_p2", label: "Unified Dedupe", kind: "process", purpose: "Merge subsidiaries & variants", providers: ["internal"] },
      { id: "l1_o1", label: "Master Company Graph", kind: "output", purpose: "Stable unified accounts" },
    ],
  },
  {
    id: "layer_2",
    label: "Identity Resolution",
    purpose: "Determine target executives and current employment",
    narrative: "Pinpoints target executives by merging resume history and social signals to confirm current employment status and decision-making authority.",
    providers: ["emailsearch_io", "internal"],
    subLayers: ["merge by name/company/title", "employment confidence", "title taxonomy"],
    outputSpec: "{Company Name, First Name, Last Name, Verified Title}",
    crmInteraction: "input",
    inputChecks: ["existing contact", "title history", "confirmed identiy"],
    phaseNumber: 2,
    subLayersFlow: [
      { id: "l2_p1", label: "Internal Identity Match", kind: "process", purpose: "Reuse existing truth before resolution", providers: ["internal"] },
      { id: "l2_p2", label: "Social Identity Resolve", kind: "process", purpose: "Merge resume & social signals", providers: ["apollo", "pdl", "rocketreach"] },
      { id: "l2_o1", label: "Resolved Identity", kind: "output", purpose: "Stable professional profile" },
    ],
  },
  {
    id: "layer_3",
    label: "Domain Intelligence",
    purpose: "Resolve company domains, MX lookup, catch-all status",
    narrative: "Analyzes root domains and MX records to identify mail server providers, detect catch-all status, and ensure infrastructure stability before outreach.",
    providers: ["internal", "enrichment_providers"],
    subLayers: ["root domain", "MX lookup", "catch-all flagging", "pattern history"],
    outputSpec: "{Root Domain, MX Provider, Catch-all Status}",
    crmInteraction: "both",
    inputChecks: ["known domain", "mx history", "base catch-all status"],
    outputWrites: ["root domain", "mx provider", "catch-all classification"],
    phaseNumber: 3,
    subLayersFlow: [
      { id: "l3_i1", label: "Identity Domains", kind: "input", purpose: "Domains from resolved identities" },
      { id: "l3_p1", label: "Lookup Known Domain?", kind: "process", purpose: "Reuse cached intel", providers: ["internal"] },
      { id: "l3_p2", label: "MX/DNS Probe", kind: "process", purpose: "Live infrastructure check", providers: ["internal"] },
      { id: "l3_o1", label: "Domain Intel", kind: "output", purpose: "Confidence scores per root domain" },
    ],
  },
  {
    id: "layer_4",
    label: "Email Pattern Engine",
    purpose: "Infer and store company email naming conventions",
    narrative: "Learns and stores company-specific email conventions from historical data. Applies seniority-based logic (e.g., first@ for C-Suite vs. firstlast@ for Directors) to automate resolution without external API costs.",
    providers: ["internal"],
    subLayers: ["pattern suggestion", "confidence scoring", "exception detection"],
    outputSpec: "{Email Pattern (e.g. f.last@domain), Confidence Score}",
    crmInteraction: "both",
    inputChecks: ["existing pattern", "verified truth samples"],
    outputWrites: ["inferred pattern", "pattern confidence"],
    phaseNumber: 4,
    subLayersFlow: [
      { id: "l4_p1", label: "Pattern Inference", kind: "process", purpose: "Derive naming conventions (Cost = $0)", providers: ["internal"] },
      { id: "l4_o1", label: "Internal Pattern DB", kind: "output", purpose: "Reusable resolution assets" },
    ],
  },
  {
    id: "layer_5",
    label: "Email Resolution Pipeline",
    purpose: "Produce channel-ready emails via pattern or fallback",
    narrative: "Identifies existing contact records in the database before resolution. Executes a multi-provider waterfall resolution for new targets, adding verified hits back to the central repository.",
    providers: ["apollo", "prospeo", "emailsearch_io", "pdl", "rocketreach"],
    subLayers: ["pattern-first", "provider fallback", "routing logic"],
    outputSpec: "{Work Email, Provider Source, Resolution Tier}",
    crmInteraction: "both",
    inputChecks: ["known-good emails", "prior bounce attempts"],
    outputWrites: ["candidate emails", "spend event"],
    phaseNumber: 4,
    subLayersFlow: [
      { id: "l5_p1", label: "Check Known-Good?", kind: "process", purpose: "Reuse verified truth first", providers: ["internal"] },
      { id: "l5_p2", label: "Cheap Provider Pass", kind: "process", purpose: "First pass via low-cost vendors", providers: ["emailsearch_io", "apollo", "prospeo"] },
      { id: "l5_p3", label: "Premium Fallback", kind: "process", purpose: "High-cost resolution for misses", providers: ["pdl", "rocketreach"] },
      { id: "l5_o1", label: "Email Candidates", kind: "output", purpose: "Ready for verification" },
    ],
  },
  {
    id: "layer_6",
    label: "Verification / Catch-all Classification",
    purpose: "Verify deliverability, classify catch-all vs valid",
    narrative: "Performs multi-signal SMTP handshakes to verify email deliverability and classifies catch-all domains to protect sender reputation.",
    providers: ["millionverifier", "neverbounce", "zerobounce"],
    partnersNote: "MillionVerify: 1M infinite credits for $499",
    subLayers: ["SMTP handshake", "catch-all classification", "confidence scoring"],
    outputSpec: "{Email, SMTP Status (Deliverable/Catch-all/Invalid)}",
    phaseNumber: 5,
    subLayersFlow: [
      { id: "l6_i1", label: "Candidate Emails", kind: "input", purpose: "Unverified resolution results" },
      { id: "l6_p1", label: "SMTP Handshake", kind: "process", purpose: "Direct server verification", providers: ["neverbounce", "millionverifier"] },
      { id: "l6_d1", label: "Catch-all State?", kind: "decision", purpose: "Route based on domain behavior" },
      { id: "l6_o1", label: "Verified Pool", kind: "output", purpose: "Deliverable emails" },
      { id: "l6_o2", label: "Catch-all Pool", kind: "output", purpose: "Conditional delivery" },
    ],
  },
  {
    id: "layer_7",
    label: "Catch-all Email Pipeline",
    purpose: "Treat catch-all domains as separate operational pool",
    narrative: "Applies specialized routing logic to catch-all domains, using historical reply data to isolate high-confidence leads from risky data signals.",
    providers: ["internal"],
    subLayers: ["confidence ladder", "send policy", "reply feedback loop"],
    outputSpec: "{High-Confidence Catch-all Pool, Routing Priority}",
    crmInteraction: "both",
    inputChecks: ["prior catch-all history", "reply signal ladder"],
    outputWrites: ["catch-all confidence tier", "distribution pool"],
    phaseNumber: 6,
    subLayersFlow: [
      { id: "l7_p1", label: "Confidence Tiers", kind: "process", purpose: "Segment by engagement history", providers: ["internal"] },
      { id: "l7_p2", label: "Policy Guard", kind: "process", purpose: "Apply volume/cadence filters", providers: ["internal"] },
      { id: "l7_o1", label: "Managed Catch-all Pool", kind: "output", purpose: "Tiered outreach candidates" },
    ],
  },
  {
    id: "layer_8",
    label: "Phone / Mobile Resolution",
    purpose: "Build SMS-eligible mobile pool",
    narrative: "Resolves verified mobile numbers for high-intent playbooks, including line type (mobile vs. landline) and carrier verification.",
    providers: ["rocketreach", "hlr_lookup", "twilio_lookup"],
    subLayers: ["E.164 normalization", "line type", "carrier lookup", "SMS eligibility"],
    outputSpec: "{Verified Mobile Number, Line Type, Carrier, SMS Eligible}",
    phaseNumber: 6,
    subLayersFlow: [
      { id: "l8_i1", label: "Target Person", kind: "input", purpose: "Resolved identity from Layer 2" },
      { id: "l8_p1", label: "Normalization", kind: "process", purpose: "Standardize E.164 formats", providers: ["internal"] },
      { id: "l8_p2", label: "Line Discovery", kind: "process", purpose: "Detect Mobile/VoIP/Landline", providers: ["twilio_lookup", "telesign"] },
      { id: "l8_p3", label: "Carrier Check", kind: "process", purpose: "Route & connectivity validation", providers: ["telesign"] },
      { id: "l8_p4", label: "Eligibility Logic", kind: "process", purpose: "Apply SMS policy (Global)", providers: ["internal"] },
      { id: "l8_o1", label: "Verified Mobile Pool", kind: "output", purpose: "SMS-ready records" },
    ],
  },
  {
    id: "layer_9",
    label: "Suppression / Compliance",
    purpose: "Prevent use of restricted contacts",
    narrative: "Enforces legal and commercial compliance by suppressing existing customers, competitors, and global opt-out lists.",
    providers: ["internal"],
    subLayers: ["DNC lists", "opt-out", "CRM sync", "audit trail"],
    outputSpec: "{Compliant Lead Set, Suppression Reason Code}",
    crmInteraction: "input",
    inputChecks: ["DNC", "active opps", "opt-out state"],
    phaseNumber: 7,
    subLayersFlow: [
      { id: "l9_p1", label: "Compliance Pass", kind: "process", purpose: "Filter against DNC & Opps", providers: ["internal"] },
      { id: "l9_o1", label: "Compliant Leads", kind: "output", purpose: "Safe-to-outreach records" },
    ],
  },
  {
    id: "layer_10",
    label: "Middleware / Confluence / CRM Sync",
    purpose: "Capture events, feed back into unified system",
    narrative: "Synchronizes outreach events, bounces, and replies back to the central pattern database to continuously improve stack intelligence.",
    providers: ["internal"],
    subLayers: ["event bus", "confidence updates", "pattern DB updates"],
    outputSpec: "{Enriched Profile, Sync Status, Feedback Loop Event}",
    crmInteraction: "output",
    phaseNumber: 8,
    subLayersFlow: [
      { id: "l10_i1", label: "Campaign Events", kind: "input", purpose: "Replies, Bounces, Opens" },
      { id: "l10_p1", label: "Reply Boost Loop", kind: "process", purpose: "Promote replies to verified truth", providers: ["internal"] },
      { id: "l10_o1", label: "Truth Sync", kind: "output", purpose: "Continuously improving master data" },
    ],
  },
  {
    id: "layer_11",
    label: "Final Outputs",
    purpose: "Deliver quality tiers to team leads",
    narrative: "Distributes quality-tier audiences to CRM and sales systems, segmenting by verified email, catch-all, and SMS-eligible mobile pools.",
    providers: ["internal"],
    outputSpec: "{Verified Email List, Catch-all List, Mobile SMS List}",
    crmInteraction: "output",
    phaseNumber: 9,
    subLayers: [
      "Verified Email Pool",
      "Catch-all High-confidence Pool",
      "SMS-Eligible Mobile Pool",
      "Premium Multi-channel Pool",
    ],
    subLayersFlow: [
      { id: "l11_i1", label: "Compliant Leads", kind: "input", purpose: "Resolution & Compliance complete" },
      { id: "l11_p1", label: "Tiering Logic", kind: "process", purpose: "Segment records by channel safety", providers: ["internal"] },
      { id: "l11_d1", label: "Match Policy?", kind: "decision", purpose: "Decide which output pool to join" },
      { id: "l11_o1", label: "Verified Emails", kind: "output", purpose: "Highest deliverability tier" },
      { id: "l11_o2", label: "Managed Catch-all", kind: "output", purpose: "High-confidence internal pool" },
      { id: "l11_o3", label: "SMS Mobiles", kind: "output", purpose: "Compliance-ready mobiles" },
    ],
  },
];

/**
 * Build the top-level overview diagram of the entire stack.
 */
export function buildOverviewDiagram(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Vertical layout (Top down storytelling)
  // Moderate vertical gap (550px) for tighter flow
  const verticalGap = 550;
  const layout = {
    layer_1: { x: 0, y: 0 },
    layer_2: { x: 0, y: verticalGap },
    layer_3: { x: 0, y: verticalGap * 2 },
    layer_4: { x: -450, y: verticalGap * 3 }, // Path A
    layer_5: { x: 450, y: verticalGap * 3 },  // Path B
    layer_6: { x: 0, y: verticalGap * 4 },
    layer_7: { x: -450, y: verticalGap * 5 }, // Path A
    layer_8: { x: 450, y: verticalGap * 5 },  // Path B
    layer_9: { x: 0, y: verticalGap * 6 },
    layer_10: { x: 0, y: verticalGap * 7 },
    layer_11: { x: 0, y: verticalGap * 8 },
  };

  stackLayers.forEach((layer) => {
    const pos = layout[layer.id as keyof typeof layout] || { x: 0, y: 0 };

    nodes.push({
      id: layer.id,
      type: "layerNode",
      position: pos,
      draggable: false,
      data: {
        label: layer.label,
        purpose: layer.purpose,
        narrative: layer.narrative,
        providers: layer.providers,
        outputSpec: layer.outputSpec,
        isOverview: true,
        phaseNumber: layer.phaseNumber,
        partnersNote: layer.partnersNote,
      },
    });

    // CRM Interactions: Localized side-nodes
    if (layer.crmInteraction === "input" || layer.crmInteraction === "both") {
      const crmInputId = `crm-in-${layer.id}`;
      const crmOffset = (layer.id === "layer_4" || layer.id === "layer_7") ? -1000 : -750;
      nodes.push({
        id: crmInputId,
        type: "layerNode",
        position: { x: pos.x + crmOffset, y: pos.y + 100 },
        draggable: false,
        data: {
          label: "CRM / Master DB",
          purpose: "Reference Data",
          isOverview: false,
          isCRM: true,
          style: { minWidth: '180px', scale: 0.8 },
        },
      });
      edges.push({
        id: `e-crm-in-${layer.id}`,
        source: crmInputId,
        target: layer.id,
        animated: true,
        label: "CRM Input",
        labelStyle: { fill: "var(--color-utility-brand-600)", fontWeight: 600, fontSize: 10 },
        style: { strokeDasharray: "5 5", stroke: "var(--color-utility-brand-400)" },
      });
    }

    if (layer.crmInteraction === "output" || layer.crmInteraction === "both") {
      const crmOutputId = `crm-out-${layer.id}`;
      const crmOffset = (layer.id === "layer_5" || layer.id === "layer_8") ? 1000 : 750;
      nodes.push({
        id: crmOutputId,
        type: "layerNode",
        position: { x: pos.x + crmOffset, y: pos.y + 100 },
        draggable: false,
        data: {
          label: "CRM / Master DB",
          purpose: "System Sync",
          isOverview: false,
          isCRM: true,
          style: { minWidth: '180px', scale: 0.8 },
        },
      });
      edges.push({
        id: `e-crm-out-${layer.id}`,
        source: layer.id,
        target: crmOutputId,
        animated: true,
        label: "CRM Output",
        labelStyle: { fill: "var(--color-utility-brand-600)", fontWeight: 600, fontSize: 10 },
        style: { strokeDasharray: "5 5", stroke: "var(--color-utility-brand-400)" },
      });
    }
  });

  // Manual edges to match the storyboard flow
  const connections = [
    ["layer_1", "layer_2"],
    ["layer_2", "layer_3"],
    ["layer_3", "layer_4"],
    ["layer_3", "layer_5"],
    ["layer_4", "layer_6"],
    ["layer_5", "layer_6"],
    ["layer_6", "layer_7"],
    ["layer_6", "layer_8"],
    ["layer_7", "layer_9"],
    ["layer_8", "layer_9"],
    ["layer_9", "layer_10"],
    ["layer_10", "layer_11"],
  ];

  connections.forEach(([source, target]) => {
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      animated: true,
    });
  });

  return { nodes, edges };
}

/**
 * Build a zoomed-in diagram for a specific layer.
 */
export function buildLayerDetailDiagram(layerId: string): { nodes: Node[]; edges: Edge[] } {
  const layer = stackLayers.find((l) => l.id === layerId);
  if (!layer) return buildOverviewDiagram();

  // If we have a rich flow definition, use it.
  if (layer.subLayersFlow && layer.subLayersFlow.length > 0) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const startX = 0;
    const horizontalGap = 350;
    const verticalGap = 150;

    // Group items by kind to help with layout
    const inputs = layer.subLayersFlow.filter(s => s.kind === "input");
    const processes = layer.subLayersFlow.filter(s => s.kind === "process" || s.kind === "decision");
    const outputs = layer.subLayersFlow.filter(s => s.kind === "output");

    // Layout configuration
    const cols = {
      input: 0,
      process: horizontalGap,
      decision: horizontalGap * 2,
      output: horizontalGap * 3,
    };

    const flow = layer.subLayersFlow;
    // Keep track of node positions for edge routing
    const nodePosMap: Record<string, { x: number, y: number }> = {};

    flow.forEach((sub, index) => {
      // Simple layout: stack inputs, stack processes, etc.
      const kindIndex = flow.filter((s, i) => s.kind === sub.kind && i < index).length;

      const x = cols[sub.kind] || (index * horizontalGap);
      const y = kindIndex * verticalGap;

      nodePosMap[sub.id] = { x, y };

      nodes.push({
        id: sub.id,
        type: "layerNode",
        position: { x, y },
        draggable: false,
        data: {
          label: sub.label,
          purpose: sub.purpose,
          providers: sub.providers || [],
          isOverview: false,
        },
      });
    });

    // Strategy for edges: link inputs to first process, then sequential, then to outputs
    const firstProcess = processes[0];
    const lastProcess = processes[processes.length - 1];

    inputs.forEach(input => {
      if (firstProcess) {
        edges.push({ id: `e-${input.id}-${firstProcess.id}`, source: input.id, target: firstProcess.id, animated: true });
      }
    });

    for (let i = 0; i < processes.length - 1; i++) {
      edges.push({ id: `e-${processes[i].id}-${processes[i + 1].id}`, source: processes[i].id, target: processes[i + 1].id, animated: true });
    }

    outputs.forEach(output => {
      if (lastProcess) {
        edges.push({ id: `e-${lastProcess.id}-${output.id}`, source: lastProcess.id, target: output.id, animated: true });
      }
    });

    return { nodes, edges };
  }

  // Fallback to old simple horizontal list logic
  if (!layer.subLayers || layer.subLayers.length === 0) {
    return buildOverviewDiagram();
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const startX = 0;
  const startY = 150;
  const horizontalGap = 350;

  nodes.push({
    id: `${layer.id}_input`,
    type: "layerNode",
    position: { x: startX - horizontalGap, y: startY },
    draggable: false,
    data: {
      label: "Input Data",
      purpose: "Raw signals for " + layer.label,
      providers: [],
      isOverview: false,
    },
  });

  layer.subLayers.forEach((subLabel, index) => {
    const x = startX + index * horizontalGap;
    const y = startY;
    const nodeId = `${layer.id}_sub_${index}`;

    nodes.push({
      id: nodeId,
      type: "layerNode",
      position: { x, y },
      draggable: false,
      data: {
        label: subLabel,
        purpose: "Phase " + (index + 1),
        providers: layer.providers,
        isOverview: false,
      },
    });

    const prevId = index === 0 ? `${layer.id}_input` : `${layer.id}_sub_${index - 1}`;
    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
      animated: true,
    });
  });

  const lastSubIndex = layer.subLayers.length - 1;
  nodes.push({
    id: `${layer.id}_output`,
    type: "layerNode",
    position: { x: startX + (lastSubIndex + 1) * horizontalGap, y: startY },
    draggable: false,
    data: {
      label: "Output Tier",
      purpose: "Resolved state for downstream sync",
      providers: [],
      isOverview: false,
    },
  });

  edges.push({
    id: `e-last-to-output`,
    source: `${layer.id}_sub_${lastSubIndex}`,
    target: `${layer.id}_output`,
    animated: true,
  });

  return { nodes, edges };
}


