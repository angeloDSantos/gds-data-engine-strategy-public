"use client";

import { useState } from "react";
import { cx } from "@/utils/cx";
import { 
  File01, 
  Settings01, 
  Database01, 
  Zap, 
  Mail01, 
  Phone, 
  ShieldTick, 
  ChevronRight,
  InfoCircle
} from "@untitledui/icons";

const sections = [
  { id: "abstract", label: "Abstract", icon: File01 },
  { id: "modular", label: "Modular Strategy", icon: Settings01 },
  { id: "catch-all", label: "Catch-all Pipeline", icon: Mail01 },
  { id: "mobile", label: "Mobile Resolution", icon: Phone },
  { id: "compounding", label: "Compounding Intelligence", icon: Database01 },
  { id: "compliance", label: "Compliance & Shield", icon: ShieldTick },
];

export function DocsPage() {
  const [activeSection, setActiveSection] = useState("abstract");

  return (
    <div className="flex h-full bg-primary">
      {/* GitHub-style Sidebar */}
      <aside className="w-64 shrink-0 border-r border-secondary bg-primary">
        <div className="flex flex-col gap-1 p-4">
          <div className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-tertiary">
            Documentation
          </div>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-brand-secondary text-brand-secondary"
                    : "text-secondary hover:bg-primary_hover hover:text-primary"
                )}
              >
                <Icon className="size-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-primary">
        <div className="mx-auto max-w-3xl px-8 pt-8 pb-12">
          {activeSection === "abstract" && (
            <div className="space-y-8">
              <header className="border-b border-secondary pb-4">
                <h1 className="text-3xl font-bold text-primary">Abstract: GDS Data Engine</h1>
                <p className="mt-2 text-lg text-tertiary">How the stacks work, resolution flows, and self-improving economics.</p>
              </header>

              <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                <p className="text-md leading-relaxed text-secondary">
                  The GDS Data Engine is not a static list of providers. It is a <strong>modular, tiered resolution framework</strong> designed to minimize cost while maximizing identity truth. We treat every data lookup as a waterfall decision.
                </p>

                <h3 className="text-xl font-semibold text-primary">The Core Flow</h3>
                <div className="rounded-xl border border-secondary bg-secondary/30 p-6">
                  <ol className="space-y-4">
                    <li className="flex gap-4">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">1</span>
                      <div>
                        <p className="font-semibold text-primary">In-house Intelligence Check</p>
                        <p className="text-tertiary">Consult Crunchbase and our CRM/Master DB first. If we know the company or domain, pattern recognition solves the email for $0.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">2</span>
                      <div>
                        <p className="font-semibold text-primary">Identity Resolve</p>
                        <p className="text-tertiary">Use PDL & Apollo to map professional profiles to current titles and employment events.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">3</span>
                      <div>
                        <p className="font-semibold text-primary">Waterfall Enrichment</p>
                        <p className="text-tertiary">Emails are resolved via cheap pass (Emailsearch, Apollo) before hitting premium fallbacks (Prospeo, PDL).</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeSection === "modular" && (
            <div className="space-y-8">
              <header className="border-b border-secondary pb-4">
                <h1 className="text-3xl font-bold text-primary">Modular Strategy</h1>
                <p className="mt-2 text-lg text-tertiary">Adapting to performance, avoiding center-box bottlenecks.</p>
              </header>

              <div className="prose prose-sm prose-slate max-w-none text-secondary">
                <p>
                  Our architecture is built on the principle of <strong>provider agility</strong>. We swap technology partners in real-time based on hit rates and regional performance. 
                </p>
                <div className="my-6 rounded-lg border-l-4 border-brand-primary bg-secondary/20 p-4">
                  <p className="italic">"Every successful credit use is logged as straight data to our master database, decreasing the cost to operate in true time."</p>
                </div>
                <h4 className="font-semibold text-primary">Key Efficiency Gains:</h4>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Cheaper-Tools-First:</strong> Verification is only run on generated candidates, stopping the waterfall the second a valid signal is found.</li>
                  <li><strong>Credit Memory:</strong> Every successful resolution improves the pattern recognition system for the next campaign.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === "catch-all" && (
            <div className="space-y-8">
              <header className="border-b border-secondary pb-4">
                <h1 className="text-3xl font-bold text-primary">Catch-all Emails</h1>
                <p className="mt-2 text-lg text-tertiary">Solving the "unverifiable" domain challenge with pattern recognition.</p>
              </header>

              <div className="prose prose-sm prose-slate max-w-none text-secondary">
                <p>
                  <strong>Catch-all domains</strong> accept all incoming mail at the server level, making standard SMTP handshakes useless. They are a primary source of data waste and reputation risk.
                </p>
                
                <h3 className="text-xl font-semibold text-primary mt-6">How GDS Proprietary Tools Solve It</h3>
                <p>
                  We don't rely on "guesses." We use a three-step resolution:
                </p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li><strong>Pattern History:</strong> If we have successfully delivered to <code>first.last@domain.com</code> previously, we promote that pattern to "Verified Truth" for all targets at that company.</li>
                  <li><strong>Response Loop:</strong> Data from responded emails from our DSEs (Designated Sales Executives) is immediately fed back into the pattern DB. A single reply validates the pattern for thousands of future records.</li>
                  <li><strong>Confidence Tiers:</strong> Catch-alls are never sent blindly. They are segmented into high-confidence (validated via pattern) and risky pools.</li>
                  <li><strong>Seniority Mapping:</strong> Our engine recognizes that patterns shift by role. For example, C-suite targets are 70% more likely to follow the <code>first@domain.com</code> convention, while Directors/Heads of typically use <code>firstlast@domain.com</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === "mobile" && (
            <div className="space-y-8">
              <header className="border-b border-secondary pb-4">
                <h1 className="text-3xl font-bold text-primary">Mobile Resolution</h1>
                <p className="mt-2 text-lg text-tertiary">High-intent phone enrichment and live HLR lookups.</p>
              </header>

              <div className="prose prose-sm prose-slate max-w-none text-secondary">
                <p>
                  Phone data is the most expensive and fragile signal. Our stack is optimized for SMS-ready mobile resolution by combining vendor truth with proprietary harvesting.
                </p>
                <div className="grid gap-4 mt-6 sm:grid-cols-2">
                  <div className="rounded-lg border border-secondary p-4">
                    <h5 className="font-bold text-primary">Source: RocketReach & Apollo</h5>
                    <p className="text-xs text-tertiary">Primary mobile enrichment pass. We leverage RocketReach extensively for high-accuracy professional mobile data.</p>
                  </div>
                  <div className="rounded-lg border border-secondary p-4">
                    <h5 className="font-bold text-primary">Proprietary Scraping</h5>
                    <p className="text-xs text-tertiary">In-house tools scrape LinkedIn profiles and niche social data to identify phone patterns that vendors often miss.</p>
                  </div>
                  <div className="rounded-lg border border-secondary p-4">
                    <h5 className="font-bold text-primary">Internal Mobile DB</h5>
                    <p className="text-xs text-tertiary">Our growing master database acts as the first point of resolution, providing tens of thousands of numbers for $0.</p>
                  </div>
                  <div className="rounded-lg border border-secondary p-4">
                    <h5 className="font-bold text-primary">Lookup: HLR Tools</h5>
                    <p className="text-xs text-tertiary">Real-time connectivity check to ensure the mobile line is actually active before use.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "compounding" && (
            <div className="space-y-8">
              <header className="border-b border-secondary pb-4">
                <h1 className="text-3xl font-bold text-primary">Compounding Intelligence</h1>
                <p className="mt-2 text-lg text-tertiary">Turning every outreach effort into a permanent asset.</p>
              </header>

              <div className="prose prose-sm prose-slate max-w-none text-secondary">
                <p>
                  The GDS platform is designed to get <strong>cheaper every day</strong>. As our internal database grows, the need to pay for external lookups for common companies and contacts vanishes.
                </p>
                
                <div className="my-6 rounded-xl border border-secondary bg-secondary/30 p-6">
                  <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                    <Database01 className="size-4 text-brand-primary" />
                    The Compounding Memory Effect
                  </h4>
                  <p className="text-sm text-tertiary">
                    When scaling to high volumes (e.g., 2.5M identities/year), the system transitions from "Discovery" to "Resolution." For example, if we target 300k mobile numbers annually, at least 100k (33%+) will typically already reside in our CRM from previous resolutions. 
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand">
                    Result: Every dollar spent today reduces the marginal cost of the next campaign by strengthening the Internal Pattern Database.
                  </p>
                </div>

                <div className="my-6 space-y-4">
                  <div className="flex gap-4">
                    <Zap className="size-5 shrink-0 text-brand-primary" />
                    <div>
                      <strong>Pattern Recognition:</strong> 
                      <p className="text-tertiary">As we confirm more valid emails, our internal pattern engine solves a higher percentage of total requests for zero cost, bypassing expensive waterfall steps.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <ShieldTick className="size-5 shrink-0 text-brand-primary" />
                    <div>
                      <strong>Truth Promotion:</strong> 
                      <p className="text-tertiary">Every "delivered" event is recorded. Every "replied" event is locked in as absolute truth, overriding all vendor data and permanently removing the need for future verification of that record.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
