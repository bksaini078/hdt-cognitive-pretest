export const APP_VERSION = "pretest-web-v2-github-pages-2026-09-10";

export const participantInformation = {
  version: "participant-information-v1",
  study: "Consent-First Human Digital Twin Marketplace Design",
  activity: "Cognitive pretest of a proposed expert questionnaire",
  researcher: "Bhupender Kumar Saini",
  institution: "Fraunhofer IAO, Interaction Design and Technology",
  contactEmail: "bksaini078@gmail.com",
};

export const scale = [
  { value: "1", label: "Strongly disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neither" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly agree" },
  { value: "OE", label: "Outside my expertise" },
];

export const properties = {
  relevance: "The condition or requirement belongs in the artifact for its stated purpose.",
  clarity: "Its wording and boundary can be interpreted consistently.",
  implementability: "An organization could translate it into bounded controls and responsibilities.",
  observability: "The stated evidence could support a determination about implementation.",
  completeness: "No material requirement is missing from the domain at the stated scope.",
  usefulness: "The framework supports transparent design and review decisions.",
  plausibility: "An economic proposition is reasonable enough to retain as a scenario pending empirical evidence.",
};

export const eligibility = {
  EL1: "A real contributor or represented individual has an established source relationship with the representation.",
  EL2: "A bounded representation persists or can be reused beyond the original contribution event.",
  EL3: "Downstream marketplace use can be authorized, refused, paused or restricted, and withdrawn.",
  EL4: "Each downstream use can be attributed to a study, client or justified client class, and transaction or equivalent use event.",
  EL5: "The configuration contains both an enterprise-facing access mechanism and a defined payment or value-allocation mechanism.",
};

export const eligibilityNotes = {
  EL1: "The contributor's real data or identity was used to create or train the digital representation.",
  EL2: "The representation has a defined scope and can be queried or retrieved after the initial contribution.",
  EL4: "An equivalent use event is any platform-recorded use that does not involve a financial transaction, such as a consented academic access or a non-commercial query.",
};

export const requirements = {
  DR1: { domain: "D1", label: "Participation separate from core service, off by default", text: "Marketplace participation is separate from access to any core service and is off by default.", evidence: "Versioned consent interface, participation-state record, and refusal test" },
  DR2: { domain: "D1", label: "Authorization bound to defined purposes or query classes", text: "Authorization is bound to defined purposes, studies, use categories, or query classes rather than unrestricted downstream use.", evidence: "Purpose taxonomy, authorization record, and policy-enforcement test" },
  DR3: { domain: "D1", label: "Refusal, restriction, and withdrawal enforced prospectively", text: "Refusal, restriction, and withdrawal are enforced prospectively across future querying, retrieval, relevant training use, and derived artifacts within the declared scope.", evidence: "Revocation workflow, propagation test, exception log, and completion record" },
  DR4: { domain: "D2", label: "Contributor information distinguishes data types and states processing details", text: "Contributor-facing information distinguishes supplied, observed, and inferred data and states purposes, recipient classes, retention, transfers, and material automated processing.", evidence: "Notice versions, data map, recipient register, and comprehension test" },
  DR5: { domain: "D2", label: "Contributors can inspect attributable use record", text: "Contributors can inspect an attributable use record linking authorization, downstream use, client or justified client class, transaction status, and compensation status where applicable.", evidence: "Contributor-visible audit view and reconciled event-log test" },
  DR6: { domain: "D2", label: "Correction, deletion, portability, and challenge routes record outcomes", text: "Accessible correction, restriction, deletion, portability, objection, complaint, and challenge routes record actions, outcomes, and unresolved exceptions.", evidence: "Rights workflow, service records, escalation path, and exception register" },
  DR7: { domain: "D3", label: "Platform discloses charge basis, contributor-return rule, and exceptions", text: "The platform discloses the enterprise charge basis, attributable revenue basis, contributor-return rule, payment timing, fees, reversals, and material exceptions.", evidence: "Versioned compensation policy, worked examples, and payout ledger schema" },
  DR8: { domain: "D3", label: "Compensation rules evaluated in a full-cost model with separate outputs", text: "Compensation and revenue-share rules are evaluated within a full-cost model that separately reports contribution margin, operating result, contributor capacity, continuity assumptions, concentration, acquisition payback, and runway.", evidence: "Versioned model, assumptions ledger, sensitivity results, and approval record" },
  DR9: { domain: "D4", label: "Representation lineage links inputs, transformations, and artifacts to contributor", text: "Representation-level lineage and identity-resolution rules link permitted inputs, transformations, model versions, and downstream artifacts to the correct contributor or contributor group.", evidence: "Lineage schema, identity-resolution test, provenance record, and error-handling procedure" },
  DR10: { domain: "D4", label: "Update, retention, deletion, and notification behavior specified before use", text: "Update, versioning, retention, restriction, deletion, backup expiry, and downstream-notification behavior are specified before use.", evidence: "Lifecycle policy, deletion and backup-expiry tests, version history, and notification log" },
  DR11: { domain: "D4", label: "Quality and cohort-matching rules define release thresholds", text: "Quality, freshness, coverage, diversity, and cohort-matching rules define release thresholds and the consequence when a requested cohort cannot satisfy them.", evidence: "Metric definitions, threshold rationale, cohort-fill test, and abstention record" },
  DR12: { domain: "D5", label: "Buyer identity and purpose verified; repurposing prohibited or escalated", text: "Buyer identity, access, purpose, and use-case approval are verified, with unapproved repurposing and consequential individual decisions prohibited or escalated to qualified review.", evidence: "Access-control test, buyer attestation, approved-use register, and enforcement record" },
  DR13: { domain: "D5", label: "Re-identification and singling-out controls validated for intended output", text: "Minimum-cohort, anti-singling-out (no individual contributor can be uniquely distinguished within an output), leakage, reconstruction, and re-identification controls are validated for the intended output; aggregation is not assumed to provide anonymity.", evidence: "Privacy test report, attack assessment, cohort threshold, and residual-risk decision" },
  DR14: { domain: "D5", label: "Evaluation, uncertainty communication, output disclosure, and human fallback defined", text: "Fit-for-purpose evaluation, output limitations, uncertainty communication, simulated-output disclosure, monitoring, and confidence-gated human fallback are defined for the intended decision context.", evidence: "Evaluation report, model card, output marking, monitoring plan, and fallback test" },
  DR15: { domain: "D6", label: "Both sides jointly governed across matching, pricing, compensation, and disputes", text: "The operating design jointly governs contributor eligibility and consented availability, enterprise access and demand, matching, pricing, quality, utilization, compensation, and dispute ownership across both sides.", evidence: "Operating rules, responsibility map, matching metrics, reconciliation tests, and dispute workflow" },
  DR16: { domain: "D6", label: "Named pre-release gates and owners control purpose, privacy, outputs, and changes", text: "Purpose and role definition, contributor agency, privacy and security, processors and transfers, buyer use, output integrity, incidents, and material changes are controlled by named pre-release gates and accountable owners.", evidence: "Completed release-gate record, named owners, change log, incident plan, and escalation decisions" },
};

export const domains = {
  D1: { label: "Contributor agency", requirements: ["DR1", "DR2", "DR3"] },
  D2: { label: "Contributor transparency and rights", requirements: ["DR4", "DR5", "DR6"] },
  D3: { label: "Economic participation", requirements: ["DR7", "DR8"] },
  D4: { label: "Grounding and lifecycle assurance", requirements: ["DR9", "DR10", "DR11"] },
  D5: { label: "Controlled buyer deployment and outputs", requirements: ["DR12", "DR13", "DR14"] },
  D6: { label: "Two-sided marketplace orchestration and accountability", requirements: ["DR15", "DR16"] },
};

export const economics = {
  EC1: { property: "relevance", text: "The model contains the material cost and revenue groups needed for scenario analysis." },
  EC2: { property: "usefulness", text: "Its margin, operating result, capacity, continuity, concentration, payback, and runway outputs are useful when reported separately." },
  EC3: { property: "plausibility", text: "Demand-contingent contributor revenue share is plausible to retain as a scenario." },
  EC4: { property: "plausibility", text: "A minimum contributor guarantee is plausible to retain as a cold-start scenario." },
  EC5: { property: "plausibility", text: "A hybrid guarantee plus revenue share is plausible to retain as a scenario." },
  EC6: { property: "relevance", text: "Coverage, diversity, quality, and freshness are appropriate demand sensitivities for this marketplace, without being described as observed network effects." },
};

export const routes = {
  T: { label: "Taxonomy and Information Systems methods", scope: "For expertise in taxonomy development, classification, construct design, or Information Systems research methods.", duration: "10 to 25 minutes", eligibility: ["EL1", "EL2", "EL5"], requirements: ["DR1", "DR2", "DR4", "DR14", "DR15", "DR16"], domains: ["D1", "D2", "D5", "D6"], economics: [] },
  E: { label: "Platform economics and market research", scope: "For expertise in platform or marketplace economics, pricing, compensation, business models, or market research.", duration: "10 to 25 minutes", eligibility: ["EL4", "EL5"], requirements: ["DR5", "DR7", "DR8", "DR11", "DR12", "DR15"], domains: ["D2", "D3", "D4", "D5", "D6"], economics: ["EC1", "EC2", "EC3", "EC4", "EC5", "EC6"] },
  G: { label: "Privacy and governance", scope: "For expertise in privacy, data protection, consent, responsible data use, risk, compliance, or organizational governance.", duration: "up to 30 minutes", eligibility: ["EL1", "EL3", "EL4"], requirements: ["DR1", "DR2", "DR3", "DR4", "DR6", "DR7", "DR12", "DR13", "DR16"], domains: ["D1", "D2", "D3", "D5", "D6"], economics: [] },
  A: { label: "AI and data architecture", scope: "For expertise in AI systems, data architecture, model lifecycle, data quality, privacy engineering, or technical deployment.", duration: "up to 30 minutes", eligibility: ["EL2", "EL3", "EL4"], requirements: ["DR3", "DR5", "DR9", "DR10", "DR11", "DR12", "DR13", "DR14", "DR15", "DR16"], domains: ["D1", "D2", "D4", "D5", "D6"], economics: [] },
};