<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * POST /api/tasks
     * Create a new task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create([
            'title'    => $request->title,
            'due_date' => $request->due_date,
            'priority' => $request->priority,
            'status'   => 'pending',
        ]);

        return response()->json([
            'message' => 'Task created successfully.',
            'task'    => $task,
        ], 201);
    }

    /**
     * GET /api/tasks?status=pending
     * List all tasks, sorted by priority (high→low) then due_date asc.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::query();

        // Optional filter by status
        if ($request->has('status')) {
            $status = $request->query('status');
            $allowed = ['pending', 'in_progress', 'done'];

            if (!in_array($status, $allowed)) {
                return response()->json([
                    'message' => 'Invalid status filter. Allowed: pending, in_progress, done.',
                ], 422);
            }

            $query->where('status', $status);
        }

        // Sort: priority high→low using FIELD(), then due_date ascending
        $tasks = $query
            ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
            ->orderBy('due_date', 'asc')
            ->get();

        if ($tasks->isEmpty()) {
            return response()->json([
                'message' => 'No tasks found.',
                'tasks'   => [],
            ], 200);
        }

        return response()->json([
            'message' => 'Tasks retrieved successfully.',
            'count'   => $tasks->count(),
            'tasks'   => $tasks,
        ], 200);
    }

    /**
     * PATCH /api/tasks/{id}/status
     * Progress task status: pending → in_progress → done (no skipping, no reverting).
     */
    public function updateStatus(UpdateTaskStatusRequest $request, int $id): JsonResponse
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        $requestedStatus = $request->status;
        $currentStatus   = $task->status;

        // Check that the requested status is the next valid step
        $expectedNext = Task::$statusFlow[$currentStatus] ?? null;

        if ($expectedNext === null) {
            return response()->json([
                'message' => 'This task is already marked as done. No further status changes allowed.',
            ], 422);
        }

        if ($requestedStatus !== $expectedNext) {
            return response()->json([
                'message' => "Invalid status transition. Task is currently '{$currentStatus}'. The only allowed next status is '{$expectedNext}'.",
            ], 422);
        }

        $task->update(['status' => $requestedStatus]);

        return response()->json([
            'message' => 'Task status updated successfully.',
            'task'    => $task->fresh(),
        ], 200);
    }

    /**
     * DELETE /api/tasks/{id}
     * Only tasks with status 'done' can be deleted.
     */

    public function destroy(int $id): JsonResponse
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        if ($task->status !== 'done') {
            return response()->json([
                'message' => 'Forbidden. Only tasks with status "done" can be deleted.',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ], 200);
    }

    /**
     * GET /api/tasks/report?date=YYYY-MM-DD
     * Return task counts grouped by priority and status for a given date.
     */
    public function report(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date', 'date_format:Y-m-d'],
        ]);

        $date  = $request->query('date');
        $tasks = Task::whereDate('due_date', $date)->get();

        // Build the summary scaffold
        $summary = [
            'high'   => ['pending' => 0, 'in_progress' => 0, 'done' => 0],
            'medium' => ['pending' => 0, 'in_progress' => 0, 'done' => 0],
            'low'    => ['pending' => 0, 'in_progress' => 0, 'done' => 0],
        ];

        // Tally each task into the grid
        foreach ($tasks as $task) {
            $summary[$task->priority][$task->status]++;
        }

        return response()->json([
            'date'    => $date,
            'summary' => $summary,
        ], 200);
    }
}