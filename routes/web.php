<?php

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

