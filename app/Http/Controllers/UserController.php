<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function addReview(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = new Review();
        $review->user_id = Auth::user()->id;
        $review->product_id = $validated['product_id'];
        $review->rating = $validated['rating'];
        $review->comment = $validated['comment'];
        $review->save();

        return response()->json(['message' => 'Review added successfully'], 201);
    }
}
