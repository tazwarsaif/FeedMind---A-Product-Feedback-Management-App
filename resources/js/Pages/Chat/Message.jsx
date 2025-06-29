export default function Message({ sender, content }) {
    const isUser = sender === "user";

    return (
        <div
            className={`p-3 max-w-2xl rounded ${
                isUser ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
            }`}
        >
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {content}
            </p>
        </div>
    );
}
