# Task Management API — Interactive Documentation UI

A standalone, zero-dependency interactive API documentation interface
for the Laravel 11 Task Management API. Built with plain HTML, CSS, and
Vanilla JavaScript — no build step required.

---

## Project Structure

```
task-api-docs/
├── index.html          ← Entry point; all sections declared here
├── css/
│   ├── base.css        ← CSS variables, reset, typography, keyframes
│   ├── layout.css      ← Shell grid, sidebar, main, hero, setup steps
│   ├── components.css  ← Cards, tabs, forms, responses, report grid
│   └── syntax.css      ← JSON & PHP token highlight colors
└── js/
    ├── store.js        ← In-memory task store + all business logic
    ├── highlight.js    ← JSON & PHP syntax highlighting utilities
    ├── ui.js           ← DOM helpers (responses, tabs, task list, etc.)
    ├── api.js          ← Simulated API handlers (one per endpoint)
    └── app.js          ← Bootstrap: navigation, event wiring, init
```

---

## How to run

Open `index.html` directly in any modern browser — no server needed.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Or just drag the file into Chrome / Firefox
```

---

## Features

| Feature | Detail |
|---------|--------|
| 5 interactive endpoints | GET, POST, PATCH, DELETE, report |
| In-memory data store | Fully simulates Laravel backend logic |
| Business rule enforcement | Duplicate check, status flow, done-only delete |
| Syntax-highlighted responses | JSON tokens colored by type |
| PHP migration preview | Highlighted migration code on Setup page |
| Clickable done-task list | Auto-fills ID in Delete section |
| Report visual grid | Priority × status counts grid |
| Tab navigation | Try it / Schema / Rules per endpoint |
| Keyboard support | Press Enter in any field to fire the request |
| Responsive layout | Works on mobile (sidebar collapses to top bar) |

---

## Script load order

Scripts must load in this order (already set in `index.html`):

1. `store.js`    — data + business logic (no deps)
2. `highlight.js` — pure utilities (no deps)
3. `ui.js`       — uses `Store` + `Highlight`
4. `api.js`      — uses `Store` + `UI`
5. `app.js`      — uses `UI` + `Api`, bootstraps the app

---

## Connecting to a real Laravel backend

Replace each `Store.*` call in `js/api.js` with a real `fetch()`:

```js
// Before (simulated)
const result = Store.listTasks(status);
UI.showResponse('list', result.code, result.body);

// After (real API)
const res  = await fetch(`/api/tasks${status ? '?status=' + status : ''}`);
const data = await res.json();
UI.showResponse('list', res.status, data);
```

Set the base URL once at the top of `api.js`:

```js
const BASE_URL = 'http://127.0.0.1:8000/api';
```
