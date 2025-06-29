<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSanctumAuthenticated
{
    public function handle(Request $request, Closure $next)
{
    // First try to authenticate via token
    if ($request->bearerToken()) {
        Auth::shouldUse('sanctum');
    }

    if (!Auth::check()) {
        return redirect()->route('login');
    }

    return $next($request);
}
}
