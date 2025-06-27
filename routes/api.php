<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ScrapeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post("/chat", [ChatController::class,'message']);
Route::post('/scrape', ScrapeController::class);
