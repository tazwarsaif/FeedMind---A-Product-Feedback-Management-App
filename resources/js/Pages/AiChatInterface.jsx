import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const AIChatInterface = ({ conversation }) => {
    // Prepare initial messages from conversation prop, fallback to default
    const token = localStorage.getItem("token");
    const [summary, setSummary] = useState("");
    const [summaryLoad, setSummaryLoad] = useState(false);
    const getInitialMessages = () => {
        if (
            conversation &&
            conversation?.messages &&
            conversation?.messages.length > 0
        ) {
            return conversation?.messages.map((msg) => ({
                id: msg?.id,
                content: msg?.content,
                sender: msg?.sender, // Should be 'ai' or 'user'
                timestamp: new Date(msg?.created_at), // Adjust if your API uses a different field
            }));
        }
        return [
            {
                id: 1,
                content: "Hello! I'm FeedMind AI. How can I assist you today?",
                sender: "ai",
                timestamp: new Date(),
            },
        ];
    };

    const [messages, setMessages] = useState(getInitialMessages());
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationTitle, setConversationTitle] = useState(
        conversation?.title || "New Conversation"
    );
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Update messages if conversation prop changes
    useEffect(() => {
        setMessages(getInitialMessages());
        setConversationTitle(conversation?.title || "New Conversation");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            content: inputMessage,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/chat/message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        conversation_id: conversation?.id,
                        prompt: inputMessage,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log(data);

            const aiMessage = {
                id: Date.now() + 1,
                content:
                    data?.botMessage.content ||
                    "Sorry, I didn't understand that.",
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI response error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    content: "Error: Unable to get response from AI.",
                    sender: "ai",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleNewConversation = () => {
        setMessages([
            {
                id: 1,
                content: "Hello! I'm FeedMind AI. How can I assist you today?",
                sender: "ai",
                timestamp: new Date(),
            },
        ]);
        setConversationTitle("New Conversation");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#39344a]">
            {/* Chat header */}
            <div className="border-b border-[#4a4458] p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                    {conversationTitle}
                </h2>
                <div className="flex space-x-2">
                    <div
                        onClick={() =>
                            document
                                .getElementById(
                                    `summary_modal_${conversation?.id}`
                                )
                                .showModal()
                        }
                        className="bg-blue-600 hover:bg-blue-700 p-2 px-3  text-white rounded-lg cursor-pointer"
                    >
                        <svg
                            className="w-6 h-6 text-white-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 2v4M8 2v4"
                            />
                        </svg>
                        <dialog
                            id={`summary_modal_${conversation?.id}`}
                            className="modal modal-bottom sm:modal-middle"
                        >
                            <div className="modal-box bg-[#39344a] text-white">
                                <h3 className="font-bold text-lg">
                                    Summarization of the Conversation
                                </h3>
                                {summary === "" && summaryLoad === false && (
                                    <div>click generate summary</div>
                                )}
                                {summary === "" && summaryLoad === true && (
                                    <span className="loading loading-bars loading-xl"></span>
                                )}
                                {summary !== "" && summaryLoad === false && (
                                    <div>{summary}</div>
                                )}
                                <div className="modal-action">
                                    <button
                                        className="btn bg-violet-300 border-purple-400 hover:text-white hover:bg-[#39344a]"
                                        onClick={() => {
                                            setSummaryLoad(true);
                                            fetch(
                                                `http://127.0.0.1:8000/api/chat/conversation/${conversation?.id}/summary`,
                                                {
                                                    method: "Get",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                        Authorization: `Bearer ${localStorage.getItem(
                                                            "token"
                                                        )}`,
                                                    },
                                                }
                                            )
                                                .then((res) => res.json())
                                                .then((data) => {
                                                    setSummary(data);
                                                    setSummaryLoad(false);
                                                    console.log(data);
                                                })
                                                .catch((err) => {
                                                    setSummaryLoad(false);
                                                    console.error(
                                                        "Failed to start conversation:",
                                                        err
                                                    );
                                                });
                                        }}
                                    >
                                        Generate Summary
                                    </button>
                                    <form
                                        method="dialog"
                                        className="flex space-x-3"
                                    >
                                        {/* if there is a button in form, it will close the modal */}

                                        <button className="btn ">Close</button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </div>
                </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message?.id}
                        className={`flex ${
                            message?.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-3xl rounded-lg px-4 py-3 ${
                                message?.sender === "user"
                                    ? "bg-[#a892fe] text-white"
                                    : "bg-[#4a4458] text-gray-200"
                            }`}
                        >
                            <div className="flex items-start space-x-2">
                                {message?.sender === "ai" && (
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                        AI
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="whitespace-pre-wrap">
                                        {message?.content}
                                    </div>
                                    <div className="text-xs mt-1 opacity-70">
                                        {message?.timestamp.toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </div>
                                </div>
                                {message?.sender === "user" && (
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                        Y
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-3xl rounded-lg px-4 py-3 bg-[#4a4458] text-gray-200">
                            <div className="flex space-x-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                    AI
                                </div>
                                <div className="flex items-center space-x-1">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="w-2 h-2 bg-gray-300 rounded-full"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.2,
                                        }}
                                        className="w-2 h-2 bg-gray-300 rounded-full"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.4,
                                        }}
                                        className="w-2 h-2 bg-gray-300 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[#4a4458] p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Message FeedMind AI..."
                            className="w-full bg-[#4a4458] border border-[#5a546a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        {isTyping && (
                            <div className="absolute right-3 top-3 flex items-center">
                                <span className="text-xs text-gray-400 mr-2">
                                    AI is typing
                                </span>
                                <div className="flex space-x-1">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.2,
                                        }}
                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.4,
                                        }}
                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-[#a892fe] hover:bg-[#9c83fd] text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </form>
                <div className="mt-2 text-xs text-gray-400 text-center">
                    FeedMind AI may produce inaccurate information. Consider
                    verifying important details.
                </div>
            </div>
        </div>
    );
};

export default AIChatInterface;
