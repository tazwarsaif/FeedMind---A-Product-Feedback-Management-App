import { router } from "@inertiajs/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "../../Layouts/Header";

const Register = () => {
    const [name, setName] = useState("");
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [text, setText] = useState("");
    const fullText = "FeedMind";
    const [text2, setText2] = useState("");
    const fullText2 = "A feedback management app";
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
    const images = [
        {
            id: 1,
            url: "/d2b4e5b0eebea57b53182974d8b0c8f2.gif",
            title: "Amazon AI Scrapping",
            subtitle: "Analying Amazon Products.",
        },
        {
            id: 2,
            url: "/probability.jpg",
            title: "AI Assistant",
            subtitle: "AI can help to analyze product feedback.",
        },
        {
            id: 3,
            url: "/review.jpg",
            title: "Review",
            subtitle: "Users can add reviews to product.",
        },
        {
            id: 4,
            url: "/aihelp.jpg",
            title: "Choose The Best",
            subtitle: "Users can choose the best for him/her.",
        },
        {
            id: 5,
            url: "/analyze.png",
            title: "Analyzing One Product",
            subtitle:
                "Product Managers can analyze their product and generate report.",
        },
    ];

    // Auto-advance the slider every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = "Name is required.";
        }

        if (!mail.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            errors.email = "Email is invalid.";
        }

        if (!password.trim()) {
            errors.password = "Password is required.";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters long.";
        } else if (password !== passwordConfirmation) {
            errors.password_confirmation = "Passwords do not match.";
        }
        if (!passwordConfirmation.trim()) {
            errors.password_confirmation = "Password confirmation is required.";
        }

        return errors;
    };
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }
        const formData = {
            name,
            password,
            email: mail,
            password_confirmation: passwordConfirmation,
        };
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register",
                formData
            );
            router.visit("/login");
        } catch (error) {
            if (error.response) {
                setFormErrors(
                    error.response.data.error || {
                        general: "Registration failed",
                    }
                );
            } else {
                setFormErrors({ general: "An unexpected error occurred" });
            }
        }
    };

    return (
        <>
            <Header title={"Register"} />
            <div className="min-h-screen flex items-center justify-center bg-[#39344a] px-4">
                <div className="flex w-full max-w-6xl bg-[#28243c] rounded-2xl shadow-2xl overflow-hidden">
                    {/* Left: Image & Branding */}
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

                    {/* Right: Register Form */}
                    <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Create your account
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="text-[#a892fe] hover:underline"
                            >
                                Sign in
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
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-gray-300 text-sm mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    className="w-full px-4 py-3 bg-[#22203a] border border-[#39344a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a892fe]"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-gray-300 text-sm mb-1"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
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
                                        type={
                                            showPassword ? "text" : "password"
                                        }
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
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
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
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block text-gray-300 text-sm mb-1"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className="w-full px-4 py-3 bg-[#22203a] border border-[#39344a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a892fe]"
                                    placeholder="Confirm your password"
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#a892fe] hover:bg-[#7d5fff] text-white font-semibold py-3 rounded-lg transition"
                            >
                                Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
