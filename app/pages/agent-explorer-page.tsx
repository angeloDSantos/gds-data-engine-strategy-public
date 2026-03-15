"use client";

import { CheckCircle, AlertTriangle, XCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";

const riskLevels = {
  green: { label: "Straightforward", color: "success" as const, icon: CheckCircle },
  amber: { label: "Feasible but brittle", color: "warning" as const, icon: AlertTriangle },
  red: { label: "High risk", color: "error" as const, icon: XCircle },
};

const automationTasks = [
  {
    group: "Web research and discovery",
    tasks: [
      { name: "Searching company sites for leadership pages", risk: "green" as const },
      { name: "Crawling conference speaker pages", risk: "green" as const },
      { name: "Crawling event agendas and exhibitor pages", risk: "green" as const },
      { name: "Extracting named executives from HTML", risk: "green" as const },
      { name: "Collecting schema.org person/company data", risk: "green" as const },
    ],
  },
  {
    group: "Internal browser workflows",
    tasks: [
      { name: "Opening vendor dashboards, exporting saved searches", risk: "amber" as const },
      { name: "Batching uploads, moving data between tools", risk: "amber" as const },
      { name: "Triggering enrichment runs, checking job completion", risk: "amber" as const },
    ],
  },
  {
    group: "Lookup orchestration",
    tasks: [
      { name: "Checking domain/pattern DB before provider lookup", risk: "green" as const },
      { name: "MX lookups, catch-all classification", risk: "green" as const },
      { name: "Selecting cheapest next provider by routing rules", risk: "green" as const },
      { name: "Promoting delivered/replied emails to verified pattern samples", risk: "green" as const },
    ],
  },
  {
    group: "Data reconciliation",
    tasks: [
      { name: "Dedupe by normalized name/company/title/domain", risk: "green" as const },
      { name: "Compare vendor conflicts, identify stale records", risk: "green" as const },
      { name: "Map raw titles to normalized taxonomies", risk: "green" as const },
    ],
  },
  {
    group: "Outreach operations",
    tasks: [
      { name: "Generate lead batches, personalize with templates", risk: "amber" as const },
      { name: "Queue email/SMS sends for eligible records", risk: "amber" as const },
      { name: "Log delivery events, classify replies", risk: "green" as const },
      { name: "Push confirmed-good contacts to verified truth", risk: "green" as const },
    ],
  },
  {
    group: "Higher risk / fragile",
    tasks: [
      { name: "Large-scale scraping of hostile sites", risk: "red" as const },
      { name: "LinkedIn-intensive automation at scale", risk: "red" as const },
      { name: "CAPTCHA-heavy workflows", risk: "red" as const },
      { name: "Unsupervised message sending", risk: "red" as const },
    ],
  },
];

const compoundingSteps = [
  "Source acquisition — Agents scrape/query company sites, speaker pages, event agendas",
  "Middleware entry — Every record enters with source, timestamp, confidence, cost",
  "Identity/domain/pattern classification — Resolve identity, check pattern DB, catch-all status",
  "Channel-specific resolution — Route to verified email, catch-all, or phone stack",
  "Unified sales app — DSEs search, outreach queued, templates personalize",
  "Real-world outreach truth — Delivery, bounce, reply, opt-in, opt-out signals",
  "Verified truth promotion — Mark confirmed good, increase pattern/domain confidence",
  "System intelligence compounds — Next target: pattern known, premium lookup avoided",
];

export function AgentExplorerPage() {
  return (
    <div className="flex h-full flex-col bg-secondary overflow-hidden">
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-12">
        {/* Agent infrastructure blocks */}
        <section>
          <h2 className="mb-4 text-md font-semibold text-primary">Agent infrastructure</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfraBlock title="Local model layer" items={["LLM router", "Task planner", "Extraction model", "Reply classifier"]} />
            <InfraBlock title="Execution layer" items={["Browser automation", "Queue processors", "Scheduled jobs", "Retry workers"]} />
            <InfraBlock title="Data layer" items={["Raw scrape staging", "Pattern DB", "Event stream", "Verified truth tables"]} />
            <InfraBlock title="Governance layer" items={["Action approval policies", "Rate limits", "Safe mode", "Audit logs"]} />
          </div>
        </section>

        {/* Automatable tasks */}
        <section>
          <h2 className="mb-4 text-md font-semibold text-primary">Automatable tasks</h2>
          <p className="mb-4 text-sm text-tertiary">
            Risk classification: Green = straightforward, Amber = feasible but brittle, Red = high fragility / policy risk.
          </p>
          <div className="space-y-6">
            {automationTasks.map((group) => (
              <div key={group.group} className="rounded-lg border border-secondary bg-primary p-4">
                <h3 className="mb-3 text-sm font-semibold text-secondary">{group.group}</h3>
                <ul className="space-y-2">
                  {group.tasks.map((task) => {
                    const config = riskLevels[task.risk];
                    const Icon = config.icon;
                    return (
                      <li key={task.name} className="flex items-center gap-3 text-sm">
                        <Icon className={`size-4 shrink-0 ${
                          task.risk === "green" ? "text-fg-success-primary" :
                          task.risk === "amber" ? "text-fg-warning-primary" : "text-fg-error-primary"
                        }`} aria-hidden />
                        <span className="text-secondary">{task.name}</span>
                        <Badge color={config.color} size="sm" type="pill-color">
                          {config.label}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Compounding loop */}
        <section>
          <h2 className="mb-4 text-md font-semibold text-primary">Compounding intelligence loop</h2>
          <div className="space-y-3">
            {compoundingSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-secondary bg-primary p-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-secondary">
                  {i + 1}
                </span>
                <p className="text-sm text-secondary">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-tertiary">
            The real long-term win is not just automation—it is self-improving intelligence. Every credit spent should
            create memory. The next time someone from that company is targeted, the pattern may already be known.
          </p>
        </section>

        {/* Unified sales app */}
        <section>
          <h2 className="mb-4 text-md font-semibold text-primary">Unified sales app flow</h2>
          <div className="rounded-lg border border-secondary bg-primary p-4">
            <p className="mb-3 text-sm text-secondary">
              The operating system where users search companies/executives, filter by region/title/industry, see channel
              availability and confidence scores, launch outreach, and record outcomes.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Search view",
                "Company view",
                "Contact 360 view",
                "Outreach queue",
                "Campaign monitor",
                "Reply inbox",
                "Verified truth review",
                "Pattern intelligence view",
                "Provider spend view",
              ].map((view) => (
                <Badge key={view} color="gray" size="sm">
                  {view}
                </Badge>
              ))}
            </div>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

function InfraBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-secondary bg-primary p-4">
      <h3 className="mb-2 text-sm font-semibold text-primary">{title}</h3>
      <ul className="space-y-1 text-sm text-tertiary">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
