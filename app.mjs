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
      <p><strong>You are invited as an independent expert. We want to check whether this draft questionnaire is easy to understand, easy to use, and practical to complete.</strong></p>
      <p>Your responses will be used to improve the questionnaire. They are not Delphi ratings, will not be included in Delphi consensus calculations, and cannot establish implementation, legal compliance, market demand, or commercial viability.</p>
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
    ${heading(`Route ${state.route}`, "Marketplace eligibility", "Review your assigned parts of the five-condition eligibility checklist.")}
    <section class="notice">
      <p><strong>What is this checklist?</strong> The full checklist has five conditions, EL1 to EL5. A proposed service must meet all five conditions to fit this study's definition of a contributor-backed marketplace. Your route shows only the conditions assigned to you for review.</p>
      <p>The platform is only a design. It is not running yet.</p>
      <p><strong>What to do:</strong></p>
      <ol>
        <li>Read each statement and the short note below it.</li>
        <li>For <strong>Relevance</strong>, ask: “Should this statement be one of the five required conditions?” Choose 1 for no and 5 for yes.</li>
        <li>For <strong>Clarity</strong>, ask: “Is this statement easy to understand?” Choose 1 for very unclear and 5 for very clear.</li>
        <li>If you choose 1, 2, or Outside my expertise, write a short reason in the box that appears.</li>
        <li>At the end, tell us if a rule should be added, removed, or made clearer. Enter <strong>None</strong> if you have no suggestion.</li>
      </ol>
      <p>Codes such as <strong>EL1</strong> are only labels. You do not need to explain the codes. Text in brackets helps explain a statement but is not part of the formal rule.</p>
      <p><strong>If the researcher asks you to think aloud, say what the sentence means in your own words. Say what is confusing. There is no correct answer.</strong></p>
      <p>Review only the idea and the words. Do not rate whether the platform works, follows the law, or makes money.</p>
    </section>
    ${route.eligibility.map((id) => renderEligibilityCard(id)).join("")}
    ${renderOpenField("EL.open", "Your comments on the checklist", "Should a rule be added, removed, or made clearer? Explain briefly, or enter None.")}
    ${navigation()}`;
}

function renderEligibilityCard(id) {
  const note = eligibilityNotes[id] ? `<p class="item-note">${escapeHtml(eligibilityNotes[id])}</p>` : "";
  return `<article class="item-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text">${escapeHtml(eligibility[id])}</p></div>${note}${ratingControl(`${id}.relevance`, "relevance")}${ratingControl(`${id}.clarity`, "clarity")}</article>`;
}

function renderRequirements() {
  const route = routeConfig();
  return `
    ${heading(`Route ${state.route}`, "Consent-first requirements", "Read each proposed requirement and rate it in four ways.")}
    ${definitionPanel(["relevance", "clarity", "implementability", "observability"])}
    <section class="notice"><p><strong>What to do:</strong> Read the requirement, then rate whether it should be included, is easy to understand, can be put into practice, and can be checked using evidence.</p><p>Open <strong>View evidence expected before release</strong> before you rate Observability. This shows the records or tests that could prove the requirement was followed.</p><p>Choose <strong>Outside my expertise</strong> only when you cannot judge that rating. If you choose 1, 2, or Outside my expertise, write a short reason in the box that appears.</p><p>Codes such as <strong>DR1</strong> are only labels.</p></section>
    ${route.requirements.map((id) => renderRequirementCard(id)).join("")}
    ${renderOpenField("DR.open", "Your comments on the requirements", "Tell us about a missing link between rules, a possible harm, or wording that should change. Enter None if you have nothing to report.")}
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
    ${heading(`Route ${state.route}`, "Are any requirements missing?", "Each domain groups related requirements. Decide whether an important requirement is missing from each group.")}
    ${definitionPanel(["completeness"])}
    <section class="notice"><p><strong>What to do:</strong> Read the full list in each domain. Choose 1 if important requirements are missing and 5 if the group appears complete.</p><p>Rows marked <strong>Rated</strong> were rated by you earlier. Rows marked <strong>Context only</strong> are shown to help you understand the whole group; do not rate those rows separately.</p><p>Codes such as <strong>D1</strong> are only labels for groups of related requirements.</p></section>
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
    ${heading("Route E", "Economic scenario review", "Decide whether each economic idea is reasonable enough to keep for later testing.")}
    ${definitionPanel(["relevance", "usefulness", "plausibility"])}
    <section class="notice warning"><p><strong>What to do:</strong> Rate whether each idea is useful, relevant, or reasonable enough to keep as a scenario for future testing. You are not deciding whether the business will succeed.</p><p>The financial model keeps transaction-level results separate from the overall operating result. It also reports capacity, continuity, concentration, acquisition payback, and runway.</p><p>Four of five original scenarios did not meet all tested thresholds. The one that did showed about $431 monthly surplus, but it failed under every tested combination of worse assumptions. These are model results, not forecasts, observed demand, or proof that the marketplace will work.</p></section>
    ${routeConfig().economics.map((id) => renderEconomicCard(id)).join("")}
    ${renderOpenField("EC.open", "Assumptions that need evidence", "Which three assumptions most need real-world evidence before decisions about pricing, recruitment, or investment? If possible, say where the evidence could come from or give a reasonable range. Enter None if you have nothing to report.")}
    ${navigation()}`;
}

function renderEconomicCard(id) {
  const item = economics[id];
  return `<article class="item-card"><div class="item-header"><span class="item-id">${id}</span><p class="item-text">${escapeHtml(item.text)}</p></div>${ratingControl(id, item.property)}</article>`;
}

function renderOverall() {
  return `
    ${heading("Final participant section", "Overall review", "Think about all the sections you reviewed and identify the most important change.")}
    ${definitionPanel(["usefulness"])}
    <article class="item-card"><div class="item-header"><span class="item-id">Overall</span><p class="item-text">The framework supports transparent design and review decisions for a proposed consent-first marketplace.</p></div>${ratingControl("FW1", "usefulness")}</article>
    ${renderOpenField("F1", "Most important revision", "Which single revision would most improve the framework? Enter None if you recommend no revision.")}
    ${renderOpenField("F2", "Any remaining concern", "State any important objection that the earlier ratings did not let you express. Enter None if you have no remaining concern.")}
    ${navigation()}`;
}

function renderReview() {
  const expected = expectedRatingItems();
  const missing = expected.filter((item) => !state.ratings[item.id]);
  const lowWithoutRationale = expected.filter((item) => ["1", "2", "OE"].includes(state.ratings[item.id]) && !(state.rationales[item.id] ?? "").trim());
  const domainWithoutReason = routeConfig().domains.filter((id) => ["1", "2"].includes(state.ratings[`${id}.completeness`]) && !(state.openResponses[`${id}.open`] ?? "").trim());
  const requiredOpen = ["EL.open", "DR.open", ...(state.route === "E" ? ["EC.open"] : []), "F1", "F2"];
  const missingOpen = requiredOpen.filter((id) => !(state.openResponses[id] ?? "").trim());
  const openResponseLabels = {
    "EL.open": "Eligibility checklist comment",
    "DR.open": "Requirements comment",
    "EC.open": "Economic assumptions comment",
    F1: "Most important revision",
    F2: "Remaining concern",
  };
  const issues = [...missing.map((item) => `${item.id} is unanswered`), ...lowWithoutRationale.map((item) => `${item.id} needs a brief reason`), ...domainWithoutReason.map((id) => `${id} needs the missing requirement`), ...missingOpen.map((id) => `${openResponseLabels[id]} needs a response; enter None when there is nothing to report`)];
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

function renderOpenField(id, label, prompt) {
  return `<label class="field item-card"><span>${escapeHtml(label)}</span><small class="rating-help">${escapeHtml(prompt)}</small><textarea data-open-id="${id}">${escapeHtml(state.openResponses[id] ?? "")}</textarea></label>`;
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