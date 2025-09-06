<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Panther\Client;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\AiCachedSummary;

class ChatController extends Controller
{
   public function message(Request $request)
    {
        set_time_limit(300); // PHP script execution timeout

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
            "\n\nReview this product: what it is, tell me about the rating, good and bad sides according to the review, etc.";

        try {
            $ollamaResponse = Http::timeout(120)
                ->withOptions([
                    'connect_timeout' => 30,
                    'read_timeout' => 120,
                ])
                ->post('http://localhost:11434/api/generate', [
                    'model' => 'llama3.2',
                    'prompt' => $aiPrompt,
                    'stream' => false,
                ]);

            if (!$ollamaResponse->ok()) {
                Log::error('Ollama API Error:', ['response' => $ollamaResponse->body()]);
                return response()->json(['error' => 'Ollama API failed'], 500);
            }

            $aiData = $ollamaResponse->json();
        } catch (\Exception $e) {
            Log::error('Ollama request exception:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'AI request failed'], 500);
        }

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
        set_time_limit(300);
        $conversation = Conversation::with('messages')->where('user_id', Auth::user()->id)->findOrFail($id);
        $aiPrompt = json_encode($conversation) .
                "\n\nSummarize the whole conversation, read the messages and tell a brief and concise summarization, don't have to include the id and timestamps.";

        try {
            $ollamaResponse = Http::timeout(120)
                ->withOptions([
                    'connect_timeout' => 30,
                    'read_timeout' => 120,
                ])
                ->post('http://localhost:11434/api/generate', [
                    'model' => 'llama3.2',
                    'prompt' => $aiPrompt,
                    'stream' => false,
                ]);

            if (!$ollamaResponse->ok()) {
                Log::error('Ollama API Error:', ['response' => $ollamaResponse->body()]);
                return response()->json(['error' => 'Ollama API failed'], 500);
            }

            $aiData = $ollamaResponse->json();
        } catch (\Exception $e) {
            Log::error('Ollama request exception:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'AI request failed'], 500);
        }
        $aiData = $ollamaResponse->json();
        return response()->json($aiData["response"]);
    }
    public function deleteConv(Request $request){
        $id = $request->id;
        $conversation = Conversation::where('id', $id);
        $conversation->delete();
        return response()->json(["message"=>"deleted successfully"]);

    }

    public function sendMessage(Request $request){
        set_time_limit(300);

        try {
            $request->validate([
                'conversation_id' => 'required|exists:conversations,id',
                'prompt' => 'required|string',
            ]);

            $user = Auth::user();

            $conversation = Conversation::where('user_id', $user->id)
                ->findOrFail($request->conversation_id);

            $userMsg = $conversation->messages()->create([
                'sender' => 'user',
                'content' => $request->prompt,
            ]);


            $currentHistory = $conversation->messages()->orderBy('created_at')->get();

            //get 10 most recent summaries from other conversations
            $previousSummaries = AiCachedSummary::where('user_id', $user->id)
                ->where('conversation_id', '!=', $conversation->id)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->sortBy('created_at');

            //merge summaries as plain strings
            $summaryText = $previousSummaries->map(function ($summary) {
                return "Summary: " . $summary->summary;
            })->implode("\n");

            //convert current conversation to plain text
            $currentText = $currentHistory->map(function ($msg) {
                return ucfirst($msg->sender) . ": " . $msg->content;
            })->implode("\n");

            //formatted string for chat context
            $combinedContext = $summaryText . "\n\n" . $currentText;

            $response = Http::timeout(120)
                ->withOptions([
                    'connect_timeout' => 30,
                    'read_timeout' => 120,
                ])
                ->post('http://localhost:11434/api/chat', [
                    'model' => 'llama3.2',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "You are a helpful assistant. Use the context provided to generate a relevant response but you do not have to tell about your internal processes. Do not include anything like 'Bot:' stuffs to your response. If the user asks for a summary, provide a concise summary of the conversation. Do not include redundant information or timestamps.",
                        ],
                        [
                            'role' => 'user',
                            'content' => "This is the context for you to understand user's relevance to the conversation: ".$combinedContext. "\n\n" .
                                "This is the current text: " . $userMsg->content. "\n\n" .
                                "Now, please generate a response based on the context and the user's message.",
                        ]
                    ],
                    'stream' => false,
                ]);

            $aiReply = $response->json()['message']['content'] ?? 'Sorry, I couldn\'t generate a response.';

            //save the bot reply
            $botMsg = $conversation->messages()->create([
                'sender' => 'bot',
                'content' => $aiReply,
            ]);

            //summary prompt
            $aiPrompt = $currentText .
                "\n\nSummarize this conversation in under 80 words. Extract the user's name (if mentioned), preferences, interests, and any relevant facts that help understand the user's context. Do not include timestamps or IDs.";

            $ollamaResponse = Http::timeout(120)
                ->withOptions([
                    'connect_timeout' => 30,
                    'read_timeout' => 120,
                ])
                ->post('http://localhost:11434/api/generate', [
                    'model' => 'llama3.2',
                    'prompt' => $aiPrompt,
                    'stream' => false,
                ]);

            $aiData = $ollamaResponse->json();
            $aisummary = $aiData['response'] ?? 'No AI response';

            //save or update the summary for this conversation
            AiCachedSummary::updateOrCreate(
                ['conversation_id' => $conversation->id],
                [
                    'user_id' => $user->id,
                    'summary' => $aisummary,
                ]
            );

            return response()->json([
                'userMessage' => $userMsg,
                'botMessage' => $botMsg,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            return response()->json(['error' => 'Failed to connect to AI service'], 502);
        } catch (\Throwable $e) {
            Log::error('Error in sendMessage: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }


}
