/* =========================================================
   app.js — Application bootstrap & event wiring
   Runs after all other scripts are loaded.
   ========================================================= */

(function init() {

  /* ── Set default dates ──────────────────────────────────── */
  const today = new Date().toISOString().split('T')[0];

  const cDate = document.getElementById('c-date');
  const rDate = document.getElementById('r-date');

  if (cDate) { cDate.value = today; cDate.min = today; }
  if (rDate)   rDate.value = today;

  /* ── Render static content ──────────────────────────────── */
  UI.renderMigrationCode();

  /* ────────────────────────────────────────────────────────
     NAVIGATION
     Clicking a .nav-item shows its section and hides all others.
  ──────────────────────────────────────────────────────── */
  const allSections = document.querySelectorAll('[id^="section-"]');

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      // Show target section, hide the rest
      const sectionId = `section-${item.dataset.section}`;
      allSections.forEach((s) => {
        s.style.display = s.id === sectionId ? 'block' : 'none';
      });

      // Populate done-tasks list when entering the Delete section
      if (item.dataset.section === 'ep-delete') {
        UI.renderDoneTaskList();
      }
    });
  });

  /* ────────────────────────────────────────────────────────
     TABS — event delegation per .tabs container
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('.tabs').forEach((tabsEl) => {
    tabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const target = tab.dataset.target;
      if (target) UI.switchTab(tab, target);
    });
  });

  /* ────────────────────────────────────────────────────────
     ENDPOINT HEADERS — collapse / expand
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('.ep-header').forEach((header) => {
    header.addEventListener('click', () => UI.toggleEndpoint(header));
  });

  /* ────────────────────────────────────────────────────────
     RUN BUTTONS — wire to Api handlers
  ──────────────────────────────────────────────────────── */
  const buttonMap = {
    'btn-list':   () => Api.listTasks(),
    'btn-create': () => Api.createTask(),
    'btn-status': () => Api.updateStatus(),
    'btn-delete': () => Api.deleteTask(),
    'btn-report': () => Api.getReport(),
  };

  Object.entries(buttonMap).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  });

  /* ────────────────────────────────────────────────────────
     KEYBOARD SHORTCUT — Enter in any form input fires the
     nearest run button inside the same .ep-body.
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('.ep-body input, .ep-body select').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const btn = el.closest('.ep-body')?.querySelector('.run-btn');
      if (btn) btn.click();
    });
  });

})();
