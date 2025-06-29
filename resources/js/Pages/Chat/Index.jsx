import axios from "axios";
import { useEffect, useState } from "react";
import ChatInput from "../components/ChatInput";
import Message from "./Message";
import Sidebar from "./Sidebar";

export default function Index({ conversations }) {
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selected) {
            axios
                .get(`/api/chat/conversation/${selected.id}`)
                .then((res) => setMessages(res.data.messages))
                .catch(console.error);
        }
    }, [selected]);

    const sendPrompt = async (prompt) => {
        if (!selected) return;

        setLoading(true);
        try {
            const res = await axios.post("/api/chat/message", {
                conversation_id: selected.id,
                prompt,
            });

            setMessages((prev) => [
                ...prev,
                res.data.userMessage,
                res.data.botMessage,
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar
                conversations={conversations}
                onSelect={setSelected}
                onNew={async (title) => {
                    const res = await axios.post("/api/chat/start", { title });
                    setSelected(res.data);
                }}
            />
            <div className="flex-1 p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-2">
                    {selected?.title || "Select or create a conversation"}
                </h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {messages.map((msg) => (
                        <Message
                            key={msg.id}
                            sender={msg.sender}
                            content={msg.content}
                        />
                    ))}
                </div>
                {selected && (
                    <ChatInput onSend={sendPrompt} loading={loading} />
                )}
            </div>
        </div>
    );
}
