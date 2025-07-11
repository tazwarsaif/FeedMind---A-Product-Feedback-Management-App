<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function loginView() {
        return inertia("Auth/Login");
    }
    public function registerView() {
        return inertia("Auth/Register");
    }
    public function dashboardView() {
        //dd($request->user());
        return inertia("Dashboard");
    }
    public function feedGPTView() {
        //dd($request->user());
        return inertia("ChatPage");
    }
    public function getConversationsView() {
        //dd($request->user());
        return inertia("Conversations");
    }
    public function getProductsView() {
        //dd($request->user());
        return inertia("ProductsPage");
    }
}
