<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Panther\Client;

class ChatController extends Controller
{
   public function message(Request $request)
        {
            set_time_limit(300);
            $prompt = $request->input('prompt');
            $scriptPath = base_path('scrapeNodejs/scrapeAmazon.js');
            $escapedUrl = escapeshellarg($prompt);
            $command = "node {$scriptPath} {$escapedUrl}";
            Log::info("Running shell command: {$command}");

            $output = shell_exec($command);
            Log::info('Node Output:', ['output' => $output]);

            $scrapedData = json_decode($output, true);

            if (!is_array($scrapedData)) {
                return response()->json(['error' => 'Failed to parse scraped data'], 500);
            }

            $aiPrompt = json_encode($scrapedData) .
                "\n\nReview this product: what it is, tell me about the rating that what is the average rating or stars based on the review, tell me the good sides and bad sides of the product according to the review, point them out if necessary or possible.";

            $ollamaResponse = Http::timeout(120)->post('http://localhost:11434/api/generate', [
                'model' => 'llama3.2',
                'prompt' => $aiPrompt,
                'stream' => false,
            ]);

            $aiData = $ollamaResponse->json();

            $images = $scrapedData['images'] ?? [];
            $remainingImages = array_slice($images, 1);

            return response()->json([
                'summary' => $aiData['response'] ?? 'No AI response',
                'images' => $remainingImages,
            ]);
        }

   public function scrape(Request $request)
    {
        $response = Http::get('https://api.scraperapi.com', [
            'api_key' => 'YOUR_KEY',
            'url' => $request->input('url')
        ]);
        $html = $response->body();
        return response()->json($html);
    }
}
