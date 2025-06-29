<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GeneralController extends Controller
{
    public function loginView() {
        return inertia("Auth/Login");
    }
    public function registerView() {
        return inertia("Auth/Register");
    }
    public function dashboardView() {
        return inertia("Dashboard");
    }
}
