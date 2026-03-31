<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = [
            ['title' => 'Fix production bug',    'due_date' => now()->toDateString(),              'priority' => 'high',   'status' => 'in_progress'],
            ['title' => 'Write unit tests',       'due_date' => now()->addDays(1)->toDateString(),  'priority' => 'medium', 'status' => 'pending'],
            ['title' => 'Update documentation',   'due_date' => now()->addDays(2)->toDateString(),  'priority' => 'low',    'status' => 'pending'],
            ['title' => 'Deploy to staging',      'due_date' => now()->toDateString(),              'priority' => 'high',   'status' => 'done'],
            ['title' => 'Code review PR #42',     'due_date' => now()->addDays(1)->toDateString(),  'priority' => 'medium', 'status' => 'pending'],
            ['title' => 'Database backup check',  'due_date' => now()->toDateString(),              'priority' => 'low',    'status' => 'done'],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}