<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\SuggestedCategorySet;
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
    public function getProductsView(Request $request) {
        if($request->query('search')) {
            $searchQuery = $request->query('search');
            //Here I want to find the products according to the search query and then put all the products in a single category named "Searched Item"
            $products = \App\Models\Product::with([
                'amazonImages',
                'amazonReviews',
                'reviews',
                'categories'
            ])->where('name', 'like', '%' . $searchQuery . '%')->get();

            // Format products into a single "Searched Item" category
            $result = collect([
                [
                    'name' => 'Searched Item "' . $searchQuery . '"',
                    'products' => $products->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'price' => $product->price,
                            'description' => $product->description,
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
                ]
            ]);

            return inertia("ProductsPage", [
                'productsFromBack' => $result
            ]);
        }
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

        return inertia("ProductsPage", [
            'productsFromBack' => $result
        ]);
    }
}
