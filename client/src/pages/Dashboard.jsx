import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function Dashboard() {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = savedUser?._id || savedUser?.id;
    const membershipPlan = (
        savedUser?.membershipPlan ||
        savedUser?.membershipType ||
        savedUser?.membership ||
        "free"
    ).toString();

    const [stats, setStats] = useState({
        sent: 0,
        received: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
    });
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem("dashboardSettings");

        if (savedSettings) {
            return JSON.parse(savedSettings);
        }

        return {
            profileVisible: true,
            photoVisible: true,
            contactAlerts: true,
            interestAlerts: true,
        };
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        localStorage.setItem("dashboardSettings", JSON.stringify(settings));
    }, [settings]);

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
        <div className="min-h-screen bg-[#fff8f2] pt-40 px-4 pb-20">
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
                    <DashboardCard title="Settings" link="#settings" />
                </div>

                <section id="settings" className="mt-8 rounded-2xl bg-white p-6 shadow-lg scroll-mt-44">
                    <div className="flex flex-col gap-3 border-b border-rose-100 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#800020]">
                                Settings
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your profile visibility, alerts, membership, and support options.
                            </p>
                        </div>

                        <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-[#800020]">
                            Current Plan: {membershipPlan}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        <SettingsPanel title="Profile Settings">
                            <SettingsLink label="Edit profile details" to="/create-profile" />
                            <SettingsLink label="Update partner preferences" to="/create-profile" />
                            <SettingsToggle
                                label="Keep profile visible"
                                checked={settings.profileVisible}
                                onChange={() =>
                                    setSettings((current) => ({
                                        ...current,
                                        profileVisible: !current.profileVisible,
                                    }))
                                }
                            />
                        </SettingsPanel>

                        <SettingsPanel title="Privacy Settings">
                            <SettingsToggle
                                label="Show profile photos"
                                checked={settings.photoVisible}
                                onChange={() =>
                                    setSettings((current) => ({
                                        ...current,
                                        photoVisible: !current.photoVisible,
                                    }))
                                }
                            />
                            <SettingsLink label="Review privacy policy" to="/legal#privacy" />
                            <SettingsLink label="Review terms" to="/legal#terms" />
                        </SettingsPanel>

                        <SettingsPanel title="Notification Settings">
                            <SettingsToggle
                                label="Interest received alerts"
                                checked={settings.interestAlerts}
                                onChange={() =>
                                    setSettings((current) => ({
                                        ...current,
                                        interestAlerts: !current.interestAlerts,
                                    }))
                                }
                            />
                            <SettingsToggle
                                label="Contact and support alerts"
                                checked={settings.contactAlerts}
                                onChange={() =>
                                    setSettings((current) => ({
                                        ...current,
                                        contactAlerts: !current.contactAlerts,
                                    }))
                                }
                            />
                        </SettingsPanel>

                        <SettingsPanel title="Membership & Support">
                            <SettingsLink label="View or upgrade membership" to="/membership" />
                            <SettingsLink label="Check sent interests" to="/sent-interests" />
                            <SettingsLink label="Check received interests" to="/received-interests" />
                            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-gray-700">
                                Contact: info@nichayavedika.com
                            </p>
                        </SettingsPanel>
                    </div>
                </section>
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

function SettingsPanel({ title, children }) {
    return (
        <div className="rounded-2xl border border-rose-100 bg-[#fff8f2] p-5">
            <h3 className="mb-4 text-lg font-bold text-[#800020]">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function SettingsLink({ label, to }) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:text-[#800020] hover:shadow-md"
        >
            <span>{label}</span>
            <span className="text-amber-600">›</span>
        </Link>
    );
}

function SettingsToggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-5 w-5 accent-[#800020]"
            />
        </label>
    );
}
