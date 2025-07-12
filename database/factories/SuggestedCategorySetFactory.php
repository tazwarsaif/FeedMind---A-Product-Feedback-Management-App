<?php

namespace Database\Factories;

use App\Models\SuggestedCategorySet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SuggestedCategorySet>
 */
class SuggestedCategorySetFactory extends Factory
{
    protected $model = SuggestedCategorySet::class;

    // Full category list you gave
    protected $allCategories = [
        "bottles",
        "button-down shirts",
        "casual",
        "cell phones",
        "cell phones & accessories",
        "clothing",
        "clothing, shoes & jewelry",
        "computers & accessories",
        "computers & tablets",
        "cookware",
        "cookware sets",
        "dining & entertaining",
        "dresses",
        "electronics",
        "flatware",
        "flatware sets",
        "home & kitchen",
        "kitchen & dining",
        "kitchen knives & accessories",
        "kitchen utensils & gadgets",
        "knife block sets",
        "laptops",
        "men",
        "oil sprayers & dispensers",
        "shirts",
        "steak sets",
        "traditional laptops",
        "women",
    ];

    public function definition()
    {
        // Pick 5 unique random categories
        $categories = collect($this->allCategories)->random(5)->values()->all();

        return [
            'name' => 'Suggested Set: ' . implode(', ', array_slice($categories, 0, 3)) . '...', // first 3 for brevity
            'categories' => $categories,
        ];
    }
}
