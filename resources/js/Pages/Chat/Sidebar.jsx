import { useState } from "react";

export default function Sidebar({ conversations, onSelect, onNew }) {
    const [newTitle, setNewTitle] = useState("");

    const createConversation = () => {
        if (newTitle.trim()) {
            onNew(newTitle);
            setNewTitle("");
        }
    };

    return (
        <div className="w-64 bg-gray-100 p-4 border-r overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            <div className="space-y-2">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className="block w-full text-left p-2 hover:bg-gray-200 rounded"
                    >
                        {conv.title}
                    </button>
                ))}
            </div>
            <div className="mt-6">
                <input
                    type="text"
                    placeholder="New title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={createConversation}
                    className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    New Conversation
                </button>
            </div>
        </div>
    );
}
