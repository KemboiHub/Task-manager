/* =========================================================
   api.js — Simulated API handlers
   Each function mirrors exactly one Laravel route handler.
   ========================================================= */

const Api = (() => {

  /* ── GET /api/tasks ─────────────────────────────────────── */
  async function listTasks() {
    const btn    = document.getElementById('btn-list');
    const status = document.getElementById('list-status').value;

    UI.setLoading(btn, true);

    await UI.fakeDelay(() => {
      const result = Store.listTasks(status || null);
      UI.showResponse('list', result.code, result.body);
    });

    UI.setLoading(btn, false);
  }

  /* ── POST /api/tasks ────────────────────────────────────── */
  async function createTask() {
    const btn      = document.getElementById('btn-create');
    const title    = document.getElementById('c-title').value;
    const due_date = document.getElementById('c-date').value;
    const priority = document.getElementById('c-priority').value;

    UI.setLoading(btn, true);

    await UI.fakeDelay(() => {
      const result = Store.createTask(title, due_date, priority);
      UI.showResponse('create', result.code, result.body);
    });

    UI.setLoading(btn, false);
  }

  /* ── PATCH /api/tasks/{id}/status ───────────────────────── */
  async function updateStatus() {
    const btn       = document.getElementById('btn-status');
    const id        = parseInt(document.getElementById('s-id').value, 10);
    const newStatus = document.getElementById('s-status').value;

    UI.setLoading(btn, true);

    await UI.fakeDelay(() => {
      const result = Store.updateStatus(id, newStatus);
      UI.showResponse('status', result.code, result.body);
    });

    UI.setLoading(btn, false);
  }

  /* ── DELETE /api/tasks/{id} ─────────────────────────────── */
  async function deleteTask() {
    const btn = document.getElementById('btn-delete');
    const id  = parseInt(document.getElementById('d-id').value, 10);

    UI.setLoading(btn, true);

    await UI.fakeDelay(() => {
      const result = Store.deleteTask(id);
      UI.showResponse('delete', result.code, result.body);

      // Refresh the done-tasks list after deletion
      UI.renderDoneTaskList();
    });

    UI.setLoading(btn, false);
  }

  /* ── GET /api/tasks/report ──────────────────────────────── */
  async function getReport() {
    const btn  = document.getElementById('btn-report');
    const date = document.getElementById('r-date').value; 

    UI.setLoading(btn, true);
    
    await UI.fakeDelay(() => {
      const result = Store.getReport(date);
      UI.showResponse('report', result.code, result.body);

      if (result.code === 200) {
        UI.renderReportVisual(result.body.date, result.body.summary);
      }
    });

    UI.setLoading(btn, false);
  }
  async function getReport() {
    const btn  = document.getElementById('btn-report');
    const date = document.getElementById('r-date').value;

    UI.setLoading(btn, true);

    await UI.fakeDelay(() => {
      const result = Store.getReport(date);
      UI.showResponse('report', result.code, result.body);

      if (result.code === 200) {
        UI.renderReportVisual(result.body.date, result.body.summary);
      }
    });

    UI.setLoading(btn, false);
  }

  return { listTasks, createTask, updateStatus, deleteTask, getReport };
})();
