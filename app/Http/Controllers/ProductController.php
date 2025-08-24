<?php

namespace App\Http\Controllers;

use App\Models\AmazonImages;
use App\Models\AmazonReview;
use App\Models\AnalyzedData;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use App\Models\SuggestedCategorySet;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JsonException;

class ProductController extends Controller
{
    //'images' => array_values($product->amazonImages->pluck('image_url')->slice(1)->toArray()),
    public function getAllCategoriesWithProducts(Request $request)
    {
        if ($request->query('search')) {
            $searchQuery = $request->query('search');
            $products = Product::with([
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
    public function getMyProductsForAnalyze(Request $request)
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
                    'categories',
                    'amazonReviews',
                    'amazonImages'
                ])
                ->orderBy('created_at', 'desc')
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
                    'analyzed_reports' => $product->analyzedReports->sortByDesc('created_at')->values(),
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
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
    public function getOneProductWithAnalyzedData(Request $request, $id)
    {
        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Find the analyzed report and ensure it belongs to the user's product
            $analyzedReport = AnalyzedData::with([
                'product.categories',
                'product.amazonReviews', // Use snake_case to match your database
                'product.amazonImages'   // Use snake_case to match your database
            ])
            ->where('id', $id)
            ->first();

            if (
                !$analyzedReport ||
                !$analyzedReport->product ||
                $analyzedReport->product->user_id !== $user->id
            ) {
                return response()->json(['error' => 'Analyzed report not found or unauthorized'], 404);
            }

            // Add rating statistics calculation
            $ratingStats = [];
            if ($analyzedReport->product && $analyzedReport->product->amazonReviews) {
                $reviews = $analyzedReport->product->amazonReviews;
                $ratingCounts = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

                foreach ($reviews as $review) {
                    if (isset($ratingCounts[$review->rating])) {
                        $ratingCounts[$review->rating]++;
                    }
                }

                $totalReviews = $reviews->count();
                foreach ($ratingCounts as $rating => $count) {
                    if ($count > 0) {
                        $ratingStats[] = [
                            'rating' => $rating,
                            'count' => $count,
                            'percentage' => round(($count / $totalReviews) * 100, 1)
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'product' => $analyzedReport,
                'rating_statistics' => $ratingStats
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to get product with analyzed data: ' . $e->getMessage(), [
                'user_id' => Auth::user()->id ?? null,
                'analyzed_report_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve product: ' . $e->getMessage()
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
        public function generateAnalyzedReport(Request $request, $id)
{
    set_time_limit(600); // Increase PHP timeout to 10 minutes

    try {
        // Get the authenticated user
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get product with only essential data (no images)
        $product = Product::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['amazonReviews:id,product_id,reviewer_name,rating,comment', 'categories:id,name'])
            ->select('id', 'name', 'description', 'price', 'user_id')
            ->first();

        if (!$product) {
            return response()->json(['error' => 'Product not found or unauthorized'], 404);
        }

        // Prepare minimal structured data for AI analysis
        $reviews = $product->amazonReviews->toArray();
        $categories = $product->categories->pluck('name')->toArray();

        // Calculate basic statistics
        $totalReviews = count($reviews);
        $ratingCounts = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        $averageRating = 0;

        if ($totalReviews > 0) {
            foreach ($reviews as $review) {
                $rating = (int)$review['rating'];
                if ($rating >= 1 && $rating <= 5) {
                    $ratingCounts[$rating]++;
                }
            }
            $averageRating = array_sum(array_map(function($rating, $count) {
                return $rating * $count;
            }, array_keys($ratingCounts), $ratingCounts)) / $totalReviews;
        }

        // Limit reviews for AI processing (take a balanced sample)
        $positiveReviews = array_filter($reviews, fn($r) => $r['rating'] >= 4);
        $neutralReviews = array_filter($reviews, fn($r) => $r['rating'] == 3);
        $negativeReviews = array_filter($reviews, fn($r) => $r['rating'] <= 2);

        $sampleReviews = array_merge(
            array_slice($positiveReviews, 0, 15),  // 15 positive
            array_slice($neutralReviews, 0, 5),   // 5 neutral
            array_slice($negativeReviews, 0, 10)  // 10 negative
        );

        // Create essential product data structure
        $essentialProductData = [
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'categories' => $categories,
            'total_reviews' => $totalReviews,
            'average_rating' => round($averageRating, 2),
            'rating_distribution' => $ratingCounts,
            'sample_reviews' => array_slice($sampleReviews, 0, 30), // Max 30 reviews for analysis
        ];

        // Create comprehensive AI prompt with proper markdown formatting
        $aiPrompt = "Analyze this product and generate a professional analysis report.

PRODUCT INFO:
Name: {$essentialProductData['name']}
Description: {$product->description}
Price: {$essentialProductData['price']}
Categories: " . implode(', ', $categories) . "

REVIEW STATISTICS:
Total Reviews: {$totalReviews}
Average Rating: {$essentialProductData['average_rating']}/5.0
5-Star: {$ratingCounts[5]} ({$this->getPercentage($ratingCounts[5], $totalReviews)}%)
4-Star: {$ratingCounts[4]} ({$this->getPercentage($ratingCounts[4], $totalReviews)}%)
3-Star: {$ratingCounts[3]} ({$this->getPercentage($ratingCounts[3], $totalReviews)}%)
2-Star: {$ratingCounts[2]} ({$this->getPercentage($ratingCounts[2], $totalReviews)}%)
1-Star: {$ratingCounts[1]} ({$this->getPercentage($ratingCounts[1], $totalReviews)}%)

SAMPLE REVIEWS FOR ANALYSIS:
" . $this->formatReviewsForAI($sampleReviews) . "

Generate ONLY this JSON response with proper markdown formatting:
{
\"title\": \"[Engaging professional title about the product]\",
\"summary\": \"[2-3 sentence executive summary]\",
\"full_report\": \"# Review Quality Assessment\n\n## Review Analysis Summary\n\n[Brief analysis summary]\n\n## Review Distribution\n\n- **5 Stars**: {$this->getPercentage($ratingCounts[5], $totalReviews)}% ({$ratingCounts[5]} reviews)\n- **4 Stars**: {$this->getPercentage($ratingCounts[4], $totalReviews)}% ({$ratingCounts[4]} reviews)\n- **3 Stars**: {$this->getPercentage($ratingCounts[3], $totalReviews)}% ({$ratingCounts[3]} reviews)\n- **2 Stars**: {$this->getPercentage($ratingCounts[2], $totalReviews)}% ({$ratingCounts[2]} reviews)\n- **1 Star**: {$this->getPercentage($ratingCounts[1], $totalReviews)}% ({$ratingCounts[1]} reviews)\n\n## Quality Indicators\n\n### Most Praised Features\n\n1. **[Feature]** - Mentioned in X% of positive reviews\n2. **[Feature]** - Highlighted by reviewers\n3. **[Feature]** - Appreciated by customers\n\n### Common Concerns\n\n1. **[Issue]** - X% of reviews\n2. **[Issue]** - Mentioned by customers\n3. **[Issue]** - Area for improvement\n\n## Review Authenticity Assessment\n\n- **Total Reviews Analyzed**: {$totalReviews}\n- **Average Rating**: {$essentialProductData['average_rating']}/5.0\n- **Review Quality**: [Assessment based on review content]\n\n## Quality Improvement Recommendations\n\n1. [Recommendation based on feedback]\n2. [Improvement suggestion]\n3. [Action item]\n4. [Enhancement opportunity]\n5. [Quality measure]\n\n## Overall Quality Score: [X.X]/10\",
\"rating\": {$essentialProductData['average_rating']}
}";

        // Make request to Ollama with optimized settings
        $ollamaResponse = Http::timeout(180) // 3 minutes timeout
            ->withOptions([
                'connect_timeout' => 30,
                'read_timeout' => 180,
            ])
            ->post('http://localhost:11434/api/generate', [
                'model' => 'llama3.2',
                'prompt' => $aiPrompt,
                'stream' => false,
                'options' => [
                    'num_predict' => 1500, // Limit response length for faster processing
                    'temperature' => 0.7,
                    'top_p' => 0.9,
                ]
            ]);

        if (!$ollamaResponse->ok()) {
            Log::error('Ollama API Error:', ['response' => $ollamaResponse->body()]);
            return response()->json(['error' => 'AI analysis service temporarily unavailable'], 500);
        }

        $aiResponse = $ollamaResponse->json();
        $analysisText = $aiResponse['response'] ?? '';

        // Clean up the AI response to extract JSON
        $analysisData = null;

        // Try to find JSON in the response
        if (preg_match('/\{.*\}/s', $analysisText, $matches)) {
            $jsonString = $matches[0];

            // Clean up common issues with AI-generated JSON
            $jsonString = preg_replace('/\\n/', '\\n', $jsonString);
            $jsonString = preg_replace('/\\r/', '', $jsonString);

            try {
                $analysisData = json_decode($jsonString, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException $e) {
                Log::error('JSON parsing error: ' . $e->getMessage());
                $analysisData = null;
            }
        }

        // Fallback if JSON parsing fails
        if (!$analysisData || !isset($analysisData['full_report'])) {
            // Create a clean markdown report
            $cleanReport = "# Product Analysis Report\n\n";
            $cleanReport .= "## Overview\n\n";
            $cleanReport .= "This is a comprehensive analysis of the product based on customer reviews and feedback.\n\n";
            $cleanReport .= "## Review Statistics\n\n";
            $cleanReport .= "- **Total Reviews**: {$totalReviews}\n";
            $cleanReport .= "- **Average Rating**: " . round($averageRating, 2) . "/5.0\n\n";
            $cleanReport .= "## Rating Distribution\n\n";
            foreach ($ratingCounts as $rating => $count) {
                $percentage = $totalReviews > 0 ? round(($count / $totalReviews) * 100, 1) : 0;
                $cleanReport .= "- **{$rating} Stars**: {$percentage}% ({$count} reviews)\n";
            }
            $cleanReport .= "\n## Analysis Summary\n\n";
            $cleanReport .= strip_tags($analysisText) ?: "Unable to generate detailed analysis at this time.";

            $analysisData = [
                'title' => 'Product Performance Analysis - ' . substr($product->name, 0, 50),
                'summary' => 'Comprehensive analysis of customer feedback and product performance metrics based on ' . $totalReviews . ' reviews.',
                'full_report' => $cleanReport,
                'rating' => round($averageRating, 2),
                'overall_score' => round($averageRating * 2, 1)
            ];
        }

        // Save the analysis to database
        $analyzedData = AnalyzedData::create([
            'product_id' => $id,
            'title' => $analysisData['title'],
            'summary' => $analysisData['summary'],
            'full_report' => $analysisData['full_report'],
            'rating' => $analysisData['rating'],
            'generated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Analysis generated successfully',
            'analysis' => $analyzedData,
            'overall_score' => $analysisData['overall_score'] ?? null
        ], 201);

    } catch (\Exception $e) {
        Log::error('Failed to generate analyzed report: ' . $e->getMessage(), [
            'user_id' => Auth::user()->id ?? null,
            'product_id' => $id,
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Failed to generate analysis: ' . $e->getMessage()
        ], 500);
    }
}

// Helper method to calculate percentage
    private function getPercentage($count, $total)
    {
        return $total > 0 ? round(($count / $total) * 100, 1) : 0;
    }

    // Helper method to format reviews for AI
    private function formatReviewsForAI($reviews)
    {
        $formatted = "";
        foreach ($reviews as $index => $review) {
            $formatted .= ($index + 1) . ". Rating: {$review['rating']}/5 - \"{$review['comment']}\"\n";
        }
        return $formatted;
    }

    public function deleteReport(Request $request, $id)
    {
        $report = AnalyzedData::find($id);
        if (!$report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        // Delete the report
        $report->delete();
        return response()->json(['success' => true, 'message' => 'Report deleted successfully']);
    }
    public function downloadPDF($reportId)
{
    try {
        // Fetch the product data
        $product = $this->getAnalyzedReport($reportId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        // Calculate rating statistics for the charts
        $ratingStats = $this->calculateRatingStats($product);

        // Prepare data for the view
        $data = [
            'product' => $product,
            'ratingStats' => $ratingStats,
            'generatedAt' => now()->format('F j, Y \a\t g:i A')
        ];

        // Load the view and generate PDF
        $pdf = Pdf::loadView('reports.product-analysis', $data);

        // Set paper size and orientation with proper margins
        $pdf->setPaper('A4', 'portrait');

        // Enhanced options for better rendering
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'defaultFont' => 'sans-serif',
            'dpi' => 150,
            'fontSubsetting' => true,
            'isRemoteEnabled' => true,
            'javascriptEnabled' => false,
            'debugKeepTemp' => false,
            'debugCss' => false,
            'debugLayout' => false,
            'debugLayoutLines' => false,
            'debugLayoutBlocks' => false,
            'debugLayoutInline' => false,
            'debugLayoutPaddingBox' => false,
            'logOutputFile' => null,
            // Margin settings (these work with @page in CSS)
            'margin_top' => '20mm',
            'margin_right' => '15mm',
            'margin_bottom' => '20mm',
            'margin_left' => '15mm',
        ]);

        // Generate safe filename
        $productName = $product['product']['name'] ?? 'report';
        $safeProductName = preg_replace('/[^A-Za-z0-9\-_]/', '-', $productName);
        $safeProductName = preg_replace('/-+/', '-', $safeProductName);
        $safeProductName = trim($safeProductName, '-');

        $filename = 'product-analysis-' . $safeProductName . '-' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);

    } catch (\Exception $e) {
        Log::error('PDF Generation Error: ' . $e->getMessage(), [
            'reportId' => $reportId,
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Failed to generate PDF',
            'message' => config('app.debug') ? $e->getMessage() : 'An error occurred during PDF generation'
        ], 500);
    }
}

private function calculateRatingStats($product)
{
    $ratingStats = [];

    if (!isset($product['product']['amazon_reviews']) || empty($product['product']['amazon_reviews'])) {
        return $ratingStats;
    }

    $ratingCounts = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
    $reviews = $product['product']['amazon_reviews'];

    // Count ratings
    foreach ($reviews as $review) {
        $rating = (int)($review['rating'] ?? 0);
        if (isset($ratingCounts[$rating])) {
            $ratingCounts[$rating]++;
        }
    }

    $totalReviews = count($reviews);

    if ($totalReviews > 0) {
        // Create stats array in descending order (5 stars to 1 star)
        for ($rating = 5; $rating >= 1; $rating--) {
            $count = $ratingCounts[$rating];
            if ($count > 0) {
                $ratingStats[] = [
                    'rating' => $rating,
                    'count' => $count,
                    'percentage' => round(($count / $totalReviews) * 100, 1)
                ];
            }
        }
    }

    return $ratingStats;
}

private function getAnalyzedReport($reportId)
{
    try {
        // Fetch from AnalyzedData model using reportId
        $analyzedData = AnalyzedData::with(['product.categories'])->find($reportId);

        if (!$analyzedData) {
            return null;
        }

        // Get categories properly
        $categories = [];
        if ($analyzedData->product && $analyzedData->product->categories) {
            foreach ($analyzedData->product->categories as $category) {
                $categories[] = [
                    'name' => $category->name ?? $category
                ];
            }
        }

        return [
            'id' => $analyzedData->id,
            'title' => $analyzedData->title,
            'rating' => $analyzedData->rating,
            'summary' => $analyzedData->summary,
            'full_report' => $analyzedData->full_report,
            'product' => [
                'name' => $analyzedData->product->name ?? 'Unknown Product',
                'price' => $analyzedData->product->price ?? 'N/A',
                'categories' => $categories,
                'amazon_reviews' => $analyzedData->product->amazon_reviews ?? []
            ]
        ];

    } catch (\Exception $e) {
        Log::error('Error fetching analyzed data: ' . $e->getMessage(), [
            'reportId' => $reportId,
            'trace' => $e->getTraceAsString()
        ]);
        return null;
    }
}

// Optional: Add a method to preview the report before PDF generation
public function previewReport($reportId)
{
    try {
        $product = $this->getAnalyzedReport($reportId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $ratingStats = $this->calculateRatingStats($product);

        $data = [
            'product' => $product,
            'ratingStats' => $ratingStats,
            'generatedAt' => now()->format('F j, Y \a\t g:i A')
        ];

        return view('reports.product-analysis', $data);

    } catch (\Exception $e) {
        Log::error('Report Preview Error: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to generate preview'], 500);
    }
}
}
