<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ScrapeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StaticController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Models\AnalyzedData;
use App\Models\Category;

Route::get('/user', function (Request $request) {
    $user = $request->user();
    $conversations = $user->conversations()
        ->with(['messages' => function($query) {
            // Keep messages order as is (do not order by latest)
        }])
        ->orderBy('created_at', 'desc')
        ->get();
    $user['conversations'] = $conversations;
    $user['number_of_products'] = $user->products()->count();
    $user['number_of_analyzed_products'] = AnalyzedData::
        where('generated_by', $user->id)
        ->count();
    $user['average_rating'] = $user->reviews()->avg('rating');
    $appReviews = $user->reviews()->count();
    $amazonReviews = $user->amazonReviews()->count();
    $user['total_reviews'] = $user->amazonReviews()->count();
    $recentAppReviews = $user->reviews()->orderBy('created_at', 'desc')->take(3)->get();
    $recentAmazonReviews = $user->amazonReviews()->orderBy('created_at', 'desc')->take(3)->get();
    $allCategoryNames = Category::inRandomOrder()->pluck('name')->toArray();
    $chunkSize = 6;
    $chunkedCategoryNames = array_chunk($allCategoryNames, $chunkSize);
    $user['category_order'] = $chunkedCategoryNames;
    $allRecentReviews = $recentAppReviews->concat($recentAmazonReviews)
        ->sortByDesc('created_at')
        ->take(3)
        ->values();
    $user['recent_reviews'] = $allRecentReviews;
    if ($allRecentReviews->isNotEmpty()) {
        $firstReview = $allRecentReviews[0];
        $reviewTime = \Carbon\Carbon::parse($firstReview->created_at);
        $user['first_review_time_diff'] = $reviewTime->diffForHumans();
    }

    // Get last added products
    $recentProducts = $user->products()->orderBy('created_at', 'desc')->take(3)->get();
    $user['recent_products'] = $recentProducts;
    if ($recentProducts->isNotEmpty()) {
        $lastProduct = $recentProducts[0];
        $productTime = \Carbon\Carbon::parse($lastProduct->created_at);
        $user['last_product_time_diff'] = $productTime->diffForHumans();
    }

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

Route::get('/search/suggestions', [ProductController::class,'productSearch']);

Route::post('/add-review', [UserController::class, 'addReview'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function (){
    Route::post('/add-product', [ProductController::class, 'addProduct']);
    Route::put('/products/{id}', [ProductController::class, 'updateProduct']);
    Route::delete('/products/{id}', [ProductController::class, 'deleteProduct']);
    Route::get("/get-my-products",[ProductController::class, "getMyProducts"]);
    Route::get("/get-my-products-for-analyze",[ProductController::class, "getMyProductsForAnalyze"]);
    Route::get('/analyzed-report/{id}', [ProductController::class, 'getOneProductWithAnalyzedData']);
    Route::get('/product/analyze/{id}',[ProductController::class, 'generateAnalyzedReport']);
    Route::delete('/reports/{id}', [ProductController::class, 'deleteReport']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post("/ai-scrape", [ChatController::class,'message']);
    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat/start', [ChatController::class, 'startConversation']);
    Route::post('/chat/message', [ChatController::class, 'sendMessage']);
    Route::get('/chat/conversation/{id}', [ChatController::class, 'getConversation']);
    Route::get('/chat/conversation/{id}/summary', [ChatController::class, 'getConversationSummary']);
    Route::post('/delete-conversation/{id}', [ChatController::class, 'deleteConv']);
});

// // If using web.php (with auth middleware)
// Route::middleware(['auth'])->group(function () {
//     Route::get('/download-report-pdf/{reportId}', [ProductController::class, 'downloadPDF'])
//         ->name('report.download.pdf');
// });

// If using api.php (with auth:sanctum middleware)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/download-report-pdf/{reportId}', [ProductController::class, 'downloadPDF']);
});

// Route::get('/reports/printable/{reportId}', [ReportController::class, 'showPrintableReport'])
//     ->name('reports.printable')
//     ->middleware(['auth']);

// // Route for PDF download
// Route::get('/reports/download-pdf/{reportId}', [ReportController::class, 'downloadReportPDF'])
//     ->name('reports.download-pdf')
//     ->middleware(['auth']);

// // Alternative route using HTML string method
// Route::get('/reports/download-pdf-html/{reportId}', [ReportController::class, 'downloadReportPDFFromHTML'])
//     ->name('reports.download-pdf-html')
//     ->middleware(['auth']);
