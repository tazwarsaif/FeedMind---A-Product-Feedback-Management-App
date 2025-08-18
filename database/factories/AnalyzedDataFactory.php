<?php

namespace Database\Factories;

use App\Models\AnalyzedData;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AnalyzedData>
 */
class AnalyzedDataFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AnalyzedData::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Sample analysis templates for different types of products
        $analysisTemplates = [
            [
                'title' => 'Customer Sentiment Analysis Report',
                'summary' => 'Overall positive customer response with high satisfaction ratings. Key strengths include build quality and value for money. Minor concerns raised about shipping and packaging.',
                'full_report' => $this->generateDetailedReport('sentiment'),
                'rating' => $this->faker->randomFloat(2, 3.5, 5.0),
            ],
            [
                'title' => 'Product Performance Analysis',
                'summary' => 'Strong performance metrics across key indicators. Product meets or exceeds customer expectations in most categories. Recommended for continued promotion.',
                'full_report' => $this->generateDetailedReport('performance'),
                'rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            ],
            [
                'title' => 'Competitive Market Analysis',
                'summary' => 'Product maintains competitive advantage in pricing and features. Market position is strong with room for growth in specific demographics.',
                'full_report' => $this->generateDetailedReport('market'),
                'rating' => $this->faker->randomFloat(2, 3.8, 4.8),
            ],
            [
                'title' => 'Review Quality Assessment',
                'summary' => 'Reviews indicate high customer satisfaction with consistent praise for key features. Few negative reviews mainly focus on delivery issues rather than product quality.',
                'full_report' => $this->generateDetailedReport('quality'),
                'rating' => $this->faker->randomFloat(2, 4.2, 5.0),
            ],
        ];

        $template = $this->faker->randomElement($analysisTemplates);

        return [
            'product_id' => Product::inRandomOrder()->first()?->id ?? 1,
            'title' => $template['title'],
            'summary' => $template['summary'],
            'full_report' => $template['full_report'],
            'rating' => $template['rating'],
            'generated_by' => User::where('role_id', 1)->inRandomOrder()->first()?->id ?? 1,
        ];
    }

    /**
     * Generate detailed report based on analysis type
     */
    private function generateDetailedReport(string $type): string
    {
        $reports = [
            'sentiment' => $this->generateSentimentReport(),
            'performance' => $this->generatePerformanceReport(),
            'market' => $this->generateMarketReport(),
            'quality' => $this->generateQualityReport(),
        ];

        return $reports[$type] ?? $this->generateSentimentReport();
    }

    private function generateSentimentReport(): string
    {
        return "## Customer Sentiment Analysis

### Overview
This analysis examines customer feedback and sentiment patterns based on {$this->faker->numberBetween(50, 200)} reviews collected over the past {$this->faker->numberBetween(3, 12)} months.

### Key Findings

#### Positive Sentiments ({$this->faker->numberBetween(65, 85)}%)
- **Quality & Durability**: Customers consistently praise the build quality and long-lasting performance
- **Value for Money**: High satisfaction with price-to-quality ratio
- **Ease of Use**: Users appreciate the intuitive design and functionality
- **Customer Service**: Positive interactions with support team

#### Neutral Sentiments ({$this->faker->numberBetween(10, 20)}%)
- **Average Performance**: Meets expectations but doesn't exceed them
- **Standard Features**: Basic functionality as advertised

#### Negative Sentiments ({$this->faker->numberBetween(5, 15)}%)
- **Shipping Issues**: Delays and packaging concerns
- **Size/Fit**: Some discrepancies with product descriptions
- **Documentation**: Instructions could be clearer

### Recommendations
1. Address shipping and packaging concerns with logistics partners
2. Improve product documentation and setup guides
3. Leverage positive feedback in marketing materials
4. Monitor sentiment trends monthly for early issue detection

### Sentiment Score: {$this->faker->randomFloat(2, 7.5, 9.5)}/10";
    }

    private function generatePerformanceReport(): string
    {
        return "## Product Performance Analysis

### Performance Metrics

#### Sales Performance
- **Monthly Sales Growth**: {$this->faker->numberBetween(5, 25)}%
- **Return Rate**: {$this->faker->randomFloat(2, 1.5, 5.0)}%
- **Repeat Purchase Rate**: {$this->faker->numberBetween(15, 35)}%

#### Customer Engagement
- **Average Review Rating**: {$this->faker->randomFloat(1, 4.0, 5.0)}/5.0
- **Review Volume**: {$this->faker->numberBetween(50, 300)} reviews
- **Photo/Video Reviews**: {$this->faker->numberBetween(15, 40)}% of total reviews

#### Feature Performance
- **Primary Function**: {$this->faker->numberBetween(85, 98)}% satisfaction
- **Design & Aesthetics**: {$this->faker->numberBetween(80, 95)}% satisfaction
- **Durability**: {$this->faker->numberBetween(75, 92)}% satisfaction
- **Value Proposition**: {$this->faker->numberBetween(70, 90)}% satisfaction

### Competitive Comparison
- Ranks #{$this->faker->numberBetween(1, 5)} in category
- {$this->faker->numberBetween(10, 30)}% price advantage over competitors
- Superior ratings in {$this->faker->numberBetween(2, 4)} key categories

### Action Items
1. Optimize product listings based on high-performing keywords
2. Address any quality concerns mentioned in reviews
3. Enhance marketing focus on top-performing features
4. Consider premium variant development

### Overall Performance Score: {$this->faker->numberBetween(75, 95)}/100";
    }

    private function generateMarketReport(): string
    {
        return "## Competitive Market Analysis

### Market Position
Current product holds a {$this->faker->randomElement(['strong', 'moderate', 'emerging'])} position in the {$this->faker->randomElement(['cookware', 'electronics', 'fashion', 'home goods'])} market segment.

### Competitive Landscape
- **Direct Competitors**: {$this->faker->numberBetween(3, 8)} major competitors identified
- **Price Range**: Product positioned in the {$this->faker->randomElement(['budget-friendly', 'mid-range', 'premium'])} segment
- **Market Share**: Estimated {$this->faker->randomFloat(2, 2.5, 15.0)}% of niche market

### SWOT Analysis

#### Strengths
- Competitive pricing strategy
- High customer satisfaction ratings
- Strong brand recognition in target demographic
- Effective distribution channels

#### Weaknesses
- Limited color/variant options
- Seasonal sales fluctuations
- Dependency on online reviews for credibility

#### Opportunities
- Expansion into related product categories
- International market penetration
- Partnership opportunities with influencers
- Subscription/recurring revenue models

#### Threats
- New market entrants with lower prices
- Supply chain disruptions
- Changing consumer preferences
- Economic downturns affecting discretionary spending

### Market Recommendations
1. Develop product line extensions
2. Implement dynamic pricing strategies
3. Strengthen brand differentiation
4. Explore new market segments
5. Enhance customer retention programs

### Market Viability Score: {$this->faker->numberBetween(70, 90)}/100";
    }

    private function generateQualityReport(): string
    {
        return "## Review Quality Assessment

### Review Analysis Summary
Comprehensive analysis of {$this->faker->numberBetween(50, 500)} customer reviews to assess product quality perception and identify improvement opportunities.

### Review Distribution
- **5 Stars**: {$this->faker->numberBetween(40, 70)}%
- **4 Stars**: {$this->faker->numberBetween(15, 30)}%
- **3 Stars**: {$this->faker->numberBetween(5, 15)}%
- **2 Stars**: {$this->faker->numberBetween(2, 8)}%
- **1 Star**: {$this->faker->numberBetween(1, 5)}%

### Quality Indicators

#### Most Praised Features
1. **Build Quality** - Mentioned in {$this->faker->numberBetween(60, 85)}% of positive reviews
2. **Functionality** - Highlighted by {$this->faker->numberBetween(55, 80)}% of reviewers
3. **Design** - Appreciated by {$this->faker->numberBetween(45, 75)}% of customers
4. **Value** - Noted by {$this->faker->numberBetween(50, 70)}% of buyers

#### Common Concerns
1. **Packaging Issues** - {$this->faker->numberBetween(5, 15)}% of reviews
2. **Size Expectations** - {$this->faker->numberBetween(3, 12)}% of feedback
3. **Instructions Clarity** - {$this->faker->numberBetween(2, 10)}% of mentions
4. **Delivery Time** - {$this->faker->numberBetween(4, 8)}% of comments

### Review Authenticity Score
- **Verified Purchases**: {$this->faker->numberBetween(85, 95)}%
- **Detailed Reviews**: {$this->faker->numberBetween(60, 80)}%
- **Photo/Video Content**: {$this->faker->numberBetween(25, 45)}%

### Quality Improvement Recommendations
1. Address packaging concerns to reduce damage during shipping
2. Improve product description accuracy for size/dimensions
3. Create better instructional materials or video guides
4. Implement quality assurance checks before shipment
5. Develop customer education content

### Overall Quality Score: {$this->faker->randomFloat(1, 8.0, 9.5)}/10";
    }

    /**
     * State for existing product
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
        ]);
    }

    /**
     * State for existing user
     */
    public function generatedBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'generated_by' => $user->id,
        ]);
    }

    /**
     * State for high rating analysis
     */
    public function highRating(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'title' => 'Excellent Product Performance Analysis',
            'summary' => 'Outstanding customer satisfaction with exceptional ratings across all categories. Product exceeds expectations and shows strong market potential.',
        ]);
    }

    /**
     * State for low rating analysis
     */
    public function lowRating(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->randomFloat(2, 2.0, 3.5),
            'title' => 'Product Improvement Analysis',
            'summary' => 'Analysis reveals areas for improvement. While the product has potential, customer feedback indicates several concerns that need addressing.',
        ]);
    }
}

//php artisan db:seed --class=AnalyzedDataSeeder
