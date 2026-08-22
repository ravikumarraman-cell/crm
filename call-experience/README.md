# Calls CRM Mock

## Overview

Calls CRM Mock is a polished, browser-based prototype for exploring a modern sales and service calling workflow. It brings the important parts of a Calls product into one responsive interface: a prioritized calling queue, simulated live calls, structured wrap-up, canonical call history, relationship follow-through, reporting, operational oversight, and administration settings.

The application is intentionally a frontend mock. It uses realistic seeded data and browser-local persistence to make demonstrations feel coherent across reloads, while keeping the environment simple to run and safe to reset.

## What It Demonstrates

| Area | Demonstrated workflow |
| --- | --- |
| Calling workspace | Prioritized contacts, contextual call preparation, outbound and inbound call states, timer, mute, hold, warm transfer, live notes, and structured wrap-up. |
| Call activity | Scheduled and manually logged calls, durable mock call records, follow-up flags, outcomes, and connection results. |
| History and intelligence | Full-text search, activity and outcome filters, call-detail review, simulated recording/transcript surfaces, quality signal, and summary approval. |
| Relationship management | Contact timeline, editable relationship note, contact details, open commitments, and creation or completion of follow-through tasks. |
| Reporting | Connection rate, meeting and task metrics, report filters, and drill-down from a metric to supporting call records. |
| Operations | A supervisor-oriented view of agent availability, call waiting, routing exceptions, private assist, and important events. |
| Administration | Recording, transcript-access, retention, routing, and simulated provider-health controls. |

For the complete behavioral inventory, see [Calls Mock Functionality](../docs/Calls_Mock_Functionality.md). The target, production-oriented capability is documented in [New Call Functionality And Flow](../docs/New_Call_Functionality_And_Flow.md).

## Technology

- React 19
- TypeScript
- Vite 8
- Lucide React icons
- CSS-based responsive design system

There is no backend, database, API service, environment file, or external account required to run the mock.

## Prerequisites

- Node.js 20 or later
- npm 9 or later

Verify the local toolchain before installing dependencies:

```sh
node --version
npm --version
```

## Quick Start

Run these commands from the `call-experience` directory:

```sh
npm install
npm run dev
```

Vite prints the development URL when the server starts, usually `http://localhost:5173/`. Open the address shown in the terminal. Source changes are applied through hot module replacement while the server is running.

To use an explicit loopback address and port:

```sh
npm run dev -- --host 127.0.0.1 --port 4174
```

Choose another port if the requested one is already in use.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot module replacement. |
| `npm run build` | Type-checks the project and creates an optimized production bundle in `dist/`. |
| `npm run lint` | Runs ESLint across the project. |
| `npm run preview` | Serves the existing production bundle for a local production-style check. |

Use the following verification sequence before sharing changes:

```sh
npm run lint
npm run build
```

To preview the production bundle after building it:

```sh
npm run preview
```

## Deploy To Vercel

The app is configured for Vercel as a static Vite deployment. It does not need environment variables, a database, serverless functions, or a separate API deployment.

### Deploy From The Vercel Dashboard

1. Push the repository to a Git provider supported by Vercel.
2. In Vercel, select **Add New** and then **Project**.
3. Import the repository.
4. Set **Root Directory** to `call-experience`.
5. Leave the detected Vite preset in place. The committed `vercel.json` runs `npm ci`, builds with `npm run build`, and publishes `dist`.
6. Select **Deploy**.

Vercel will create preview deployments for future branches and deploy the configured production branch when it is updated.

### Deploy With The Vercel CLI

From the `call-experience` directory:

```sh
npx vercel
```

Follow the prompts to authenticate, select or create a Vercel project, and confirm the directory. For a production deployment:

```sh
npx vercel --prod
```

The first CLI deployment creates local `.vercel` project metadata. That directory is ignored by Git.

### Verify A Deployment

After Vercel reports a successful deployment:

1. Open the Vercel deployment URL.
2. Start and wrap up a sample call to confirm static assets and interaction state load correctly.
3. Refresh the page to confirm browser-local call records and tasks are restored.

Vercel hosts the frontend bundle only. Each visitor's mock records, tasks, and policy choices remain isolated in that visitor's browser-local storage.

## Project Structure

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Application state, seeded data, navigation, interaction logic, and browser persistence. |
| `src/App.css` | The responsive visual system, layouts, component styling, and responsive breakpoints. |
| `src/main.tsx` | React entry point. |
| `src/index.css` | Global base styles. |
| `public/` | Static assets served directly by Vite. |
| `package.json` | Scripts and dependency declarations. |
| `vercel.json` | Vercel install, build, and static-output configuration. |
| `../docs/Calls_Mock_Functionality.md` | Comprehensive description of the implemented mock behavior. |
| `../docs/New_Call_Functionality_And_Flow.md` | Product-level specification for a future production capability. |

## Demonstration Path

The application opens in the calling workspace. This path shows the primary flow end to end:

1. Select a person from the priority queue.
2. Start an outbound call and wait for the simulated connected state.
3. Enter live notes, end the call, select a connection result and business outcome, then save the wrap-up.
4. Open Call History, find the new record, and review its detail or approve the mock summary.
5. Open the relationship record, create a follow-through task, and complete it.
6. Open Insights to see task completion and call records reflected in derived metrics.
7. Open Administration to change a policy, simulate a provider delay, and recover the mock provider state.

Call Finder, opened from the top-bar search control, provides direct routes to filtered activity views such as follow-ups due, no answers, voicemails, softphone calls, and uncontacted prospects.

## Browser-Local Data

The mock persists selected data in the current browser profile with `localStorage`. This makes scheduled calls, completed call records, task state, and administrative policy choices survive a page refresh without requiring a backend.

| Local-storage key | Stored information |
| --- | --- |
| `solace-call-records` | Seeded records plus scheduled, manually logged, and wrapped-up calls; summary approval and follow-up changes. |
| `solace-follow-through-tasks` | Created and completed relationship tasks. |
| `solace-call-policies` | Recording notice, transcript access, retention, and routing choices. |

Other UI state, including the selected contact, active view, filters, availability, live notes, and current call state, resets when the page reloads.

### Resetting A Demo

Clear site data for the development URL in browser developer tools, or remove the three local-storage keys above from the browser's Local Storage panel and reload the page. The mock then recreates its initial seeded data and default policy state.

## Mock Boundaries

The following experiences are intentionally simulated and do not perform external actions:

- Dialing, inbound events, device management, recording, transcription, transfer, routing, and provider synchronization.
- Email delivery, call export, notifications, and recording playback.
- Authentication, user permissions, audit logging, CRM records, backend storage, and server APIs.
- Quality scores, chart data, operational events, and agent availability.

The design is intended to make those future production integrations understandable without claiming that they are implemented.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `npm install` cannot resolve or download packages | Configure the npm registry and credentials required by the local network, then rerun the install. |
| Browser cannot connect to the app | Confirm that `npm run dev` is still running and open the exact address Vite printed. If the port is occupied, start the server on a different port. |
| An earlier demonstration's records remain visible | Clear the local-storage keys described in Browser-Local Data and reload. |
| The production preview is stale or missing | Run `npm run build` before `npm run preview`. |
| Lint or build fails after an edit | Run `npm run lint` for source diagnostics, correct the reported issue, then rerun `npm run build`. |

## Development Notes

- Keep interaction changes in `src/App.tsx` and visual changes in `src/App.css` unless a new module provides a clear simplification.
- Preserve the mock boundary in UI text and documentation; a control should not imply a real provider action when it only simulates one.
- Validate changes with lint and a production build. Use a local browser session for interaction and responsive checks when the development server is available.
