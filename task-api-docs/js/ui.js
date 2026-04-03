/* =========================================================
   ui.js — DOM helpers: responses, tabs, loading, task list,
            report grid, copy button
   ========================================================= */

const UI = (() => {

  /* ── Status code metadata ───────────────────────────────── */
  const STATUS_META = {
    200: { text: 'OK',                      dot: 'dot-green', cls: 'status-2xx' },
    201: { text: 'Created',                 dot: 'dot-green', cls: 'status-2xx' },
    403: { text: 'Forbidden',               dot: 'dot-amber', cls: 'status-4xx' },
    404: { text: 'Not Found',               dot: 'dot-red',   cls: 'status-4xx' },
    422: { text: 'Unprocessable Entity',    dot: 'dot-red',   cls: 'status-4xx' },
  };

  /* ── showResponse ───────────────────────────────────────── */
  /**
   * Renders a simulated HTTP response into the DOM.
   *
   * @param {string} prefix   — e.g. 'list', 'create', 'status', 'delete', 'report'
   * @param {number} code     — HTTP status code
   * @param {object} data     — Response payload (will be JSON-highlighted)
   */
  function showResponse(prefix, code, data) {
    const box    = document.getElementById(`${prefix}-response`);
    const header = document.getElementById(`${prefix}-resp-header`);
    const body   = document.getElementById(`${prefix}-resp-body`);

    if (!box || !header || !body) return;

    const meta = STATUS_META[code] || { text: '', dot: 'dot-amber', cls: 'status-4xx' };

    header.innerHTML = `
      <span class="status-dot ${meta.dot}"></span>
      <span class="status-code ${meta.cls}">${code}</span>
      <span class="status-text">${meta.text}</span>
      <button class="copy-btn" data-prefix="${prefix}">Copy</button>
    `;

    // Wire up copy button
    header.querySelector('.copy-btn').addEventListener('click', () => copyResponse(prefix));

    body.innerHTML = Highlight.highlightJSON(data);
    box.style.display = 'block';

    // Smooth reveal
    box.style.animation = 'none';
    void box.offsetHeight; // reflow
    box.style.animation = '';
  }

  /* ── copyResponse ───────────────────────────────────────── */
  function copyResponse(prefix) {
    const body = document.getElementById(`${prefix}-resp-body`);
    if (!body) return;

    // Extract plain text from highlighted HTML
    const text = body.innerText || body.textContent;
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });

    const btn = document.querySelector(
      `#${prefix}-response .copy-btn`
    );
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    }
  }

  /* ── setLoading ─────────────────────────────────────────── */
  /**
   * Toggles loading state on a run button.
   *
   * @param {HTMLElement} btnEl
   * @param {boolean}     loading
   */
  function setLoading(btnEl, loading) {
    if (!btnEl) return;
    btnEl.classList.toggle('loading', loading);
  }

  /* ── switchTab ──────────────────────────────────────────── */
  /**
   * Activates a tab and shows its panel, hiding siblings.
   * Called by event delegation from app.js.
   *
   * @param {HTMLElement} tabEl     — The clicked tab element
   * @param {string}      targetId  — ID of the panel to show
   */
  function switchTab(tabEl, targetId) {
    const tabsContainer = tabEl.closest('.tabs');
    const epBody        = tabEl.closest('.ep-body');
    if (!tabsContainer || !epBody) return;

    // Deactivate all tabs in this group
    tabsContainer.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tabEl.classList.add('active');

    // Hide all sibling panels
    tabsContainer.querySelectorAll('.tab').forEach((t) => {
      const tid = t.dataset.target;
      if (tid) {
        const panel = document.getElementById(tid);
        if (panel) panel.style.display = 'none';
      }
    });

    // Show the target panel
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'block';
  }

  /* ── toggleEndpoint ─────────────────────────────────────── */
  /**
   * Expands / collapses an endpoint card body.
   *
   * @param {HTMLElement} headerEl — The .ep-header element
   */
  function toggleEndpoint(headerEl) {
    const body    = headerEl.nextElementSibling;
    const chevron = headerEl.querySelector('.ep-chevron');
    if (!body || !chevron) return;

    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    body.style.display = isOpen ? 'none' : 'block';
    chevron.classList.toggle('collapsed', isOpen);
  }

  /* ── renderDoneTaskList ─────────────────────────────────── */
  /**
   * Renders the clickable list of done-status tasks in the
   * Delete section so users can quickly auto-fill the ID input.
   */
  function renderDoneTaskList() {
    const list = document.getElementById('done-tasks-list');
    if (!list) return;

    const doneTasks = Store.getDoneTasks();

    if (doneTasks.length === 0) {
      list.innerHTML = '<div class="empty-state">No done tasks available</div>';
      return;
    }

    list.innerHTML = doneTasks
      .map(
        (t) => `
        <div class="task-row" data-task-id="${t.id}">
          <span class="priority-dot pr-${t.priority}"></span>
          <span class="task-title">#${t.id} · ${escapeHtml(t.title)}</span>
          <span class="task-date">${t.due_date}</span>
          <span class="task-status st-done">done</span>
        </div>
      `
      )
      .join('');

    // Auto-fill the ID input on row click
    list.querySelectorAll('.task-row').forEach((row) => {
      row.addEventListener('click', () => {
        const idInput = document.getElementById('d-id');
        if (idInput) idInput.value = row.dataset.taskId;
      });
    });
  }

  /* ── renderReportVisual ─────────────────────────────────── */
  /**
   * Renders the priority × status summary grid for the report.
   *
   * @param {string} date    — YYYY-MM-DD
   * @param {object} summary — { high: {pending,in_progress,done}, ... }
   */
  function renderReportVisual(date, summary) {
    const visual = document.getElementById('report-visual');
    const label  = document.getElementById('report-date-label');
    const grid   = document.getElementById('report-grid');
    if (!visual || !label || !grid) return;

    label.textContent = `Report for ${date}`;

    const PRIORITY_COLORS = {
      high:   'var(--c-red)',
      medium: 'var(--c-amber)',
      low:    'var(--c-green)',
    };

    const STATUS_COLORS = {
      pending:     'var(--c-amber)',
      in_progress: 'var(--c-blue)',
      done:        'var(--c-green)',
    };

    grid.innerHTML = ['high', 'medium', 'low']
      .map(
        (priority) => `
        <div class="report-cell">
          <div class="priority-label" style="color:${PRIORITY_COLORS[priority]}">${priority}</div>
          <div class="counts">
            ${['pending', 'in_progress', 'done']
              .map(
                (status) => `
              <div class="count-row">
                <span class="count-label">${status.replace('_', ' ')}</span>
                <span class="count-val" style="color:${STATUS_COLORS[status]}">${summary[priority][status]}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      )
      .join('');

    visual.style.display = 'block';
  }

  /* ── renderMigrationCode ─────────────────────────────────── */
  function renderMigrationCode() {
    const el = document.getElementById('migration-code');
    if (el) el.innerHTML = Highlight.renderMigrationCode();
  }

  /* ── Private helpers ─────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── fakeDelay ───────────────────────────────────────────── */
  /**
   * Returns a Promise that resolves after a short random delay
   * (400–600 ms) to simulate network latency.
   *
   * @param   {Function} fn — Work to do after the delay
   * @returns {Promise}
   */
  function fakeDelay(fn, baseMs = 400) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(fn()), baseMs + Math.random() * 200);
    });
  }

  return {
    showResponse,
    setLoading,
    switchTab,
    toggleEndpoint,
    renderDoneTaskList,
    renderReportVisual,
    renderMigrationCode,
    fakeDelay,
  };
})();
