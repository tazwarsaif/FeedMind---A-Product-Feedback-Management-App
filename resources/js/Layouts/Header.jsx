import { router } from "@inertiajs/react";
import axios from "axios";
import { useEffect } from "react";
import { io } from "socket.io-client";
const Header = () => {
    const token = localStorage.getItem("token");
    const session = localStorage.getItem("session");
    if (!token) {
        router.visit("/login");
    }
    if (!session) {
        router.visit("/login");
    }
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
    useEffect(() => {
        const socket = io("http://localhost:6001"); // WebSocket server

        socket.emit("join", `user.36`);

        socket.on("message", (message) => {
            console.log("New message:", message);
            alert(message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    return (
        <>
            <div className="drawer fixed top-0 z-50">
                <input
                    id="my-drawer-3"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col overflow-x-hidden">
                    {/* Navbar */}
                    <div className="navbar bg-stone-200 w-screen">
                        <div className="flex-none lg:hidden">
                            <label
                                htmlFor="my-drawer-3"
                                aria-label="open sidebar"
                                className="btn btn-square btn-ghost"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="inline-block h-6 w-6 stroke-current"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    ></path>
                                </svg>
                            </label>
                        </div>
                        <div className="mx-2 flex-1 px-2 text-2xl font-bold">
                            SecTech
                        </div>
                        <div className="hidden flex-none lg:block">
                            <ul className="menu menu-horizontal mr-4">
                                {/* Navbar menu content here */}
                                <li>
                                    <a>My Account</a>
                                </li>
                                <li>
                                    <div>🔔</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="drawer-side">
                    <label
                        htmlFor="my-drawer-3"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-stone-100 min-h-full w-80 p-4">
                        {/* Sidebar content here */}
                        <li className="text-l font mb-4 mt-4">
                            <a href="/manager">My Dashboard</a>
                        </li>
                        <li className="text-l font mb-4">
                            <a href="/manager/myprojects">My Projects</a>
                        </li>
                        <li className="text-l font mb-4">
                            <a>Project Creation</a>
                        </li>
                        <li className="text-l font mb-4">
                            <a href="/manager/allprojects">All Projects</a>
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
                        <li className="text-l font mb-4">
                            <a>My Account</a>
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
        </>
    );
};

export default Header;
