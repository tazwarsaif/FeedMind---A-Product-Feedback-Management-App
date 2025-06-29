<?php

use App\Http\Controllers\GeneralController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// routes/web.php
use App\Http\Controllers\ChatController;

Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/start', [ChatController::class, 'startConversation'])->name('chat.start');
    Route::post('/chat/message', [ChatController::class, 'sendMessage'])->name('chat.message');
    Route::get('/chat/conversation/{id}', [ChatController::class, 'getConversation'])->name('chat.conversation');
});


Route::get('/', function () {
    return Inertia::render("Home");
});

// Route::get('/chat', function () {
//     return Inertia::render('Chat');
// });
Route::get('/scrape', function () {
    return Inertia::render('ScrapePage');
});

Route::get('/login',[GeneralController::class,'loginView'])->name('login');
Route::get('/register',[GeneralController::class,'registerView'])->name('register');
Route::get('/dashboard',[GeneralController::class,'dashboardView'])->name('dashboard');
