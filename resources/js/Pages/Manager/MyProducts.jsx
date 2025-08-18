import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";

const MyProducts = ({ category = null }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Edit modal states
    const [editingProduct, setEditingProduct] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editKeywords, setEditKeywords] = useState("");
    const [editImages, setEditImages] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(
        category ? category : "oldestToLatest"
    );

    // Image viewer states (only for modal)
    const [viewingImage, setViewingImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const sortProducts = (data, category) => {
        const sorted = [...data];
        if (category === "latestToOldest") {
            return sorted.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
        } else if (category === "oldestToLatest") {
            return sorted.sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
        } else if (category === "highRated") {
            return sorted.sort(
                (a, b) =>
                    parseFloat(b.averageRating) - parseFloat(a.averageRating)
            );
        } else if (category === "lowRated") {
            return sorted.sort(
                (a, b) =>
                    parseFloat(a.averageRating) - parseFloat(b.averageRating)
            );
        }
        return sorted;
    };
    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        let filtered = allProducts.filter((product) =>
            product.title.toLowerCase().includes(term)
        );

        // Apply current sort on top of filtered data
        const sorted = sortProducts(filtered, selectedCategory);
        setProducts(sorted);
    };
    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingProducts(true);
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/get-my-products",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProducts(response.data.products || []);
            setAllProducts(response.data.products);
        } catch (err) {
            setError("Failed to load products");
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };
    console.log(products);

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        let temp = [];

        if (value === "latestToOldest") {
            temp = [...products].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
        } else if (value === "oldestToLatest") {
            temp = [...products].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
        } else if (value === "highRated") {
            temp = [...products].sort(
                (a, b) =>
                    parseFloat(b.averageRating) - parseFloat(a.averageRating)
            );
        } else if (value === "lowRated") {
            temp = [...products].sort(
                (a, b) =>
                    parseFloat(a.averageRating) - parseFloat(b.averageRating)
            );
        } else {
            // Default: no sorting
            temp = [...products];
        }

        setProducts(temp);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditTitle(product.title);
        setEditPrice(product.price);
        setEditDescription(
            Array.isArray(product.features)
                ? product.features.join("\n")
                : product.features || ""
        );
        setEditKeywords(
            Array.isArray(product.keywords)
                ? product.keywords.join(", ")
                : product.keywords || ""
        );
        setEditImages([...product.images]);
    };

    const handleSaveProduct = async () => {
        if (!editTitle.trim()) {
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const updateData = {
                title: editTitle.trim(),
                price: editPrice,
                description: editDescription.trim(),
                keywords: editKeywords.trim(),
                images: editImages,
            };

            await axios.put(`/api/products/${editingProduct.id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            setEditingProduct(null);
            // Reload the page using Inertia
            window.location.reload();
        } catch (err) {
            console.log(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            // Close the modal
            document.getElementById(`delete_${productId}`).close();
            // Reload the page using Inertia
            window.location.reload();
        } catch (err) {
            console.log(err);
        } finally {
            setDeleting(false);
        }
    };

    const removeImageFromEdit = (indexToRemove) => {
        setEditImages(editImages.filter((_, index) => index !== indexToRemove));
    };

    const openImageViewer = (images, startIndex = 0) => {
        setViewingImage(images);
        setCurrentImageIndex(startIndex);
    };

    const closeImageViewer = () => {
        setViewingImage(null);
        setCurrentImageIndex(0);
    };

    const prevImage = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + viewingImage.length) % viewingImage.length
        );
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % viewingImage.length);
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
            <Header title={"My Products"} />
            <ManagerLayout user={user}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-col md:justify-between mb-6">
                        <div className="mb-5">
                            <h1 className="text-2xl font-bold mb-4 text-purple-300">
                                My Products ({products.length})
                            </h1>
                            <hr />
                        </div>
                        <div className="flex flex-col-reverse md:flex-row md:justify-between items-center mb-3 space-x-10 space-y-4 w-full ml-5 md:ml-0">
                            <div className="flex justify-center items-center space-x-3">
                                <h3 className="text-white">
                                    Sort Products By:
                                </h3>
                                <select
                                    className="select bg-slate-300 px-3 py-2 text-sm text-purple-800 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors cursor-pointer w-40 items-center"
                                    name="category"
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e)}
                                >
                                    <option value="oldestToLatest">
                                        Oldest to Latest
                                    </option>
                                    <option value="latestToOldest">
                                        Latest to Oldest
                                    </option>

                                    <option value="highRated">
                                        High Rated
                                    </option>
                                    <option value="lowRated">Low Rated</option>
                                </select>
                            </div>
                            <div className="relative max-w-md md:w-xl md:mt-0 mt-3">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    name="search"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setIsFocused(false),
                                            200
                                        )
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
                                        router.get(
                                            `/products?search=${search}`
                                        );
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-800 hover:bg-purple-700 text-white p-1 rounded-md text-sm w-20 cursor-pointer transition-colors"
                                >
                                    Search
                                </button>

                                {isFocused && suggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 w-full bg-[#2c2841] shadow-md z-20 max-h-80 overflow-auto">
                                        {suggestions.map((item, index) => (
                                            <li
                                                key={index}
                                                className="p-2 cursor-pointer hover:bg-gray-400 flex space-x-2 max-w-2xl border-b border-gray-600"
                                                onClick={() => {
                                                    setSearch(item); // optional: update field
                                                    setIsFocused(false);
                                                    router.get(
                                                        `/products?search=${item?.name}`
                                                    );
                                                }}
                                            >
                                                <div>{item?.name}</div>
                                                <div>{item?.price}</div>
                                                <div>
                                                    <img
                                                        src={item?.images[1]}
                                                        alt={item?.name}
                                                        className="w-50 h-10 object-cover rounded-md"
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="-ml-5 md:ml-0 -mt-2">
                                <button
                                    className="bg-slate-300 px-3 py-2 text-sm text-purple-800 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors cursor-pointer w-40 flex items-center"
                                    onClick={() =>
                                        (window.location.href =
                                            "/manager/add-product")
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Add Products
                                </button>
                            </div>
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
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-4">
                                No products found.
                            </div>
                            <button
                                onClick={() =>
                                    (window.location.href =
                                        "/manager/add-product")
                                }
                                className="bg-[#a892fe] hover:bg-[#9581fe] text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-[#2c2841] hover:bg-[#554e6b] rounded-lg shadow-lg overflow-hidden transition-colors"
                                >
                                    {/* Product Image */}
                                    {product.images &&
                                        product.images.length > 0 && (
                                            <div className="relative h-48 bg-gray-800">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-contain"
                                                />
                                                {product.images.length > 1 && (
                                                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                                                        +
                                                        {product.images.length -
                                                            1}{" "}
                                                        more
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="p-4">
                                        {/* Title and Price */}
                                        <div className="mb-3">
                                            <h3
                                                className="text-purple-300 font-semibold text-lg line-clamp-2 mb-2 hover:underline cursor-pointer"
                                                onClick={() =>
                                                    openEditModal(product)
                                                }
                                            >
                                                {product.title}
                                            </h3>
                                            <div className="flex justify-between items-center">
                                                <span className="text-green-400 font-bold text-xl">
                                                    {product.price}
                                                </span>
                                                <div className="flex items-center text-yellow-400">
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        {product.averageRating}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keywords */}
                                        {product.keywords &&
                                            product.keywords.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(Array.isArray(
                                                            product.keywords
                                                        )
                                                            ? product.keywords
                                                            : product.keywords.split(
                                                                  ","
                                                              )
                                                        )
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    keyword,
                                                                    idx
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="bg-blue-600 bg-opacity-20 text-blue-300 px-2 py-1 rounded text-xs"
                                                                    >
                                                                        {keyword.trim()}
                                                                    </span>
                                                                )
                                                            )}
                                                        {(Array.isArray(
                                                            product.keywords
                                                        )
                                                            ? product.keywords
                                                            : product.keywords.split(
                                                                  ","
                                                              )
                                                        ).length > 3 && (
                                                            <span className="text-gray-400 text-xs px-2 py-1">
                                                                +
                                                                {(Array.isArray(
                                                                    product.keywords
                                                                )
                                                                    ? product.keywords
                                                                    : product.keywords.split(
                                                                          ","
                                                                      )
                                                                ).length -
                                                                    3}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Description Preview */}
                                        {product.features &&
                                            product.features.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-gray-300 text-sm line-clamp-3">
                                                        {Array.isArray(
                                                            product.features
                                                        )
                                                            ? product
                                                                  .features[0]
                                                            : product.features}
                                                    </p>
                                                </div>
                                            )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(product)
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 p-2 text-white rounded-lg transition-colors"
                                                    title="Edit Product"
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
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <div
                                                    className="bg-red-600 hover:bg-red-700 p-2 px-3 text-white rounded-lg cursor-pointer"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                `delete_${product.id}`
                                                            )
                                                            .showModal()
                                                    }
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
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </div>

                                                {/* Delete Confirmation Dialog */}
                                                <dialog
                                                    id={`delete_${product.id}`}
                                                    className="modal modal-bottom sm:modal-middle"
                                                >
                                                    <div className="modal-box bg-[#554e6b] text-white">
                                                        <h3 className="font-bold text-lg">
                                                            Delete Product
                                                        </h3>
                                                        <p className="py-4">
                                                            Are you sure you
                                                            want to delete "
                                                            {product.title}"?
                                                            This action cannot
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
                                                                onClick={() =>
                                                                    handleDeleteProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleting
                                                                }
                                                            >
                                                                {deleting
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </dialog>
                                            </div>
                                            {product.url && (
                                                <a
                                                    href={product.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                                                >
                                                    View Original
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit Modal with blurred background */}
                    {editingProduct && (
                        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-[#39344a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-purple-300">
                                            Edit Product
                                        </h2>
                                        <button
                                            onClick={() =>
                                                setEditingProduct(null)
                                            }
                                            className="text-gray-400 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) =>
                                                    setEditTitle(e.target.value)
                                                }
                                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                            />
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Price
                                            </label>
                                            <input
                                                type="text"
                                                value={editPrice}
                                                onChange={(e) =>
                                                    setEditPrice(e.target.value)
                                                }
                                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Description/Features
                                            </label>
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(
                                                        e.target.value
                                                    )
                                                }
                                                rows={6}
                                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none resize-vertical"
                                            />
                                        </div>

                                        {/* Keywords */}
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Keywords/Categories
                                            </label>
                                            <input
                                                type="text"
                                                value={editKeywords}
                                                onChange={(e) =>
                                                    setEditKeywords(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                                placeholder="Comma-separated keywords"
                                            />
                                        </div>

                                        {/* Images */}
                                        {editImages.length > 0 && (
                                            <div>
                                                <label className="block text-white font-semibold mb-2">
                                                    Images
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {editImages.map(
                                                        (img, i) => (
                                                            <div
                                                                key={i}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Image ${
                                                                        i + 1
                                                                    }`}
                                                                    className="w-full h-32 object-contain bg-gray-800 rounded cursor-pointer"
                                                                    onClick={() =>
                                                                        openImageViewer(
                                                                            editImages,
                                                                            i
                                                                        )
                                                                    }
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        removeImageFromEdit(
                                                                            i
                                                                        )
                                                                    }
                                                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save Confirmation Dialog */}
                                    <dialog
                                        id="save_confirmation"
                                        className="modal modal-bottom sm:modal-middle"
                                    >
                                        <div className="modal-box bg-[#554e6b] text-white">
                                            <h3 className="font-bold text-lg">
                                                Save Changes
                                            </h3>
                                            <p className="py-4">
                                                Are you sure you want to save
                                                these changes?
                                            </p>
                                            <div className="modal-action">
                                                <form method="dialog">
                                                    <button className="btn">
                                                        Cancel
                                                    </button>
                                                </form>
                                                <button
                                                    className="btn btn-success"
                                                    onClick={handleSaveProduct}
                                                    disabled={
                                                        saving ||
                                                        !editTitle.trim()
                                                    }
                                                >
                                                    {saving
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    </dialog>

                                    {/* Modal Actions */}
                                    <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-600">
                                        <button
                                            onClick={() =>
                                                setEditingProduct(null)
                                            }
                                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "save_confirmation"
                                                    )
                                                    .showModal()
                                            }
                                            disabled={!editTitle.trim()}
                                            className="px-6 py-2 bg-[#a892fe] hover:bg-[#9581fe] disabled:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Image Viewer (only inside modal) */}
                            {viewingImage && (
                                <div
                                    className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center"
                                    onClick={closeImageViewer}
                                >
                                    <div
                                        className="relative max-w-4xl max-h-[90vh]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={closeImageViewer}
                                            className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
                                        >
                                            ✕
                                        </button>

                                        {viewingImage.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
                                                >
                                                    →
                                                </button>
                                            </>
                                        )}

                                        <img
                                            src={
                                                viewingImage[currentImageIndex]
                                            }
                                            alt={`Image ${
                                                currentImageIndex + 1
                                            }`}
                                            className="max-w-full max-h-[90vh] object-contain"
                                        />

                                        {viewingImage.length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
                                                {currentImageIndex + 1} /{" "}
                                                {viewingImage.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ManagerLayout>
        </>
    );
};

export default MyProducts;
