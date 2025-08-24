<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Show the printable version of the report
     */
    public function showPrintableReport($reportId)
    {
        // Get the same data as your original AnalyzedData component
        $product = $this->getProductData($reportId);
        $ratingStats = $this->calculateRatingStats($product);

        return Inertia::render('Reports/PrintableReport', [
            'product' => $product,
            'ratingStats' => $ratingStats,
        ]);
    }

    /**
     * Generate and download PDF
     */
    public function downloadReportPDF($reportId)
    {
        try {
            // Get product data
            $product = $this->getProductData($reportId);
            $ratingStats = $this->calculateRatingStats($product);

            // Generate the printable URL
            $printableUrl = route('reports.printable', $reportId);

            // Create temp directory if it doesn't exist
            $tempDir = storage_path('app/temp/pdfs');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Generate unique filename
            $filename = 'product-analysis-' . $reportId . '-' . time() . '.pdf';
            $filePath = $tempDir . '/' . $filename;

            // Generate PDF using Browsershot (Puppeteer)
            Browsershot::url($printableUrl)
                ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
                ->waitUntilNetworkIdle()
                ->format('A4')
                ->margins(10, 10, 10, 10)
                ->showBackground()
                ->save($filePath);

            // Return the PDF as download
            return response()->download($filePath, $filename, [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Alternative method using HTML string instead of URL
     */
    public function downloadReportPDFFromHTML($reportId)
    {
        try {
            $product = $this->getProductData($reportId);
            $ratingStats = $this->calculateRatingStats($product);

            // Render the component to HTML string
            $html = $this->renderPrintableHTML($product, $ratingStats);

            $filename = 'product-analysis-' . $reportId . '-' . time() . '.pdf';
            $tempPath = storage_path('app/temp/pdfs/' . $filename);

            // Ensure directory exists
            if (!file_exists(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }

            Browsershot::html($html)
                ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
                ->format('A4')
                ->margins(10, 10, 10, 10)
                ->showBackground()
                ->save($tempPath);

            return response()->download($tempPath, $filename, [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product data (replace with your actual data fetching logic)
     */
    private function getProductData($reportId)
    {
        // Replace this with your actual data fetching logic
        // This should match the API call in your React component

        // Example:
        // return Product::with(['amazon_reviews', 'categories'])->find($reportId);

        // For now, returning a placeholder - replace with your actual implementation
        return [
            'id' => $reportId,
            'title' => 'Sample Product Analysis',
            'rating' => 4.2,
            'summary' => 'This is a comprehensive analysis of the product...',
            'full_report' => '# Product Analysis\n\nThis is the detailed analysis...',
            'product' => [
                'name' => 'Sample Product',
                'price' => '$99.99',
                'amazon_reviews' => [
                    ['rating' => 5],
                    ['rating' => 4],
                    ['rating' => 5],
                    ['rating' => 3],
                    ['rating' => 4],
                ],
                'categories' => [
                    ['id' => 1, 'name' => 'Electronics'],
                    ['id' => 2, 'name' => 'Gadgets'],
                ]
            ]
        ];
    }

    /**
     * Calculate rating statistics
     */
    private function calculateRatingStats($product)
    {
        if (!isset($product['product']['amazon_reviews'])) {
            return [];
        }

        $reviews = $product['product']['amazon_reviews'];
        $ratingCounts = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];

        foreach ($reviews as $review) {
            $rating = (int) $review['rating'];
            if (isset($ratingCounts[$rating])) {
                $ratingCounts[$rating]++;
            }
        }

        $totalReviews = count($reviews);
        $chartData = [];

        foreach ($ratingCounts as $rating => $count) {
            if ($count > 0) {
                $chartData[] = [
                    'name' => $rating . ' Star' . ($rating === 1 ? '' : 's'),
                    'value' => $count,
                    'rating' => $rating,
                    'percentage' => round(($count / $totalReviews) * 100, 1),
                ];
            }
        }

        return $chartData;
    }

    /**
     * Render printable HTML (if you choose the HTML string method)
     */
    private function renderPrintableHTML($product, $ratingStats)
    {
        // This is a simplified version - you might want to use a template engine
        // or render the React component server-side

        return view('reports.printable', compact('product', 'ratingStats'))->render();
    }
}
