import {
  APP_VERSION,
  domains,
  economics,
  eligibility,
  eligibilityNotes,
  glossary,
  participantInformation,
  properties,
  requirements,
  routes,
  scale,
} from "./data.mjs";

const main = document.querySelector("#main-content");
const stepList = document.querySelector("#step-list");
const sessionLabel = document.querySelector("#session-label");
const versionLabel = document.querySelector("#version-label");
const toast = document.querySelector("#toast");

const state = {
  route: null,
  pretestId: "",
  consentDate: "",
  consentConfirmed: false,
  informationAcknowledged: false,
  identityConfirmed: false,
  startedAt: null,
  exportedAt: null,
  currentStep: 0,
  ratings: {},
  rationales: {},
  openResponses: {},
};

let steps = [{ id: "setup", label: "Set up" }];

versionLabel.textContent = APP_VERSION;
render();

function routeConfig() {
  return state.route ? routes[state.route] : null;
}

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSteps() {
  const route = routeConfig();
  steps = [
    { id: "setup", label: "Set up" },
    { id: "information", label: "Information & consent" },
    { id: "eligibility", label: "Eligibility" },
    { id: "requirements", label: "Requirements" },
    { id: "domains", label: "Domains" },
    ...(route.economics.length ? [{ id: "economics", label: "Economics" }] : []),
    { id: "overall", label: "Overall review" },
    { id: "review", label: "Review & export" },
  ];
}

function render() {
  const step = steps[state.currentStep];
  renderProgress();
  sessionLabel.textContent = state.route ? `${state.pretestId} / Route ${state.route}` : "Not started";

  const views = {
    setup: renderSetup,
    information: renderParticipantInformation,
    eligibility: renderEligibility,
    requirements: renderRequirements,
    domains: renderDomains,
    economics: renderEconomics,
    overall: renderOverall,
    review: renderReview,
  };
  main.innerHTML = views[step.id]();
  bindViewEvents();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProgress() {
  stepList.innerHTML = steps
    .map((step, index) => `<li class="${index === state.currentStep ? "active" : index < state.currentStep ? "complete" : ""}">${escapeHtml(step.label)}</li>`)
    .join("");
}

function heading(kicker, title, description) {
  return `<header class="page-heading"><p class="eyebrow">${escapeHtml(kicker)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></header>`;
}

function renderSetup() {
  return `
    ${heading("Researcher setup", "Prepare a bounded pretest session", "Assign the verified route and pseudonymous ID before handing the device to the participant.")}
    <section class="setup-panel">
      <div class="notice warning">
        <p>The next screen presents the participant-information sheet and consent affirmation.</p>
        <p>This hosted app does not submit questionnaire responses, record audio or video, or intentionally collect direct identifiers. GitHub may process access metadata, including IP addresses, under its own privacy terms.</p>
      </div>
      <div class="field-grid">
        <label class="field"><span>Pseudonymous pretest ID</span><input id="pretest-id" type="text" autocomplete="off" maxlength="40" placeholder="PT-001" value="${escapeHtml(state.pretestId)}" /></label>
        <label class="field"><span>Verified route</span><select id="route-select"><option value="">Select route</option>${Object.entries(routes).map(([id, route]) => `<option value="${id}" ${state.route === id ? "selected" : ""}>${id}: ${escapeHtml(route.label)}</option>`).join("")}</select></label>
      </div>
      <section class="definition-panel" aria-labelledby="route-guide-title">
        <p><strong id="route-guide-title">Route guide</strong></p>
        <p>Select the one route assigned by the researcher based on verified expertise.</p>
        <div class="definition-grid">${Object.entries(routes).map(([id, route]) => `<div><strong>Route ${id}: ${escapeHtml(route.label)}</strong><span>${escapeHtml(route.scope)}</span></div>`).join("")}</div>
      </section>
      <section class="definition-panel" aria-labelledby="glossary-title">
        <p><strong id="glossary-title">Plain-language glossary</strong></p>
        <p>These explanations clarify recurring terms without changing the formal questionnaire statements.</p>
        <div class="definition-grid">${glossary.map(({ term, definition }) => `<div><strong>${escapeHtml(term)}</strong><span>${escapeHtml(definition)}</span></div>`).join("")}</div>
      </section>
      <label class="check-row"><input id="identity-confirmed" type="checkbox" ${state.identityConfirmed ? "checked" : ""} /><span>I confirm that no participant name, employer, client, or other direct identifier will be entered in this app.</span></label>
    </section>
    <div class="section-actions"><span></span><button class="button primary" id="start-session">Open participant information</button></div>`;
}

function participantInformationIsComplete() {
  return ["researcher", "institution", "contactEmail"]
    .every((key) => participantInformation[key].trim().length > 0);
}

function renderParticipantInformation() {
  const configured = participantInformationIsComplete();
  return `
    ${heading("Participant information", "Please read before deciding", "This information applies to the cognitive pretest of the proposed expert questionnaire.")}
    <section class="participant-information" aria-labelledby="participant-information-title">
      <h2 id="participant-information-title">Cognitive Pretest Participant Information and Consent Record</h2>
      <dl class="information-meta">
        <div><dt>Study</dt><dd>${escapeHtml(participantInformation.study)}</dd></div>
        <div><dt>Activity</dt><dd>${escapeHtml(participantInformation.activity)}</dd></div>
        <div><dt>Researcher</dt><dd>${escapeHtml(participantInformation.researcher)}</dd></div>
        <div><dt>Institution</dt><dd>${escapeHtml(participantInformation.institution)}</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${escapeHtml(participantInformation.contactEmail)}">${escapeHtml(participantInformation.contactEmail)}</a></dd></div>
      </dl>

      <h2>Why you are being invited</h2>
      <p>You are being invited as a non-panel expert to test whether a draft questionnaire is understandable, navigable, and practical to complete. Your responses will be used to improve the questionnaire. They are not Delphi ratings, will not be included in Delphi consensus calculations, and cannot establish implementation, legal compliance, market demand, or commercial viability.</p>
      <p>You cannot later participate in the Delphi panel for this study.</p>

      <h2>What participation involves</h2>
      <ul>
        <li>One supervised session lasting ${escapeHtml(routeConfig().duration)}.</li>
        <li>Thinking aloud while reading the introductory text, one eligibility condition, and the first assigned requirement.</li>
        <li>Completing assigned ratings and short comments without coaching.</li>
        <li>Answering brief questions about wording, response properties, navigation, and burden.</li>
        <li>No audio or video recording unless separately disclosed and consented.</li>
      </ul>

      <h2>Voluntary participation</h2>
      <p>Participation is voluntary. You may skip a question, choose <code>OE outside my expertise</code>, pause, or stop without giving a reason. Stopping will not affect any relationship with the researcher or institution.</p>

      <h2>Information collected and handling</h2>
      <p>The pretest uses the pseudonymous ID <strong>${escapeHtml(state.pretestId)}</strong>. Do not enter your name, employer, client names, confidential project details, or sensitive personal information. The researcher records your verified competence route, questionnaire responses, timing, interruptions, comprehension observations, and revision decisions. Identity and contact information are stored separately from response and issue logs.</p>
      <p>The app does not send questionnaire responses to a study server. GitHub Pages delivers the application files and may process access metadata under <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's privacy statement</a>. At the end of the session, the researcher saves the exported response file to an access-controlled study location and clears the browser session.</p>
      <p><strong>Intended reporting:</strong> Aggregate methodological description and non-identifying examples only.</p>

      <h2>Consent record</h2>
      <p>By affirming below, you confirm that you have read and understood this information, had an opportunity to ask questions, understand that this is questionnaire pretesting rather than Delphi participation, understand how the information will be handled and how to stop participating, and consent to participate.</p>
      <p>No recording is planned. Any later recording would require separate disclosure, approval, and consent.</p>
      <label class="field"><span>Consent date</span><input id="consent-date" type="date" value="${escapeHtml(state.consentDate)}" readonly /></label>
      <label class="check-row"><input id="information-acknowledged" type="checkbox" ${state.informationAcknowledged ? "checked" : ""} ${configured ? "" : "disabled"} /><span>I have read and understood the participant information and had an opportunity to ask questions.</span></label>
      <label class="check-row"><input id="consent-confirmed" type="checkbox" ${state.consentConfirmed ? "checked" : ""} ${configured ? "" : "disabled"} /><span>I voluntarily consent to participate in this cognitive pretest.</span></label>
    </section>
    <div class="section-actions"><button class="button secondary" data-nav="back">Back to researcher setup</button><button class="button primary" id="begin-questionnaire" ${configured ? "" : "disabled"}>Begin questionnaire</button></div>`;
}

function renderEligibility() {
  const route = routeConfig();
  return `
    ${heading(`Route ${state.route}`, "Marketplace eligibility", "Rate whether each assigned condition belongs in the boundary and can be interpreted consistently.")}
    <section class="notice">
      <p>This is a proposed, unlaunched platform. Your ratings assess design content, not implementation, compliance, or commercial viability.</p>
      <p>The conditions below define the narrower contributor-backed marketplace. They are not taxonomy categories. Parenthetical notes explain the wording and are not part of the formal condition.</p>
      <p><strong>During this first section, the researcher may ask you to think aloud.</strong></p>
    </section>
    ${route.eligibility.map((id) => renderEligibilityCard(id)).join("")}
    ${renderOpenField("EL.open", "What condition is missing, unnecessary, or ambiguously bounded?")}
    ${navigation()}`;
}

function renderEligibilityCard(id) {
  const note = eligibilityNotes[id] ? `<p class="item-note">${escapeHtml(eligibilityNotes[id])}</p>` : "";
  return `<article class="item-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text">${escapeHtml(eligibility[id])}</p></div>${note}${ratingControl(`${id}.relevance`, "relevance")}${ratingControl(`${id}.clarity`, "clarity")}</article>`;
}

function renderRequirements() {
  const route = routeConfig();
  return `
    ${heading(`Route ${state.route}`, "Consent-first requirements", "Rate each assigned requirement as one design unit. Open the evidence reference when judging observability.")}
    ${definitionPanel(["relevance", "clarity", "implementability", "observability"])}
    <section class="notice"><p><strong>OE is a deliberate response:</strong> choose it when the property is outside your expertise. An unanswered item is recorded separately as missing.</p><p>If one element within a compound requirement is unclear, describe that element in DR.open rather than marking the whole requirement OE.</p></section>
    ${route.requirements.map((id) => renderRequirementCard(id)).join("")}
    ${renderOpenField("DR.open", "Identify one control dependency, harmful implication, or wording change in your assigned requirements.")}
    ${navigation()}`;
}

function renderRequirementCard(id) {
  const requirement = requirements[id];
  return `<article class="item-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text">${escapeHtml(requirement.text)}</p></div>
    <details class="evidence-panel"><summary>View evidence expected before release</summary><p><strong>${escapeHtml(requirement.label)}:</strong> ${escapeHtml(requirement.evidence)}.</p></details>
    ${["relevance", "clarity", "implementability", "observability"].map((property) => ratingControl(`${id}.${property}`, property)).join("")}</article>`;
}

function renderDomains() {
  const route = routeConfig();
  return `
    ${heading(`Route ${state.route}`, "Domain completeness", "Judge whether each routed domain covers the material requirements needed at its stated scope.")}
    ${definitionPanel(["completeness"])}
    <section class="notice"><p>Each card shows the complete domain. Requirements outside your rating route are context only; do not rate them individually.</p></section>
    ${route.domains.map((id) => renderDomainCard(id)).join("")}
    ${navigation()}`;
}

function renderDomainCard(id) {
  const domain = domains[id];
  const assigned = new Set(routeConfig().requirements);
  const rating = state.ratings[`${id}.completeness`];
  const showOpen = rating === "1" || rating === "2";
  return `<article class="domain-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text"><strong>${escapeHtml(domain.label)}</strong><br />This domain covers the material requirements needed at its stated scope.</p></div>
    <ul class="domain-list">${domain.requirements.map((requirementId) => `<li><strong>${requirementId}</strong><span>${escapeHtml(requirements[requirementId].label)}</span><span class="context-badge ${assigned.has(requirementId) ? "assigned" : ""}">${assigned.has(requirementId) ? "Rated" : "Context only"}</span></li>`).join("")}</ul>
    ${ratingControl(`${id}.completeness`, "completeness")}
    <label class="field domain-open" data-domain-open="${id}" ${showOpen ? "" : "hidden"}><span>What material requirement is missing? Required for a rating of 1 or 2.</span><textarea data-open-id="${id}.open">${escapeHtml(state.openResponses[`${id}.open`] ?? "")}</textarea></label>
  </article>`;
}

function renderEconomics() {
  return `
    ${heading("Route E", "Economic scenario review", "Assess whether the propositions should remain as scenarios pending empirical evidence.")}
    ${definitionPanel(["relevance", "usefulness", "plausibility"])}
    <section class="notice warning"><p>The model separates transaction contribution margin from platform operating result and reports capacity, continuity assumptions, concentration, acquisition payback, and runway.</p><p>Four of five original scenarios fail the combined threshold test. The one passing scenario shows approximately $431 monthly surplus and fails under every tested adverse-factor combination. These are assumption-driven sensitivity results, not forecasts, observed demand, or viability evidence.</p></section>
    ${routeConfig().economics.map((id) => renderEconomicCard(id)).join("")}
    ${renderOpenField("EC.open", "Which three assumptions most require empirical evidence before pricing, recruitment, or investment decisions can be made? For each, suggest a plausible evidence source or range where possible.")}
    ${navigation()}`;
}

function renderEconomicCard(id) {
  const item = economics[id];
  return `<article class="item-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text">${escapeHtml(item.text)}</p></div>${ratingControl(id, item.property)}</article>`;
}

function renderOverall() {
  return `
    ${heading("Final participant section", "Overall review", "Consider the framework as a whole, then identify the revision that matters most.")}
    ${definitionPanel(["usefulness"])}
    <article class="item-card"><div class="item-header"><span class="item-id">FW1</span><p class="item-text">The framework supports transparent design and review decisions for a proposed consent-first marketplace.</p></div>${ratingControl("FW1", "usefulness")}</article>
    ${renderOpenField("F1", "Which single revision would most improve the framework?")}
    ${renderOpenField("F2", "State any material objection that the assigned ratings did not let you express.")}
    ${navigation()}`;
}

function renderReview() {
  const expected = expectedRatingItems();
  const missing = expected.filter((item) => !state.ratings[item.id]);
  const lowWithoutRationale = expected.filter((item) => ["1", "2", "OE"].includes(state.ratings[item.id]) && !(state.rationales[item.id] ?? "").trim());
  const domainWithoutReason = routeConfig().domains.filter((id) => ["1", "2"].includes(state.ratings[`${id}.completeness`]) && !(state.openResponses[`${id}.open`] ?? "").trim());
  const requiredOpen = ["EL.open", "DR.open", ...(state.route === "E" ? ["EC.open"] : []), "F1", "F2"];
  const missingOpen = requiredOpen.filter((id) => !(state.openResponses[id] ?? "").trim());
  const issues = [...missing.map((item) => `${item.id} is unanswered`), ...lowWithoutRationale.map((item) => `${item.id} needs a brief reason`), ...domainWithoutReason.map((id) => `${id}.open needs the missing requirement`), ...missingOpen.map((id) => `${id} needs a response; enter None when there is nothing to report`)];
  return `
    ${heading("Final check", "Review and export", "Review missing or incomplete responses, then save the pseudonymous response package locally.")}
    <section class="review-summary">
      <p><span class="route-badge">Route ${state.route}</span> <strong>${escapeHtml(routeConfig().label)}</strong></p>
      <p><strong>${expected.length}</strong> atomic ratings expected; <strong>${expected.length - missing.length}</strong> answered.</p>
      ${issues.length ? `<div class="notice warning"><p><strong>${issues.length} item${issues.length === 1 ? "" : "s"} need attention.</strong></p><ul class="review-list missing">${issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")}</ul></div>` : `<div class="notice"><p><strong>Response check complete.</strong> All expected ratings and required reasons are present.</p></div>`}
      <label class="check-row"><input id="missing-confirmed" type="checkbox" ${issues.length ? "" : "checked"} /><span>${issues.length ? "I have reviewed these items and intentionally leave any remaining responses incomplete." : "All required response checks passed."}</span></label>
      <div class="export-grid"><button class="button primary" id="export-json" ${issues.length ? "disabled" : ""}>Download response package</button><button class="button secondary" id="print-review">Print or save as PDF</button></div>
      <p class="rating-help">After the download is verified, give the device back to the researcher. The researcher records comprehension observations and timing in the separate pretest log.</p>
    </section>
    <div class="section-actions"><button class="button secondary" data-nav="back">Back</button><button class="button danger" id="clear-session">Clear browser session</button></div>`;
}

function definitionPanel(names) {
  return `<section class="definition-panel"><p class="eyebrow">Rating properties</p><div class="definition-grid">${names.map((name) => `<div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(properties[name])}</span></div>`).join("")}</div></section>`;
}

function ratingControl(id, property) {
  const current = state.ratings[id] ?? "";
  const rationaleVisible = ["1", "2", "OE"].includes(current);
  return `<fieldset class="rating-block" data-rating-id="${id}" data-property="${property}"><legend>${escapeHtml(property)}</legend><p class="rating-help">${escapeHtml(properties[property])}</p><div class="rating-options">${scale.map(({ value, label }) => `<label class="rating-option"><input type="radio" name="${id}" value="${value}" ${current === value ? "checked" : ""} /><span>${value}<small>${escapeHtml(label)}</small></span></label>`).join("")}</div><label class="field rationale-field" data-rationale-for="${id}" ${rationaleVisible ? "" : "hidden"}><span>Brief reason required for 1, 2, or OE</span><textarea data-rationale-id="${id}">${escapeHtml(state.rationales[id] ?? "")}</textarea></label></fieldset>`;
}

function renderOpenField(id, prompt) {
  return `<label class="field item-card"><span>${escapeHtml(id)}: ${escapeHtml(prompt)}</span><textarea data-open-id="${id}">${escapeHtml(state.openResponses[id] ?? "")}</textarea></label>`;
}

function navigation() {
  return `<div class="section-actions"><button class="button secondary" data-nav="back">Back</button><button class="button primary" data-nav="next">Continue</button></div>`;
}

function bindViewEvents() {
  document.querySelectorAll("input[type=radio]").forEach((input) => input.addEventListener("change", handleRating));
  document.querySelectorAll("[data-rationale-id]").forEach((field) => field.addEventListener("input", (event) => { state.rationales[event.target.dataset.rationaleId] = event.target.value; }));
  document.querySelectorAll("[data-open-id]").forEach((field) => field.addEventListener("input", (event) => { state.openResponses[event.target.dataset.openId] = event.target.value; }));
  document.querySelectorAll("[data-nav=back]").forEach((button) => button.addEventListener("click", () => navigate(-1)));
  document.querySelectorAll("[data-nav=next]").forEach((button) => button.addEventListener("click", () => navigate(1)));
  document.querySelector("#start-session")?.addEventListener("click", startSession);
  document.querySelector("#begin-questionnaire")?.addEventListener("click", beginQuestionnaire);
  document.querySelector("#export-json")?.addEventListener("click", exportResponse);
  document.querySelector("#print-review")?.addEventListener("click", () => window.print());
  document.querySelector("#clear-session")?.addEventListener("click", clearSession);
  document.querySelector("#missing-confirmed")?.addEventListener("change", (event) => {
    const exportButton = document.querySelector("#export-json");
    if (exportButton) exportButton.disabled = !event.target.checked;
  });
}

function startSession() {
  const pretestId = document.querySelector("#pretest-id").value.trim();
  const route = document.querySelector("#route-select").value;
  const identityConfirmed = document.querySelector("#identity-confirmed").checked;
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(pretestId) || !route || !identityConfirmed) {
    showToast("Complete the pseudonymous ID, verified route, and privacy confirmation.");
    return;
  }
  Object.assign(state, { pretestId, route, identityConfirmed, consentDate: localDateValue() });
  buildSteps();
  state.currentStep = 1;
  render();
}

function beginQuestionnaire() {
  const consentDate = document.querySelector("#consent-date").value;
  const informationAcknowledged = document.querySelector("#information-acknowledged").checked;
  const consentConfirmed = document.querySelector("#consent-confirmed").checked;
  if (!participantInformationIsComplete() || !consentDate || !informationAcknowledged || !consentConfirmed) {
    showToast("Complete the consent date and both participant affirmations.");
    return;
  }
  Object.assign(state, { consentDate, informationAcknowledged, consentConfirmed, startedAt: new Date().toISOString(), currentStep: 2 });
  render();
}

function handleRating(event) {
  const id = event.target.name;
  state.ratings[id] = event.target.value;
  const rationale = document.querySelector(`[data-rationale-for="${cssEscape(id)}"]`);
  if (rationale) rationale.hidden = !["1", "2", "OE"].includes(event.target.value);
  if (id.endsWith(".completeness")) {
    const domainId = id.split(".")[0];
    const domainOpen = document.querySelector(`[data-domain-open="${domainId}"]`);
    if (domainOpen) domainOpen.hidden = !["1", "2"].includes(event.target.value);
  }
}

function navigate(direction) {
  state.currentStep = Math.max(0, Math.min(steps.length - 1, state.currentStep + direction));
  render();
}

function expectedRatingItems() {
  const route = routeConfig();
  return [
    ...route.eligibility.flatMap((id) => ["relevance", "clarity"].map((property) => ({ id: `${id}.${property}`, objectId: id, module: "EL", property }))),
    ...route.requirements.flatMap((id) => ["relevance", "clarity", "implementability", "observability"].map((property) => ({ id: `${id}.${property}`, objectId: id, module: "DR", property }))),
    ...route.domains.map((id) => ({ id: `${id}.completeness`, objectId: id, module: "D", property: "completeness" })),
    ...route.economics.map((id) => ({ id, objectId: id, module: "EC", property: economics[id].property })),
    { id: "FW1", objectId: "FW1", module: "FW", property: "usefulness" },
  ];
}

function exportResponse() {
  const completedAt = new Date().toISOString();
  const responses = expectedRatingItems().map((item) => {
    const rating = state.ratings[item.id] ?? null;
    return {
      item_id: item.id,
      object_id: item.objectId,
      module: item.module,
      property: item.property,
      response_status: rating ? (rating === "OE" ? "outside-expertise" : "valid-rating") : "missing",
      rating: rating && rating !== "OE" ? Number(rating) : null,
      rationale_text: state.rationales[item.id]?.trim() || null,
    };
  });
  const payload = {
    schema_version: "cognitive-pretest-response-v1",
    package_version: APP_VERSION,
    pretest_id: state.pretestId,
    verified_route: state.route,
    assigned_item_ids: [...routeConfig().eligibility, ...routeConfig().requirements, ...routeConfig().domains, ...routeConfig().economics, "FW1", "EL.open", ...routeConfig().domains.map((id) => `${id}.open`), "DR.open", ...(state.route === "E" ? ["EC.open"] : []), "F1", "F2"],
    participant_information_version: participantInformation.version,
    participant_information_acknowledged: state.informationAcknowledged,
    consent_recorded: state.consentConfirmed,
    consent_date: state.consentDate,
    delivery_mode: "public-github-pages",
    started_at_iso: state.startedAt,
    completed_at_iso: completedAt,
    completion_seconds: Math.max(0, Math.round((new Date(completedAt) - new Date(state.startedAt)) / 1000)),
    responses,
    open_responses: Object.entries(state.openResponses).map(([item_id, response_text]) => ({ item_id, response_text: response_text.trim() || null })),
  };
  download(`${safeFilename(state.pretestId)}_${state.route}_${APP_VERSION}.json`, JSON.stringify(payload, null, 2));
  state.exportedAt = completedAt;
  showToast("Response package downloaded. Verify the file before clearing this session.");
}

function clearSession() {
  if (!window.confirm("Clear all responses from this browser session? Verify the downloaded file first.")) return;
  Object.assign(state, { route: null, pretestId: "", consentDate: "", consentConfirmed: false, informationAcknowledged: false, identityConfirmed: false, startedAt: null, exportedAt: null, currentStep: 0, ratings: {}, rationales: {}, openResponses: {} });
  steps = [{ id: "setup", label: "Set up" }];
  render();
}

function download(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function safeFilename(value) {
  return value.replace(/[^A-Za-z0-9_-]/g, "_");
}

function cssEscape(value) {
  return window.CSS?.escape ? window.CSS.escape(value) : value.replaceAll(".", "\\.");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("beforeunload", (event) => {
  if (state.startedAt && !state.exportedAt) {
    event.preventDefault();
    event.returnValue = "";
  }
});