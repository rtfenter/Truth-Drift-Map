# Truth Drift Map — System Edition  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Truth-Drift-Map/)

### A small interactive map that visualizes meaning and schema drift across distributed systems over time.

This project is part of my **Systems of Trust Series**, exploring how distributed systems maintain coherence, truth, and alignment across services, schemas, and teams.

The goal of this map is to make *truth drift* legible — not just event validity, but **meaning**: how shared concepts change, fork, or degrade as they pass through pipelines, teams, and services.

---

## Purpose

Distributed systems don’t usually break because a single service fails.  
They fracture because **shared meaning** drifts.

Over time, small changes accumulate:

- fields renamed or repurposed  
- enums forked between services  
- optional fields that are “required in practice”  
- different teams interpreting the same event differently  

These shifts create:

- conflicting views of “what happened”  
- silent schema mismatches  
- harder incident analysis and debugging  
- inconsistent analytics and decisions  

This map visualizes how those drifts emerge across services and time.

---

## Features (MVP)

The first version will include:

- **Semantic Drift Timeline** – see how a field’s meaning changes across versions and services  
- **Schema Divergence Map** – track added, removed, or repurposed fields over time  
- **Service Alignment Graph** – highlight which services still agree on a concept and which have drifted  
- **Invariant Mismatch Flags** – surface different rules applied to the same field or event  
- **Downstream Impact Summary** – rough Low / Medium / High impact for analytics, ML, and incident analysis  
- **Lightweight client-side experience** – static HTML + JS, no backend required  

This tool is intentionally minimal and aimed at conceptual clarity, not a full metadata catalog or governance platform.

---

## Demo Screenshot

_Coming soon — once the first interactive prototype is live, this section will include a screenshot of the Truth Drift Map UI._

---

## Truth Drift Flow Diagram

    [Source of Truth]
    (canonical event + meaning)
              |
      (rename, repurpose,
       add/remove fields)
              |
              v
    [Service A Interpretation]
              |
      (local invariants,
       partial upgrades)
              |
              v
    [Service B Interpretation]
              |
      (schema forks, enum drift)
              |
              v
    [Service C Interpretation]
              |
              v
    Downstream Consumers
    (analytics, ML, dashboards,
     incident review, audits)

---

## Why Truth Drift Matters

Even if services are “up” and requests succeed, drift in meaning can quietly erode trust:

- teams disagree on what a field actually represents  
- dashboards and ML models are trained on incompatible definitions  
- different services enforce different invariants on the same concept  
- incident analysis becomes a negotiation of interpretations, not facts  
- governance docs lag behind reality  

This tool focuses on the **semantic layer** of trust: not just “is the event valid,” but **“do we still agree on what it means?”**

---

## How This Maps to Real Systems

Each element of the map corresponds to a real architectural concern:

### Semantic Drift (Meaning Divergence)  
The same field (or event name) comes to represent slightly different concepts between services.  
Example: `status` meaning “lifecycle state” in one service and “billing state” in another.

### Schema Drift Over Time  
Schemas change version-by-version, but not all services upgrade together. This leads to:

- old services emitting legacy fields  
- new services reading or writing fields differently  
- “optional” fields that become required in downstream assumptions  

### Service-to-Service Mismatches  
Two services can share a field name but diverge on:

- type (`"123"` vs `123`)  
- enum values (`"ACTIVE"` vs `"active"`)  
- cardinality (single value vs list)  

These mismatches show up as fragmented logs, broken joins, and inconsistent analytics.

### Downstream Breakage  
When meaning diverges, systems built on top of that data — attribution, billing, ML, customer journeys, audits — all quietly inherit the drift.

The Truth Drift Map makes these conceptual differences visible instead of implicit.

---

## Part of the Systems of Trust Series

Main repo:  
https://github.com/rtfenter/Systems-of-Trust-Series

---

## Status

MVP planned.  
The first version of this map will focus on core mechanics needed to demonstrate truth drift at the schema/meaning layer, not a full production metadata catalog.

---

## Local Use

Everything will run client-side.

To run locally (once the prototype is implemented):

1. Clone the repo  
2. Open `index.html` in your browser  

That’s it — static HTML + JS, no backend required.
