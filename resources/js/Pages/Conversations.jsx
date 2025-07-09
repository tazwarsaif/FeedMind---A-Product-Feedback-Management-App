import axios from "axios";
import { useEffect, useState } from "react";
import FeedMindLayout from "../Layouts/FeedMindLayout";
import Header from "../Layouts/Header";

const Conversations = () => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState("");
    const [summaryLoad, setSummaryLoad] = useState(false);
    const [convTitle, setConvTitle] = useState("");
    const summaryFetch = async (conv) => {
        setSummaryLoad(true);
        fetch(
            `http://127.0.0.1:8000/api/chat/conversation/${conv?.id}/summary`,
            {
                method: "Get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setSummary(data);
                conv.summary = data;
                setSummaryLoad(false);
                console.log(data);
            })
            .catch((err) => {
                setSummaryLoad(false);
                console.error("Failed to start conversation:", err);
            });
    };
    const deleteConversation = async (id) => {
        try {
            const response = await axios.post(
                `/api/delete-conversation/${id}`,
                { id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );
            if (response.data.error) {
                console.log("API Error:", response.data.error);
                return;
            }
            console.log("Success:", response);
            window.location.reload();
        } catch (error) {
            if (error.response) {
                console.log("Validation or server error:", error);
                window.alert("Server Error");
            } else {
                console.error("Unexpected error:", error);
            }
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
        // Fetch conversations
        const token = localStorage.getItem("token");
        if (!token) return;
        setLoadingConvos(true);
        axios
            .get("http://127.0.0.1:8000/api/chat", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("This is res", res);
                setConversations(res.data.Conversation);
            })
            .catch((err) => setError("Failed to load conversations"))
            .finally(() => setLoadingConvos(false));
    }, []);

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
            <Header title={"Conversations"} />
            <FeedMindLayout user={user}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 md:mb-0">
                        <div>
                            <h1 className="text-2xl font-bold mb-4 text-purple-300">
                                Your Conversations
                            </h1>
                        </div>
                        <div>
                            <button
                                className="bg-slate-300 flex items-center px-3 py-2 text-sm text-purple-800 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors cursor-pointer w-full"
                                onClick={() =>
                                    document
                                        .getElementById("my_modal_5")
                                        .showModal()
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
                                Add Conversation
                            </button>
                            <dialog
                                id="my_modal_5"
                                className="modal modal-bottom sm:modal-middle"
                            >
                                <div className="modal-box bg-[#39344a] text-white">
                                    <h3 className="font-bold text-lg">
                                        Title of the Conversation
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Enter title"
                                        value={convTitle}
                                        className="input input-bordered w-full text-black mt-3"
                                        onChange={(e) =>
                                            setConvTitle(e.target.value)
                                        }
                                    />
                                    <div className="modal-action">
                                        <form
                                            method="dialog"
                                            className="flex space-x-3"
                                        >
                                            {/* if there is a button in form, it will close the modal */}
                                            <button
                                                className="btn bg-violet-300 border-purple-400 hover:text-white hover:bg-[#39344a]"
                                                onClick={() => {
                                                    fetch(
                                                        "http://127.0.0.1:8000/api/chat/start",
                                                        {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type":
                                                                    "application/json",
                                                                Authorization: `Bearer ${localStorage.getItem(
                                                                    "token"
                                                                )}`,
                                                            },
                                                            body: JSON.stringify(
                                                                {
                                                                    title: convTitle,
                                                                }
                                                            ),
                                                        }
                                                    )
                                                        .then((res) =>
                                                            res.json()
                                                        )
                                                        .then((data) => {
                                                            if (
                                                                data &&
                                                                data.id
                                                            ) {
                                                                window.location.href = `/feedgpt/${data.id}`;
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            console.error(
                                                                "Failed to start conversation:",
                                                                err
                                                            );
                                                        });
                                                }}
                                            >
                                                Start Conversation
                                            </button>
                                            <button className="btn ">
                                                Close
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </div>
                    </div>

                    {loadingConvos ? (
                        <div className="flex items-center space-x-2 text-purple-300">
                            <div className="w-6 h-6 border-4 border-[#a892fe] border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading conversations...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400">{error}</div>
                    ) : conversations.length === 0 ? (
                        <div className="text-gray-400">
                            No conversations found.
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                className="bg-[#2c2841] hover:bg-[#554e6b] rounded-lg shadow cursor-pointer flex justify-between p-5 my-2"
                                key={conv.id}
                            >
                                <>
                                    <div
                                        className="flex items-center"
                                        onClick={() => {
                                            window.location.href = `/feedgpt/${conv.id}`;
                                        }}
                                    >
                                        <a
                                            href={`/feedgpt/${conv.id}`}
                                            className="text-purple-300 w-27 md:w-full text-xl text-wrap break-words"
                                        >
                                            {conv.title}
                                            <span className="text-[10px] text-gray-400">
                                                {" "}
                                                {/* Smaller and lighter text */}
                                                {new Date(
                                                    conv.created_at
                                                ).toLocaleDateString("en-CA")}
                                            </span>
                                        </a>
                                    </div>
                                    <div className="inline-flex items-center cursor-pointer transition-colors space-x-2">
                                        <div
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        `summary_modal_${conv.id}`
                                                    )
                                                    .showModal()
                                            }
                                            className="bg-blue-600 hover:bg-blue-700 p-2 px-3  text-white rounded-lg cursor-pointer"
                                        >
                                            <svg
                                                className="w-6 h-6 text-white-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 2v4M8 2v4"
                                                />
                                            </svg>
                                            <dialog
                                                id={`summary_modal_${conv.id}`}
                                                className="modal modal-bottom sm:modal-middle"
                                            >
                                                <div className="modal-box bg-[#39344a] text-white">
                                                    <h3 className="font-bold text-lg">
                                                        Summarization of the
                                                        Conversation
                                                    </h3>
                                                    {!conv.summary &&
                                                        summaryLoad ===
                                                            false && (
                                                            <div>
                                                                click generate
                                                                summary
                                                            </div>
                                                        )}
                                                    {summaryLoad === true && (
                                                        <span className="loading loading-bars loading-xl"></span>
                                                    )}
                                                    {conv?.summary &&
                                                        summaryLoad ===
                                                            false && (
                                                            <div>
                                                                {conv?.summary}
                                                            </div>
                                                        )}
                                                    <div className="modal-action">
                                                        {!summaryLoad && (
                                                            <button
                                                                className="btn bg-violet-300 border-purple-400 hover:text-white hover:bg-[#39344a]"
                                                                onClick={() =>
                                                                    summaryFetch(
                                                                        conv
                                                                    )
                                                                }
                                                            >
                                                                Generate Summary
                                                            </button>
                                                        )}

                                                        <form
                                                            method="dialog"
                                                            className="flex space-x-3"
                                                            onSubmit={() =>
                                                                setSummary("")
                                                            }
                                                        >
                                                            {/* if there is a button in form, it will close the modal */}

                                                            <button className="btn">
                                                                Close
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </dialog>
                                        </div>
                                        <div
                                            className="bg-red-600 hover:bg-red-700 p-2 px-3  text-white rounded-lg"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        `delete_${conv.id}`
                                                    )
                                                    .showModal()
                                            }
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
                                        <dialog
                                            id={`delete_${conv.id}`}
                                            className="modal modal-bottom sm:modal-middle"
                                        >
                                            <div className="modal-box">
                                                <h3 className="font-bold text-lg">
                                                    You sure you want to delete
                                                    your conversation?
                                                </h3>

                                                <div className="modal-action">
                                                    <form method="dialog">
                                                        {/* if there is a button in form, it will close the modal */}
                                                        <button className="btn">
                                                            No
                                                        </button>
                                                    </form>
                                                    <button
                                                        className="btn btn-error text-white"
                                                        onClick={(e) =>
                                                            deleteConversation(
                                                                conv.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </dialog>
                                    </div>
                                </>
                            </div>
                        ))
                    )}
                </div>
            </FeedMindLayout>
        </>
    );
};

export default Conversations;
