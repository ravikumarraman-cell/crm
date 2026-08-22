# Payments CRM Mock Experience Guide

## Purpose

`payment-experience` is an interactive React/Vite prototype for a Payments module inside the Solace CRM. It demonstrates how fundraising and commercial collection work can feel calm, relationship-aware, and operationally trustworthy.

The prototype is designed for product discussion, workflow reviews, sales demonstrations, and usability feedback. It uses realistic local data and stateful interactions. It is **not** a production payment service: it does not call a gateway, collect real credentials, send email, create accounting entries, or enforce permissions on a server.

The canonical product scope is in [New_Payment_Functionality.md](New_Payment_Functionality.md). This guide explains what the mock itself demonstrates today.

## Product Principles

The mock applies five operating principles throughout the experience:

1. **Money states are explicit.** A payment that is pending settlement is not presented as paid. Refunds and disputes are independent, auditable actions.
2. **Relationships come first.** Payments connect to Contacts, Companies, campaigns, receipts, and commitments rather than creating an isolated financial database.
3. **One clear next action.** Screens reveal the current signal first, then the next useful work; history is available after that.
4. **Donor control is respected.** Recurring changes, pauses, and cancellation are visible, direct, and never framed as a retention trap.
5. **Sensitive operations create evidence.** Refund, dispute, acknowledgement, and reconciliation flows explain what will happen and add a mock audit event.

## Technology And Runtime

| Area | Implementation |
| --- | --- |
| Application | React 19 + TypeScript |
| Build and local development | Vite |
| Icons | Lucide React |
| State | React component state with a small `localStorage` activity ledger |
| Navigation | Stateful single-page CRM module navigation; no router or backend |
| Payment provider | Simulated only; no provider SDK or API call is made |
| Sensitive payment data | Never collected, stored, or transmitted by this mock |

Run the mock from `payment-experience` with:

```sh
npm run dev -- --host 127.0.0.1 --port 4175
```

For a production-style build check:

```sh
npm run lint && npm run build
```

## CRM Navigation Model

Payments is intentionally one global CRM destination rather than a separate application. The left rail includes representative global destinations:

- Home
- Contacts
- Pipeline
- Payments
- Tasks
- Administration

Payments is expanded as the active module and exposes seven local destinations:

| Destination | Demonstrated question | Primary capability |
| --- | --- | --- |
| Overview | Is collection healthy today? | Confidence indicators, recovery attention, recent activity |
| Collect | How should we ask for payment? | Donation page, invoice, payment link, and manual-payment entry points |
| Transactions | What happened to this payment? | Evidence, relationship, lifecycle events, refund and dispute actions |
| Recurring | Which commitments need care? | Active commitments, pause, cancellation, and management flows |
| Donors & customers | What is the financial relationship? | Lifetime support, preferences, acknowledgement, self-service |
| Reconciliation | Does the payout agree with source payments? | Match confirmation, export preparation, exception ownership |
| Settings | What governs payment operations? | Providers, receipts, retries, exports, permissions, and consent |

On a mobile viewport, the CRM rail becomes icon-first and Payments opens its nested navigation in a compact fly-out. The local module is still reachable without forcing a dense desktop layout into a narrow screen.

## Overview: Money Confidence

The landing screen is an operational summary, not a generic dashboard.

### Visible mock data

- Cash-confidence statement: `98.4% of expected revenue is on track.`
- Month-to-date collection, recurring revenue, and reconciliation-ready totals.
- A single donor-safe recovery item for Priya Shah.
- A compact visual of current collection flow.
- Recent payments for Maya Thompson, William Chen, and Amina Rahman.

### Interactive behavior

- **Collect payment** switches to the Collection Studio.
- **Try the donor checkout** opens the donor-facing payment experience.
- **Send secure update** opens the same checkout preview to demonstrate a donor-safe recovery touchpoint.
- Completing a card or bank-debit mock checkout prepends a `You` record to Recent payments.

The activity item persists in browser `localStorage` under `solace-payment-mock-activity`, so the latest mock payment remains visible after refresh. This is intentionally limited to recent-activity demonstration data; it is not a complete local database.

## Collect: Collection Studio

Collection Studio frames four collection modes in plain language.

| Entry point | Intended audience | Mock output |
| --- | --- | --- |
| Create a donation page | Public campaign supporters | CRM-linked reusable giving page draft |
| Send an invoice | Known customer or donor | Recipient-specific invoice draft |
| Share a payment link | Multiple channels or events | Reusable, attributed secure link |
| Record payment | Cash, check, wire, or external settlement | Manual payment record with audit context |

Each choice opens a focused composer with:

- a relationship selector prepopulated with a relevant Contact, Company, campaign, or public fund;
- editable amount;
- a purpose, reminder, or payment-source choice appropriate to the collection mode;
- a plain-language audit statement; and
- a completion action that closes the composer and shows a CRM-timeline toast.

The page also includes a Springwater restoration giving-page preview with campaign, receipt, and attribution indicators.

### Mock semantics

Creating a composer item produces a UI confirmation only. It does not currently add an invoice, link, or offline payment to a persistent operational list. The interaction demonstrates the required entry sequence and audit intent rather than pretending to issue a real public URL or invoice.

## Donor Checkout

The checkout is the most complete end-to-end flow in the mock. It is presented as the Northwind Foundation’s Springwater restoration giving experience.

### Gift configuration

Supporters can change:

- cadence: One time, Monthly, Quarterly, or Annually;
- amount: suggested `30`, `45`, `100`, or `250` amounts, or a custom amount;
- designation: Springwater restoration, Community garden fund, or Where needed most;
- processing-fee coverage for cards;
- public anonymity;
- payment method: card or bank debit.

For recurring selections, the checkout shows clear commitment language and an estimated annual impact. The current mock calculates that value as:

$$
\text{estimated annual impact} = \text{selected amount} \times 12
$$

The consent message states that the gift renews on its selected cadence until the supporter changes or cancels it.

### Card path

The card path represents a previously stored tokenized card ending in `4242`.

1. The supporter leaves **Card** selected.
2. They may opt in to cover the calculated $2.9\% + $0.30 fee.
3. The primary action shows the total, for example `Give $46.60` for a $45 gift with fee coverage.
4. Completion presents **Gift confirmed**.
5. The confirmation references mock receipt `RC-2026-1051` and states that it is linked to the CRM timeline.
6. A `You` activity item appears with `Paid` status and the masked card context.

This models an immediately confirmed card charge. It does not charge a card, vault a credential, or issue a legal/tax receipt.

### Bank-debit path

The bank-debit path represents an ACH/direct-debit account ending in `1088`.

1. The supporter chooses **Bank debit**.
2. The method panel states an expected 3-5 business-day settlement period.
3. Fee coverage is omitted because this mock only calculates the card-fee scenario.
4. The primary action reads `Start bank debit for $...`.
5. Completion presents **Bank debit processing**, not payment success.
6. The confirmation says a receipt will be emailed only after settlement.
7. A `You` activity item appears with `Pending` status and bank-debit context.

This distinction is intentional. The mock never uses paid/received language for a payment still awaiting settlement.

### Checkout confirmation boundaries

The confirmation screen communicates the financial state and the expected next step. It does not provide a real receipt download, recipient email delivery, provider-hosted payment-field integration, wallet selection, mandate capture, or a real secure-management URL.

## Transaction Ledger

Transactions provides a compact canonical payment view with three mock records:

| Record | Relationship | State |
| --- | --- | --- |
| `PM-1048` | Maya Thompson / Springwater restoration | Paid and settled |
| `PM-1047` | William Chen / Monthly stewardship | Paid |
| `PM-1046` | Amina Rahman / Community garden fund | Pending |

Selecting a record changes the focused-record label. The detail region demonstrates the expected evidence bundle:

- CRM association with Contact, campaign, and receipt;
- method, fee, and net settlement context;
- immutable activity for processor success, receipt issuance, and gift allocation.

### Refund workflow

**Request refund** opens a guided sheet rather than immediately changing a status. It makes the financial implications visible:

- refundable balance;
- original masked card;
- donor confirmation timing;
- reason/policy selector; and
- audit-timeline checkbox.

Submitting creates a mock audit-event toast. The source payment stays conceptually intact; the prototype communicates that a refund is a separate operational record.

### Dispute workflow

**Open dispute case** shows the amount at risk, evidence deadline, and pre-attached payment evidence. The action assigns an evidence owner through the mock workflow and creates a mock audit event.

## Recurring Gifts

Recurring demonstrates three commitment states:

- William Chen: active $45 monthly, next charge Apr 18.
- Maya Thompson: active $100 monthly, next charge Apr 21.
- Priya Shah: $30 quarterly, needing payment attention.

The focused record includes relationship history, current cadence, next charge, and immutable lifecycle events.

### Pause flow

**Pause this gift** explains that no future charge runs during the pause, identifies the next scheduled charge, and keeps the management link available. The action is modeled as a pause through Jun 18.

### Respectful cancellation flow

**Cancel respectfully** makes cancellation immediate and clear:

- effective date is immediate;
- no future charges run;
- receipt history remains accessible; and
- a rejoin path remains available.

The explanatory text says that pause, lower amount, and cadence changes are optional alternatives, not barriers. The cancellation button is not visually or procedurally hidden.

## Donors And Customers

This view presents financial context as part of a CRM relationship.

| Supporter | Mock context |
| --- | --- |
| Maya Thompson | $1,850 lifetime giving, 7 gifts |
| William Chen | $540 lifetime giving, 12 gifts |
| Amina Rahman | $80 lifetime giving, new supporter |

The focused record combines lifetime support, preferred fund, active commitments, delivery preferences, and relationship events.

### Self-service workflow

**Open self-service** demonstrates issuing a signed, seven-day management link. It explains that payment-method updates use provider-hosted fields and that receipt history stays available. The prototype does not generate or resolve a real signed URL.

### Acknowledgement workflow

**Send acknowledgement** demonstrates a non-financial thank-you. It includes recipient, channel, and consent context and explicitly states that the acknowledgement does not modify the financial record.

## Reconciliation

The reconciliation view models a payout-first operational queue:

| Item | State |
| --- | --- |
| Mar 13 payout | $4,280.65, 18 matched payments |
| Mar 12 payout | $3,690.00, reconciled |
| ACH transfer | $80.00, awaiting settlement |

The focused payout identifies gross amount, fees, net amount, matching count, export readiness, and owner.

### Match confirmation

**Confirm match** shows 18 linked payments, $0.00 variance, and the QuickBooks clearing-account destination. Confirming performs the mock `Confirm and export` action and adds an audit toast.

### Exception review

**Mark for review** creates a human-owned exception task in the mock. It preserves the payout and linked records rather than changing a financial status merely to clear an operational queue.

## Settings

Settings is deliberately concise. Each row opens a focused-editor toast in the mock.

| Setting | Demonstrated policy |
| --- | --- |
| Providers and methods | Stripe test workspace; cards, ACH, Apple Pay, and manual records enabled |
| Receipts and acknowledgements | Branded immutable template and current tax language |
| Respectful retry schedule | Three attempts over ten days with terminal conditions |
| Accounting export | QuickBooks mapping and a payout awaiting review |
| Team permissions | Separate approval, issue, dispute, and export responsibilities |
| Automation and consent | Versioned events and recorded outcomes |

The rows are intentionally not full configuration forms. They demonstrate which controls belong in Payments and how a low-overload control center is organized.

## Guided Financial Workflow Sheets

Refunds, disputes, pause, cancellation, self-service, acknowledgements, payout matching, and reconciliation exceptions all use one interaction pattern:

1. A title identifies the action in plain language.
2. A short explanation describes the record or donor impact.
3. A short checklist presents the relevant evidence or outcome.
4. A reason/policy field provides an operational decision context.
5. An audit-timeline checkbox defaults to recording the action.
6. The primary action closes the sheet and presents a mock audit-event toast.

This pattern is a key part of the mock: sensitive actions should be deliberate and legible without becoming multi-screen administrative processes.

## Mock Data

The application uses representative, fictional entities and values. Important examples include:

- **Maya Thompson**: Springwater donor, $1,850 lifetime giving, receipt `RC-2026-1048`.
- **William Chen**: active monthly supporter, $45 recurring commitment.
- **Amina Rahman**: new supporter with a pending payment.
- **Priya Shah**: recurring supporter with a payment that did not clear.
- **Northwind Foundation**: the donor-checkout organization.
- **Nora Reed**: reconciliation owner.
- **PO-0313**: payout reference prepared for accounting review.

Amounts, receipt references, account suffixes, settlement timing, and provider details are mock values. They are not connected to a processor, donor, or accounting system.

## State And Persistence

Most UI state lives in the running React process:

- active module page;
- selected operational record;
- active composer or workflow sheet;
- checkout amount, cadence, fee coverage, anonymity, and method;
- completion modal state; and
- transient toast messages.

The exception is **Recent payments activity**. Completing the donor checkout writes the newest mock `You` transaction to `localStorage`. On startup the app reads that value, allowing a demo to prove that card and ACH outcomes are preserved after browser refresh.

The ledger retains up to four activity items and replaces the prior `You` entry. It is intentionally simple and should be cleared from browser storage when a repeatable clean demo is needed.

## Suggested Demonstration Script

Use this sequence for an end-to-end product walkthrough:

1. Start in **Overview** and describe cash confidence, the single recovery, and the payment activity signal.
2. Open **Collect** and contrast a public donation page with a recipient-specific invoice and an auditable manual payment.
3. Preview the donor checkout, select **Monthly** or **Annually**, and point out annual impact and explicit recurring consent.
4. Complete a **Card** payment; show the confirmed state, receipt reference, and newly added paid activity row.
5. Reopen checkout, choose **Bank debit**, complete it, and contrast the pending settlement confirmation with the card confirmation.
6. Refresh the page to show that the latest mock activity remains visible.
7. Open **Transactions**, select `PM-1048`, and run **Request refund**. Highlight balance, policy reason, and audit timeline.
8. In **Recurring**, use **Cancel respectfully** to demonstrate no-trap donor control.
9. In **Donors & customers**, issue a mock secure management link and distinguish it from a personal acknowledgement.
10. In **Reconciliation**, confirm a payout match and show the export-oriented evidence.
11. Close in **Settings**, which makes the operating policies visible without turning the product into a dense admin console.

## What Is Deliberately Not Implemented

The following are product requirements or natural production follow-ons, but are not operational features of this prototype:

- payment-provider API calls, webhooks, token vaulting, or PCI compliance controls;
- real hosted checkout, wallet availability, card entry, or ACH mandate capture;
- payment authorization, settlement polling, retry execution, refunds, chargeback submission, or real invoice delivery;
- server-side authentication, role enforcement, audit immutability, or signed management links;
- accounting synchronization, export file creation, revenue recognition, or tax calculation;
- persisted collection drafts, invoices, payment links, manual records, or complete operational activity;
- filtering, search, pagination, reporting periods, and record-level detail navigation beyond the focused mock state;
- localization, currency conversion, accessibility audit, analytics, monitoring, and automated test coverage.

These exclusions are intentional. The mock demonstrates the information architecture, state language, and interaction decisions needed before implementation of those systems.

## Production Readiness Path

To turn this mock into a real Payments module, the next technical phases are:

1. Define server-side entities for Intent, Attempt, Payment, Gift, Subscription, Invoice, Receipt, Refund, Dispute, and Reconciliation Item.
2. Integrate a PCI-compliant provider using hosted/tokenized payment fields and verified webhooks.
3. Introduce authentication, organization scoping, role-based permissions, and immutable audit storage.
4. Build a payment lifecycle engine that retains provider evidence and models pending, settled, failed, reversed, refunded, and disputed states separately.
5. Add a background-job system for receipts, stewardship, retries, reminders, expiry, settlement updates, and accounting exports.
6. Implement donor self-service with signed, expiring links and provider-hosted credential update flows.
7. Add reconciliation matching, accounting mappings, exception workflows, reports, alerts, and observability.
8. Validate legal, tax, privacy, consent, PCI, accessibility, and regional payment-method requirements before launch.

## Source Map

| File | Responsibility |
| --- | --- |
| [payment-experience/src/App.tsx](../payment-experience/src/App.tsx) | Mock data, navigation, operational screens, checkout logic, workflow sheets, and persistence |
| [payment-experience/src/App.css](../payment-experience/src/App.css) | Responsive visual system, CRM rail, sheets, checkout, and payment-state treatments |
| [payment-experience/src/main.tsx](../payment-experience/src/main.tsx) | React application entry point |
| [New_Payment_Functionality.md](New_Payment_Functionality.md) | Authoritative functional scope and product rules |
