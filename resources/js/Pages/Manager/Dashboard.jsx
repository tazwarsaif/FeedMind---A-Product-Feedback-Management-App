import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";
const Dashboard = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    if (!token) {
        window.location.href = "/login";
    }

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
                    router.visit("/login");
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
    if (user.role_id !== 1) {
        return (
            <div className="min-h-screen flex flex-row justify-center items-center bg-[#39344a]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Unauthorized access</p>
                    <button
                        onClick={() => router.visit("/unauthorized")}
                        className="bg-[#a892fe] hover:bg-[#9581fe] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Go to Unauthorized Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header title={"Dashboard"} />
            <ManagerLayout user={user}>
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
                                    {user?.total_reviews}
                                </p>
                                <p className="text-green-400 text-xs">
                                    Last Review: {user?.first_review_time_diff}
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
                                <p className="text-2xl font-bold text-white">
                                    {user?.number_of_products}
                                </p>
                                <p className="text-blue-400 text-xs">
                                    Last Added: {user?.last_product_time_diff}
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
                                <p className="text-2xl font-bold text-white">
                                    {user?.average_rating}
                                </p>
                                <p className="text-yellow-400 text-xs">
                                    {"★".repeat(
                                        Math.round(user?.average_rating)
                                    )}
                                    {"☆".repeat(
                                        5 - Math.round(user?.average_rating)
                                    )}
                                </p>
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
                                <p className="text-2xl font-bold text-white">
                                    {user?.number_of_analyzed_products}
                                </p>
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
                            {user?.recent_reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="flex items-start space-x-3 p-3 bg-[#39344a] rounded-lg cursor-pointer"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                `review_modal_${review.id}`
                                            )
                                            .showModal()
                                    }
                                >
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">
                                            Product Review #{review.id}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {review.comment.length > 100
                                                ? review.comment.substring(
                                                      0,
                                                      100
                                                  ) + "..."
                                                : review.comment}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="flex text-yellow-400">
                                                {"★".repeat(
                                                    Math.round(review.rating)
                                                )}
                                                {"☆".repeat(
                                                    5 -
                                                        Math.round(
                                                            review.rating
                                                        )
                                                )}
                                            </div>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <dialog
                                            id={`review_modal_${review.id}`}
                                            className="modal"
                                        >
                                            <div className="modal-box bg-[#39344a] text-white">
                                                <form method="dialog">
                                                    {/* if there is a button in form, it will close the modal */}
                                                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                                        ✕
                                                    </button>
                                                </form>
                                                <h3 className="font-bold text-lg">
                                                    <div className="flex text-yellow-400">
                                                        {"★".repeat(
                                                            Math.round(
                                                                review.rating
                                                            )
                                                        )}
                                                        {"☆".repeat(
                                                            5 -
                                                                Math.round(
                                                                    review.rating
                                                                )
                                                        )}
                                                    </div>
                                                </h3>
                                                <p className="py-4">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </dialog>
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
                            <button
                                className="bg-[#a892fe] hover:bg-[#9581fe] text-white p-4 rounded-lg transition-colors text-left cursor-pointer"
                                onClick={() => {
                                    router.visit("/manager/add-product");
                                }}
                            >
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
                            <button className="bg-[#39344a] hover:bg-[#4a4458] text-white p-4 rounded-lg transition-colors text-left cursor-pointer">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M16.862 5.487l1.65-1.65a2.121 2.121 0 10-3-3l-1.65 1.65m2 2l-9.193 9.193a2 2 0 00-.512.878l-1.12 3.36a.5.5 0 00.632.632l3.36-1.12a2 2 0 00.878-.512L18.862 7.487m-2-2l2 2"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M19 14v2m0 4v.01M21 16h-2m-4 0h-.01"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="font-medium">FeedGpt</p>
                                <p className="text-xs opacity-80">
                                    Chat with AI
                                </p>
                            </button>

                            <button
                                className="bg-[#39344a] hover:bg-[#4a4458] text-white p-4 rounded-lg transition-colors text-left cursor-pointer"
                                onClick={() => {
                                    router.visit("/manager/amazon-scrape");
                                }}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M9 12a3 3 0 016 0v6a3 3 0 01-6 0v-6z"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 6V4m0 16v-2m8-6h-2m-12 0H4m14.364-5.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.414l1.414 1.414M17.95 17.95l1.414 1.414"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="font-medium">Amazon Scrape</p>
                                <p className="text-xs opacity-80">
                                    Scrape product data from Amazon
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </ManagerLayout>
        </>
    );
};

export default Dashboard;
