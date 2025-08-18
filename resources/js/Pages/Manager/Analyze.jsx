import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";

const Analyze = () => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState("");
    const [summaryLoad, setSummaryLoad] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("oldestToLatest");
    const [allProducts, setAllProducts] = useState([]);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingProducts(true);
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/get-my-products-for-analyze",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProducts(response.data.products || []);
            setAllProducts(response.data.products || []);
            console.log("Fetched products:", response.data.products);
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
            const response = await axios.get(
                `http://127.0.0.1:8000/api/product/analyze/${productId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200 && response.data.analysis) {
                // Update the product with the analysis
                await fetchProducts(); // Assuming you have this function
                console.log("Analysis generated successfully");
            }
        } catch (err) {
            console.error("Failed to generate analysis:", err);
            setError("Failed to generate analysis");
        } finally {
            setSummaryLoad(false);
        }
    };

    // Function to delete a product
    const deleteProduct = async (productId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/products/${productId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Remove product from state
            setProducts((prevProducts) =>
                prevProducts.filter((product) => product.id !== productId)
            );
        } catch (err) {
            console.error("Failed to delete product:", err);
            setError("Failed to delete product");
        }
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
            fetchProducts();
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

    return (
        <>
            <Header title={"Analyze"} />
            <ManagerLayout user={user}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 md:mb-0">
                        <div className="w-full">
                            <h1 className="text-2xl font-bold mb-4 text-purple-300">
                                Product Analysis
                            </h1>
                            <hr className="w-full" />
                        </div>
                    </div>

                    {loadingProducts ? (
                        <div className="flex items-center space-x-2 text-purple-300">
                            <div className="w-6 h-6 border-4 border-[#a892fe] border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading products...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="text-gray-400">No products found.</div>
                    ) : (
                        products.map((product) => (
                            <div
                                className="bg-[#2c2841] hover:bg-[#554e6b] rounded-lg shadow cursor-pointer flex justify-between p-5 my-2"
                                key={product.id}
                            >
                                <div className="flex items-start space-x-4 flex-1">
                                    {/* Product Image */}
                                    {product.images &&
                                        product.images.length > 0 && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                }}
                                            />
                                        )}

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => {
                                                window.open(
                                                    product.url,
                                                    "_blank"
                                                );
                                            }}
                                        >
                                            <h3 className="text-purple-300 text-lg font-medium mb-2 hover:text-purple-200 line-clamp-2">
                                                {product.title}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            <span>Price: {product.price}</span>
                                            <span>
                                                Rating: {product.averageRating}
                                                /5
                                            </span>
                                            <span>
                                                Reviews:{" "}
                                                {product.reviews?.length || 0}
                                            </span>
                                            <span>
                                                Added:{" "}
                                                {new Date(
                                                    product.created_at
                                                ).toLocaleDateString("en-CA")}
                                            </span>
                                        </div>

                                        {/* Keywords/Categories */}
                                        {product.keywords &&
                                            product.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {product.keywords
                                                        .slice(0, 3)
                                                        .map(
                                                            (
                                                                keyword,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full"
                                                                >
                                                                    {keyword}
                                                                </span>
                                                            )
                                                        )}
                                                    {product.keywords.length >
                                                        3 && (
                                                        <span className="text-xs text-gray-400">
                                                            +
                                                            {product.keywords
                                                                .length -
                                                                3}{" "}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="inline-flex items-center cursor-pointer transition-colors space-x-2 ml-4">
                                    {/* Analysis Button */}
                                    <div
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    `analysis_modal_${product.id}`
                                                )
                                                .showModal()
                                        }
                                        className="bg-blue-600 hover:bg-blue-700 p-2 px-3 text-white rounded-lg cursor-pointer"
                                        title="Generate Analysis"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>

                                    {/* Delete Button */}
                                    <div
                                        className="bg-red-600 hover:bg-red-700 p-2 px-3 text-white rounded-lg cursor-pointer"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    `delete_${product.id}`
                                                )
                                                .showModal()
                                        }
                                        title="Delete Product"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m1 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 4v6m4-6v6"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Analysis Modal */}
                                <dialog
                                    id={`analysis_modal_${product.id}`}
                                    className="modal modal-bottom sm:modal-middle"
                                >
                                    <div className="modal-box bg-[#39344a] text-white max-w-4xl">
                                        <h3 className="font-bold text-lg mb-4">
                                            Product Analysis: {product.title}
                                        </h3>

                                        {/* Product Summary */}
                                        <div className="mb-4 p-4 bg-[#4b4470] rounded-lg">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400">
                                                        Price:
                                                    </span>
                                                    <p className="text-white font-medium">
                                                        {product.price}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Rating:
                                                    </span>
                                                    <p className="text-white font-medium">
                                                        {product.averageRating}
                                                        /5
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Reviews:
                                                    </span>
                                                    <p className="text-white font-medium">
                                                        {product.reviews
                                                            ?.length || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Reports:
                                                    </span>
                                                    <p className="text-white font-medium">
                                                        {product
                                                            .analyzed_reports
                                                            ?.length || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* making reports list */}

                                        <ul className="list bg-[#5e557a] rounded-box shadow-md text-slate ">
                                            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                                                Recent Generated Reports
                                            </li>
                                            {product.analyzed_reports &&
                                                product.analyzed_reports.map(
                                                    (report, index) => (
                                                        <li
                                                            key={index}
                                                            className="list-row"
                                                        >
                                                            <div>
                                                                <div
                                                                    onClick={() =>
                                                                        (window.location.href = `/manager/analyzed-data/${report.id}`)
                                                                    }
                                                                    className="hover:underline"
                                                                >
                                                                    {
                                                                        report.title
                                                                    }
                                                                </div>
                                                                <div className="text-xs uppercase font-semibold opacity-60">
                                                                    {
                                                                        report.created_at.split(
                                                                            "T"
                                                                        )[0]
                                                                    }
                                                                </div>
                                                            </div>
                                                            <p className="list-col-wrap text-xs">
                                                                {report.summary ||
                                                                    "No summary available"}
                                                            </p>
                                                            <button
                                                                className="btn btn-square btn-ghost"
                                                                onClick={() =>
                                                                    (window.location.href = `/manager/analyzed-data/${report.id}`)
                                                                }
                                                            >
                                                                <svg
                                                                    className="size-[1.2em]"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    aria-hidden="true"
                                                                >
                                                                    <g
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        {/* Document with folded corner */}
                                                                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-6z" />
                                                                        <path d="M14 3v6h6" />
                                                                        {/* Text lines */}
                                                                        <path d="M9 13h6" />
                                                                        <path d="M9 17h6" />
                                                                    </g>
                                                                </svg>
                                                            </button>
                                                        </li>
                                                    )
                                                )}
                                        </ul>

                                        {summaryLoad === true && (
                                            <div className="text-center py-8">
                                                <span className="loading loading-bars loading-xl"></span>
                                                <p className="mt-4 text-gray-400">
                                                    Analyzing product data...
                                                </p>
                                            </div>
                                        )}

                                        {product.analysis &&
                                            summaryLoad === false && (
                                                <div className="space-y-4">
                                                    <div className="prose prose-invert max-w-none">
                                                        {product.analysis}
                                                    </div>
                                                </div>
                                            )}

                                        <div className="modal-action">
                                            {!summaryLoad &&
                                                !product.analysis && (
                                                    <button
                                                        className="btn bg-violet-300 border-purple-400 hover:text-white hover:bg-[#39344a]"
                                                        onClick={() =>
                                                            generateAnalysis(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        Generate Analysis
                                                    </button>
                                                )}

                                            <form
                                                method="dialog"
                                                className="flex space-x-3"
                                                onSubmit={() => setSummary("")}
                                            >
                                                <button className="btn">
                                                    Close
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </dialog>

                                {/* Report Detail Modals */}
                                {product.analyzed_reports &&
                                    product.analyzed_reports.map(
                                        (report, index) => (
                                            <dialog
                                                key={report.id || index}
                                                id={`report_detail_${report.id}`}
                                                className="modal modal-bottom sm:modal-middle"
                                            >
                                                <div className="modal-box bg-[#39344a] text-white max-w-4xl max-h-[80vh]">
                                                    <h3 className="font-bold text-lg mb-4 text-purple-300">
                                                        {report.title}
                                                    </h3>

                                                    {/* Report Header */}
                                                    <div className="mb-4 p-3 bg-[#2c2841] rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center space-x-4">
                                                                {report.rating && (
                                                                    <div className="text-center">
                                                                        <div className="text-2xl font-bold text-purple-400">
                                                                            {parseFloat(
                                                                                report.rating
                                                                            ).toFixed(
                                                                                1
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            Rating
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="text-sm text-gray-400">
                                                                        Generated
                                                                        on
                                                                    </div>
                                                                    <div className="font-medium">
                                                                        {new Date(
                                                                            report.created_at ||
                                                                                report.updated_at
                                                                        ).toLocaleDateString(
                                                                            "en-US",
                                                                            {
                                                                                year: "numeric",
                                                                                month: "long",
                                                                                day: "numeric",
                                                                            }
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {report.generated_by && (
                                                                <div className="text-right">
                                                                    <div className="text-sm text-gray-400">
                                                                        Generated
                                                                        by
                                                                    </div>
                                                                    <div className="font-medium">
                                                                        {report.generated_by_name ||
                                                                            `User #${report.generated_by}`}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Report Summary */}
                                                    <div className="mb-4 p-4 bg-[#554e6b]/30 rounded-lg border-l-4 border-purple-500">
                                                        <h4 className="font-semibold text-purple-300 mb-2">
                                                            Executive Summary
                                                        </h4>
                                                        <p className="text-gray-300 leading-relaxed">
                                                            {report.summary}
                                                        </p>
                                                    </div>

                                                    {/* Full Report */}
                                                    <div className="overflow-y-auto max-h-96">
                                                        <h4 className="font-semibold text-purple-300 mb-3">
                                                            Detailed Analysis
                                                        </h4>
                                                        <div className="prose prose-invert prose-purple max-w-none">
                                                            <div
                                                                className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        report.full_report?.replace(
                                                                            /\n/g,
                                                                            "<br>"
                                                                        ) ||
                                                                        "No detailed report available.",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="modal-action mt-6 pt-4 border-t border-gray-600">
                                                        <form method="dialog">
                                                            <button className="btn">
                                                                Close
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </dialog>
                                        )
                                    )}

                                {/* Delete Modal */}
                                <dialog
                                    id={`delete_${product.id}`}
                                    className="modal modal-bottom sm:modal-middle"
                                >
                                    <div className="modal-box bg-[#39344a] text-white">
                                        <h3 className="font-bold text-lg">
                                            Delete Product
                                        </h3>
                                        <p className="py-4">
                                            Are you sure you want to delete "
                                            {product.title}"? This action cannot
                                            be undone.
                                        </p>

                                        <div className="modal-action">
                                            <form method="dialog">
                                                <button className="btn">
                                                    Cancel
                                                </button>
                                            </form>
                                            <button
                                                className="btn btn-error text-white"
                                                onClick={() => {
                                                    deleteProduct(product.id);
                                                    document
                                                        .getElementById(
                                                            `delete_${product.id}`
                                                        )
                                                        .close();
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </dialog>
                            </div>
                        ))
                    )}
                </div>
            </ManagerLayout>
        </>
    );
};

export default Analyze;
