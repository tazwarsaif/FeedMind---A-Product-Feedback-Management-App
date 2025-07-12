<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SuggestedCategorySet;

class SuggestCategorySetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         SuggestedCategorySet::factory()->count(5)->create();
    }
}
