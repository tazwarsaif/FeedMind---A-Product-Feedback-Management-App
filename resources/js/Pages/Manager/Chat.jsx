import axios from "axios";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // For lightbox
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const sendPrompt = async () => {
        setLoading(true);
        setResponse("");
        setImages([]);
        setError("");

        try {
            const res = await axios.post("/api/chat", { prompt });

            const content = res.data?.summary || "No summary found.";
            const imgs = res.data?.images || [];

            setResponse(content);
            setImages(imgs.length > 0 ? imgs : []);

            console.log("✅ Response:", res);
        } catch (err) {
            console.error("❌ Error:", err);
            setError("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    // Open lightbox on image click
    const openLightbox = (index) => setLightboxIndex(index);

    // Close lightbox
    const closeLightbox = () => setLightboxIndex(null);

    // Show previous image in lightbox
    const prevImage = () => {
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // Show next image in lightbox
    const nextImage = () => {
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <head>
                <title>Amazone Product Review</title>
                <meta
                    name="description"
                    content="AI-powered Amazon product review summarizer and image viewer."
                />
            </head>
            <h1 className="text-2xl font-bold mb-4">Product Review AI</h1>

            <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste an Amazon product URL here..."
            />

            <button
                onClick={sendPrompt}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading || !prompt.trim()}
            >
                {loading ? "Analyzing..." : "Analyze Product"}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
                    {error}
                </div>
            )}

            {response && (
                <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
                    <h2 className="font-semibold text-lg mb-2">AI Summary:</h2>
                    <ReactMarkdown>{response}</ReactMarkdown>

                    <div className="mt-4">
                        <h3 className="font-semibold text-md mb-2">
                            Product Images:
                        </h3>
                        {images.length === 0 ? (
                            <p>No images available</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {images.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Product image ${index + 1}`}
                                        className="w-full rounded shadow cursor-pointer hover:opacity-80"
                                        onClick={() => openLightbox(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        backdropFilter: "blur(8px)",
                        backgroundColor: "rgba(0,0,0,0.1)",
                    }}
                    onClick={closeLightbox}
                >
                    <div
                        className="relative max-w-4xl max-h-full p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute -top-7 right-2 text-white text-3xl font-bold hover:text-yellow-300"
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <img
                            src={images[lightboxIndex]}
                            alt={`Product large ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[80vh] rounded"
                        />

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={prevImage}
                                className="px-4 py-2 bg-white rounded shadow hover:bg-gray-100"
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextImage}
                                className="px-4 py-2 bg-white rounded shadow hover:bg-gray-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
