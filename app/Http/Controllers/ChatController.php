<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Panther\Client;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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

    /////
    public function index()
    {
        $conversations = Auth::user()->conversations()->latest()->get();
        return response()->json(["Conversation"=>$conversations]);
    }

    public function startConversation(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255']);
        $user = Auth::user();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => $request->title,
        ]);

        return response()->json($conversation);
    }

    public function getConversation($id)
    {
        $conversation = Conversation::with('messages')->where('user_id', Auth::user()->id)->findOrFail($id);
        return response()->json($conversation);
    }
    public function getConversationSummary($id)
    {
        $conversation = Conversation::with('messages')->where('user_id', Auth::user()->id)->findOrFail($id);
        $aiPrompt = json_encode($conversation) .
                "\n\nSummarize the whole conversation, read the messages and tell a brief and concise summarization, don't have to include the id and timestamps.";

        $ollamaResponse = Http::timeout(120)->post('http://localhost:11434/api/generate', [
                'model' => 'llama3.2',
                'prompt' => $aiPrompt,
                'stream' => false,
        ]);
        $aiData = $ollamaResponse->json();
        return response()->json($aiData["response"]);
    }

    public function sendMessage(Request $request)
    {
        try {
            $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'prompt' => 'required|string',
            ]);
            $user = Auth::user();
            $conversation = Conversation::where('user_id', $user->id)->findOrFail($request->conversation_id);

            // Save user message
            $userMsg = $conversation->messages()->create([
            'sender' => 'user',
            'content' => $request->prompt,
            ]);

            // Fetch chat history for context (optional)
            $chatHistory = $conversation->messages()->orderBy('created_at')->get();

            $formattedMessages = $chatHistory->map(function ($msg) {
            return [
                'role' => $msg->sender === 'user' ? 'user' : 'assistant',
                'content' => $msg->content,
            ];
            });

            // Call Ollama API
            $response = Http::post('http://localhost:11434/api/chat', [
            'model' => 'llama3.2',
            'messages' => $formattedMessages->toArray(),
            'stream' => false,
            ]);

            $aiReply = $response->json()['message']['content'] ?? 'Sorry, I couldn\'t generate a response.';

            // Save bot message
            $botMsg = $conversation->messages()->create([
            'sender' => 'bot',
            'content' => $aiReply,
            ]);

            return response()->json([
            'userMessage' => $userMsg,
            'botMessage' => $botMsg,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Conversation not found'], 404);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            return response()->json(['error' => 'Failed to connect to AI service'], 502);
        } catch (\Throwable $e) {
            Log::error('Error in sendMessage: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
