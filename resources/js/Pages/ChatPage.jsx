import { useEffect, useState } from "react";
import FeedMindLayout from "../Layouts/FeedMindLayout";
import Header from "../Layouts/Header";
import AIChatInterface from "./AiChatInterface";
const ChatPage = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const pathname = window.location.pathname; // "/feedgpt/2"
    const parts = pathname.split("/");
    const conversationId = parts[2];

    useEffect(() => {
        if (!token) {
            router.visit("/unauthorized");
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    router.visit("/unauthorized");
                }
            } catch (error) {
                router.visit("/unauthorized");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        if (!token || !conversationId) return;

        const fetchConversation = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/chat/conversation/${conversationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setConversation(data);
                } else {
                    setConversation(null);
                }
            } catch (error) {
                setConversation(null);
            }
        };

        fetchConversation();
    }, [token, conversationId]);
    // Fetch conversation data
    // useEffect(() => {
    //     if (!token || !conversationId) return;

    //     const fetchConversation = async () => {
    //         try {
    //             const response = await fetch(
    //                 `http://127.0.0.1:8000/api/chat/conversation/${conversationId}`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );
    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setConversation(data);
    //             } else {
    //                 setConversation(null);
    //             }
    //         } catch (error) {
    //             setConversation(null);
    //         }
    //     };

    //     fetchConversation();
    // }, [token, conversationId]);

    // ... rest of your loading and error UI ...

    if (loading) {
        return (
            <div className="min-h-screen flex flex-row justify-center items-center bg-[#39344a]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#a892fe] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-row justify-center items-center bg-[#39344a]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">
                        Unable to load user data
                    </p>
                    <button
                        onClick={() => router.visit("/login")}
                        className="bg-[#a892fe] hover:bg-[#9581fe] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        localStorage.removeItem("token");
        router.visit("/login");
    };

    return (
        <>
            <Header title={"FeedGPT"} />
            <FeedMindLayout user={user}>
                <AIChatInterface conversation={conversation} />
            </FeedMindLayout>
        </>
    );
};

export default ChatPage;
