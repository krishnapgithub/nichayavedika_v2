import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const submenuOptions = [
    ["dashboard", "Dashboard"],
    ["profile", "Profile"],
    ["sentInterests", "Sent"],
    ["receivedInterests", "Received"],
    ["adminProfiles", "Admin"],
    ["adminPayments", "Payments"],
    ["adminContent", "Pages"],
    ["adminUsers", "Users"],
];

const defaultMenuAccess = ["dashboard", "profile"];
const ACTIVE_FILTERS = [
    ["all", "All Users"],
    ["active", "Active"],
    ["inactive", "Inactive"],
];

const paymentStatusClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

const getMenuAccess = (user) =>
    Array.isArray(user?.menuAccess) ? user.menuAccess : defaultMenuAccess;

const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatChanges = (changes = []) =>
    changes.length > 0
        ? changes.map((change) => `${change.field}: ${change.from} -> ${change.to}`).join("; ")
        : "-";

const DEFAULT_PLAN_SETTINGS = {
    free: { profileViews: 5 },
    premium: { profileViews: 20 },
    elite: { profileViews: 40 },
};

const getProfileViewSummary = (user, plans = DEFAULT_PLAN_SETTINGS) => {
    const plan = String(user?.membershipPlan || "free").toLowerCase();
    const limit = plans[plan]?.profileViews ?? plans.free?.profileViews ?? 5;
    const used = Math.max(user?.profileViewsUsed || 0, user?.viewedProfileIds?.length || 0);
    const pending = Math.max(limit - used, 0);

    return { limit, used, pending };
};

const getPaymentSummary = (user) => {
    const payment = user?.latestPayment;

    if (!payment) {
        return {
            label: "No payment",
            detail: "-",
            className: "bg-gray-50 text-gray-600 border-gray-200",
        };
    }

    return {
        label: payment.status || "pending",
        detail: `${payment.plan || "-"} ${payment.currency || "INR"} ${payment.amount || 0}`,
        className: paymentStatusClasses[payment.status] || paymentStatusClasses.pending,
    };
};

const formatLocation = (log) => {
    const location = log.location || {};
    const place = [
        location.city,
        location.region,
        location.country,
    ].filter(Boolean).join(", ");
    const context = [
        location.timezone,
        location.language,
    ].filter(Boolean).join(" | ");

    if (place && context) return `${place} (${context})`;
    if (place) return place;
    if (context) return context;

    return log.ipAddress || "-";
};

export default function AdminUsers({ mode = "users" }) {
    const [users, setUsers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [logCounts, setLogCounts] = useState({
        activityTotal: 0,
        guest: 0,
        loggedIn: 0,
        auditTotal: 0,
    });
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [activeLogTab, setActiveLogTab] = useState("activity");
    const [logFilters, setLogFilters] = useState({
        from: new Date().toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
    });
    const [quickSearch, setQuickSearch] = useState("");
    const [planSettings, setPlanSettings] = useState(DEFAULT_PLAN_SETTINGS);
    const [activeFilter, setActiveFilter] = useState("all");

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    const userRole = loggedInUser?.role?.toLowerCase?.().trim();

    const isSuperAdminRole = userRole === "super_admin";
    const isSuperAdmin = isSuperAdminRole && mode === "super-admin";
    const canManageUsers = userRole === "admin" || userRole === "super_admin";
    const canEditFullAccess = isSuperAdmin;
    const canEditGender = isSuperAdmin;
    const canToggleActive = canManageUsers;
    const normalizedQuickSearch = quickSearch.trim().toLowerCase();
    const displayedUsers = users.filter((user) => {
        const matchesSearch = !normalizedQuickSearch || [
                user.fullName,
                user.email,
                user.mobile,
            ]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuickSearch);
        const matchesActive =
            activeFilter === "all" ||
            (activeFilter === "active" && user.isActive) ||
            (activeFilter === "inactive" && !user.isActive);

        return matchesSearch && matchesActive;
    });
    const currentLogs = activeLogTab === "activity" ? activityLogs : auditLogs;

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchUsers = async () => {
        try {
            if (!canManageUsers || !token) {
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/api/admin/users`, authConfig);

            setUsers(res.data.users || []);
        } catch (error) {
            console.error("Fetch users failed:", error);
            toast.error(error.response?.data?.message || "Unable to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlanSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/payments/plans`);

            setPlanSettings({ ...DEFAULT_PLAN_SETTINGS, ...(res.data.plans || {}) });
        } catch (error) {
            console.error("Load plan settings failed:", error);
        }
    };

    const fetchLogs = async (filters = logFilters) => {
        if (!isSuperAdmin || !token) return;

        try {
            setLogsLoading(true);
            const params = {
                ...(filters.from ? { from: filters.from } : {}),
                ...(filters.to ? { to: filters.to } : {}),
            };
            const [activityResponse, auditResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/activity-logs`, {
                    ...authConfig,
                    params,
                }),
                axios.get(`${API_BASE_URL}/api/admin/audit-logs`, {
                    ...authConfig,
                    params,
                }),
            ]);

            setActivityLogs(activityResponse.data.logs || []);
            setAuditLogs(auditResponse.data.logs || []);
            setLogCounts({
                activityTotal: activityResponse.data.totalCount || 0,
                guest: activityResponse.data.guestCount || 0,
                loggedIn: activityResponse.data.loggedInCount || 0,
                auditTotal: auditResponse.data.totalCount || 0,
            });
        } catch (error) {
            console.error("Fetch logs failed:", error);
            toast.error(error.response?.data?.message || "Unable to load logs");
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchPlanSettings();
    }, []);

    useEffect(() => {
        if (isLogsOpen) {
            fetchLogs();
        }
    }, [isLogsOpen]);

    const updateAccess = async (userId, field, value) => {
        try {
            if (
                loggedInUser?._id === userId &&
                field === "isActive" &&
                value === false
            ) {
                toast.error("You cannot deactivate your own account");
                return;
            }

            const payload = {
                [field]: value,
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/admin/users/${userId}/access`,
                payload,
                authConfig
            );
            const updatedUser = response.data.user;

            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === userId
                        ? {
                            ...u,
                            ...(updatedUser || { [field]: value }),
                        }
                        : u
                )
            );

            toast.success("User updated");
            fetchLogs();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update user");
        }
    };

    const resetPassword = async (userId) => {
        const newPassword = prompt("Enter new password");

        if (!newPassword) return;

        try {
            await axios.put(
                `${API_BASE_URL}/api/admin/users/${userId}/reset-password`,
                { newPassword },
                authConfig
            );

            toast.success("Password reset successfully");
            fetchLogs();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to reset password");
        }
    };

    const toggleMenuAccess = (user, menuKey) => {
        const currentMenuAccess = getMenuAccess(user);
        const nextMenuAccess = currentMenuAccess.includes(menuKey)
            ? currentMenuAccess.filter((item) => item !== menuKey)
            : [...currentMenuAccess, menuKey];

        updateAccess(user._id, "menuAccess", nextMenuAccess);
    };

    const updateLogFilter = (event) => {
        const { name, value } = event.target;

        setLogFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const showAllLogs = () => {
        const nextFilters = {
            from: "",
            to: "",
        };

        setLogFilters(nextFilters);
        fetchLogs(nextFilters);
    };

    if (!canManageUsers) {
        return (
            <>
                <div className="pt-40 text-center text-red-700 font-bold">
                    Access denied. Admin only.
                </div>
            </>
        );
    }

    return (
        <>

            <div className="min-h-screen bg-[#fff8f2] pt-40 px-3 sm:px-4 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#800020]">
                                {isSuperAdmin ? "Super Admin - User Management" : "Admin - Users"}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {isSuperAdmin
                                    ? "Manage roles, approval status, memberships, active state, and password resets."
                                    : "View user payment information and activate or deactivate regular users."}
                            </p>
                        </div>

                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsLogsOpen(true)}
                                className="rounded-xl bg-[#800020] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[#5f0018]"
                            >
                                Open Logs
                            </button>
                        )}
                    </div>

                    {canManageUsers && (
                        <div className="mb-5 rounded-2xl bg-white p-4 shadow">
                            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                                <label className="block">
                                    <span className="text-xs font-bold uppercase text-gray-500">
                                        Quick Search
                                    </span>
                                    <input
                                        type="search"
                                        value={quickSearch}
                                        onChange={(event) => setQuickSearch(event.target.value)}
                                        placeholder="Search by name, email, or phone"
                                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#800020]"
                                    />
                                </label>

                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500">Active Status</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {ACTIVE_FILTERS.map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setActiveFilter(value)}
                                                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                                                    activeFilter === value
                                                        ? "border-[#800020] bg-[#800020] text-white"
                                                        : "border-rose-100 bg-white text-gray-700"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Showing {displayedUsers.length} of {users.length} users
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow p-6 text-center font-semibold text-[#800020]">
                            Loading users...
                        </div>
                    ) : (
                        <>
                            {/* Desktop / Tablet Table */}
                            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
                                <table className="min-w-[1450px] w-full text-sm">
                                    <thead className="bg-[#800020] text-white">
                                        <tr>
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Mobile</th>
                                            <th className="p-3 text-left">Gender</th>
                                            <th className="p-3 text-left">Role</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Membership</th>
                                            <th className="p-3 text-left">Payment</th>
                                            {isSuperAdmin && (
                                                <th className="p-3 text-left">Views</th>
                                            )}
                                            {isSuperAdmin && (
                                                <th className="p-3 text-left">Sub Menu</th>
                                            )}
                                            <th className="p-3 text-left">Active</th>
                                            {isSuperAdmin && (
                                                <th className="p-3 text-left">Action</th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {displayedUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={isSuperAdmin ? 12 : 9} className="p-6 text-center text-gray-600">
                                                    {quickSearch ? "No users match your search." : "No users found."}
                                                </td>
                                            </tr>
                                        )}

                                        {displayedUsers.map((u) => (
                                            <tr key={u._id} className="border-b">
                                                <td className="p-3">
                                                    {canEditFullAccess ? (
                                                        <input
                                                            value={u.fullName || ""}
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((user) =>
                                                                        user._id === u._id
                                                                            ? { ...user, fullName: e.target.value }
                                                                            : user
                                                                    )
                                                                )
                                                            }
                                                            onBlur={(e) => updateAccess(u._id, "fullName", e.target.value)}
                                                            className="w-full min-w-[150px] rounded border px-2 py-1 font-semibold"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold">{u.fullName || "-"}</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {canEditFullAccess ? (
                                                        <input
                                                            type="email"
                                                            value={u.email || ""}
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((user) =>
                                                                        user._id === u._id
                                                                            ? { ...user, email: e.target.value }
                                                                            : user
                                                                    )
                                                                )
                                                            }
                                                            onBlur={(e) => updateAccess(u._id, "email", e.target.value)}
                                                            className="w-full min-w-[210px] rounded border px-2 py-1"
                                                        />
                                                    ) : (
                                                        <span>{u.email || "-"}</span>
                                                    )}
                                                </td>
                                                <td className="p-3">{u.mobile || "-"}</td>

                                                <td className="p-3">
                                                    {canEditGender ? (
                                                        <select
                                                            value={u.gender || ""}
                                                            onChange={(e) =>
                                                                updateAccess(u._id, "gender", e.target.value)
                                                            }
                                                            className="w-full border rounded px-2 py-1"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Bride">Bride</option>
                                                            <option value="Groom">Groom</option>
                                                        </select>
                                                    ) : (
                                                        <span className="font-semibold text-gray-700">{u.gender || "-"}</span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {canEditFullAccess ? (
                                                        <select
                                                            value={u.role || "user"}
                                                            onChange={(e) =>
                                                                updateAccess(u._id, "role", e.target.value)
                                                            }
                                                            className="w-full border rounded px-2 py-1"
                                                        >
                                                            <option value="user">user</option>
                                                            <option value="executive">executive</option>
                                                            <option value="admin">admin</option>
                                                            <option value="oper_admin">oper_admin</option>
                                                            <option value="super_admin">super_admin</option>
                                                        </select>
                                                    ) : (
                                                        <span className="font-semibold text-gray-700">{u.role || "user"}</span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {canEditFullAccess ? (
                                                        <select
                                                            value={u.status || "pending"}
                                                            onChange={(e) =>
                                                                updateAccess(u._id, "status", e.target.value)
                                                            }
                                                            className="w-full border rounded px-2 py-1"
                                                        >
                                                            <option value="pending">pending</option>
                                                            <option value="approved">approved</option>
                                                            <option value="rejected">rejected</option>
                                                        </select>
                                                    ) : (
                                                        <span className="font-semibold text-gray-700">{u.status || "pending"}</span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {canEditFullAccess ? (
                                                        <select
                                                            value={u.membershipPlan || "free"}
                                                            onChange={(e) =>
                                                                updateAccess(u._id, "membershipPlan", e.target.value)
                                                            }
                                                            className="w-full border rounded px-2 py-1"
                                                        >
                                                            <option value="free">free</option>
                                                            <option value="premium">premium</option>
                                                            <option value="elite">elite</option>
                                                        </select>
                                                    ) : (
                                                        <span className="font-semibold text-gray-700">{u.membershipPlan || "free"}</span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {(() => {
                                                        const paymentSummary = getPaymentSummary(u);

                                                        return (
                                                            <div className="min-w-[135px]">
                                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${paymentSummary.className}`}>
                                                                    {paymentSummary.label}
                                                                </span>
                                                                <p className="mt-1 text-xs font-semibold capitalize text-gray-600">
                                                                    {paymentSummary.detail}
                                                                </p>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {isSuperAdmin && (
                                                    <td className="p-3">
                                                        {(() => {
                                                            const viewSummary = getProfileViewSummary(u, planSettings);

                                                            return (
                                                                <div className="min-w-[120px] rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-gray-700">
                                                                    <p className="text-[#800020]">
                                                                        {viewSummary.used} / {viewSummary.limit} used
                                                                    </p>
                                                                    <p className="mt-1">
                                                                        {viewSummary.pending} pending
                                                                    </p>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                )}

                                                {isSuperAdmin && (
                                                    <td className="p-3">
                                                        <div className="grid min-w-[260px] grid-cols-2 gap-2">
                                                            {submenuOptions.map(([value, label]) => (
                                                                <label key={value} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={getMenuAccess(u).includes(value)}
                                                                        onChange={() => toggleMenuAccess(u, value)}
                                                                        className="accent-[#800020]"
                                                                    />
                                                                    <span>{label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="p-3">
                                                    <button
                                                        type="button"
                                                        disabled={!canToggleActive}
                                                        onClick={() =>
                                                            updateAccess(u._id, "isActive", !u.isActive)
                                                        }
                                                        className={`w-full rounded-lg px-3 py-2 text-white disabled:opacity-60 ${u.isActive ? "bg-red-600" : "bg-green-600"}`}
                                                    >
                                                        {u.isActive ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>

                                                {isSuperAdmin && (
                                                    <td className="p-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => resetPassword(u._id)}
                                                            className="w-full bg-[#800020] text-white px-3 py-2 rounded-lg"
                                                        >
                                                            Reset Password
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {displayedUsers.map((u) => (
                                    <div key={u._id} className="bg-white rounded-2xl shadow p-4">
                                        <div className="mb-4">
                                            {canEditFullAccess ? (
                                                <div className="space-y-3">
                                                    <label className="block">
                                                        <span className="text-xs font-bold text-gray-500">
                                                            Display Name
                                                        </span>
                                                        <input
                                                            value={u.fullName || ""}
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((user) =>
                                                                        user._id === u._id
                                                                            ? { ...user, fullName: e.target.value }
                                                                            : user
                                                                    )
                                                                )
                                                            }
                                                            onBlur={(e) => updateAccess(u._id, "fullName", e.target.value)}
                                                            className="mt-1 w-full rounded-lg border px-3 py-2 font-bold text-[#800020]"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="text-xs font-bold text-gray-500">
                                                            Email
                                                        </span>
                                                        <input
                                                            type="email"
                                                            value={u.email || ""}
                                                            onChange={(e) =>
                                                                setUsers((prevUsers) =>
                                                                    prevUsers.map((user) =>
                                                                        user._id === u._id
                                                                            ? { ...user, email: e.target.value }
                                                                            : user
                                                                    )
                                                                )
                                                            }
                                                            onBlur={(e) => updateAccess(u._id, "email", e.target.value)}
                                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-700"
                                                        />
                                                    </label>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold text-[#800020]">
                                                        {u.fullName || "-"}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 break-all">
                                                        {u.email || "-"}
                                                    </p>
                                                </>
                                            )}
                                            <p className="text-sm text-gray-600">{u.mobile || "-"}</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                Gender: {u.gender || "-"}
                                            </p>
                                            <div className="mt-3">
                                                {(() => {
                                                    const paymentSummary = getPaymentSummary(u);

                                                    return (
                                                        <div className="rounded-xl border border-rose-100 bg-[#fff8f2] px-3 py-3">
                                                            <p className="text-xs font-bold uppercase text-gray-500">
                                                                Payment
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${paymentSummary.className}`}>
                                                                    {paymentSummary.label}
                                                                </span>
                                                                <span className="text-sm font-semibold capitalize text-gray-700">
                                                                    {paymentSummary.detail}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Gender
                                                </label>
                                                {canEditGender ? (
                                                    <select
                                                        value={u.gender || ""}
                                                        onChange={(e) =>
                                                            updateAccess(u._id, "gender", e.target.value)
                                                        }
                                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Bride">Bride</option>
                                                        <option value="Groom">Groom</option>
                                                    </select>
                                                ) : (
                                                    <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                                        {u.gender || "-"}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Role
                                                </label>
                                                {canEditFullAccess ? (
                                                    <select
                                                        value={u.role || "user"}
                                                        onChange={(e) =>
                                                            updateAccess(u._id, "role", e.target.value)
                                                        }
                                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                                    >
                                                        <option value="user">user</option>
                                                        <option value="executive">executive</option>
                                                        <option value="admin">admin</option>
                                                        <option value="oper_admin">oper_admin</option>
                                                        <option value="super_admin">super_admin</option>
                                                    </select>
                                                ) : (
                                                    <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                                        {u.role || "user"}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Status
                                                </label>
                                                {canEditFullAccess ? (
                                                    <select
                                                        value={u.status || "pending"}
                                                        onChange={(e) =>
                                                            updateAccess(u._id, "status", e.target.value)
                                                        }
                                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                                    >
                                                        <option value="pending">pending</option>
                                                        <option value="approved">approved</option>
                                                        <option value="rejected">rejected</option>
                                                    </select>
                                                ) : (
                                                    <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                                        {u.status || "pending"}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Membership
                                                </label>
                                                {canEditFullAccess ? (
                                                    <select
                                                        value={u.membershipPlan || "free"}
                                                        onChange={(e) =>
                                                            updateAccess(u._id, "membershipPlan", e.target.value)
                                                        }
                                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                                    >
                                                        <option value="free">free</option>
                                                        <option value="premium">premium</option>
                                                        <option value="elite">elite</option>
                                                    </select>
                                                ) : (
                                                    <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                                                        {u.membershipPlan || "free"}
                                                    </p>
                                                )}
                                            </div>

                                            {isSuperAdmin && (
                                                <div className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-semibold text-gray-700">
                                                    {(() => {
                                                        const viewSummary = getProfileViewSummary(u, planSettings);

                                                        return (
                                                            <>
                                                                <p className="text-xs font-bold uppercase text-gray-500">
                                                                    Profile Views
                                                                </p>
                                                                <p className="mt-1 text-[#800020]">
                                                                    {viewSummary.used} / {viewSummary.limit} used
                                                                </p>
                                                                <p>{viewSummary.pending} pending</p>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {isSuperAdmin && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500">
                                                        Sub Menu
                                                    </p>
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        {submenuOptions.map(([value, label]) => (
                                                            <label key={value} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={getMenuAccess(u).includes(value)}
                                                                    onChange={() => toggleMenuAccess(u, value)}
                                                                    className="accent-[#800020]"
                                                                />
                                                                <span>{label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    disabled={!canToggleActive}
                                                    onClick={() =>
                                                        updateAccess(u._id, "isActive", !u.isActive)
                                                    }
                                                    className={`w-full rounded-xl px-3 py-3 font-semibold text-white disabled:opacity-60 ${u.isActive ? "bg-red-600" : "bg-green-600"}`}
                                                >
                                                    {u.isActive ? "Deactivate" : "Activate"}
                                                </button>

                                                {isSuperAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => resetPassword(u._id)}
                                                        className="w-full bg-[#800020] text-white px-3 py-3 rounded-xl font-semibold"
                                                    >
                                                        Reset Password
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {displayedUsers.length === 0 && (
                                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                                        {quickSearch ? "No users match your search." : "No users found."}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isSuperAdmin && isLogsOpen && (
                <div className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-black/60 px-3 py-5 sm:py-8">
                    <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex flex-col gap-3 border-b border-rose-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="text-2xl font-bold text-[#800020]">Logs</h2>
                                <p className="text-sm text-gray-600">
                                    Review user, guest, and Super Admin activity by date.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLogsOpen(false)}
                                className="self-start rounded-full border border-rose-100 px-4 py-2 text-sm font-bold text-[#800020] hover:bg-rose-50 sm:self-auto"
                            >
                                Close
                            </button>
                        </div>

                        <div className="border-b border-rose-100 px-4 py-4 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="flex rounded-xl bg-[#fff8f2] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveLogTab("activity")}
                                        className={`rounded-lg px-4 py-2 text-sm font-bold ${activeLogTab === "activity"
                                            ? "bg-[#800020] text-white"
                                            : "text-gray-700 hover:bg-white"
                                            }`}
                                    >
                                        User & Guest
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveLogTab("audit")}
                                        className={`rounded-lg px-4 py-2 text-sm font-bold ${activeLogTab === "audit"
                                            ? "bg-[#800020] text-white"
                                            : "text-gray-700 hover:bg-white"
                                            }`}
                                    >
                                        Admin Audit
                                    </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                                    <label className="text-sm font-bold text-gray-700">
                                        From
                                        <input
                                            type="date"
                                            name="from"
                                            value={logFilters.from}
                                            onChange={updateLogFilter}
                                            className="mt-1 w-full rounded-xl border border-rose-100 px-3 py-2 text-sm outline-none focus:border-[#800020]"
                                        />
                                    </label>
                                    <label className="text-sm font-bold text-gray-700">
                                        To
                                        <input
                                            type="date"
                                            name="to"
                                            value={logFilters.to}
                                            onChange={updateLogFilter}
                                            className="mt-1 w-full rounded-xl border border-rose-100 px-3 py-2 text-sm outline-none focus:border-[#800020]"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => fetchLogs()}
                                        disabled={logsLoading}
                                        className="rounded-xl bg-[#800020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showAllLogs}
                                        disabled={logsLoading}
                                        className="rounded-xl border border-rose-100 px-5 py-2.5 text-sm font-bold text-[#800020] hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <LogCountCard label="Activity Total" value={logCounts.activityTotal} />
                                <LogCountCard label="Logged-In Users" value={logCounts.loggedIn} />
                                <LogCountCard label="Guests" value={logCounts.guest} />
                                <LogCountCard label="Admin Audit" value={logCounts.auditTotal} />
                            </div>

                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="font-bold text-gray-700">
                                    Showing {currentLogs.length} of {activeLogTab === "activity" ? logCounts.activityTotal : logCounts.auditTotal} {activeLogTab === "activity" ? "activity" : "audit"} logs
                                </span>
                                {logsLoading && (
                                    <span className="font-bold text-amber-600">Loading...</span>
                                )}
                            </div>

                            {activeLogTab === "activity" ? (
                                <LogList emptyText="No user or guest logs found for this date range.">
                                    {activityLogs.map((log) => (
                                        <ActivityLogRow key={log._id} log={log} />
                                    ))}
                                </LogList>
                            ) : (
                                <LogList emptyText="No admin audit logs found for this date range.">
                                    {auditLogs.map((log) => (
                                        <AuditLogRow key={log._id} log={log} />
                                    ))}
                                </LogList>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function LogCountCard({ label, value }) {
    return (
        <div className="rounded-xl border border-rose-100 bg-[#fff8f2] px-4 py-3">
            <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#800020]">{value}</p>
        </div>
    );
}

function LogList({ emptyText, children }) {
    const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);

    return (
        <div className="rounded-2xl border border-rose-100">
            {hasRows ? children : (
                <div className="rounded-2xl bg-[#fff8f2] p-6 text-center text-sm font-semibold text-gray-500">
                    {emptyText}
                </div>
            )}
        </div>
    );
}

function ActivityLogRow({ log }) {
    return (
        <div className="grid gap-2 border-b border-rose-50 p-4 last:border-0 lg:grid-cols-[1fr_1.6fr_1.1fr_90px_160px] lg:items-center">
            <div>
                <p className="font-bold text-[#800020]">{log.userName || "Guest"}</p>
                <p className="break-all text-xs text-gray-500">{log.userEmail || log.ipAddress || "-"}</p>
            </div>
            <p className="break-all text-sm font-semibold text-gray-700">
                {log.method} {log.path}
            </p>
            <p className="break-words text-xs font-semibold text-gray-600">
                {formatLocation(log)}
            </p>
            <p className="text-sm font-bold text-gray-600">Status {log.statusCode}</p>
            <p className="text-xs font-semibold text-gray-500">{formatDateTime(log.createdAt)}</p>
        </div>
    );
}

function AuditLogRow({ log }) {
    return (
        <div className="grid gap-2 border-b border-rose-50 p-4 last:border-0 lg:grid-cols-[1.2fr_1fr_2fr_170px] lg:items-center">
            <div>
                <p className="font-bold text-[#800020]">{log.actorName || "Admin"}</p>
                <p className="break-all text-xs text-gray-500">{log.actorEmail || "-"}</p>
            </div>
            <p className="text-sm font-semibold text-gray-700">
                {log.action} for {log.targetName || "user"}
            </p>
            <p className="break-words text-xs text-gray-500">{formatChanges(log.changes)}</p>
            <p className="text-xs font-semibold text-gray-500">{formatDateTime(log.createdAt)}</p>
        </div>
    );
}
