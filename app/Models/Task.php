<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'due_date',
        'priority',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    /**
     * Priority weight map used for sorting (high=3, medium=2, low=1)
     */
    public static array $priorityOrder = [
        'high'   => 3,
        'medium' => 2,
        'low'    => 1,
    ];

    /**
     * Valid status progression map
     */
    public static array $statusFlow = [
        'pending'     => 'in_progress',
        'in_progress' => 'done',
    ];
}