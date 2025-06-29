import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.visit("/unauthorized");
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    router.visit("/unauthorized");
                }
            } catch (error) {
                router.visit("/unauthorized");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post(
                "http://127.0.0.1:8000/api/logout",
                {},
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
        router.visit("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-row justify-center items-center">
                <span className="loading loading-ring loading-xl"></span>
            </div>
        );
    }

    if (!user) {
        window.location.href = "/unauthorized"; // Or a fallback UI
    }

    return (
        <>
            <div>Welcome, {user.name}!</div>
            <button
                className="btn btn-outline btn-error w-70"
                onClick={handleSubmit}
            >
                Logout
            </button>
        </>
    );
};

export default Dashboard;
