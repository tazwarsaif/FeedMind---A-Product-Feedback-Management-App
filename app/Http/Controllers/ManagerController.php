<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\SuggestedCategorySet;
use Illuminate\Http\Request;

class ManagerController extends Controller
{
    public function loginView() {
        return inertia("Manager/ManagerLogin");
    }
    public function dashboardView() {
        //dd($request->user());
        return inertia("Manager/Dashboard");
    }
    public function feedGPTView() {
        //dd($request->user());
        return inertia("Manager/ChatPage");
    }
    public function getConversationsView() {
        //dd($request->user());
        return inertia("Manager/Conversations");
    }
    public function addProduct(){
        return inertia("Manager/AddProduct");
    }
    public function myProducts(){
        return inertia("Manager/MyProducts");
    }
    public function getProductsView(Request $request)
    {
        // Always generate categoryOrder for pagination
        $allCategoryNames = Category::inRandomOrder()->pluck('name')->toArray();
        $chunkSize = 6;
        $chunkedCategoryNames = array_chunk($allCategoryNames, $chunkSize);

        // --- CASE 1: Search query ---
        if ($request->query('search')) {
            $searchQuery = $request->query('search');
            $products = \App\Models\Product::with([
                'amazonImages',
                'amazonReviews',
                'reviews',
                'categories'
            ])->where('name', 'like', '%' . $searchQuery . '%')->get();

            $name = 'Searched Item "' .
                    (strlen($searchQuery) > 50 ? substr($searchQuery, 0, 50) . '..."' : $searchQuery . '"');

            $result = collect([
                [
                    'name' => $name,
                    'products' => $products->map(fn($product) => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'description' => $product->description,
                        'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
                        'amazonReviews' => $product->amazonReviews->map(fn($review) => [
                            'user' => $review->reviewer_name,
                            'rating' => $review->rating,
                            'comment' => $review->comment,
                        ])->toArray(),
                        'inAppReviews' => $product->reviews->map(fn($review) => [
                            'user' => null,
                            'rating' => $review->rating,
                            'comment' => $review->comment,
                        ])->toArray(),
                        'category' => $product->categories->first()?->name ?? null,
                    ])->toArray(),
                ]
            ]);

            return inertia("Manager/ProductsPage", [
                'productsFromBack' => $result,
                'categoryOrder' => $chunkedCategoryNames // Add this line
            ]);
        }

        // --- CASE 2: Category query OR random fallback ---
        $selectedCategoryNames = [];

        if ($request->query('categories')) {
            // Use categories from query
            $selectedCategoryNames = explode(',', $request->query('categories'));
        } else {
            // No query param, use random
            $selectedCategoryNames = $chunkedCategoryNames[0] ?? [];
        }

        // Fetch only the selected categories with related products
        $categories = Category::with([
                'products.amazonImages',
                'products.amazonReviews',
                'products.reviews'
            ])
            ->whereIn('name', $selectedCategoryNames)
            ->get();

        $result = $categories->map(function ($category) {
            return [
                'name' => $category->name,
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'description' => $product->description,
                        'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
                        'amazonReviews' => $product->amazonReviews->map(fn($review) => [
                            'user' => $review->reviewer_name,
                            'rating' => $review->rating,
                            'comment' => $review->comment,
                        ])->toArray(),
                        'inAppReviews' => $product->reviews->map(fn($review) => [
                            'user' => null,
                            'rating' => $review->rating,
                            'comment' => $review->comment,
                        ])->toArray(),
                        'category' => $product->categories->first()?->name ?? null,
                    ];
                })->toArray(),
            ];
        });

        return inertia("Manager/ProductsPage", [
            'productsFromBack' => $result,
            'categoryOrder' => $chunkedCategoryNames
        ]);
    }


}
