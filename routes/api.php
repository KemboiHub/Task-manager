<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/tasks/report', [TaskController::class, 'report']);

Route::get('/tasks',                  [TaskController::class, 'show']);
Route::get('/tasks',                  [TaskController::class, 'index']);
Route::post('/tasks',                 [TaskController::class, 'store']);
Route::patch('/tasks/{id}/status',    [TaskController::class, 'updateStatus']);
Route::delete('/tasks/{id}',          [TaskController::class, 'destroy']);
