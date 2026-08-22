# Calls Mock Functionality

## Purpose

This document describes the functionality currently implemented in the `call-experience` Calls CRM mock. It is an interactive React prototype with seeded CRM data and browser-local persistence. It demonstrates user workflows and operational states; it does not connect to a real CRM, phone provider, authentication system, or external service.

## Navigation

The left rail opens these primary areas:

| Area | Purpose |
| --- | --- |
| Overview | High-level view of calls in focus, open commitments, connection rate, next conversation, and follow-through. |
| Calling workspace | The daily calling queue, simulated call lifecycle, live notes, conversation brief, and scheduling. |
| Call history | Searchable canonical activity records with optional filters and record detail. |
| Insights | Derived call metrics, report filters, and drill-down into the supporting records. |
| Live operations | Simulated supervisor view of availability, waiting calls, routing exceptions, and meaningful events. |
| Administration | Persistent mock policies for recording, transcript access, retention, routing, and provider-health recovery. |
| Relationship record | A selected contact's CRM-style timeline, commitments, notes, contact details, and quick actions. |

The top bar also provides:

- An availability toggle between `Available` and `Focus time`.
- Call Finder, a guided way to open a filtered history view.
- A notification action that surfaces a follow-up reminder.
- A help action that explains where to find a contact's complete relationship story.

## Overview

The Overview summarizes the work that needs attention today.

- It shows counts for calls in focus and open commitments, plus a connection rate calculated from the current call records.
- It highlights the currently selected queue contact as the next conversation and offers direct `View record` and `Call` routes.
- It reports whether follow-through work remains and links to the relationship record to review it.
- Its values update as calls, follow-ups, and tasks are created or completed in the mock.

## Calling Workspace

### Priority queue and context

- A four-contact priority queue provides name, company, priority reason, and recommended call time.
- Selecting a contact resets the simulated call to the ready state and loads that person's context into the call card, conversation brief, notes, and relationship record.
- The queue's contextual messages explain why an item is prioritized; `View all` and the queue overflow action provide explanatory feedback in the mock.
- The workspace displays the selected contact's phone number, recommended contact window, and a prior-conversation count.

### Simulated call lifecycle

The call card supports these states:

| State | Available behavior |
| --- | --- |
| Ready | Start an outbound call for the selected person. |
| Connecting | Displays a connecting state, then automatically moves to connected after a short simulated delay. The call can be cancelled. |
| Incoming | A simulated inbound call can be placed from the workspace or operations console. It can be answered or sent to voicemail. |
| Connected | A timer advances each second. Mute/unmute, hold/resume, warm transfer, and end call controls are available. |
| Wrap-up | Capture connection result, applicable business outcome, live notes, and whether to create a linked follow-up. Save creates a canonical call record. |

Connection results include `Connected`, `No answer`, `Voicemail left`, `Busy`, and `Wrong number`. When connected, the available business outcomes are `Follow-up required`, `Meeting booked`, `Qualified`, `Not interested`, and `Issue resolved`.

### Live controls and notes

- Mute and hold are visible state toggles within a connected simulated call.
- Warm transfer opens a dialog with three destinations. Confirming the handoff ends the current simulation and confirms that relationship context travelled with it.
- Live notes are editable at all times in the calling workspace and show `Ready` or `Autosaved` feedback. Their content is used when the call is wrapped up.
- The conversation brief presents two static prompts for the selected contact: the shared commitment and what to listen for.

### Scheduling and manual logging

`Schedule call` opens a single activity form that can switch between scheduled and completed calls.

- The scheduling path searches existing call records by person or company and shows up to four matching relationships.
- Choosing a result fills name, company, and phone details and can synchronize the selected queue contact when that person is present in the queue.
- The user chooses a suggested future slot and supplies the call purpose before saving.
- Saving a scheduled call creates a canonical record with `Scheduled` connection, `Call planned` outcome, `Planned` duration, and a time that includes the selected slot.
- The completed-call path creates a connected manual activity using the supplied contact details and notes.
- Manual save requires a name and phone number. When either is missing, the mock does not create a record.

## Call History And Record Detail

Call History is the mock's canonical activity list. It includes seeded records and every completed, scheduled, or manually logged call created during the session.

### Retrieval

- The search field matches contact name, company, phone number, connection result, outcome, and notes.
- Optional filters can be revealed with `Filters`.
- Activity filters are `All`, `Needs follow-up`, `Meetings`, `No answer`, `Voicemails`, `Softphone`, and `Uncontacted`.
- Outcome filters are generated from the outcomes currently present in the record collection.
- `Clear` resets the activity and outcome filters. Search text remains independently controlled.
- An empty state appears when no records match and guides the user to broaden the view.
- `Export` produces an in-app confirmation with the number of matching records; it does not create a file.

### Selected call detail

Selecting a history row opens its detail beside the list.

- It displays contact, company, outcome, time, duration, recording/consent label, and mock quality score.
- `Play recording` and `Search transcript` show simulated feedback rather than playing or searching real assets.
- The waveform and decision moment are visual mock content populated from the selected record.
- A generated-summary approval action persists on the selected record and changes its sync state to `Synced`.
- The automation label communicates the record's current mock automation, such as follow-up creation or meeting suggestion.
- When a selected record needs follow-through, `Complete` clears that record's follow-up flag.
- `Call again` opens the calling workspace and prepares the selected contact where that person exists in the priority queue.

## Call Finder

Call Finder is opened from the top-bar search icon. It is a command-style dialog that searches predefined activity intents, not raw call content.

The available intents are:

- Call logs
- Follow-ups due
- No answers
- Voicemails waiting
- Softphone calls
- Uncontacted prospects

Selecting an intent opens Call History with the corresponding activity filter applied. A no-result state suggests supported finder terms. The finder explicitly routes to the same canonical records used by History.

## Insights And Reporting

Insights derives its headline values from the current records and tasks:

- **Connected:** the percentage of records with a `Connected` connection result.
- **Follow-through:** completed task count compared with total task count.
- **Meetings booked:** record count with a `Meeting booked` outcome.

The report filter bar narrows the drill-down to `All activity`, `Connected`, `Needs follow-up`, or `Meetings`.

- The drill-down displays up to three matching records and opens the selected record in History.
- `Open full history` routes to unfiltered Call History.
- The chart, call-quality label, and focus recommendation are illustrative mock content rather than computed analytics.

## Relationship Record

The relationship record focuses the mock around the selected queue contact.

- It shows identity, title, company, a three-signal relationship summary, contact details, and quick email/call/create actions.
- `Email` supplies in-app feedback for a prepared follow-up email; it does not open an email client.
- `Call` returns to the calling workspace.
- The timeline can be limited to `All`, `Calls`, or `Notes`.
- The relationship note can be edited inline, saved, or cancelled. Saved text remains in React state for the current session.
- The timeline's call event opens Call History.
- The next-best-action panel can call the contact or open a prefilled scheduled-call form.

### Follow-through tasks

- The record shows incomplete tasks assigned to the selected contact.
- A task dialog creates a named next step and due value for that contact.
- A task can be completed from the relationship record; completion updates the global task metrics.
- Task records persist in browser local storage and are restored on reload in the same browser.

## Live Operations

Live Operations is an intentionally simulated supervisor console.

- It displays mock agent availability, calls waiting, and service level.
- The live-floor list includes mock agent context and an `Assist` confirmation action.
- A routing exception explains why Maya Das should be handed off and offers a simulated callback commitment or immediate inbound-call routing.
- `Route now` and `Place inbound call` move the calling workspace into its incoming-call state.
- The event stream is illustrative and does not grow from actual mock actions.

## Administration And Resilience

Administration supplies interactive, locally persisted policy controls:

| Policy | Available mock values |
| --- | --- |
| Recording notice | `Required` or `Optional` |
| Transcript access | `Restricted` or `Team leads` |
| Retention | 90, 180, or 365 days |
| Routing order | `Assigned owner`, `Skills match`, or `Team overflow` |

- The wrap-up panel documents the mock's expected fields: connection result, connected-call outcome, and follow-up owner when needed.
- Provider health starts as `Operational`. `Simulate delay` changes it to `Degraded`, displaying queued retries and a retrying context service.
- `Recover and reconcile` restores the provider state and marks records with `Needs review` sync status as `Synced`.
- Provider status, routing, and policy controls simulate operational behavior only; they do not configure a provider or enforce real access control.

## Persistence And Reset Behavior

The mock uses browser `localStorage` under these keys:

| Key | Persisted data |
| --- | --- |
| `solace-call-records` | Call records created by wrap-up, scheduling, and manual logging; record approval and follow-up changes. |
| `solace-follow-through-tasks` | Created and completed relationship tasks. |
| `solace-call-policies` | Recording, transcript, retention, and routing policy selections. |

Seed data is used only when a stored value does not exist. Clearing the browser's site data restores the seed records, tasks, and default policies on the next load. Most other UI state, such as the active view, selected contact, filters, call state, notes, availability, and relationship note, lasts only until the page reloads.

## Explicit Mock Boundaries

The following interactions are intentionally presentational or simulated:

- No real inbound or outbound dialing, phone-number validation, device selection, recording, transcript, email, transfer, routing, or provider synchronization occurs.
- No user authentication, permissions, audit log, CRM association service, backend database, or server API exists.
- Call data is isolated to the browser profile and device; it is not shared with other users or sessions.
- Recording playback, transcript search, export, notification, assistance, and email actions provide feedback rather than external side effects.
- Mock quality scores, chart data, operational metrics, event stream entries, and selected relationship context are illustrative rather than complete production analytics.

## Recommended Demo Paths

1. Select a contact, start a call, wait for the connected state, add notes, end the call, and complete wrap-up with a follow-up.
2. Open Call History, search for the new call, inspect the record, approve its summary, and complete the linked follow-up.
3. Open the relationship record, add a follow-through task, then visit Insights to see task completion reflected in the metric.
4. Open Call Finder and route to Voicemails waiting or Uncontacted prospects.
5. Open Administration, change a policy, simulate a provider delay, then recover and reconcile.