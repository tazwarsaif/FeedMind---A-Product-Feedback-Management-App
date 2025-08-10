import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";
import Pagination from "../components/Pagination";
const ProductsPage = ({ productsFromBack = null, categoryOrder = null }) => {
    // console.log(randomID);
    console.log(categoryOrder);
    // console.log(
    //     "ProductsPage rendered with productsFromBack:",
    //     productsFromBack
    // );
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCategories, setExpandedCategories] = useState(() => {
        // Assuming 'products' is available at this stage or use 'productsFromBack':
        const source = productsFromBack || [];
        const allExpanded = {};
        source.forEach((cat) => {
            allExpanded[cat.name] = true;
        });
        return allExpanded;
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);
    const modalRef = useRef(null);
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState(productsFromBack || []);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        if (!localStorage.getItem("categoryOrder")) {
            localStorage.setItem(
                "categoryOrder",
                JSON.stringify(categoryOrder)
            );
        }
    }, [categoryOrder]);

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
        }
    }, [token]);

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

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const searchParam = searchParams.get("search");
        const page = searchParams.get("page");
        const categories = searchParams.get("categories");

        if (searchParam) {
            // Handle search case
            setSearch(searchParam);
            setQuery(searchParam);
            setCurrentPage(1); // Always set to page 1 for searches
            setLastPage(1); // Search results don't use pagination
            return;
        }

        if (!page || !categories) {
            // Retrieve category order from localStorage
            const storedOrder = localStorage.getItem("categoryOrder");
            let firstGroup = "";
            if (storedOrder) {
                try {
                    const parsed = JSON.parse(storedOrder);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        firstGroup = parsed[0].join(",");
                    }
                } catch (error) {
                    console.error(
                        "Error parsing categoryOrder from localStorage:",
                        error
                    );
                }
            }

            // Fallback in case localStorage is empty or broken
            if (!firstGroup) {
                firstGroup = "kitchen,bharwa";
            }

            // Redirect with categories from localStorage
            router.visit(
                `/manager/products?page=1&categories=${encodeURIComponent(
                    firstGroup
                )}`,
                {
                    replace: true,
                }
            );
            return;
        } else {
            // Handle normal pagination case
            if (page) {
                setCurrentPage(Number(page));
            } else {
                setCurrentPage(1);
            }

            // Set lastPage based on categoryOrder
            const storedOrder = localStorage.getItem("categoryOrder");
            if (storedOrder) {
                try {
                    const parsed = JSON.parse(storedOrder);
                    setLastPage(parsed.length || 1);
                } catch (error) {
                    setLastPage(1);
                }
            } else {
                setLastPage(1);
            }
        }
    }, []);

    const categories = products;

    const toggleCategory = (categoryName) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryName]: !prev[categoryName],
        }));
    };

    const openProductModal = (product) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        if (selectedProduct) {
            setCurrentImageIndex((prev) =>
                prev === selectedProduct.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedProduct) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedProduct.images.length - 1 : prev - 1
            );
        }
    };

    const addInAppReview = async (productId) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/add-review`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        rating: newRating,
                        comment: newReview,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add review");
            }

            const data = await response.json();
            console.log("Review added:", data);
        } catch (error) {
            console.error("Error adding review:", error);
        }
        if (newReview.trim() && selectedProduct) {
            const updatedProduct = {
                ...selectedProduct,
                inAppReviews: [
                    ...selectedProduct.inAppReviews,
                    {
                        user: "Current User",
                        rating: newRating,
                        comment: newReview,
                    },
                ],
            };
            setSelectedProduct(updatedProduct);
            setNewReview("");
            setNewRating(5);
            console.log("In-App Review Added:", {
                productId,
                rating: newRating,
                comment: newReview,
            });
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                className={i < rating ? "text-yellow-400" : "text-gray-400"}
            >
                ★
            </span>
        ));
    };

    const filteredCategories = categories
        .map((category) => ({
            ...category,
            products: category.products.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((category) => category.products.length > 0);
    const handleInputChange = async (e) => {
        const value = e.target.value;
        setQuery(value);

        // fetch suggestions
        const res = await fetch(`/api/search/suggestions?q=${value}`);
        const data = await res.json();
        console.log("Suggestions:", data);
        setSuggestions(data);
    };
    const settingText = (e) => {
        setSearch(e.target.value);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeProductModal();
            }
        };

        if (selectedProduct) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [selectedProduct]);

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
            <Header title="Products" />
            <ManagerLayout user={user}>
                <div className="min-h-screen bg-[#39344a] text-white">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-4 text-purple-300 my-5">
                            All Products
                        </h1>
                        <hr className="text-black" />

                        {/* Search Bar */}
                        <div className="relative mt-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                name="search"
                                onChange={(e) => {
                                    settingText(e);
                                    handleInputChange(e);
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() =>
                                    setTimeout(() => setIsFocused(false), 200)
                                }
                                className="w-full px-4 py-2 pl-10 pr-12 bg-[#2c2841] border border-[#39344a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />

                            {/* Search Icon (left side) */}
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            {/* Search Button (right side) */}
                            <button
                                onClick={() => {
                                    // Handle search button click
                                    router.visit(
                                        `/manager/products?search=${search}`
                                    );
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-800 hover:bg-purple-700 text-white p-1 rounded-md text-sm w-20 cursor-pointer transition-colors"
                            >
                                Search
                            </button>

                            {isFocused && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-[#2c2841] shadow-md z-20 max-h-80 overflow-auto border border-gray-600 rounded-b-lg">
                                    <table className="w-full border-0 table-fixed">
                                        <tbody>
                                            {suggestions.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="cursor-pointer hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                                                    onClick={() => {
                                                        setSearch(item.name);
                                                        setIsFocused(false);
                                                        router.get(
                                                            `/manager/products?search=${encodeURIComponent(
                                                                item.name
                                                            )}`
                                                        );
                                                    }}
                                                >
                                                    <td className="p-2 text-left w-3/5 sm:w-2/3">
                                                        <div className="break-words hyphens-auto leading-tight text-sm">
                                                            {item?.name}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-right w-1/5 sm:w-1/6">
                                                        <div className="text-green-400 font-semibold text-xs sm:text-sm break-words">
                                                            {item?.price}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-right w-1/5 sm:w-1/6">
                                                        {item?.images &&
                                                            item.images.length >
                                                                0 && (
                                                                <img
                                                                    src={
                                                                        item
                                                                            .images[0]
                                                                    }
                                                                    alt={
                                                                        item?.name
                                                                    }
                                                                    className="w-8 h-8 sm:w-10 sm:h-8 md:w-12 md:h-10 object-cover rounded-md ml-auto"
                                                                />
                                                            )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    {new URLSearchParams(window.location.search).get(
                        "search"
                    ) && (
                        <div className="my-4 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    const storedOrder =
                                        localStorage.getItem("categoryOrder");
                                    let firstGroup = "kitchen,music";
                                    if (storedOrder) {
                                        try {
                                            const parsed =
                                                JSON.parse(storedOrder);
                                            if (
                                                Array.isArray(parsed) &&
                                                parsed.length > 0
                                            ) {
                                                firstGroup =
                                                    parsed[0].join(",");
                                            }
                                        } catch (error) {
                                            console.error(
                                                "Error parsing categoryOrder:",
                                                error
                                            );
                                        }
                                    }
                                    router.visit(
                                        `/manager/products?page=1&categories=${encodeURIComponent(
                                            firstGroup
                                        )}`
                                    );
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                <span>Back to Categories</span>
                            </button>
                            <div className="text-sm text-gray-400">
                                Found{" "}
                                {categories.reduce(
                                    (total, cat) => total + cat.products.length,
                                    0
                                )}{" "}
                                results
                            </div>
                        </div>
                    )}
                    <div className="my-6">
                        {!new URLSearchParams(window.location.search).get(
                            "search"
                        ) && (
                            <Pagination
                                currentPage={currentPage ? currentPage : 1}
                                lastPage={lastPage ? lastPage : 1}
                                categoryOrder={
                                    localStorage.getItem("categoryOrder")
                                        ? JSON.parse(
                                              localStorage.getItem(
                                                  "categoryOrder"
                                              )
                                          )
                                        : []
                                }
                            />
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.name}
                                className="bg-[#2c2841] rounded-lg overflow-hidden"
                            >
                                {/* Category Header */}
                                <button
                                    onClick={() =>
                                        toggleCategory(category.name)
                                    }
                                    className="w-full px-6 py-4 bg-[#2c2841] hover:bg-[#312e46] cursor-pointer transition-colors flex items-center justify-between"
                                >
                                    <h2 className="text-xl font-semibold">
                                        {category.name}
                                    </h2>
                                    <svg
                                        className={`h-5 w-5 transform transition-transform ${
                                            expandedCategories[category.name]
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Products Grid */}
                                <AnimatePresence>
                                    {expandedCategories[category.name] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 pb-6"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {category.products.map(
                                                    (product) => (
                                                        <div
                                                            key={product.id}
                                                            className="bg-[#39344a] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                                        >
                                                            <img
                                                                src={
                                                                    product
                                                                        .images[0]
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="w-full h-48 object-cover"
                                                            />
                                                            <div className="p-4">
                                                                <h3
                                                                    className="font-semibold text-lg mb-2 line-clamp-2 hover:cursor-pointer hover:underline"
                                                                    onClick={() =>
                                                                        openProductModal(
                                                                            product
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        product.name
                                                                    }
                                                                </h3>
                                                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                                                    {
                                                                        product.description
                                                                    }
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xl font-bold text-green-400">
                                                                        {
                                                                            product.price
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            openProductModal(
                                                                                product
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        View
                                                                        Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                    {/* Product Detail Modal */}
                    <AnimatePresence>
                        {selectedProduct && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                {/* Blurred background overlay */}
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
                                <motion.div
                                    ref={modalRef}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="relative bg-[#2c2841] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto z-10"
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={closeProductModal}
                                        className="fixed top-4 right-4 z-10 cursor-pointer bg-[#39344a] hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>

                                    <div className="p-6">
                                        {/* Desktop Layout */}
                                        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
                                            {/* Image Slider - Left Column */}
                                            <div className="col-span-4">
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            selectedProduct
                                                                .images[
                                                                currentImageIndex
                                                            ]
                                                        }
                                                        alt={
                                                            selectedProduct.name
                                                        }
                                                        className="w-full h-80 object-cover rounded-lg"
                                                    />
                                                    {selectedProduct.images
                                                        .length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={
                                                                    prevImage
                                                                }
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M15 19l-7-7 7-7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    nextImage
                                                                }
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 mt-4">
                                                    {selectedProduct.images.map(
                                                        (image, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() =>
                                                                    setCurrentImageIndex(
                                                                        index
                                                                    )
                                                                }
                                                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                                                    index ===
                                                                    currentImageIndex
                                                                        ? "border-purple-400"
                                                                        : "border-gray-600"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Details - Middle Column */}
                                            <div className="col-span-4">
                                                <h2 className="text-2xl font-bold mb-4">
                                                    {selectedProduct.name}
                                                </h2>
                                                <p className="text-3xl font-bold text-green-400 mb-4">
                                                    {selectedProduct.price}
                                                </p>
                                                <p className="text-gray-300 mb-6">
                                                    {
                                                        selectedProduct.description
                                                    }
                                                </p>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-2">
                                                            Category:
                                                        </h3>
                                                        <span className="px-3 py-1 bg-[#39344a] rounded-full text-sm">
                                                            {
                                                                selectedProduct.category
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reviews - Right Column */}
                                            <div className="col-span-4 space-y-6">
                                                {/* Amazon Reviews */}
                                                <div className="bg-[#39344a] p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-4 text-yellow-400">
                                                        Amazon Reviews
                                                    </h3>
                                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                                        {selectedProduct.amazonReviews.map(
                                                            (review, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border-b border-gray-600 pb-2"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                review.user
                                                                            }
                                                                        </span>
                                                                        <div className="flex">
                                                                            {renderStars(
                                                                                review.rating
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300">
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* In-App Reviews */}
                                                <div className="bg-[#39344a] p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-4 text-purple-400">
                                                        In-App Reviews
                                                    </h3>
                                                    <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                                                        {selectedProduct.inAppReviews.map(
                                                            (review, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border-b border-gray-600 pb-2"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                review.user
                                                                            }
                                                                        </span>
                                                                        <div className="flex">
                                                                            {renderStars(
                                                                                review.rating
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300">
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Add Review Form */}
                                                    <div className="border-t border-gray-600 pt-4">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm mr-2">
                                                                Rating:
                                                            </span>
                                                            <div className="flex">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <button
                                                                            key={
                                                                                star
                                                                            }
                                                                            onClick={() =>
                                                                                setNewRating(
                                                                                    star
                                                                                )
                                                                            }
                                                                            className={`text-lg ${
                                                                                star <=
                                                                                newRating
                                                                                    ? "text-yellow-400"
                                                                                    : "text-gray-400"
                                                                            }`}
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={newReview}
                                                            onChange={(e) =>
                                                                setNewReview(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Write your review..."
                                                            className="w-full p-2 bg-[#2c2841] border border-gray-600 rounded text-white placeholder-gray-400 text-sm"
                                                            rows="3"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                addInAppReview(
                                                                    selectedProduct.id
                                                                )
                                                            }
                                                            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Add Review
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile/Tablet Layout */}
                                        <div className="lg:hidden">
                                            {/* Product Images */}
                                            <div className="mb-6">
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            selectedProduct
                                                                .images[
                                                                currentImageIndex
                                                            ]
                                                        }
                                                        alt={
                                                            selectedProduct.name
                                                        }
                                                        className="w-full h-64 object-cover rounded-lg"
                                                    />
                                                    {selectedProduct.images
                                                        .length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={
                                                                    prevImage
                                                                }
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M15 19l-7-7 7-7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    nextImage
                                                                }
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 mt-4 overflow-x-auto">
                                                    {selectedProduct.images.map(
                                                        (image, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() =>
                                                                    setCurrentImageIndex(
                                                                        index
                                                                    )
                                                                }
                                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                                                    index ===
                                                                    currentImageIndex
                                                                        ? "border-purple-400"
                                                                        : "border-gray-600"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Details */}
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-bold mb-4">
                                                    {selectedProduct.name}
                                                </h2>
                                                <p className="text-3xl font-bold text-green-400 mb-4">
                                                    ${selectedProduct.price}
                                                </p>
                                                <p className="text-gray-300 mb-6">
                                                    {
                                                        selectedProduct.description
                                                    }
                                                </p>

                                                <div>
                                                    <h3 className="font-semibold mb-2">
                                                        Category:
                                                    </h3>
                                                    <span className="px-3 py-1 bg-[#39344a] rounded-full text-sm">
                                                        {
                                                            selectedProduct.category
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Reviews */}
                                            <div className="space-y-6">
                                                {/* Amazon Reviews */}
                                                <div className="bg-[#39344a] p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-4 text-yellow-400">
                                                        Amazon Reviews
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {selectedProduct.amazonReviews.map(
                                                            (review, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border-b border-gray-600 pb-2"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                review.user
                                                                            }
                                                                        </span>
                                                                        <div className="flex">
                                                                            {renderStars(
                                                                                review.rating
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300">
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* In-App Reviews */}
                                                <div className="bg-[#39344a] p-4 rounded-lg">
                                                    <h3 className="font-semibold mb-4 text-purple-400">
                                                        In-App Reviews
                                                    </h3>
                                                    <div className="space-y-3 mb-4">
                                                        {selectedProduct.inAppReviews.map(
                                                            (review, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border-b border-gray-600 pb-2"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                review.user
                                                                            }
                                                                        </span>
                                                                        <div className="flex">
                                                                            {renderStars(
                                                                                review.rating
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300">
                                                                        {
                                                                            review.comment
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Add Review Form */}
                                                    <div className="border-t border-gray-600 pt-4">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm mr-2">
                                                                Rating:
                                                            </span>
                                                            <div className="flex">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <button
                                                                            key={
                                                                                star
                                                                            }
                                                                            onClick={() =>
                                                                                setNewRating(
                                                                                    star
                                                                                )
                                                                            }
                                                                            className={`text-lg ${
                                                                                star <=
                                                                                newRating
                                                                                    ? "text-yellow-400"
                                                                                    : "text-gray-400"
                                                                            }`}
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={newReview}
                                                            onChange={(e) =>
                                                                setNewReview(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Write your review..."
                                                            className="w-full p-2 bg-[#2c2841] border border-gray-600 rounded text-white placeholder-gray-400 text-sm"
                                                            rows="3"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                addInAppReview(
                                                                    selectedProduct.id
                                                                )
                                                            }
                                                            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Add Review
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Close Button */}
                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={closeProductModal}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ManagerLayout>
        </>
    );
};

export default ProductsPage;
