# Forms Mock Experience Guide

## Purpose

The Forms experience is a front-end CRM prototype for turning a form response into an accountable relationship event. It is designed to answer a narrow operational question at every step:

> What is the next safe and useful action for this person?

The mock lives in [form-experience/src/App.tsx](../form-experience/src/App.tsx). It uses React state and browser `localStorage` to simulate a Forms module within the Solace CRM. There is no API, authentication service, server-side workflow engine, or external integration in this prototype.

The experience is intentionally relationship-first. A form is not treated as an isolated response row; it carries identity evidence, consent, attribution, ownership, routing, and a visible next action.

## Product Principles

The mock is organized around these principles:

- **Relationship before response:** people and their CRM context matter more than collecting fields.
- **One clear action per moment:** the Overview highlights one priority, the submission record shows one contextual action, and the builder progresses one stage at a time.
- **Progressive disclosure:** advanced options such as routing, channels, version management, and processing evidence are available without crowding the primary workflow.
- **Explainable automation:** matching, routing, CRM mutation, delivery, and retry decisions are shown as visible evidence rather than hidden system behavior.
- **Trust by default:** consent, immutable versioning, idempotency, governed fields, and connection health are part of the experience.

## Application Structure

The Forms app has a single global CRM rail. The active Forms module expands an internal navigation list:

| Area | Purpose | Primary action |
| --- | --- | --- |
| Overview | Prioritize the next human decision | Review the highlighted submission |
| Forms | Browse and manage form definitions | Create a form |
| Builder | Configure a form through progressive stages | Publish a version |
| Submissions | Review an individual relationship event | Complete the contextual recovery or handoff |
| Automations | Inspect routing and follow-through policy | Configure an automation path |
| Analytics | Find high-confidence friction or quality signals | Improve the affected form |
| Library | Reuse governed assets | Use a template |
| Settings | Review consent, handling, and connections | Inspect policy |

At narrow widths, the global rail collapses to icons. The Forms item opens the nested Forms navigation as a mobile drawer. This preserves the single-rail CRM model rather than introducing a separate Forms sidebar.

## State and Persistence

The mock starts with four sample forms and four sample submissions. The application persists only the following values to the browser:

| Local storage key | Contents |
| --- | --- |
| `solace-forms` | Form records and lifecycle status |
| `solace-form-submissions` | Submission records and their simulated processing state |

The initial records are used only when the relevant local-storage key is absent. This means interactions such as publishing, lifecycle transitions, assigning an owner, resolving an identity match, and replaying a delivery survive a browser refresh in the same profile.

To reset the mock to its sample data, remove the two keys through the browser's storage tools.

## Overview

The Overview is deliberately compact. It contains:

- A **Work next** strip that prioritizes Priya Shah's high-fit demo request.
- Three health measures: actionable responses, live forms, and qualified conversion.
- One focused watch item: mobile abandonment at the Company size field.
- One completed relationship handoff, showing Dani Okafor progressing from submission to meeting.

### How to use it

1. Select **Review submission** to open the submission inbox.
2. Select **Create form** to begin the builder.
3. Select **See evidence** to open Analytics and inspect the friction signal.

The Overview does not attempt to display every report, form, or automation. Those are reachable through the Forms subnavigation.

## Forms Library and Lifecycle

The Forms view contains the working inventory of form records. Each row shows the form name, purpose, performance, owner, status, and latest update time. Selecting a row opens the builder with that form's name and purpose prefilled.

### Creating a form

The **Create form** action opens a modal with three starter intents:

- Request a demo
- Support request
- Event registration

The mock currently creates a generic draft record regardless of the selected tile. The selected tile communicates the intended relationship outcome and then opens the builder.

### Lifecycle controls

The Version Control panel is an interactive form-management surface. It demonstrates these lifecycle states:

- Draft
- Review
- Scheduled
- Live
- Paused
- Retired
- Archived

A live form can be paused or retired. A paused form can resume collection or be retired. Other states can move to Review, Scheduled, or Live. A lifecycle transition updates the corresponding in-memory and persisted form record, sets its updated timestamp to `Just now`, and shows a confirmation toast.

### Version comparison

The lifecycle panel presents a mock comparison between version `v7.0` and `v6.4`. It illustrates that:

- customer-visible behavior can change in a new version;
- prior responses remain associated with their historical version; and
- routing and consent changes should be called out explicitly.

The panel is a UI demonstration of immutable-version principles. It does not create a full version history data model or checksum.

## Builder

The builder is a five-step, stateful workflow. The top stepper can be used to move forward, back, or directly to a stage.

| Stage | Main configuration in the mock |
| --- | --- |
| Purpose | Form name, relationship outcome, destination, and initial channel |
| Ask | Core CRM fields and progressive-question toggles |
| After submit | CRM update safety, owner handoff, meeting offer, and routing policy |
| Trust | Purpose-specific consent and raw-payload retention option |
| Review | Readiness checks and version-publish confirmation |

The respondent preview has three personas:

- **New visitor** shows the normal request flow.
- **Known contact** demonstrates progressive profiling by hiding a known Team size field and showing the recognized identity path.
- **Mobile** switches the preview framing to a narrow respondent experience.

### Purpose stage

The Purpose stage collects the form's relationship outcome and target CRM destination. It has primary choices for Embedded web form and Standalone page.

The separate **Collection Design** panel broadens the channel model. It can change the shared `channel` state to:

- Embedded web form
- Standalone page
- Popup / slide-in
- Conversational
- Kiosk / shared device
- Internal intake
- External handler / API

The panel also demonstrates governed block types:

- Conditional question
- Scheduler
- File upload
- Payment handoff
- Calculation
- Hidden context

Selecting a block changes the inspector description. This is a controlled capability catalogue, not a drag-and-drop layout editor.

### Ask stage

The Ask stage starts with governed Work email and Company fields. The user can toggle:

- Team size
- Buying timeline
- Progressive profiling

The respondent preview updates immediately for Team size, Buying timeline, and consent. The `Add approved CRM field` control is illustrative in the current mock and does not append a new field record.

### After submit stage

This stage demonstrates safe post-submit behavior:

- Contact and Company updates are described as a verified-email match with fill-only-safe behavior.
- Routing can be set to Territory + capacity, Existing relationship owner, or Sales review queue.
- A meeting offer can be enabled or disabled.
- The workflow summary describes acknowledgement, task creation, campaign association, and nurture entry.

The routing selection is shared with the Automations view, so the displayed routing explanation changes when this control changes.

### Trust stage

Trust includes a purpose-specific consent toggle and a raw-payload retention selector. The UI communicates that public-form safeguards include rate limiting, bot protection, accessible errors, and prefill reset.

These are product behaviors represented in the mock; no real rate limiting, bot detection, encryption, consent API, or retention job is implemented.

### Review and publish

The Review stage renders a short readiness list covering identity, field fallbacks, owner handoff, consent, and mobile/accessibility preview. Choosing **Publish version 7** or the header **Publish** action updates the Request a demo record to `Live`, returns to the Forms view, and shows a toast.

The mock does not create a new persisted immutable version object on every publish. It demonstrates the publish consequence and versioned language in the user interface.

## Submissions

The Submissions view is a focused inbox, not a generic spreadsheet. It supports:

- Search by person, company, or form.
- Filters for All, Match review, Ready for owner, Needs attention, Automating, and Completed.
- A selected submission record with identity, source, consent, fit score, stated intent, and next action.

The inbox contains four sample scenarios:

| Person | Scenario | Contextual action |
| --- | --- | --- |
| Priya Shah | High-fit demo request without an owner | Assign to Maya |
| Jordan Lee | Ambiguous CRM identity | Confirm identity |
| Sofia Bennett | Ticket delivery failed after safe retries | Replay delivery |
| Dani Okafor | Completed demo-to-meeting handoff | Open contact |

### Interactive recovery flows

The following interactions change persisted submission state:

- **Assign to Maya:** assigns Priya to Maya Das and changes the state to Automating.
- **Confirm identity:** moves Jordan from Match review to Ready for owner and retains Avery Ross as the owner.
- **Replay delivery:** moves Sofia from Needs attention to Completed, replaces the automation trace with a successful ticket and acknowledgement result, and clears the exception.

The replay action is intentionally framed as safe because it preserves the original event identity and idempotency key. It does not call a real webhook or ticketing system.

### Processing evidence

Below the inbox, the Processing Evidence panel turns the selected submission into an inspectable event. It shows the stages:

1. Received
2. Identity
3. CRM updates
4. Routing
5. Automation

Each stage uses the selected submission's state, confidence, owner, routing rationale, and automation trace. The panel also shows:

- consent evidence;
- version and source context;
- an idempotency key; and
- an **Inspect receipt** action.

Inspect receipt expands a JSON-like view of the mock event metadata. It intentionally shows metadata only, not raw sensitive response values.

## Automations and Routing

The Automations view represents the Request a demo workflow in a visible sequence:

1. Validate and resolve identity.
2. Assign an accountable owner.
3. Send a transactional acknowledgement.
4. Offer a relevant meeting.

The routing policy selector reflects the same `routePolicy` state used in the builder. The route path provides an understandable example: North America to Enterprise team to Maya Das.

This screen is a policy visualization. It does not persist a reusable workflow definition or execute email, task, scheduling, or integration calls.

## Analytics and Experimentation

Analytics focuses on one decision rather than a dense dashboard. It presents:

- Start-to-submit rate.
- Qualified response rate.
- Owner coverage.
- A recent conversion trend.
- A field-friction recommendation for Company size on mobile.

Selecting **Improve Request a demo** or **Apply recommendation** opens the builder.

The Controlled Experiment panel provides an interactive launch/pause control. It models a 50/50 experiment where Company size becomes progressive for recognized contacts. The panel calls out explicit guardrails:

- consent completion;
- data validity; and
- owner coverage.

The toggle changes only local component state; it does not alter traffic allocation, production forms, or analytics data.

## Library

The Library is a governed asset catalogue. It presents examples of:

- a Request a demo starter template;
- an approved Company size field;
- consent copy version `v3.2`; and
- a Website form handler connection.

The template action opens the new-form modal. The inspection actions are informational in the current mock.

## Settings and Governance

Settings communicates policy ownership across three areas:

- Consent
- Data handling
- Connections

The Governance Ledger adds an audit-and-access layer. It shows example events for version publication, a match-review assignment, and a replay policy. It also states a publisher policy:

- Authors prepare forms from approved assets.
- Publishers activate low-risk versions.
- Privacy and integration administrators own protected policy changes.

This is an explanatory and visual model of governance. Roles are not authenticated or enforced in code.

## Responsive Behavior

The Forms experience is designed to remain usable at reduced widths:

- At medium widths, the global rail contracts to an icon rail and dense layouts stack.
- At mobile widths, the Forms subnavigation becomes an off-canvas drawer controlled through the Forms rail item.
- Builder preview content moves below the builder configuration.
- Submission list and record stack vertically.
- Form tables preserve their column structure with horizontal scrolling when necessary.
- Modals use a viewport-constrained, scrollable layout.

The UI includes keyboard-focus styling on interactive controls. The mock does not include automated accessibility tests or real locale switching.

## Files of Interest

| File | Responsibility |
| --- | --- |
| [form-experience/src/App.tsx](../form-experience/src/App.tsx) | All React state, views, mock interactions, and local persistence |
| [form-experience/src/App.css](../form-experience/src/App.css) | Visual system, layouts, responsive behavior, and UI states |
| [form-experience/src/index.css](../form-experience/src/index.css) | Global fonts, body baseline, and focus styles |
| [docs/New_Form_Functionality_And_Flow.md](New_Form_Functionality_And_Flow.md) | Broader product and functional specification that informed the mock |

## Running the Mock

From the Forms project directory:

```sh
npm run dev
```

Run static checks and the production bundle with:

```sh
npm run lint
npm run build
```

The repository-level build assembles the Forms static output under `dist/forms/` for deployment alongside Calls and Payments.

## Mock Boundaries and Future Work

The prototype is intentionally stateful enough to demonstrate operational UX, but it is not a production Forms platform. Production implementation would require at least:

- authenticated roles and authorization;
- durable backend storage with immutable version and event records;
- controlled CRM field schema and mapping policies;
- server-side validation, anti-abuse controls, and signed external-handler verification;
- real consent capture and data-retention workflows;
- workflow execution, retries, dead-letter handling, and observability;
- actual experiment allocation, metric collection, and guardrail enforcement; and
- automated accessibility, responsive, and end-to-end coverage.

The mock is most valuable as a decision-making artifact: it makes the intended interaction, information hierarchy, and safety posture concrete before backend contracts and production services are introduced.
