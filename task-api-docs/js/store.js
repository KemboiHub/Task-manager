/* =========================================================
   store.js — In-memory task store & business logic
   Simulates the Laravel 11 MySQL backend in the browser.
   ========================================================= */

const Store = (() => {
  /* ── Seed data ──────────────────────────────────────────── */
  let tasks = [
    {
      id: 1,
      title: 'Fix production bug',
      due_date: '2026-04-01',
      priority: 'high',
      status: 'in_progress',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-30T09:00:00Z',
    },
    {
      id: 2,
      title: 'Write unit tests',
      due_date: '2026-04-02',
      priority: 'medium',
      status: 'pending',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-30T08:00:00Z',
    },
    {
      id: 3,
      title: 'Update documentation',
      due_date: '2026-04-03',
      priority: 'low',
      status: 'pending',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-30T08:00:00Z',
    },
    {
      id: 4,
      title: 'Deploy to staging',
      due_date: '2026-04-01',
      priority: 'high',
      status: 'done',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-31T10:00:00Z',
    },
    {
      id: 5,
      title: 'Code review PR #42',
      due_date: '2026-04-02',
      priority: 'medium',
      status: 'pending',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-30T08:00:00Z',
    },
    {
      id: 6,
      title: 'Database backup check',
      due_date: '2026-04-01',
      priority: 'low',
      status: 'done',
      created_at: '2026-03-30T08:00:00Z',
      updated_at: '2026-03-31T11:00:00Z',
    },
  ];

  let nextId = 7;

  /* ── Constants ──────────────────────────────────────────── */
  const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

  /**
   * Valid next status for each current status.
   * 'done' has no entry — it is a terminal state.
   */
  const STATUS_FLOW = {
    pending:     'in_progress',
    in_progress: 'done',
  };

  const VALID_PRIORITIES = ['low', 'medium', 'high'];
  const VALID_STATUSES   = ['pending', 'in_progress', 'done'];

  /* ── Helpers ────────────────────────────────────────────── */
  function now() {
    return new Date().toISOString();
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ── GET /api/tasks ─────────────────────────────────────── */
  function listTasks(statusFilter) {
    // Validate optional filter
    if (statusFilter && !VALID_STATUSES.includes(statusFilter)) {
      return {
        code: 422,
        body: { message: 'Invalid status filter. Allowed: pending, in_progress, done.' },
      };
    }

    let result = deepClone(tasks);

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sort: priority high→low, then due_date ascending (mirrors MySQL FIELD())
    result.sort((a, b) => {
      const pd = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (pd !== 0) return pd;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    if (result.length === 0) {
      return { code: 200, body: { message: 'No tasks found.', tasks: [] } };
    }

    return {
      code: 200,
      body: { message: 'Tasks retrieved successfully.', count: result.length, tasks: result },
    };
  }

  /* ── POST /api/tasks ────────────────────────────────────── */
  function createTask(title, due_date, priority) {
    const errors = {};

    // Validate title
    if (!title || !title.trim()) {
      errors.title = ['The title field is required.'];
    } else if (title.length > 255) {
      errors.title = ['The title may not be greater than 255 characters.'];
    }

    // Validate due_date
    if (!due_date) {
      errors.due_date = ['The due date field is required.'];
    } else {
      const today = todayStr();
      if (due_date < today) {
        errors.due_date = ['The due date must be today or a future date.'];
      }
    }

    // Validate priority
    if (!priority) {
      errors.priority = ['The priority field is required.'];
    } else if (!VALID_PRIORITIES.includes(priority)) {
      errors.priority = ['Priority must be one of: low, medium, high.'];
    }

    // Check unique title + due_date combination
    if (title && due_date && !errors.title && !errors.due_date) {
      const duplicate = tasks.find(
        (t) => t.title === title.trim() && t.due_date === due_date
      );
      if (duplicate) {
        errors.title = ['A task with this title already exists on the same due date.'];
      }
    }

    if (Object.keys(errors).length > 0) {
      return { code: 422, body: { message: 'Validation failed.', errors } };
    }

    const task = {
      id: nextId++,
      title: title.trim(),
      due_date,
      priority,
      status: 'pending',
      created_at: now(),
      updated_at: now(),
    };

    tasks.push(task);

    return { code: 201, body: { message: 'Task created successfully.', task: deepClone(task) } };
  }

  /* ── PATCH /api/tasks/{id}/status ───────────────────────── */
  function updateStatus(id, newStatus) {
    // Validate inputs
    if (!id || isNaN(id)) {
      return { code: 422, body: { message: 'Validation failed.', errors: { id: ['The id field is required.'] } } };
    }

    if (!newStatus) {
      return { code: 422, body: { message: 'Validation failed.', errors: { status: ['The status field is required.'] } } };
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return { code: 422, body: { message: 'Validation failed.', errors: { status: ['Status must be one of: pending, in_progress, done.'] } } };
    }

    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return { code: 404, body: { message: 'Task not found.' } };
    }

    const expectedNext = STATUS_FLOW[task.status];

    // Terminal state
    if (!expectedNext) {
      return {
        code: 422,
        body: { message: 'This task is already marked as done. No further status changes allowed.' },
      };
    }

    // Wrong transition
    if (newStatus !== expectedNext) {
      return {
        code: 422,
        body: {
          message: `Invalid status transition. Task is currently '${task.status}'. The only allowed next status is '${expectedNext}'.`,
        },
      };
    }

    task.status = newStatus;
    task.updated_at = now();

    return {
      code: 200,
      body: { message: 'Task status updated successfully.', task: deepClone(task) },
    };
  }

  /* ── DELETE /api/tasks/{id} ─────────────────────────────── */
  function deleteTask(id) {
    if (!id || isNaN(id)) {
      return { code: 422, body: { message: 'Task ID is required.' } };
    }

    const idx = tasks.findIndex((t) => t.id === id);

    if (idx === -1) {
      return { code: 404, body: { message: 'Task not found.' } };
    }

    if (tasks[idx].status !== 'done') {
      return {
        code: 403,
        body: { message: 'Forbidden. Only tasks with status "done" can be deleted.' },
      };
    }

    tasks.splice(idx, 1);

    return { code: 200, body: { message: 'Task deleted successfully.' } };
  }

  /* ── GET /api/tasks/report ──────────────────────────────── */
  function getReport(date) {
    if (!date) {
      return {
        code: 422,
        body: { message: 'Validation failed.', errors: { date: ['The date field is required.'] } },
      };
    }

    // Basic date format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        code: 422,
        body: { message: 'Validation failed.', errors: { date: ['The date must match the format YYYY-MM-DD.'] } },
      };
    }

    const filtered = tasks.filter((t) => t.due_date === date);

    // Always returns all 9 cells even if 0
    const summary = {
      high:   { pending: 0, in_progress: 0, done: 0 },
      medium: { pending: 0, in_progress: 0, done: 0 },
      low:    { pending: 0, in_progress: 0, done: 0 },
    };

    filtered.forEach((t) => {
      summary[t.priority][t.status]++;
    });

    return { code: 200, body: { date, summary } };
  }

  /* ── Utility queries ────────────────────────────────────── */
  function getDoneTasks() {
    return deepClone(tasks.filter((t) => t.status === 'done'));
  }

  /* ── Public API ─────────────────────────────────────────── */
  return { listTasks, createTask, updateStatus, deleteTask, getReport, getDoneTasks };
})();
