// import { motion } from "framer-motion";
// import { Menu, X } from "lucide-react"; // Optional: lucide icons (or use your own)
import { router } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header.jsx"; // Assuming Header is in the same directory
function ManagerLayout() {
    const token = localStorage.getItem("token");
    const session = localStorage.getItem("session");
    if (!token) {
        router.visit("/login");
    }
    if (!session) {
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
            {/* <div className="md:flex-[2_2_0] w-screen">
                <Header></Header>
            </div> */}
            {/* <nav className="w-screen stone-300 fixed top-0 z-50 p-6">
                <div>Bhugi chugi</div>
            </nav> */}
            <header>
                <Header></Header>
            </header>

            <div className="md:flex-[2_2_0] w-18 max-w-52">
                <div className="absolute left-0 h-screen flex flex-col w-20 md:w-full">
                    <div className="drawer lg:drawer-open fixed mt-7">
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
                            <ul className="menu bg-stone-100 text-base-content min-h-full w-80 p-4">
                                {/* Sidebar content here */}
                                <li className="text-l font mb-4 mt-10">
                                    <a href="/manager">My Dashboard</a>
                                </li>
                                <li className="text-l font mb-4">
                                    <a href="/manager/myprojects">
                                        My Projects
                                    </a>
                                </li>

                                <li className="text-l font mb-4">
                                    <a href="/manager/allprojects">
                                        All Projects
                                    </a>
                                </li>
                                <li className="text-l font mb-4">
                                    <a href="/manager/leaveownership">
                                        Project Ownership Transfer
                                    </a>
                                </li>
                                <li className="text-l font mb-4">
                                    <a href="/manager/project-completion">
                                        Project Completion
                                    </a>
                                </li>

                                <li className="text-l font p-0">
                                    <button
                                        className="btn btn-outline btn-error w-70"
                                        onClick={handleSubmit}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManagerLayout;
