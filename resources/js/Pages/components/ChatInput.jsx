import { useState } from "react";

export default function ChatInput({ onSend, loading }) {
    const [prompt, setPrompt] = useState("");

    const handleSend = () => {
        if (prompt.trim() && !loading) {
            onSend(prompt.trim());
            setPrompt("");
        }
    };

    return (
        <div className="flex items-center gap-2 mt-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 p-2 border rounded"
                rows={2}
                placeholder="Type your message..."
            />
            <button
                onClick={handleSend}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
            >
                Send
            </button>
        </div>
    );
}
