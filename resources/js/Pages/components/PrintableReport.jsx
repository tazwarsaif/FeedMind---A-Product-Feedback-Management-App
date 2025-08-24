import ReactMarkdown from "react-markdown";

const PrintableReport = ({ product, ratingStats }) => {
    // Helper function to create CSS-based pie chart
    const CSSPieChart = ({ data }) => {
        if (!data || data.length === 0) return null;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercent = 0;

        return (
            <div
                className="pie-chart-container"
                style={{
                    width: "200px",
                    height: "200px",
                    margin: "0 auto",
                    position: "relative",
                }}
            >
                <div
                    className="pie-chart"
                    style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        background: `conic-gradient(
                            ${data
                                .map((item) => {
                                    const percent = (item.value / total) * 100;
                                    const startPercent = cumulativePercent;
                                    cumulativePercent += percent;

                                    const colors = {
                                        5: "#10b981",
                                        4: "#84cc16",
                                        3: "#f59e0b",
                                        2: "#f97316",
                                        1: "#ef4444",
                                    };

                                    return `${
                                        colors[item.rating] || "#6b7280"
                                    } ${startPercent}% ${cumulativePercent}%`;
                                })
                                .join(", ")}
                        )`,
                    }}
                />
                {/* Center circle to create donut effect */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80px",
                        height: "80px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                    }}
                />

                {/* Legend */}
                <div style={{ marginTop: "20px", fontSize: "12px" }}>
                    {data.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "5px",
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor:
                                        {
                                            5: "#10b981",
                                            4: "#84cc16",
                                            3: "#f59e0b",
                                            2: "#f97316",
                                            1: "#ef4444",
                                        }[item.rating] || "#6b7280",
                                    marginRight: "8px",
                                    borderRadius: "2px",
                                }}
                            />
                            <span>
                                {item.name}: {item.value} ({item.percentage}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                maxWidth: "210mm",
                margin: "0 auto",
                backgroundColor: "white",
                color: "#333",
            }}
        >
            {/* Print Styles */}
            <style>{`
                @media print {
                    body { margin: 0; }
                    @page { margin: 1cm; }
                    .page-break { page-break-after: always; }
                }
                .pie-chart-container { break-inside: avoid; }
            `}</style>

            {/* Header */}
            <div
                style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: "20px",
                }}
            >
                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#7c3aed",
                        marginBottom: "10px",
                    }}
                >
                    Product Analysis Report
                </h1>
                <h2
                    style={{
                        fontSize: "20px",
                        color: "#4b5563",
                        marginBottom: "15px",
                    }}
                >
                    {product?.title || "Product Analysis"}
                </h2>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            backgroundColor: "#fbbf24",
                            color: "black",
                            padding: "5px 15px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        Rating: {product?.rating || "N/A"}/5.0
                    </span>
                    <span style={{ color: "#6b7280" }}>
                        Product: {product?.product?.name || "Unknown Product"}
                    </span>
                </div>
            </div>

            {/* Two Column Layout */}
            <div
                style={{
                    display: "flex",
                    gap: "30px",
                    alignItems: "flex-start",
                }}
            >
                {/* Left Column - Report Content */}
                <div style={{ flex: "2" }}>
                    <div
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                                color: "#7c3aed",
                                borderBottom: "1px solid #e5e7eb",
                                paddingBottom: "10px",
                            }}
                        >
                            Detailed Analysis Report
                        </h3>
                        <div style={{ lineHeight: "1.6" }}>
                            {product?.full_report ? (
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => (
                                            <h1
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: "bold",
                                                    color: "#7c3aed",
                                                    marginTop: "20px",
                                                    marginBottom: "10px",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2
                                                style={{
                                                    fontSize: "16px",
                                                    fontWeight: "bold",
                                                    color: "#7c3aed",
                                                    marginTop: "15px",
                                                    marginBottom: "8px",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    color: "#8b5cf6",
                                                    marginTop: "12px",
                                                    marginBottom: "6px",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        p: ({ node, ...props }) => (
                                            <p
                                                style={{
                                                    marginBottom: "10px",
                                                    color: "#374151",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        ul: ({ node, ...props }) => (
                                            <ul
                                                style={{
                                                    paddingLeft: "20px",
                                                    marginBottom: "10px",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol
                                                style={{
                                                    paddingLeft: "20px",
                                                    marginBottom: "10px",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li
                                                style={{
                                                    marginBottom: "5px",
                                                    color: "#374151",
                                                }}
                                                {...props}
                                            />
                                        ),
                                        strong: ({ node, ...props }) => (
                                            <strong
                                                style={{
                                                    fontWeight: "bold",
                                                    color: "#1f2937",
                                                }}
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {product.full_report}
                                </ReactMarkdown>
                            ) : (
                                <p
                                    style={{
                                        color: "#9ca3af",
                                        fontStyle: "italic",
                                    }}
                                >
                                    No detailed report available
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Charts and Info */}
                <div style={{ flex: "1", minWidth: "250px" }}>
                    {/* Rating Distribution */}
                    {ratingStats && ratingStats.length > 0 && (
                        <div
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    marginBottom: "15px",
                                    color: "#7c3aed",
                                    borderBottom: "1px solid #e5e7eb",
                                    paddingBottom: "10px",
                                }}
                            >
                                Rating Distribution
                            </h3>
                            <CSSPieChart data={ratingStats} />
                        </div>
                    )}

                    {/* Product Information */}
                    <div
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "20px",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                                color: "#7c3aed",
                                borderBottom: "1px solid #e5e7eb",
                                paddingBottom: "10px",
                            }}
                        >
                            Product Information
                        </h3>
                        <div style={{ fontSize: "14px" }}>
                            <div style={{ marginBottom: "10px" }}>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        color: "#7c3aed",
                                    }}
                                >
                                    Price:
                                </span>
                                <span
                                    style={{
                                        marginLeft: "8px",
                                        color: "#374151",
                                    }}
                                >
                                    {product?.product?.price || "N/A"}
                                </span>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        color: "#7c3aed",
                                    }}
                                >
                                    Total Reviews:
                                </span>
                                <span
                                    style={{
                                        marginLeft: "8px",
                                        color: "#374151",
                                    }}
                                >
                                    {product?.product?.amazon_reviews?.length ||
                                        0}
                                </span>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        color: "#7c3aed",
                                    }}
                                >
                                    Categories:
                                </span>
                                <div style={{ marginTop: "5px" }}>
                                    {product?.product?.categories?.map(
                                        (category) => (
                                            <span
                                                key={category.id}
                                                style={{
                                                    backgroundColor: "#7c3aed",
                                                    color: "white",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    display: "inline-block",
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        )
                                    ) || (
                                        <span style={{ color: "#9ca3af" }}>
                                            No categories
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Break */}
            <div className="page-break" />

            {/* Executive Summary */}
            <div
                style={{
                    border: "2px solid #7c3aed",
                    borderRadius: "8px",
                    padding: "20px",
                    marginTop: "30px",
                    backgroundColor: "#f8fafc",
                }}
            >
                <h3
                    style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        marginBottom: "15px",
                        color: "#7c3aed",
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: "10px",
                    }}
                >
                    Executive Summary
                </h3>
                <p
                    style={{
                        fontSize: "16px",
                        lineHeight: "1.6",
                        color: "#374151",
                    }}
                >
                    {product?.summary ||
                        "No summary available for this product analysis."}
                </p>
            </div>

            {/* Footer */}
            <div
                style={{
                    textAlign: "center",
                    marginTop: "30px",
                    padding: "10px",
                    borderTop: "1px solid #e5e7eb",
                    fontSize: "12px",
                    color: "#9ca3af",
                }}
            >
                <p>
                    Generated on {new Date().toLocaleDateString()} | Product
                    Analysis Report
                </p>
            </div>
        </div>
    );
};

export default PrintableReport;
