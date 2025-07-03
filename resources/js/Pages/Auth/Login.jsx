import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

function Login() {
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        {
            id: 1,
            url: "/probability.jpg",
            title: "AI Assistant",
            subtitle: "AI can help to analyze product feedback.",
        },
        {
            id: 2,
            url: "/review.jpg",
            title: "Review",
            subtitle: "Users can add reviews to product.",
        },
        {
            id: 3,
            url: "/aihelp.jpg",
            title: "Choose The Best",
            subtitle: "Users can choose the best for him/her.",
        },
        {
            id: 4,
            url: "/analyze.png",
            title: "Analyzing One Product",
            subtitle:
                "Product Managers can analyze their product and generate report.",
        },
    ];

    const [displayedText, setDisplayedText] = useState("");
    const [text, setText] = useState("");
    const fullText = "FeedMind";
    const [text2, setText2] = useState("");
    const fullText2 = "A feedback management app";

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText2(fullText2.slice(0, index + 1));
            index++;
            if (index === fullText2.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = { email: mail, password };
        try {
            const response = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw { response };
            }

            const data = await response.json();
            console.log(data);

            const token = data.auth_token;
            if (!token) {
                setFormErrors({
                    general: "Authentication failed. No token received.",
                });
                return;
            }

            localStorage.setItem("token", token);
            router.visit("/dashboard");
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                let errors = {};

                if (status === 401 || status === 422) {
                    errors.general =
                        error.response.data?.message || "Invalid credentials.";
                } else if (error.response.data?.error) {
                    errors.general = error.response.data.error;
                } else {
                    errors.general = "An unknown error occurred.";
                }

                setFormErrors(errors);
            } else {
                console.log(error);
                setFormErrors({
                    general: "Network error or server not responding.",
                });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#39344a] px-4">
            <div className="flex w-full max-w-4xl bg-[#28243c] rounded-2xl shadow-2xl overflow-hidden">
                <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#2c2841] p-8 rounded-l-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center z-10">
                        <div className="flex flex-col justify-start">
                            <motion.span
                                className="text-2xl font-bold tracking-widest font-mono bg-gradient-to-r from-black via-purple-700 to-green-400 bg-clip-text text-transparent animate-gradient"
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
                            <motion.span
                                className="text-sm font-bold tracking-widest font-mono bg-gradient-to-r to-black via-purple-700 from-black bg-clip-text text-transparent animate-gradient backdrop-blur-sm p-1"
                                style={{
                                    backgroundSize: "200% 200%",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                                animate={{
                                    backgroundPosition: [
                                        "100% 50%",
                                        "0% 50%",
                                        "100% 50%",
                                    ],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "linear",
                                }}
                            >
                                {text2}
                            </motion.span>
                        </div>
                    </div>

                    {/* Image Slider */}
                    <div className="absolute inset-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={images[currentImageIndex].id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={images[currentImageIndex].url}
                                    alt={images[currentImageIndex].title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 flex flex-col justify-end pb-8 z-10">
                        <motion.div
                            key={`content-${currentImageIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="rounded-xl mb-6 shadow-lg overflow-hidden"
                        >
                            <div className="bg-black/30 p-4 backdrop-blur-sm">
                                <h3 className="text-white text-lg font-semibold">
                                    {images[currentImageIndex].subtitle}
                                </h3>
                                <div className="flex mt-4 space-x-2">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setCurrentImageIndex(index)
                                            }
                                            className={`w-3 h-1 rounded-full transition-all ${
                                                index === currentImageIndex
                                                    ? "bg-white w-6"
                                                    : "bg-white/40"
                                            }`}
                                            aria-label={`Go to slide ${
                                                index + 1
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right: Login Form */}
                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Sign in to your account
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Don&apos;t have an account?{" "}
                        <a
                            href="/register"
                            className="text-[#a892fe] hover:underline"
                        >
                            Create an account
                        </a>
                    </p>
                    {Object.keys(formErrors).length > 0 && (
                        <div className="mb-4 bg-red-100 border border-red-300 text-red-700 rounded px-4 py-2">
                            <ul>
                                {Object.entries(formErrors).map(
                                    ([key, value]) => (
                                        <li key={key}>{value}</li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="mail"
                                className="block text-gray-300 text-sm mb-1"
                            >
                                Email address
                            </label>
                            <input
                                id="mail"
                                type="email"
                                className="w-full px-4 py-3 bg-[#22203a] border border-[#39344a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a892fe]"
                                placeholder="Enter your email"
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-gray-300 text-sm mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-3 bg-[#22203a] border border-[#39344a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a892fe]"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg
                                            width="22"
                                            height="22"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path d="M1 11C1 11 5 4 11 4s10 7 10 7-4 7-10 7S1 11 1 11z" />
                                            <circle cx="11" cy="11" r="3" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="22"
                                            height="22"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path d="M1 1l20 20M1 11C1 11 5 4 11 4c2.5 0 4.7 1.2 6.4 2.7M21 11s-4 7-10 7c-2.5 0-4.7-1.2-6.4-2.7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <a
                                href="#"
                                className="text-sm text-[#a892fe] hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#a892fe] hover:bg-[#7d5fff] text-white font-semibold py-3 rounded-lg transition"
                        >
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
