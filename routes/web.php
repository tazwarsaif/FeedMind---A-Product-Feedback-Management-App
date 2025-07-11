<?php

use App\Http\Controllers\ViewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// routes/web.php
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Redirect;

Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/start', [ChatController::class, 'startConversation'])->name('chat.start');
    Route::post('/chat/message', [ChatController::class, 'sendMessage'])->name('chat.message');
    Route::get('/chat/conversation/{id}', [ChatController::class, 'getConversation'])->name('chat.conversation');
});


Route::get('/', function () {
    return Redirect::route('dashboard');;
});

// Route::get('/chat', function () {
//     return Inertia::render('Chat');
// });
Route::get('/amazon-scrape', function () {
    return Inertia::render('ScrapePage');
});

Route::get('/login',[ViewController::class,'loginView'])->name('login');
Route::get('/register',[ViewController::class,'registerView'])->name('register');
Route::get('/dashboard',[ViewController::class,'dashboardView'])->name('dashboard');
Route::get('/conversations',[ViewController::class,'getConversationsView'])->name('conversations');
Route::get('/products',[ViewController::class,'getProductsView'])->name('products');



Route::get("/feedgpt/{id}",[ViewController::class,'feedGPTView'])->name('feedgpt');

Route::get('/unauthorized', function () {
    abort(403);
});
