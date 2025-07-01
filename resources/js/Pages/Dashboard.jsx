import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import FeedMindLayout from "../Layouts/FeedMindLayout";

const Dashboard = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, [token]);

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
    console.log(user);

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

    return (
        <FeedMindLayout user={user}>
            {/* Welcome Section */}
            <div className="bg-[#2c2841] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user.name}! 👋
                        </h1>
                        <p className="text-gray-300">
                            Here's what's happening with your feedback
                            management today.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-[#a892fe] rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-[#2c2841] p-6 rounded-xl border border-[#39344a] hover:border-[#a892fe] transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">
                                Total Reviews
                            </p>
                            <p className="text-2xl font-bold text-white">
                                1,247
                            </p>
                            <p className="text-green-400 text-xs">
                                +12% from last month
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-[#a892fe]/10 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-[#a892fe]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2c2841] p-6 rounded-xl border border-[#39344a] hover:border-[#a892fe] transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">
                                Active Products
                            </p>
                            <p className="text-2xl font-bold text-white">45</p>
                            <p className="text-blue-400 text-xs">
                                3 new this week
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2c2841] p-6 rounded-xl border border-[#39344a] hover:border-[#a892fe] transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">
                                Average Rating
                            </p>
                            <p className="text-2xl font-bold text-white">4.2</p>
                            <p className="text-yellow-400 text-xs">★★★★☆</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2c2841] p-6 rounded-xl border border-[#39344a] hover:border-[#a892fe] transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">
                                AI Insights
                            </p>
                            <p className="text-2xl font-bold text-white">23</p>
                            <p className="text-purple-400 text-xs">
                                New suggestions
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#2c2841] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Recent Reviews
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-start space-x-3 p-3 bg-[#39344a] rounded-lg"
                            >
                                <div className="w-8 h-8 bg-[#a892fe] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-semibold">
                                        U{i}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">
                                        Product Review #{i}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        Great product, very satisfied with the
                                        quality...
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="flex text-yellow-400">
                                            {"★".repeat(5)}
                                        </div>
                                        <span className="text-gray-500 text-xs">
                                            2 hours ago
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#2c2841] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-[#a892fe] hover:bg-[#9581fe] text-white p-4 rounded-lg transition-colors text-left">
                            <svg
                                className="w-6 h-6 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <p className="font-medium">Add Product</p>
                            <p className="text-xs opacity-80">
                                Create new product
                            </p>
                        </button>
                        <button className="bg-[#39344a] hover:bg-[#4a4458] text-white p-4 rounded-lg transition-colors text-left">
                            <svg
                                className="w-6 h-6 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <p className="font-medium">Settings</p>
                            <p className="text-xs opacity-80">
                                Configure dashboard
                            </p>
                        </button>

                        <button className="bg-[#39344a] hover:bg-[#4a4458] text-white p-4 rounded-lg transition-colors text-left">
                            <svg
                                className="w-6 h-6 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <p className="font-medium">Security</p>
                            <p className="text-xs opacity-80">Manage access</p>
                        </button>
                    </div>
                </div>
            </div>
        </FeedMindLayout>
    );
};

export default Dashboard;
