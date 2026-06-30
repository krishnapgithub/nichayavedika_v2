import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function Dashboard() {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = savedUser?._id || savedUser?.id;

    const [stats, setStats] = useState({
        sent: 0,
        received: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            if (!userId) return;

            const [sentResponse, receivedResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/interests/sent/${userId}`),
                axios.get(`${API_BASE_URL}/api/interests/received/${userId}`),
            ]);

            const sent = sentResponse.data.interests || [];
            const received = receivedResponse.data.interests || [];
            const all = [...sent, ...received];

            setStats({
                sent: sent.length,
                received: received.length,
                pending: all.filter((item) => String(item.status).toLowerCase() === "pending").length,
                accepted: all.filter((item) => String(item.status).toLowerCase() === "accepted").length,
                rejected: all.filter((item) => String(item.status).toLowerCase() === "rejected").length,
            });
        } catch (error) {
            console.error("Dashboard stats failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#fff8f2] pt-40 px-4 pb-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[#800020] mb-2">
                    Welcome to NichayaVedika
                </h1>

                <p className="text-gray-600 mb-8">
                    Manage your profile, interests, and matches from one place.
                </p>

                <div className="grid md:grid-cols-5 gap-4 mb-8">
                    <StatCard title="Sent" count={stats.sent} />
                    <StatCard title="Received" count={stats.received} />
                    <StatCard title="Pending" count={stats.pending} />
                    <StatCard title="Accepted" count={stats.accepted} />
                    <StatCard title="Rejected" count={stats.rejected} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <DashboardCard title="My Profile" link="/create-profile" />
                    <DashboardCard title="Search Profiles" link="/search" />
                    <DashboardCard title="Sent Interests" link="/sent-interests" />
                    <DashboardCard title="Received Interests" link="/received-interests" />
                    <DashboardCard title="Membership" link="/membership" />
                    <DashboardCard title="Settings" link="/" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, count }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-5 text-center">
            <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
            <p className="text-3xl font-bold text-[#800020]">{count}</p>
        </div>
    );
}

function DashboardCard({ title, link }) {
    return (
        <Link
            to={link}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-bold text-[#800020]">
                {title}
            </h2>
        </Link>
    );
}
