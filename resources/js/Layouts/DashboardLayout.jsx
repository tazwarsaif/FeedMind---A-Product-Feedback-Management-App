import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DashboardLayout = ({ children, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] =
        useState(false);
    const [text, setText] = useState("");
    const fullText = "FeedMind";

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
        router.visit("/login");
    };

    const sidebarLinks = [
        {
            name: "Dashboard",
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
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                    />
                </svg>
            ),
            href: "/dashboard",
            active: true,
        },
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
            name: "Reviews",
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            ),
            href: "/reviews",
        },
        {
            name: "Analytics",
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            ),
            isDropdown: true,
            dropdownItems: [
                { name: "Overview", href: "/analytics/overview" },
                { name: "Product Performance", href: "/analytics/products" },
                { name: "Customer Insights", href: "/analytics/customers" },
                { name: "Reports", href: "/analytics/reports" },
            ],
        },
        {
            name: "AI Assistant",
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                </svg>
            ),
            href: "/ai-assistant",
        },
        {
            name: "Settings",
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
            href: "/settings",
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
                                                        {link.dropdownItems.map(
                                                            (
                                                                item,
                                                                itemIndex
                                                            ) => (
                                                                <a
                                                                    key={
                                                                        itemIndex
                                                                    }
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors"
                                                                >
                                                                    {item.name}
                                                                </a>
                                                            )
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className={`flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#39344a] rounded-lg transition-colors group ${
                                                link.active
                                                    ? "bg-[#39344a] text-white"
                                                    : ""
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

export default DashboardLayout;
