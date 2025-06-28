<?php

use App\Http\Controllers\GeneralController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render("Home");
});

Route::get('/chat', function () {
    return Inertia::render('Chat');
});
Route::get('/scrape', function () {
    return Inertia::render('ScrapePage');
});

Route::get('/login',[GeneralController::class,'loginView']);
Route::get('/register',[GeneralController::class,'registerView']);
Route::get('/dashboard',[GeneralController::class,'dashboardView']);
