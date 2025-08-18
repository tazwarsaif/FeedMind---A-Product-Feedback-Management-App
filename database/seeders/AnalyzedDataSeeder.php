<?php

namespace Database\Seeders;

use App\Models\AnalyzedData;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AnalyzedDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing products and users or create them if they don't exist
        $products = Product::all();
        $users = User::where('role_id', 1)->get(); // Get manager users

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Creating some sample products first...');
            $products = Product::factory(10)->create();
        }

        if ($users->isEmpty()) {
            $this->command->warn('No manager users found. Creating a sample manager user...');
            $users = collect([
                User::factory()->create([
                    'role_id' => 1,
                    'name' => 'System Manager',
                    'email' => 'manager@feedmind.com',
                ])
            ]);
        }

        $this->command->info('Creating analyzed data for products...');

        // Create analyzed data for each product
        $products->each(function ($product) use ($users) {
            // Each product gets 1-3 analysis reports
            $numberOfAnalyses = rand(1, 3);

            for ($i = 0; $i < $numberOfAnalyses; $i++) {
                $randomUser = $users->random();

                // Create different types of analyses
                $analysisType = match($i) {
                    0 => 'default', // Standard analysis
                    1 => 'highRating', // High rating analysis
                    2 => 'lowRating', // Low rating analysis for improvement
                    default => 'default'
                };

                $factory = AnalyzedData::factory()
                    ->forProduct($product)
                    ->generatedBy($randomUser);

                // Apply specific state based on analysis type
                if ($analysisType === 'highRating') {
                    $factory = $factory->highRating();
                } elseif ($analysisType === 'lowRating') {
                    $factory = $factory->lowRating();
                }

                $factory->create();

                $this->command->info("Created {$analysisType} analysis for product: {$product->name}");
            }
        });

        // Create some additional random analyzed data
        $this->command->info('Creating additional random analyzed data...');

        AnalyzedData::factory()
            ->count(15)
            ->create()
            ->each(function ($analyzedData) {
                $this->command->info("Created analysis: {$analyzedData->title} for product ID: {$analyzedData->product_id}");
            });

        $totalCount = AnalyzedData::count();
        $this->command->info("✅ Successfully created {$totalCount} analyzed data records!");

        // Display some statistics
        $this->displayStatistics();
    }

    /**
     * Display seeding statistics
     */
    private function displayStatistics(): void
    {
        $this->command->info("\n📊 Seeding Statistics:");

        $stats = [
            'Total Analyzed Data' => AnalyzedData::count(),
            'Products with Analysis' => AnalyzedData::distinct('product_id')->count(),
            'Average Rating' => number_format(AnalyzedData::avg('rating'), 2),
            'Highest Rating' => AnalyzedData::max('rating'),
            'Lowest Rating' => AnalyzedData::min('rating'),
        ];

        foreach ($stats as $label => $value) {
            $this->command->line("  {$label}: {$value}");
        }

        // Show analysis types distribution
        $this->command->info("\n📈 Analysis Types:");
        $analysisTypes = AnalyzedData::selectRaw('title, COUNT(*) as count')
            ->groupBy('title')
            ->orderBy('count', 'desc')
            ->get();

        foreach ($analysisTypes as $type) {
            $this->command->line("  {$type->title}: {$type->count}");
        }
    }
}
