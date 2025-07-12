<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Panther\Client;
use Symfony\Component\DomCrawler\Crawler;
use GuzzleHttp\Client as Guzzle;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Category;
use App\Models\AmazonReview;
use App\Models\AmazonImages;
use Illuminate\Support\Facades\DB;

class ScrapeController extends Controller
{
    public function __invoke(Request $request)
    {
        $url = $request->input('url');

        try {
           $nodePath = "/usr/bin/node"; // get this by running `which node` on your server

            // Build the full path to your Node script
            $scriptPath = base_path('scrapeNodejs/scrapeAmazon.js'); // adjust folder name here

            $escapedUrl = escapeshellarg($url);

            $command = "node {$scriptPath} {$escapedUrl}";


            Log::info("Running shell command: {$command}");

            $output = shell_exec($command);

            Log::info('Node Output:', ['output' => $output]);

            $result = json_decode($output, true);

            if (!$result) {
                throw new \Exception("Invalid scrape result.");
            }
            $arr = [];
            if (!empty($result['reviews']) && !empty($result['individualRatings'])) {
                foreach ($result['reviews'] as $i => $review) {
                    $rating = $result['individualRatings'][$i] ?? null;
                    if ($rating !== null) {
                        $arr[] = [
                            'review' => $review,
                            'rating' => (int)$rating,
                            'reviewer_name' => $result['reviewerNames'][$i] ?? null,
                        ];
                    }
                }
            }

            return response()->json($arr);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Scraping failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // public function __invoke(Request $request)
    // {
    //     $url = $request->input('url');

    //     try {
    //         $client = new Guzzle();
    //         $response = $client->get($url, [
    //             'headers' => [
    //                 'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    //             ]
    //         ]);

    //         $html = (string) $response->getBody();
    //         $crawler = new Crawler($html);

    //         $title = $crawler->filter('title')->text('No Title');
    //         $description = $crawler->filter('meta[name="description"]')->attr('content') ?? '';
    //         $bodyText = $crawler->filter('body')->text();

    //         return response()->json([
    //             'title' => $title,
    //             'description' => $description,
    //             'body' => substr($bodyText, 0, 5000),
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Scraping failed: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }
}
