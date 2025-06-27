// resources/js/Pages/ScrapePage.jsx
import axios from "axios";
import { useState } from "react";

export default function ScrapePage() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState(null);

    const handleScrape = async () => {
        try {
            const res = await axios.post("/api/scrape", { url });
            setResult(res.data);
        } catch (err) {
            alert("Failed to scrape: " + err.response?.data?.error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Scrape Product</h1>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border p-2 w-full"
                placeholder="Paste product URL"
            />
            <button
                onClick={handleScrape}
                className="bg-blue-600 text-white px-4 py-2 mt-2"
            >
                Scrape
            </button>

            {result && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">{result.title}</h2>
                    <p>{result.description}</p>
                    <pre className="bg-gray-100 p-2 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {result.body}
                    </pre>
                </div>
            )}
        </div>
    );
}
