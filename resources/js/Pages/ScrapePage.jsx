// resources/js/Pages/ScrapePage.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import FeedMindLayout from "../Layouts/FeedMindLayout";
import Header from "../Layouts/Header";
export default function ScrapePage() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [sliderOpen, setSliderOpen] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [scrapeLoading, setScrapeLoading] = useState(false);

    const openSlider = (idx) => {
        setCurrentIdx(idx);
        setSliderOpen(true);
    };

    const closeSlider = () => setSliderOpen(false);

    const prevImg = (e) => {
        e.stopPropagation();
        setCurrentIdx(
            (prev) => (prev - 1 + result.images.length) % result.images.length
        );
    };

    const nextImg = (e) => {
        e.stopPropagation();
        setCurrentIdx((prev) => (prev + 1) % result.images.length);
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
                "/api/ai-scrape",
                { prompt: url },
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

    return (
        <>
            <Header title={"Amazon Scrapper"} />
            <FeedMindLayout user={user}>
                <div className="p-6 text-purple-300">
                    <h1 className="text-2xl font-bold mb-4">Scrape Product</h1>
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
                            className="bg-purple-300 text-purple-800 px-4 py-2 mt-2"
                        >
                            Scrape
                        </button>
                    )}
                    {scrapeLoading && (
                        <button
                            onClick={handleScrape}
                            className="bg-purple-300 text-purple-800 px-4 py-2 mt-2"
                        >
                            <span className="loading loading-dots loading-md text-purple-800"></span>
                        </button>
                    )}

                    {result && (
                        <div className="mt-4 text-white">
                            <h2 className="text-xl font-semibold mb-2">
                                Summary
                            </h2>
                            <div className="prose prose-invert max-w-none bg-gray-900 p-4 rounded">
                                <ReactMarkdown>{result.summary}</ReactMarkdown>
                            </div>
                            {result.images && result.images.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {result.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`Image ${i + 1}`}
                                            className="w-48 h-48 object-contain rounded shadow cursor-pointer transition-transform hover:scale-105"
                                            onClick={() => openSlider(i)}
                                        />
                                    ))}
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
                                                        src={
                                                            result.images[
                                                                currentIdx
                                                            ]
                                                        }
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
                        </div>
                    )}
                </div>
            </FeedMindLayout>
        </>
    );
}
