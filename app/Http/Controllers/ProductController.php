<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\SuggestedCategorySet;
use Illuminate\Support\Facades\Http;

class ProductController extends Controller
{
    //'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
    public function getAllCategoriesWithProducts(Request $request)
    {
        // Get all category names initially
        $categoryNames = Category::pluck('name')->toArray();

        // Pick a random SuggestedCategorySet (IDs 1 to 5 assumed)
        $setId = rand(6, 10);
        $set = SuggestedCategorySet::find($setId);

        // Use categories from the set if found and not empty
        if ($set && !empty($set->categories)) {
            $categoryNames = $set->categories;
        }

        // Fetch categories with related products and reviews
        $categories = Category::with([
                'products.amazonImages',
                'products.amazonReviews',
                'products.reviews'
            ])
            ->whereIn('name', $categoryNames)
            ->get();

        // Format data for response
        $result = $categories->map(function ($category) {
            return [
                'name' => $category->name,
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'description' => $product->description,
                        // Get all images, remove slice(1) if first image needed
                        'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
                        'amazonReviews' => $product->amazonReviews->map(function ($review) {
                            return [
                                'user' => $review->reviewer_name,
                                'rating' => $review->rating,
                                'comment' => $review->comment,
                            ];
                        })->toArray(),
                        'inAppReviews' => $product->reviews->map(function ($review) {
                            return [
                                'user' => null,
                                'rating' => $review->rating,
                                'comment' => $review->comment,
                            ];
                        })->toArray(),
                        'category' => $product->categories->first()?->name ?? null,
                    ];
                })->toArray(),
            ];
        });

        return response()->json($result);
    }
    public function projectSearch(Request $request)
    {
        $query = $request->input('q');

        // Validate query
        if (empty($query)) {
            return response()->json(['error' => 'Query is required'], 400);
        }

        // Fetch products matching the query
        $products = Category::with(['products.amazonImages'])
            ->whereHas('products', function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%');
            })
            ->get()
            ->pluck('products')
            ->flatten()
            ->unique('id')
            ->take(4);

        // Format results
        $results = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'images' => array_values($product->amazonImages->pluck('image_url')->toArray()),
            ];
        });

        return response()->json($results);
    }
}
