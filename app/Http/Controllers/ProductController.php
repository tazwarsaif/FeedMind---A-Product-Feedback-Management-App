<?php

namespace App\Http\Controllers;

use App\Models\AmazonImages;
use App\Models\AmazonReview;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use App\Models\SuggestedCategorySet;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    //'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
    public function getAllCategoriesWithProducts(Request $request)
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
        return response()->json( [
            'productsFromBack' => $result,
            'categoryOrder' => $chunkedCategoryNames, // all category names in random order
        ]);
    }
    public function productSearch(Request $request)
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
    public function addProduct(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'title' => 'required|string|max:255',
                'price' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'keywords' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string|url',
                'url' => 'nullable|string|url',
                'averageRating' => 'nullable|numeric|min:0|max:5',
                'reviews' => 'nullable|array',
                'reviewerNames' => 'nullable|array',
                'individualRatings' => 'nullable|array'
            ]);

            // Get authenticated user
            $user = Auth::user();
            if (!$user || $user->role_id === 2) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Start database transaction
            DB::beginTransaction();

            // Create the product
            $product = Product::create([
                'user_id' => $user->id,
                'name' => $request->title,
                'description' => $request->description,
                'price' => $request->price ?? 0,
                'keywords' => $request->keywords,
                'url' => $request->url
            ]);

            // Handle categories/keywords
            if ($request->keywords) {
                $keywordArray = array_map('trim', explode(',', $request->keywords));
                foreach ($keywordArray as $categoryName) {
                    if (!empty($categoryName)) {
                        $category = Category::firstOrCreate(
                            ['name' => strtolower($categoryName)],
                            ['description' => null]
                        );

                        // Attach product to category (pivot table)
                        DB::table('product_categories')->updateOrInsert(
                            [
                                'product_id' => $product->id,
                                'category_id' => $category->id
                            ],
                            [
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        );
                    }
                }
            }

            // Handle reviews
            if ($request->reviews && $request->individualRatings) {
                $reviews = $request->reviews;
                $ratings = $request->individualRatings;
                $reviewerNames = $request->reviewerNames ?? [];

                foreach ($reviews as $i => $review) {
                    $rating = $ratings[$i] ?? null;
                    if ($rating !== null && !empty($review)) {
                        AmazonReview::create([
                            'product_id' => $product->id,
                            'rating' => (int)$rating,
                            'reviewer_name' => $reviewerNames[$i] ?? null,
                            'comment' => $review
                        ]);
                    }
                }
            }

            // Handle images
            if ($request->images && is_array($request->images)) {
                foreach ($request->images as $imageUrl) {
                    if (!empty($imageUrl)) {
                        AmazonImages::create([
                            'product_id' => $product->id,
                            'image_url' => $imageUrl
                        ]);
                    }
                }
            }

            // Commit the transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product added successfully',
                'product_id' => $product->id
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add product: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to add product: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getMyProducts(Request $request)
    {
        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get all products for the authenticated user with related data
            $products = Product::where('user_id', $user->id)
                ->with([
                    'categories', // Assuming you have a categories relationship
                    'amazonReviews', // Assuming you have reviews relationship
                    'amazonImages' // Assuming you have images relationship
                ])
                ->get();

            // Transform the products to match the desired format
            $formattedProducts = $products->map(function ($product) {
                // Get features from description (split by newlines if stored that way)
                $features = [];
                if ($product->description) {
                    $features = array_filter(explode("\n", $product->description));
                }

                // Get reviews data
                $reviews = $product->amazonReviews ?? collect();
                $reviewerNames = $reviews->pluck('reviewer_name')->filter()->toArray();
                $reviewTexts = $reviews->pluck('comment')->filter()->toArray();
                $individualRatings = $reviews->pluck('rating')->filter()->toArray();

                // Calculate average rating
                $averageRating = $reviews->count() > 0
                    ? number_format($reviews->avg('rating'), 2)
                    : "0.00";

                // Get images
                $images = $product->amazonImages->pluck('image_url')->toArray();

                // Get keywords/categories
                $keywords = [];
                if ($product->keywords) {
                    $keywords = array_map('trim', explode(',', $product->keywords));
                } elseif ($product->categories) {
                    $keywords = $product->categories->pluck('name')->toArray();
                }

                return [
                    'id' => $product->id,
                    'title' => $product->name,
                    'features' => $features,
                    'reviewerNames' => $reviewerNames,
                    'reviews' => $reviewTexts,
                    'individualRatings' => $individualRatings,
                    'averageRating' => $averageRating,
                    'images' => $images,
                    'keywords' => $keywords,
                    'price' => $product->price,
                    'url' => $product->url,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'products' => $formattedProducts,
                'total' => $formattedProducts->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get user products: ' . $e->getMessage(), [
                'user_id' => Auth::user()->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve products: ' . $e->getMessage()
            ], 500);
        }
    }
    public function updateProduct(Request $request, $id)
    {
        try {
            // Validate the request
            $request->validate([
                'title' => 'required|string|max:255',
                'price' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'keywords' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string|url'
            ]);

            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Find the product and ensure it belongs to the user
            $product = Product::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$product) {
                return response()->json(['error' => 'Product not found or unauthorized'], 404);
            }

            // Start database transaction
            DB::beginTransaction();

            // Update the product
            $product->update([
                'name' => $request->title,
                'description' => $request->description,
                'price' => $request->price ?? 0,
                'keywords' => $request->keywords
            ]);

            // Update categories/keywords
            if ($request->keywords) {
                // Remove existing categories for this product
                DB::table('product_categories')->where('product_id', $product->id)->delete();

                $keywordArray = array_map('trim', explode(',', $request->keywords));
                foreach ($keywordArray as $categoryName) {
                    if (!empty($categoryName)) {
                        $category = Category::firstOrCreate(
                            ['name' => strtolower($categoryName)],
                            ['description' => null]
                        );

                        // Attach product to category (pivot table)
                        DB::table('product_categories')->updateOrInsert(
                            [
                                'product_id' => $product->id,
                                'category_id' => $category->id
                            ],
                            [
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        );
                    }
                }
            }

            // Update images
            if ($request->has('images')) {
                // Delete existing images
                AmazonImages::where('product_id', $product->id)->delete();

                // Add new images
                if (is_array($request->images)) {
                    foreach ($request->images as $imageUrl) {
                        if (!empty($imageUrl)) {
                            AmazonImages::create([
                                'product_id' => $product->id,
                                'image_url' => $imageUrl
                            ]);
                        }
                    }
                }
            }

            // Commit the transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update product: ' . $e->getMessage(), [
                'user_id' => Auth::user()->id,
                'product_id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }
    public function deleteProduct($id)
    {
        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Find the product and ensure it belongs to the user
            $product = Product::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$product) {
                return response()->json(['error' => 'Product not found or unauthorized'], 404);
            }

            // Start database transaction
            DB::beginTransaction();

            // Get all categories associated with this product BEFORE deletion
            $productCategories = DB::table('product_categories')
                ->where('product_id', $product->id)
                ->pluck('category_id')
                ->toArray();

            // Delete related data
            AmazonReview::where('product_id', $product->id)->delete();
            AmazonImages::where('product_id', $product->id)->delete();

            // Delete product-category relationships
            DB::table('product_categories')->where('product_id', $product->id)->delete();

            // Delete the product
            $product->delete();

            // Check each category to see if it has any remaining products
            $categoriesToDelete = [];
            foreach ($productCategories as $categoryId) {
                // Count remaining products in this category
                $remainingProductsCount = DB::table('product_categories')
                    ->where('category_id', $categoryId)
                    ->count();

                // If no products left in this category, mark it for deletion
                if ($remainingProductsCount === 0) {
                    $categoriesToDelete[] = $categoryId;
                }
            }

            // Delete empty categories
            if (!empty($categoriesToDelete)) {
                $deletedCategoryNames = Category::whereIn('id', $categoriesToDelete)->pluck('name')->toArray();
                Category::whereIn('id', $categoriesToDelete)->delete();

                Log::info('Empty categories deleted after product removal', [
                    'product_id' => $id,
                    'deleted_categories' => $deletedCategoryNames,
                    'category_ids' => $categoriesToDelete
                ]);
            }

            // Commit the transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
                'deleted_categories' => !empty($categoriesToDelete) ? count($categoriesToDelete) : 0
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete product: ' . $e->getMessage(), [
                'user_id' => Auth::user()->id,
                'product_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }
}
