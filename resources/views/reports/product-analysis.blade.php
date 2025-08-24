<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Page Setup with consistent margins */
        @page {
            margin: 2cm 1.5cm 2cm 1.5cm;
            size: A4 portrait;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            background: white;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
        }

        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 15px;
            page-break-inside: avoid;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 8px;
        }

        .header h2 {
            font-size: 18px;
            color: #4b5563;
            margin-bottom: 12px;
        }

        .header-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .rating-badge {
            background-color: #fbbf24;
            color: black;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }

        .product-info {
            color: #6b7280;
            font-size: 12px;
        }

        /* Main Content Grid */
        .content-grid {
            display: flex;
            gap: 25px;
            margin-top: 15px;
        }

        .main-content {
            flex: 2;
        }

        .sidebar {
            flex: 1;
            min-width: 220px;
        }

        /* Section Styling */
        .section {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
        }

        /* Markdown Content Styling */
        .markdown-content {
            line-height: 1.7;
        }

        .markdown-content h1 {
            font-size: 16px;
            font-weight: bold;
            color: #7c3aed;
            margin-top: 15px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        .markdown-content h2 {
            font-size: 14px;
            font-weight: bold;
            color: #7c3aed;
            margin-top: 12px;
            margin-bottom: 6px;
            page-break-after: avoid;
        }

        .markdown-content h3 {
            font-size: 13px;
            font-weight: bold;
            color: #8b5cf6;
            margin-top: 10px;
            margin-bottom: 5px;
            page-break-after: avoid;
        }

        .markdown-content p {
            margin-bottom: 8px;
            text-align: justify;
            orphans: 2;
            widows: 2;
        }

        .markdown-content ul, .markdown-content ol {
            padding-left: 18px;
            margin-bottom: 8px;
        }

        .markdown-content li {
            margin-bottom: 4px;
        }

        .markdown-content strong {
            font-weight: bold;
            color: #1f2937;
        }

        /* Pie Chart Styles */
        .chart-container {
            text-align: center;
            margin: 15px 0;
            page-break-inside: avoid;
        }

        .pie-chart {
            width: 160px;
            height: 160px;
            margin: 0 auto 10px auto;
            position: relative;
        }

        .pie-chart svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .pie-slice {
            stroke: white;
            stroke-width: 1;
        }

        .chart-center-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            color: #374151;
        }

        .chart-legend {
            margin-top: 10px;
            font-size: 10px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            justify-content: flex-start;
        }

        .legend-color {
            width: 10px;
            height: 10px;
            margin-right: 6px;
            border-radius: 2px;
            flex-shrink: 0;
        }

        /* Product Info Styles */
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
        }

        .info-label {
            font-weight: bold;
            color: #7c3aed;
            font-size: 11px;
        }

        .info-value {
            color: #374151;
            font-size: 11px;
        }

        .categories {
            margin-top: 5px;
        }

        .category-tag {
            background-color: #7c3aed;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            margin-right: 4px;
            margin-bottom: 4px;
            display: inline-block;
        }

        /* Summary Section */
        .summary-section {
            border: 2px solid #7c3aed;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
            background-color: #f8fafc;
            page-break-inside: avoid;
        }

        .summary-title {
            font-size: 16px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 12px;
        }

        .summary-text {
            font-size: 12px;
            line-height: 1.6;
            color: #374151;
            text-align: justify;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            font-size: 9px;
            color: #9ca3af;
            page-break-inside: avoid;
        }

        /* Rating Colors */
        .rating-5 { fill: #10b981; background-color: #10b981; }
        .rating-4 { fill: #84cc16; background-color: #84cc16; }
        .rating-3 { fill: #f59e0b; background-color: #f59e0b; }
        .rating-2 { fill: #f97316; background-color: #f97316; }
        .rating-1 { fill: #ef4444; background-color: #ef4444; }

        /* Page Break Controls */
        .page-break-before {
            page-break-before: always;
        }

        .page-break-after {
            page-break-after: always;
        }

        .avoid-break {
            page-break-inside: avoid;
        }

        /* Print-specific styles */
        @media print {
            body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .section {
                box-shadow: none;
            }
        }

        /* Bar Chart Alternative (fallback) */
        .bar-chart-item {
            margin-bottom: 6px;
            page-break-inside: avoid;
        }

        .bar-chart-row {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
        }

        .bar-chart-label {
            width: 50px;
            font-size: 9px;
            flex-shrink: 0;
        }

        .bar-chart-bar {
            flex: 1;
            background: #f3f4f6;
            height: 12px;
            margin: 0 4px;
            border-radius: 2px;
            position: relative;
            overflow: hidden;
        }

        .bar-chart-fill {
            height: 100%;
            border-radius: 2px;
        }

        .bar-chart-percentage {
            font-size: 9px;
            width: 35px;
            text-align: right;
            flex-shrink: 0;
        }

        .bar-chart-count {
            font-size: 8px;
            color: #6b7280;
            text-align: right;
            margin-top: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Product Analysis Report</h1>
            <h2>{{ $product['title'] ?? 'Product Analysis' }}</h2>
            <div class="header-info">
                <span class="rating-badge">
                    Rating: {{ $product['rating'] ?? 'N/A' }}/5.0
                </span>
                <span class="product-info">
                    Product: {{ $product['product']['name'] ?? 'Unknown Product' }}
                </span>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Left Column - Report Content -->
            <div class="main-content">
                <div class="section">
                    <h3 class="section-title">Detailed Analysis Report</h3>
                    <div class="markdown-content">
                        @if(isset($product['full_report']) && $product['full_report'])
                            {!! \Illuminate\Support\Str::markdown($product['full_report']) !!}
                        @else
                            <p style="color: #9ca3af; font-style: italic;">
                                No detailed report available
                            </p>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Right Column - Charts and Info -->
            <div class="sidebar">
                <!-- Rating Distribution with Pie Chart -->
                @if(count($ratingStats) > 0)
                <div class="section">
                    <h3 class="section-title">Rating Distribution</h3>
                    <div class="chart-container">
                        <!-- Pie Chart -->
                        <div class="pie-chart">
                            <svg viewBox="0 0 160 160">
                                @php
                                    $total = array_sum(array_column($ratingStats, 'count'));
                                    $currentAngle = 0;
                                    $centerX = 80;
                                    $centerY = 80;
                                    $radius = 70;
                                @endphp

                                @foreach($ratingStats as $index => $stat)
                                    @php
                                        $percentage = $stat['count'] / $total;
                                        $angle = $percentage * 360;
                                        $startAngle = $currentAngle;
                                        $endAngle = $currentAngle + $angle;

                                        $startAngleRad = deg2rad($startAngle);
                                        $endAngleRad = deg2rad($endAngle);

                                        $startX = $centerX + $radius * cos($startAngleRad);
                                        $startY = $centerY + $radius * sin($startAngleRad);
                                        $endX = $centerX + $radius * cos($endAngleRad);
                                        $endY = $centerY + $radius * sin($endAngleRad);

                                        $largeArcFlag = $angle > 180 ? 1 : 0;

                                        $pathData = "M {$centerX} {$centerY} L {$startX} {$startY} A {$radius} {$radius} 0 {$largeArcFlag} 1 {$endX} {$endY} Z";

                                        $currentAngle += $angle;
                                    @endphp

                                    <path d="{{ $pathData }}"
                                          class="pie-slice rating-{{ $stat['rating'] }}"
                                          title="{{ $stat['rating'] }} Stars: {{ $stat['percentage'] }}%">
                                    </path>
                                @endforeach
                            </svg>
                            <div class="chart-center-text">
                                <div>Total</div>
                                <div>{{ $total }} Reviews</div>
                            </div>
                        </div>

                        <!-- Legend -->
                        <div class="chart-legend">
                            @foreach($ratingStats as $stat)
                                <div class="legend-item">
                                    <div class="legend-color rating-{{ $stat['rating'] }}"></div>
                                    <span>{{ $stat['rating'] }} Star{{ $stat['rating'] == 1 ? '' : 's' }}: {{ $stat['percentage'] }}% ({{ $stat['count'] }})</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <!-- Bar Chart Fallback (Alternative view) -->
                <div class="section">
                    <h3 class="section-title">Rating Breakdown</h3>
                    @foreach($ratingStats as $stat)
                        <div class="bar-chart-item">
                            <div class="bar-chart-row">
                                <span class="bar-chart-label">{{ $stat['rating'] }} Star{{ $stat['rating'] == 1 ? '' : 's' }}:</span>
                                <div class="bar-chart-bar">
                                    <div class="bar-chart-fill rating-{{ $stat['rating'] }}" style="width: {{ $stat['percentage'] }}%;"></div>
                                </div>
                                <span class="bar-chart-percentage">{{ $stat['percentage'] }}%</span>
                            </div>
                            <div class="bar-chart-count">{{ $stat['count'] }} reviews</div>
                        </div>
                    @endforeach
                </div>
                @endif

                <!-- Product Information -->
                <div class="section">
                    <h3 class="section-title">Product Information</h3>
                    <div class="info-row">
                        <span class="info-label">Price:</span>
                        <span class="info-value">{{ $product['product']['price'] ?? 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Total Reviews:</span>
                        <span class="info-value">{{ isset($product['product']['amazon_reviews']) ? count($product['product']['amazon_reviews']) : 0 }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Overall Rating:</span>
                        <span class="info-value">{{ $product['rating'] ?? 'N/A' }}/5.0</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span class="info-label">Categories:</span>
                        <div class="categories">
                            @if(isset($product['product']['categories']) && count($product['product']['categories']) > 0)
                                @foreach($product['product']['categories'] as $category)
                                    <span class="category-tag">{{ is_array($category) ? ($category['name'] ?? $category) : $category }}</span>
                                @endforeach
                            @else
                                <span class="info-value" style="color: #9ca3af;">No categories</span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="summary-section">
            <h3 class="summary-title">Executive Summary</h3>
            <p class="summary-text">
                {{ $product['summary'] ?? 'No summary available for this product analysis.' }}
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Generated on {{ $generatedAt }} | Product Analysis Report</p>
        </div>
    </div>
</body>
</html>
