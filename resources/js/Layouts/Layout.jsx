// import { motion } from "framer-motion";
// import { Menu, X } from "lucide-react"; // Optional: lucide icons (or use your own)
import { router } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header.jsx";
function Layout() {
    const token = localStorage.getItem("token");
    if (!token) {
        router.visit("/login");
    }
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/logout",
                {
                    session_id: localStorage.getItem("session"),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Logout error:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("session");
        router.visit("/login");
    };

    return (
        <>
            <div className="md:flex-[2_2_0] w-screen">
                <Header></Header>
            </div>
            <div className="md:flex-[2_2_0] w-18 max-w-52">
                <div className="absolute left-0 h-screen flex flex-col w-20 md:w-full">
                    <div className="drawer lg:drawer-open">
                        <input
                            id="my-drawer-2"
                            type="checkbox"
                            className="drawer-toggle"
                        />

                        <div className="drawer-side">
                            <label
                                htmlFor="my-drawer-2"
                                aria-label="close sidebar"
                                className="drawer-overlay"
                            ></label>
                            <ul className="menu stone-200 text-base-content min-h-full w-80 p-4">
                                {/* Sidebar content here */}
                                <li>
                                    <a>My Projects</a>
                                </li>
                                <li>
                                    <a>All Projects</a>
                                </li>
                                <li>
                                    <form action="POST" onSubmit={handleSubmit}>
                                        <button
                                            className="btn-error w-full"
                                            type="submit"
                                        >
                                            Log Out
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Layout;
