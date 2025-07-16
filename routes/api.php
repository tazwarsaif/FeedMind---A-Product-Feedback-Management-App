<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ScrapeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StaticController;
use App\Http\Controllers\ProductController;

Route::get('/user', function (Request $request) {
    $user = $request->user();
    $conversations = $user->conversations()
        ->with(['messages' => function($query) {
            // Keep messages order as is (do not order by latest)
        }])
        ->orderBy('created_at', 'desc')
        ->get();
    $user['conversations'] = $conversations;
    return $user;
})->middleware('auth:sanctum');


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require valid token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [AuthController::class, 'dashboard']);
    Route::post('/logout', [AuthController::class, 'logout']);
});


Route::post('/scrape', ScrapeController::class);

Route::get('/load-static-products', [StaticController::class, 'storeMultipleAmazonProducts']);

Route::get('/products/categories-with-products', [ProductController::class, 'getAllCategoriesWithProducts']);
Route::get('/products/categories', [StaticController::class, 'getCategories']);

Route::get('/search/suggestions', [ProductController::class,'projectSearch']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post("/ai-scrape", [ChatController::class,'message']);
    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat/start', [ChatController::class, 'startConversation']);
    Route::post('/chat/message', [ChatController::class, 'sendMessage']);
    Route::get('/chat/conversation/{id}', [ChatController::class, 'getConversation']);
    Route::get('/chat/conversation/{id}/summary', [ChatController::class, 'getConversationSummary']);
    Route::post('/delete-conversation/{id}', [ChatController::class, 'deleteConv']);
});
