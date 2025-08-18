import axios from "axios";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";

const AnalyzedData = ({ reportId = null }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [product, setProduct] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState("");
    const [summaryLoad, setSummaryLoad] = useState(false);
    const [ratingStats, setRatingStats] = useState([]);

    // Colors for the pie chart
    const RATING_COLORS = {
        5: "#10b981", // green
        4: "#84cc16", // lime
        3: "#f59e0b", // amber
        2: "#f97316", // orange
        1: "#ef4444", // red
    };

    const fetchProduct = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingProducts(true);
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/analyzed-report/${reportId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProduct(response.data.product || {});

            // Calculate rating statistics for pie chart
            if (response.data.product?.product?.amazon_reviews) {
                const reviews = response.data.product.product.amazon_reviews;
                const ratingCounts = {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0,
                };

                reviews.forEach((review) => {
                    const rating = review.rating.toString();
                    if (ratingCounts.hasOwnProperty(rating)) {
                        ratingCounts[rating]++;
                    }
                });

                const chartData = Object.entries(ratingCounts)
                    .filter(([_, count]) => count > 0) // Only include ratings that have reviews
                    .map(([rating, count]) => ({
                        name: `${rating} Star${rating === "1" ? "" : "s"}`,
                        value: count,
                        rating: rating,
                        percentage: ((count / reviews.length) * 100).toFixed(1),
                    }));

                setRatingStats(chartData);
            }

            console.log("Fetched product:", response.data.product);
        } catch (err) {
            setError("Failed to load products");
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Function to generate analysis report for a product
    const generateAnalysis = async (productId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setSummaryLoad(true);
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/generate-product-analysis/${productId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Update the product with the analysis
            setProduct((prevProduct) =>
                prevProduct.id === productId
                    ? { ...prevProduct, analysis: response.data.analysis }
                    : prevProduct
            );
        } catch (err) {
            console.error("Failed to generate analysis:", err);
            setError("Failed to generate analysis");
        } finally {
            setSummaryLoad(false);
        }
    };

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload[0]) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-semibold">{data.name}</p>
                    <p className="text-gray-300">Count: {data.value}</p>
                    <p className="text-gray-300">
                        Percentage: {data.percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    useEffect(() => {
        // Fetch user info
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/unauthorized";
            return;
        }
        axios
            .get("http://127.0.0.1:8000/api/user", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUser(res.data))
            .catch(() => (window.location.href = "/unauthorized"))
            .finally(() => setLoadingUser(false));
    }, []);

    useEffect(() => {
        if (user) {
            fetchProduct();
        }
    }, [user]);

    if (loadingUser) {
        return (
            <div className="min-h-screen flex flex-row justify-center items-center bg-[#39344a]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#a892fe] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-300">Loading user...</p>
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
                        onClick={() => (window.location.href = "/login")}
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
                        onClick={() => (window.location.href = "/unauthorized")}
                        className="bg-[#a892fe] hover:bg-[#9581fe] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Go to Unauthorized Page
                    </button>
                </div>
            </div>
        );
    }

    if (loadingProducts) {
        return (
            <>
                <Header title={"Analyze"} />
                <ManagerLayout user={user}>
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-12 h-12 border-4 border-[#a892fe] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-300">
                                Loading product analysis...
                            </p>
                        </div>
                    </div>
                </ManagerLayout>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header title={"Analyze"} />
                <ManagerLayout user={user}>
                    <div className="p-6">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={() => fetchProduct()}
                                className="bg-[#a892fe] hover:bg-[#9581fe] text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </ManagerLayout>
            </>
        );
    }

    return (
        <>
            <Header title={"Analyze"} />
            <ManagerLayout user={user}>
                <div className="p-6 bg-[#39344a] min-h-screen">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-purple-300 mb-2">
                            {product?.title || "Product Analysis"}
                        </h1>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                                Rating: {product?.rating || "N/A"}/5.0
                            </span>
                            <span className="text-gray-300">
                                Product:{" "}
                                {product?.product?.name || "Unknown Product"}
                            </span>
                        </div>
                        <hr className="border-gray-600" />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Full Report Section - Takes 2 columns */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                                <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                                    Detailed Analysis Report
                                </h2>
                                <div className="prose prose-invert max-w-none">
                                    {product?.full_report ? (
                                        <div className="text-gray-300 leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <h1
                                                            className="text-2xl font-bold text-purple-300 mt-6 mb-4"
                                                            {...props}
                                                        />
                                                    ),
                                                    h2: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <h2
                                                            className="text-xl font-semibold text-purple-300 mt-5 mb-3"
                                                            {...props}
                                                        />
                                                    ),
                                                    h3: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <h3
                                                            className="text-lg font-semibold text-purple-200 mt-4 mb-2"
                                                            {...props}
                                                        />
                                                    ),
                                                    h4: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <h4
                                                            className="text-md font-semibold text-purple-200 mt-3 mb-2"
                                                            {...props}
                                                        />
                                                    ),
                                                    ul: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <ul
                                                            className="list-disc pl-6 mb-4 space-y-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    ol: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <ol
                                                            className="list-decimal pl-6 mb-4 space-y-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    li: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <li
                                                            className="text-gray-300"
                                                            {...props}
                                                        />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p
                                                            className="mb-4 text-gray-300"
                                                            {...props}
                                                        />
                                                    ),
                                                    strong: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <strong
                                                            className="text-white font-semibold"
                                                            {...props}
                                                        />
                                                    ),
                                                    code: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <code
                                                            className="bg-gray-700 px-2 py-1 rounded text-purple-200"
                                                            {...props}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {product.full_report}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">
                                            No detailed report available
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rating Distribution Chart - Takes 1 column */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                                <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                                    Rating Distribution
                                </h2>
                                {ratingStats.length > 0 ? (
                                    <div className="h-80">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={ratingStats}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    label={({
                                                        name,
                                                        percentage,
                                                    }) => `${percentage}%`}
                                                    labelLine={false}
                                                >
                                                    {ratingStats.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    RATING_COLORS[
                                                                        entry
                                                                            .rating
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    wrapperStyle={{
                                                        color: "#d1d5db",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center">
                                        No rating data available
                                    </p>
                                )}
                            </div>

                            {/* Product Info Card */}
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                                <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                                    Product Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-purple-300 font-medium">
                                            Price:
                                        </span>
                                        <span className="text-gray-300 ml-2">
                                            {product?.product?.price || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-purple-300 font-medium">
                                            Total Reviews:
                                        </span>
                                        <span className="text-gray-300 ml-2">
                                            {product?.product?.amazon_reviews
                                                ?.length || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-purple-300 font-medium">
                                            Categories:
                                        </span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {product?.product?.categories?.map(
                                                (category) => (
                                                    <span
                                                        key={category.id}
                                                        className="bg-purple-600 text-white px-2 py-1 rounded text-sm"
                                                    >
                                                        {category.name}
                                                    </span>
                                                )
                                            ) || (
                                                <span className="text-gray-400">
                                                    No categories
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section at the bottom */}
                    <div className="mt-8">
                        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                                Executive Summary
                            </h2>
                            <p className="text-gray-200 text-lg leading-relaxed">
                                {product?.summary ||
                                    "No summary available for this product analysis."}
                            </p>
                        </div>
                    </div>
                </div>
            </ManagerLayout>
        </>
    );
};

export default AnalyzedData;
