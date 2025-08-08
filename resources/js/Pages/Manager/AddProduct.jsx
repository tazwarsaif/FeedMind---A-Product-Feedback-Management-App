import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../Layouts/Header";
import ManagerLayout from "../../Layouts/ManagerLayout";

const AddProduct = () => {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [sliderOpen, setSliderOpen] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [addingProduct, setAddingProduct] = useState(false);

    // Editable fields
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState("");
    const [images, setImages] = useState([]);

    // Update editable fields when result changes
    useEffect(() => {
        if (result) {
            setTitle(result.title || "");
            setPrice(result.price || "");
            setDescription(
                result.features && Array.isArray(result.features)
                    ? result.features.join("\n")
                    : result.features || ""
            );
            setKeywords(
                result.keywords && Array.isArray(result.keywords)
                    ? result.keywords.join(", ")
                    : result.keywords || ""
            );
            // Start from index 1 as requested
            setImages(result.images ? result.images.slice(1) : []);
        }
    }, [result]);

    const handleAddProduct = async () => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }

        setAddingProduct(true);
        try {
            const token = localStorage.getItem("token");
            const productData = {
                title: title.trim(),
                price: price,
                description: description.trim(),
                keywords: keywords.trim(),
                images: images,
                url: result?.url || url,
                averageRating: result?.averageRating || null,
                reviews: result?.reviews || [],
                reviewerNames: result?.reviewerNames || [],
                individualRatings: result?.individualRatings || [],
            };

            const res = await axios.post("/api/add-product", productData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            alert("Product added successfully!");
            // Reset form
            setResult(null);
            setUrl("");
            setTitle("");
            setPrice("");
            setDescription("");
            setKeywords("");
            setImages([]);
        } catch (err) {
            console.log(err);
            alert(
                "Failed to add product: " +
                    (err.response?.data?.error || err.message)
            );
        } finally {
            setAddingProduct(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const openSlider = (idx) => {
        setCurrentIdx(idx);
        setSliderOpen(true);
    };

    const closeSlider = () => setSliderOpen(false);

    const prevImg = (e) => {
        e.stopPropagation();
        setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    const nextImg = (e) => {
        e.stopPropagation();
        setCurrentIdx((prev) => (prev + 1) % images.length);
    };

    useEffect(() => {
        // Fetch user info as in your other pages
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

    const handleScrape = async () => {
        setScrapeLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "/api/scrape",
                { url },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );
            setResult(res.data);
            setScrapeLoading(false);
        } catch (err) {
            console.log(err);
            alert(
                "Failed to scrape: " +
                    (err.response?.data?.error || err.message)
            );
            setScrapeLoading(false);
        }
    };

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
            <Header title={"Add Product"} />
            <ManagerLayout user={user}>
                <div className="p-6 text-slate-300">
                    <h1 className="text-2xl font-bold mb-4">
                        To Add Product you need to scrape content from a valid
                        Amazon Product URL First
                    </h1>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="border p-2 w-full bg-white text-purple-800"
                        placeholder="Paste product URL"
                    />
                    {!scrapeLoading && (
                        <button
                            onClick={handleScrape}
                            className="bg-slate-300 flex items-center px-3 py-2 text-sm text-purple-800 hover:text-white hover:bg-[#625880] rounded-lg transition-colors cursor-pointer mt-3"
                        >
                            Scrape
                        </button>
                    )}
                    {scrapeLoading && (
                        <button
                            disabled
                            className="bg-slate-300 flex items-center px-3 py-2 text-sm text-purple-800 rounded-lg cursor-not-allowed mt-3"
                        >
                            <span className="loading loading-dots loading-md text-purple-800"></span>
                        </button>
                    )}

                    {result && !scrapeLoading && (
                        <div className="mt-6 text-slate-200 space-y-6">
                            <h2 className="text-2xl font-bold">
                                Edit Product Data Before Adding
                            </h2>

                            {/* Editable Title */}
                            <div>
                                <label className="text-lg font-semibold text-white block mb-2">
                                    Title: *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                    placeholder="Product title"
                                />
                            </div>

                            {/* Editable Price */}
                            <div>
                                <label className="text-lg font-semibold text-white block mb-2">
                                    Price:
                                </label>
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                    placeholder="Product price"
                                />
                            </div>

                            {/* Editable Description */}
                            <div>
                                <label className="text-lg font-semibold text-white block mb-2">
                                    Description:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={6}
                                    className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none resize-vertical"
                                    placeholder="Product description/features"
                                />
                            </div>

                            {/* Editable Keywords */}
                            <div>
                                <label className="text-lg font-semibold text-white block mb-2">
                                    Keywords/Categories:
                                </label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) =>
                                        setKeywords(e.target.value)
                                    }
                                    className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-[#a892fe] focus:outline-none"
                                    placeholder="Comma-separated keywords"
                                />
                            </div>

                            {/* Non-editable fields for reference */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-lg font-semibold text-white">
                                        Average Rating:
                                    </p>
                                    <p className="text-yellow-400">
                                        {result?.averageRating || "N/A"} / 5
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">
                                        Product URL:
                                    </p>
                                    <a
                                        href={result?.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 underline"
                                    >
                                        View on Amazon
                                    </a>
                                </div>
                            </div>

                            {/* Top Reviews (read-only) */}
                            {result?.reviews && result.reviews.length > 0 && (
                                <div>
                                    <p className="text-lg font-semibold text-white">
                                        Top Reviews:
                                    </p>
                                    <ul className="space-y-2">
                                        {result.reviews
                                            .slice(0, 3)
                                            .map((review, idx) => (
                                                <li
                                                    key={idx}
                                                    className="bg-gray-800 p-3 rounded shadow"
                                                >
                                                    <p className="text-sm text-slate-300 italic">
                                                        "{review}"
                                                    </p>
                                                    {result?.reviewerNames[
                                                        idx
                                                    ] && (
                                                        <p className="text-xs text-right mt-1 text-slate-500">
                                                            -{" "}
                                                            {
                                                                result
                                                                    .reviewerNames[
                                                                    idx
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            {/* Editable Images */}
                            {images && images.length > 0 && (
                                <div>
                                    <p className="text-lg font-semibold text-white mb-3">
                                        Product Images:
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {images.map((img, i) => (
                                            <div
                                                key={i}
                                                className="relative group"
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Image ${i + 1}`}
                                                    className="w-48 h-48 object-contain rounded shadow cursor-pointer transition-transform hover:scale-105"
                                                    onClick={() =>
                                                        openSlider(i)
                                                    }
                                                />
                                                <button
                                                    onClick={() =>
                                                        removeImage(i)
                                                    }
                                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Image Slider Modal */}
                                    {sliderOpen && (
                                        <>
                                            {/* Blurred background overlay */}
                                            <div
                                                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                                                onClick={closeSlider}
                                            ></div>
                                            {/* Centered slider modal */}
                                            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                                                <div
                                                    className="relative pointer-events-auto flex space-x-4"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <button
                                                        onClick={closeSlider}
                                                        className="absolute top-2 right-2 text-white text-3xl font-bold z-10"
                                                        title="Close"
                                                    >
                                                        &times;
                                                    </button>
                                                    <button
                                                        onClick={prevImg}
                                                        className="absolute left-[-3rem] top-1/2 -translate-y-1/2 text-white text-4xl font-bold px-2 py-1 bg-black bg-opacity-40 rounded hover:bg-opacity-70 z-10"
                                                        title="Previous"
                                                    >
                                                        &#8592;
                                                    </button>
                                                    <img
                                                        src={images[currentIdx]}
                                                        alt={`Image ${
                                                            currentIdx + 1
                                                        }`}
                                                        className="max-h-[80vh] max-w-[90vw] rounded-lg ml-3 shadow-2xl"
                                                    />
                                                    <button
                                                        onClick={nextImg}
                                                        className="absolute right-[-3rem] top-1/2 -translate-y-1/2 text-white text-4xl font-bold px-2 py-1 bg-black bg-opacity-40 rounded hover:bg-opacity-70 z-10"
                                                        title="Next"
                                                    >
                                                        &#8594;
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Add Product Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    onClick={handleAddProduct}
                                    disabled={addingProduct || !title.trim()}
                                    className="bg-[#a892fe] hover:bg-[#9581fe] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg"
                                >
                                    {addingProduct ? (
                                        <span className="flex items-center">
                                            <span className="loading loading-spinner loading-sm mr-2"></span>
                                            Adding Product...
                                        </span>
                                    ) : (
                                        "Add Product"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </ManagerLayout>
        </>
    );
};

export default AddProduct;
