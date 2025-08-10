import { router } from "@inertiajs/react";

export default function Pagination({ currentPage, lastPage, categoryOrder }) {
    if (!lastPage || lastPage <= 1) return null;

    const handleClick = (page) => {
        // Handle circular navigation
        let targetPage = page;
        if (page < 1) {
            targetPage = lastPage; // Go to last page if going before 1
        } else if (page > lastPage) {
            targetPage = 1; // Go to first page if going beyond last
        }

        let categories = "";
        if (
            Array.isArray(categoryOrder) &&
            categoryOrder.length >= targetPage &&
            targetPage > 0
        ) {
            categories = categoryOrder[targetPage - 1].join(",");
        }

        // Additional safety check: don't navigate if targetPage exceeds actual category count
        if (targetPage > categoryOrder.length) {
            console.warn(
                `Page ${targetPage} exceeds available categories (${categoryOrder.length})`
            );
            return;
        }

        const params = new URLSearchParams(window.location.search);
        params.set("page", targetPage);
        params.set("categories", categories);

        router.visit(`${window.location.pathname}?${params.toString()}`);
    };

    // Calculate which pages to show based on screen size
    const getVisiblePages = () => {
        // For mobile: show 2 pages, for tablet+: show 4 pages
        const maxVisible = window.innerWidth < 640 ? 2 : 4;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(lastPage, start + maxVisible - 1);

        // Adjust start if we don't have enough pages at the end
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <nav className="flex flex-col sm:flex-row justify-center items-center mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-2 px-2">
            {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-center">
                {/* Previous Button */}
                <button
                    onClick={() => handleClick(currentPage - 1)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-1 text-xs sm:text-sm cursor-pointer"
                    title={
                        currentPage === 1
                            ? `Go to page ${lastPage}`
                            : `Go to page ${currentPage - 1}`
                    }
                >
                    <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    <span className="hidden xs:inline sm:inline">Prev</span>
                </button>

                {/* Page Numbers - Responsive count */}
                <div className="flex space-x-0.5 sm:space-x-1">
                    {visiblePages.map((num) => (
                        <button
                            key={num}
                            onClick={() => handleClick(num)}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm transition-colors min-w-[32px] sm:min-w-[40px] cursor-pointer
                                ${
                                    num === currentPage
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }
                            `}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => handleClick(currentPage + 1)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-1 text-xs sm:text-sm cursor-pointer"
                    title={
                        currentPage === lastPage
                            ? "Go to page 1"
                            : `Go to page ${currentPage + 1}`
                    }
                >
                    <span className="hidden xs:inline sm:inline">Next</span>
                    <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>

            {/* Page Info - Separate row on mobile, inline on desktop */}
            <div className="text-xs sm:text-sm text-gray-200 sm:ml-4 text-center sm:text-left">
                Page {currentPage} of {lastPage}
            </div>
        </nav>
    );
}
