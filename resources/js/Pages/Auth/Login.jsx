import { router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";

function Login() {
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = {
            email: mail,
            password,
        };
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login",
                formData
            );
            const token = response.data.token;
            console.log("Success:", response.data.token);
            localStorage.setItem("token", response.data.token);
            const checkAuth = async () => {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/user",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("User data:", response.data);
                return response.data;
            };
            if (!checkAuth()) {
                router.visit("/login");
                return;
            }
            router.visit("/dashboard");
        } catch (error) {
            if (error.response) {
                console.log("Validation or server error:", error);
                console.log(typeof error.response.data.error === "string");
                setFormErrors({ general: error.response.data.message });
                if (typeof error.response.data.error === "string") {
                    setFormErrors({ general: error.response.data.error });
                } else if (typeof error.response.data.error === "object") {
                    setFormErrors(error.response.data.error);
                }
            } else {
                console.error("Unexpected error:", error);
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg px-8 py-6 w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                {Object.keys(formErrors).length > 0 && (
                    <div role="alert" className="alert alert-error">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <ul>
                            {Object.entries(formErrors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="mail"
                        >
                            Email Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="mail"
                            type="text"
                            placeholder="Enter your mail"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
                            type="submit"
                        >
                            Login
                        </button>
                        <a
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                            href="/register"
                        >
                            Don't have an account? Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
