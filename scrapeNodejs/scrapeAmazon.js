const puppeteer = require("puppeteer");

async function scrapeAmazon(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const result = await page.evaluate(() => {
        const title =
            document.querySelector("#productTitle")?.innerText.trim() ||
            "No title";

        const features = Array.from(
            document.querySelectorAll("#feature-bullets li")
        )
            .map((el) => el.innerText.trim())
            .filter(Boolean);

        const reviews = Array.from(
            document.querySelectorAll(".review-text-content span")
        )
            .map((el) => el.innerText.trim())
            .filter(Boolean);
        const reviewerNames = Array.from(
            document.querySelectorAll(".review .a-profile-name")
        )
            .map((el) => el.innerText.trim())
            .filter(Boolean);

        const reviewStarsRaw = Array.from(
            document.querySelectorAll(".review-rating")
        )
            .map((el) => el.innerText.trim())
            .filter((text) => text.includes("out of 5 stars"));

        const reviewStars = reviewStarsRaw
            .map((text) => {
                const match = text.match(/([\d.]+) out of 5 stars/);
                return match ? parseFloat(match[1]) : null;
            })
            .filter((num) => num !== null);
        const imageUrls = Array.from(
            document.querySelectorAll("#altImages img")
        )
            .map((img) => img.src.replace(/_.+_\.jpg/, "_SL1500_.jpg"))
            .filter(Boolean);

        const averageRating =
            reviewStars.length > 0
                ? (
                      reviewStars.reduce((a, b) => a + b, 0) /
                      reviewStars.length
                  ).toFixed(2)
                : "No rating found";
        const keywords = Array.from(
            document.querySelectorAll(
                "#wayfinding-breadcrumbs_feature_div ul.a-unordered-list a"
            )
        )
            .map((el) => el.innerText.trim())
            .filter(Boolean);
        const priceElement =
            document.querySelector("#priceblock_ourprice") ||
            document.querySelector("#priceblock_dealprice") ||
            document.querySelector("#priceblock_saleprice") ||
            document.querySelector("[data-asin-price]") ||
            document.querySelector(".a-price .a-offscreen");

        const price = priceElement
            ? priceElement.innerText.trim()
            : "Price not found";

        return {
            title,
            features,
            reviewerNames,
            reviews,
            individualRatings: reviewStars,
            averageRating,
            images: imageUrls,
            keywords: keywords,
            price: price,
            url: window.location.href,
        };
    });

    await browser.close();

    console.log(JSON.stringify(result, null, 2));
}

const url = process.argv[2];
if (!url) {
    console.error("URL missing");
    process.exit(1);
}

scrapeAmazon(url);
