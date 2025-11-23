// Truth Drift Map — System Edition
// Simple, hard-coded concept drift visualization (no text boxes)

// Drift level weights for summary
const DRIFT_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3
};

// Demo data: concepts, services, versions, and drift
const CONCEPTS = {
  user_status: {
    id: "user_status",
    label: "User Status",
    description:
      "Represents whether a user is active, suspended, or closed across different services.",
    canonical: {
      fieldName: "user_status",
      meaning:
        "Lifecycle state of a user account: ACTIVE, SUSPENDED, or CLOSED.",
      schema: {
        type: "string",
        allowedValues: ["ACTIVE", "SUSPENDED", "CLOSED"]
      }
    },
    services: {
      "Service A": [
        {
          version: "v1",
          time: "2024 Q1",
          drift: "low",
          meaning:
            "User lifecycle state used for authentication and UI display.",
          changes: ["Canonical field name user_status.", "Values: ACTIVE, SUSPENDED, CLOSED."],
          invariants: ["Only one status per user at a time.", "Status drives access control."],
          notes: "Closest to the original concept; acts as source of truth."
        },
        {
          version: "v2",
          time: "2024 Q3",
          drift: "medium",
          meaning:
            "Lifecycle state plus marketing opt-out encoded in the same field.",
          changes: [
            "New value: DORMANT for long-inactive users.",
            "Marketing opt-out represented as SUSPENDED in some flows."
          ],
          invariants: ["Still a single string field.", "Downstream services assume ACTIVE = contactable."],
          notes: "Marketing concerns started to leak into lifecycle semantics."
        }
      ],
      "Service B": [
        {
          version: "v1",
          time: "2024 Q2",
          drift: "medium",
          meaning:
            "Billing state of the account, loosely mapped from user_status.",
          changes: [
            "Field name: account_status.",
            "Values: ACTIVE, PAST_DUE, CANCELED."
          ],
          invariants: ["Used for invoicing and dunning logic."],
          notes:
            "Reuses the idea of status but repurposes it entirely for billing."
        },
        {
          version: "v2",
          time: "2025 Q1",
          drift: "high",
          meaning:
            "Composite risk & billing health indicator, overloaded into a single status field.",
          changes: [
            "Values now include FRAUD_REVIEW and CHARGEBACK.",
            "Some ACTIVE users can have non-ACTIVE account_status."
          ],
          invariants: ["Downstream analytics treat account_status as user truth."],
          notes:
            "Strong semantic drift: status is now financial risk, not lifecycle."
        }
      ],
      "Service C": [
        {
          version: "v1",
          time: "2024 Q4",
          drift: "medium",
          meaning:
            "Engagement segment derived from status and activity.",
          changes: [
            "Field name: user_segment.",
            "Values: ACTIVE, AT_RISK, CHURNED."
          ],
          invariants: ["Used to target win-back campaigns."],
          notes:
            "Shares names with user_status values but represents a behavioral model."
        }
      ]
    }
  },

  subscription_tier: {
    id: "subscription_tier",
    label: "Subscription Tier",
    description:
      "Represents a customer’s entitlement level across billing, features, and marketing experiences.",
    canonical: {
      fieldName: "subscription_tier",
      meaning:
        "Contractual tier of the customer: FREE, STANDARD, or PREMIUM.",
      schema: {
        type: "string",
        allowedValues: ["FREE", "STANDARD", "PREMIUM"]
      }
    },
    services: {
      "Billing Service": [
        {
          version: "v1",
          time: "2023 Q4",
          drift: "low",
          meaning:
            "Contract-level tier driving invoicing and entitlements.",
          changes: ["Field name: subscription_tier.", "Values match canonical set."],
          invariants: ["Tier must match product catalog.", "Single tier per billing account."],
          notes: "Acts as contractual source of truth."
        },
        {
          version: "v2",
          time: "2024 Q3",
          drift: "medium",
          meaning:
            "Introduced BUSINESS tier, mapped internally to PREMIUM pricing.",
          changes: [
            "New external value: BUSINESS.",
            "Internally treated as PREMIUM for some flows."
          ],
          invariants: ["Legacy systems still expect PREMIUM only."],
          notes:
            "Subtle drift: analytics that group by tier may double-count or misgroup BUSINESS."
        }
      ],
      "Feature Flag Service": [
        {
          version: "v1",
          time: "2024 Q1",
          drift: "medium",
          meaning:
            "Set of boolean feature flags inferred from subscription tier.",
          changes: [
            "Tier collapsed into three flag buckets: CORE, PRO, LABS.",
            "Mapping from subscription_tier is not stored, only implied."
          ],
          invariants: ["Flags, not tier, drive access checks."],
          notes:
            "Drift from explicit tier to derived flags; difficult to reconstruct original meaning."
        }
      ],
      "Marketing Service": [
        {
          version: "v1",
          time: "2024 Q2",
          drift: "high",
          meaning:
            "Customer value segment based on spend and engagement, named similarly to tiers.",
          changes: [
            "Field name: value_segment.",
            "Values: FREE, GROWTH, STRATEGIC.",
            "Not directly tied to contractual tier."
          ],
          invariants: ["Used for targeting and discount rules."],
          notes:
            "Semantic collision: names overlap with tier but represent a different axis."
        }
      ]
    }
  },

  login_event: {
    id: "login_event",
    label: "Login Event",
    description:
      "Represents user login behaviour across auth, security, and analytics pipelines.",
    canonical: {
      fieldName: "user.login",
      meaning: "User successfully authenticated via any channel.",
      schema: {
        type: "event",
        requiredFields: ["user_id", "timestamp", "auth_method"]
      }
    },
    services: {
      "Auth Service": [
        {
          version: "v1",
          time: "2023 Q3",
          drift: "low",
          meaning:
            "Single canonical login event emitted after successful authentication.",
          changes: ["Event name: user.login.", "Includes auth_method and device_id."],
          invariants: ["One event per successful login.", "Failed logins use user.login.failed."],
          notes: "Baseline definition of login."
        }
      ],
      "Security Service": [
        {
          version: "v1",
          time: "2024 Q1",
          drift: "medium",
          meaning:
            "Security-focused login events including suspicious or anomalous activity.",
          changes: [
            "Event name: security.login.",
            "Includes risk_score and geo_anomaly flag."
          ],
          invariants: ["Some anomalous logins are recorded even if auth fails."],
          notes:
            "Adds a risk lens; not all events correspond to successful sessions."
        }
      ],
      "Analytics Service": [
        {
          version: "v1",
          time: "2024 Q2",
          drift: "high",
          meaning:
            "Any session start, including auto-login, token refresh, or page-view-based session detection.",
          changes: [
            "Event name: session.start.",
            "user_id sometimes missing for anonymous sessions.",
            "Multiple session.start events per underlying login."
          ],
          invariants: ["Used for DAU/MAU metrics."],
          notes:
            "High semantic drift: counts and meaning differ significantly from the canonical login event."
        }
      ]
    }
  }
};

// Grab DOM references
const conceptSelect = document.getElementById("concept-select");
const conceptDescription = document.getElementById("concept-description");
const summaryEl = document.getElementById("summary");
const mapContainer = document.getElementById("map-container");
const detailsCard = document.getElementById("details-card");

// Populate the concept dropdown
function initConceptSelect() {
  const entries = Object.values(CONCEPTS);
  conceptSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a concept…";
  conceptSelect.appendChild(placeholder);

  entries.forEach((concept) => {
    const opt = document.createElement("option");
    opt.value = concept.id;
    opt.textContent = concept.label;
    conceptSelect.appendChild(opt);
  });
}

// Compute overall drift level for a concept
function computeOverallDriftLevel(concept) {
  let maxWeight = 0;

  Object.values(concept.services).forEach((versions) => {
    versions.forEach((v) => {
      const w = DRIFT_WEIGHT[v.drift] || 0;
      if (w > maxWeight) maxWeight = w;
    });
  });

  if (maxWeight <= 1) return "low";
  if (maxWeight === 2) return "medium";
  return "high";
}

// Render summary badge
function renderSummary(concept) {
  summaryEl.innerHTML = "";

  if (!concept) {
    const idle = document.createElement("div");
    idle.className = "summary-badge summary-badge-idle";
    idle.textContent = "No concept selected yet.";
    summaryEl.appendChild(idle);
    return;
  }

  const level = computeOverallDriftLevel(concept);
  const badge = document.createElement("div");
  badge.classList.add("summary-badge");

  if (level === "low") badge.classList.add("summary-badge-low");
  else if (level === "medium") badge.classList.add("summary-badge-medium");
  else badge.classList.add("summary-badge-high");

  const label =
    level === "low" ? "Low drift" : level === "medium" ? "Medium drift" : "High drift";

  badge.innerHTML = `
    Overall drift for <strong>${concept.label}</strong>: 
    <span class="count">${label}</span>
  `;

  summaryEl.appendChild(badge);
}

// Render the map lanes and nodes
function renderMap(concept) {
  mapContainer.innerHTML = "";

  if (!concept) {
    const p = document.createElement("p");
    p.className = "map-empty";
    p.textContent = "Select a concept on the left to render the drift map.";
    mapContainer.appendChild(p);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "map-grid";

  // header row (Service / Versions)
  const headerRow = document.createElement("div");
  headerRow.className = "map-header-row";
  headerRow.innerHTML = `
    <span>Service</span>
    <span>Versions over time</span>
  `;
  grid.appendChild(headerRow);

  Object.entries(concept.services).forEach(([serviceName, versions]) => {
    const lane = document.createElement("div");
    lane.className = "map-lane";

    const label = document.createElement("div");
    label.className = "map-lane-label";
    label.textContent = serviceName;

    const cells = document.createElement("div");
    cells.className = "map-lane-cells";

    versions.forEach((version, index) => {
      const node = document.createElement("button");
      node.type = "button";
      node.classList.add("drift-node");

      if (version.drift === "low") node.classList.add("drift-node-low");
      else if (version.drift === "medium") node.classList.add("drift-node-medium");
      else node.classList.add("drift-node-high");

      node.innerHTML = `
        <span class="drift-node-label-main">${version.version}</span>
        <span class="drift-node-label-sub">${version.time}</span>
      `;

      // Attach metadata for the details view
      node.dataset.service = serviceName;
      node.dataset.index = index.toString();
      node.dataset.conceptId = concept.id;

      node.addEventListener("click", () => {
        renderDetails(concept, serviceName, version);
      });

      cells.appendChild(node);
    });

    lane.appendChild(label);
    lane.appendChild(cells);
    grid.appendChild(lane);
  });

  mapContainer.appendChild(grid);
}

// Render details card for a specific node
function renderDetails(concept, serviceName, version) {
  detailsCard.innerHTML = "";

  const heading = document.createElement("h3");
  heading.textContent = "Drift Details";
  detailsCard.appendChild(heading);

  const meta = document.createElement("p");
  meta.className = "details-meta";
  meta.textContent = `${concept.label} · ${serviceName} · ${version.version} (${version.time})`;
  detailsCard.appendChild(meta);

  const level = version.drift;
  const levelLabel =
    level === "low" ? "Low drift" : level === "medium" ? "Medium drift" : "High drift";

  const levelP = document.createElement("p");
  levelP.className = "details-meta";
  levelP.textContent = `Local drift level: ${levelLabel}`;
  detailsCard.appendChild(levelP);

  const meaningSection = document.createElement("div");
  meaningSection.className = "details-section";
  meaningSection.innerHTML = `
    <h4>Local Meaning</h4>
    <p>${version.meaning}</p>
  `;
  detailsCard.appendChild(meaningSection);

  if (version.changes && version.changes.length) {
    const changesSection = document.createElement("div");
    changesSection.className = "details-section";
    const ul = document.createElement("ul");
    version.changes.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    changesSection.innerHTML = `<h4>Schema / Field Changes</h4>`;
    changesSection.appendChild(ul);
    detailsCard.appendChild(changesSection);
  }

  if (version.invariants && version.invariants.length) {
    const invSection = document.createElement("div");
    invSection.className = "details-section";
    const ul = document.createElement("ul");
    version.invariants.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    invSection.innerHTML = `<h4>Local Invariants</h4>`;
    invSection.appendChild(ul);
    detailsCard.appendChild(invSection);
  }

  if (version.notes) {
    const notesSection = document.createElement("div");
    notesSection.className = "details-section";
    notesSection.innerHTML = `
      <h4>Notes</h4>
      <p>${version.notes}</p>
    `;
    detailsCard.appendChild(notesSection);
  }
}

// Handle concept selection changes
function handleConceptChange() {
  const id = conceptSelect.value;
  const concept = CONCEPTS[id];

  if (!concept) {
    conceptDescription.textContent =
      "Select a concept to see how its meaning and schema evolve across services.";
    renderSummary(null);
    renderMap(null);
    detailsCard.innerHTML = `
      <h3>Drift Details</h3>
      <p class="details-empty">
        Click any node in the map to see how that service version interprets the concept.
      </p>
    `;
    return;
  }

  conceptDescription.textContent = concept.description;
  renderSummary(concept);
  renderMap(concept);

  // Reset details prompt
  detailsCard.innerHTML = `
    <h3>Drift Details</h3>
    <p class="details-empty">
      Click any node in the map to see how ${concept.label} is interpreted in that service/version.
    </p>
  `;
}

// Initialize on page load
initConceptSelect();
conceptSelect.addEventListener("change", handleConceptChange);

// Optionally pre-select the first concept for instant demo
(function preloadFirstConcept() {
  const first = Object.values(CONCEPTS)[0];
  if (!first) return;
  conceptSelect.value = first.id;
  handleConceptChange();
})();
