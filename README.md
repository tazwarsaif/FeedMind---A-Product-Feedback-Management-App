# 🧠 FeedMind – Product Feedback Management Platform

FeedMind is an AI-enhanced product feedback and analysis platform designed to help users gather, understand, and generate insights from product reviews. Whether you're a product manager, seller, or curious buyer, FeedMind allows you to scrape product pages (e.g., Amazon), summarize key reviews, chat with an intelligent assistant about pros and cons, and even generate reports.

---

## 🚀 Features

- 🔎 **Product Web Scraping** – Extract product titles, descriptions, and customer reviews from platforms like Amazon.
- 💬 **AI Chatbot with Ollama** – Ask about product pros, cons, or comparisons through an AI-driven assistant.
- 📝 **Feedback Management** – Add and manage personal reviews alongside scraped data.
- 📂 **Conversation Categorization** – Group and title conversations like ChatGPT sessions.
- 📄 **PDF/Image Generation (Optional)** – Convert AI responses into downloadable reports or images.
- 🧠 **Note Summarization & Tagging** – Automatically summarize scraped or written content with OpenAI.
- 🔐 **Google OAuth Authentication** – Secure login and registration via Google.
- 🧑‍💼 **User Dashboard** – View saved products, conversations, and AI outputs.
- 🔔 **Real-Time Notifications** – Get notified when scraping or AI processing is complete (via WebSockets).
- 🌐 **Inertia.js + React SPA** – Smooth, modern user experience powered by Laravel and React.

---

## 📦 Tech Stack

| Layer           | Technology               |
|----------------|---------------------------|
| Backend         | Laravel 10, PHP 8.2       |
| Frontend        | React + Inertia.js        |
| AI Integration  | Ollama (local LLM), OpenAI |
| Web Scraping    | Node.js + Puppeteer       |
| Auth            | Laravel Sanctum + Google OAuth |
| Realtime        | Laravel WebSockets (Pusher or Socket.IO) |
| Database        | MySQL                     |
| Others          | TailwindCSS, Axios        |

---

## 📁 Project Structure

