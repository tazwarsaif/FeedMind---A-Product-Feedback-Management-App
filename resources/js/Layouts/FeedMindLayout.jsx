import { usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
const FeedMindLayout = ({ children, user }) => {
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] =
        useState(false);
    const [text, setText] = useState("");
    const fullText = "FeedMind";
    const [convTitle, setConvTitle] = useState("");
    const [slicedConvo, setConvoList] = useState([]);

    useEffect(() => {
        if (user?.conversations && Array.isArray(user.conversations)) {
            if (user.conversations.length > 5) {
                setConvoList(user.conversations.slice(0, 5));
            } else {
                setConvoList(user.conversations);
            }
            console.log(slicedConvo);
        }
    }, [user]);

    const accountDropdownRef = useRef(null);
    const analyticsDropdownRef = useRef(null);
    // Typewriter effect for logo
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                accountDropdownRef.current &&
                !accountDropdownRef.current.contains(event.target)
            ) {
                setIsAccountDropdownOpen(false);
            }
            if (
                analyticsDropdownRef.current &&
                !analyticsDropdownRef.current.contains(event.target)
            ) {
                setIsAnalyticsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("categoryOrder");
        window.location.href = "/login";
    };

    const sidebarLinks = [
        {
            name: "Products",
            icon: (
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
            href: "/products",
        },
        {
            name: "FeedGPT",
            icon: (
                // Writing/AI style SVG (pencil with sparkles)
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M16.862 5.487l1.65-1.65a2.121 2.121 0 10-3-3l-1.65 1.65m2 2l-9.193 9.193a2 2 0 00-.512.878l-1.12 3.36a.5.5 0 00.632.632l3.36-1.12a2 2 0 00.878-.512L18.862 7.487m-2-2l2 2"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M19 14v2m0 4v.01M21 16h-2m-4 0h-.01"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ),
            isDropdown: true,
            dropdownItems: [
                { name: "Product Performance", href: "/analytics/products" },
                { name: "Customer Insights", href: "/analytics/customers" },
                { name: "Reports", href: "/analytics/reports" },
            ],
        },
        {
            name: "Amazon Scrape",
            icon: (
                // AI/brain style SVG
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M9 12a3 3 0 016 0v6a3 3 0 01-6 0v-6z"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 6V4m0 16v-2m8-6h-2m-12 0H4m14.364-5.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.414l1.414 1.414M17.95 17.95l1.414 1.414"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ),
            href: "/amazon-scrape",
        },
    ];

    const getUserInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-[#39344a]">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-[#28243c] border-b border-[#39344a] z-50 h-16">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Left: Logo and Menu Toggle */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-[#39344a] transition-colors"
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Logo */}
                        <motion.span
                            className="text-xl lg:text-2xl font-bold tracking-widest font-mono bg-gradient-to-r from-green-300 via-purple-300 to-black bg-clip-text text-transparent"
                            style={{
                                backgroundSize: "200% 200%",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                            animate={{
                                backgroundPosition: [
                                    "0% 50%",
                                    "100% 50%",
                                    "0% 50%",
                                ],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4,
                                ease: "linear",
                            }}
                        >
                            {text}
                        </motion.span>
                    </div>

                    {/* Right: Account Dropdown */}
                    <div className="relative" ref={accountDropdownRef}>
                        <button
                            onClick={() =>
                                setIsAccountDropdownOpen(!isAccountDropdownOpen)
                            }
                            className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-[#39344a] transition-colors"
                        >
                            <div className="w-8 h-8 bg-[#a892fe] rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                    {getUserInitials(user?.name)}
                                </span>
                            </div>
                            <span className="hidden sm:block text-sm">
                                {user?.name || "Account"}
                            </span>
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
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {isAccountDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-48 bg-[#2c2841] rounded-lg shadow-xl border border-[#39344a] py-2"
                                >
                                    <div className="px-4 py-2 border-b border-[#39344a]">
                                        <p className="text-sm text-gray-400">
                                            Signed in as
                                        </p>
                                        <p className="text-sm font-medium text-white truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <a
                                        href="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#39344a] transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        Profile
                                    </a>
                                    <hr className="my-2 border-[#39344a]" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#39344a] transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#2c2841] border-r border-[#39344a] z-40 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto py-6">
                        <nav className="space-y-2 px-4">
                            {sidebarLinks.map((link, index) => (
                                <div key={index}>
                                    {link.isDropdown ? (
                                        <div ref={analyticsDropdownRef}>
                                            <button
                                                onClick={() =>
                                                    setIsAnalyticsDropdownOpen(
                                                        !isAnalyticsDropdownOpen
                                                    )
                                                }
                                                className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {link.icon}
                                                    <span>{link.name}</span>
                                                </div>
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                        isAnalyticsDropdownOpen
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
                                            <AnimatePresence>
                                                {isAnalyticsDropdownOpen && (
                                                    <>
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                height: "auto",
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="ml-6 mt-2 space-y-1"
                                                        >
                                                            <div className="flex flex-col space-y-3">
                                                                <div>
                                                                    <button
                                                                        className="bg-slate-300 flex items-center px-3 py-2 text-sm text-purple-800 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors cursor-pointer w-full"
                                                                        onClick={() =>
                                                                            document
                                                                                .getElementById(
                                                                                    "my_modal_5"
                                                                                )
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
                                                                        Add
                                                                        Conversation
                                                                    </button>
                                                                    <dialog
                                                                        id="my_modal_5"
                                                                        className="modal modal-bottom sm:modal-middle"
                                                                    >
                                                                        <div className="modal-box bg-[#39344a] text-white">
                                                                            <h3 className="font-bold text-lg">
                                                                                Title
                                                                                of
                                                                                the
                                                                                Conversation
                                                                            </h3>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Enter title"
                                                                                value={
                                                                                    convTitle
                                                                                }
                                                                                className="input input-bordered w-full text-black mt-3"
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setConvTitle(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
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
                                                                                                    headers:
                                                                                                        {
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
                                                                                                .then(
                                                                                                    (
                                                                                                        res
                                                                                                    ) =>
                                                                                                        res.json()
                                                                                                )
                                                                                                .then(
                                                                                                    (
                                                                                                        data
                                                                                                    ) => {
                                                                                                        if (
                                                                                                            data &&
                                                                                                            data.id
                                                                                                        ) {
                                                                                                            window.location.href = `/feedgpt/${data.id}`;
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .catch(
                                                                                                    (
                                                                                                        err
                                                                                                    ) => {
                                                                                                        console.error(
                                                                                                            "Failed to start conversation:",
                                                                                                            err
                                                                                                        );
                                                                                                    }
                                                                                                );
                                                                                        }}
                                                                                    >
                                                                                        Start
                                                                                        Conversation
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

                                                            {user.conversations
                                                                .slice(0, 5)
                                                                .map(
                                                                    (
                                                                        item,
                                                                        itemIndex
                                                                    ) => (
                                                                        <a
                                                                            key={
                                                                                itemIndex
                                                                            }
                                                                            href={`/feedgpt/${item.id}`}
                                                                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                                                url ===
                                                                                item.href
                                                                                    ? "bg-[#39344a] text-white"
                                                                                    : "text-gray-400 hover:text-white hover:bg-[#39344a]"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </a>
                                                                    )
                                                                )}
                                                            <div>
                                                                <button
                                                                    className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors cursor-pointer w-full"
                                                                    onClick={() =>
                                                                        (window.location.href =
                                                                            "/conversations")
                                                                    }
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-5 w-5 mr-2"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                                    </svg>
                                                                    All
                                                                    Conversations
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                                                url === link.href
                                                    ? "bg-[#39344a] text-white"
                                                    : "text-gray-300 hover:text-white hover:bg-[#39344a]"
                                            }`}
                                        >
                                            {link.icon}
                                            <span>{link.name}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="pt-16 lg:pl-64 min-h-screen">
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
};

export default FeedMindLayout;
