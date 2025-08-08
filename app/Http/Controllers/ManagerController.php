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
        if ($request->query('search')) {
            $searchQuery = $request->query('search');
            $products = \App\Models\Product::with([
                'amazonImages',
                'amazonReviews',
                'reviews',
                'categories'
            ])->where('name', 'like', '%' . $searchQuery . '%')->get();

            if (strlen($searchQuery) > 50) {
                $name = 'Searched Item "' . substr($searchQuery, 0, 50) . '..."';
            } else {
                $name = 'Searched Item "' . $searchQuery . '"';
            }

            $result = collect([
                [
                    'name' => $name,
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

            return inertia("Manager/ProductsPage", [
                'productsFromBack' => $result
            ]);
        }
        $allCategoryNames = Category::inRandomOrder()->pluck('name')->toArray();
        $chunkSize = 6;
        $chunkedCategoryNames = array_chunk($allCategoryNames, $chunkSize);
        // 2. Pick first 6 category names from that shuffled list
        $selectedCategoryNames = array_slice($allCategoryNames, 0, 6);

        // 3. Fetch only the first 6 categories with related products & reviews
        $categories = Category::with([
                'products.amazonImages',
                'products.amazonReviews',
                'products.reviews'
            ])
            ->whereIn('name', $selectedCategoryNames)
            ->get();

        // 4. Format categories and their products
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

        // 5. Return inertia response:
        return inertia("Manager/ProductsPage", [
            'productsFromBack' => $result,
            'categoryOrder' => $chunkedCategoryNames, // all category names in random order
        ]);
    }

}
