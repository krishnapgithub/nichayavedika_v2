import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    const userRole = loggedInUser?.role?.toLowerCase?.().trim();

    const isSuperAdmin = userRole === "super_admin";
    const canManageUsers = userRole === "admin" || userRole === "super_admin";

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

    useEffect(() => {
        fetchUsers();
    }, []);

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

            await axios.put(
                `${API_BASE_URL}/api/admin/users/${userId}/access`,
                payload,
                authConfig
            );

            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === userId
                        ? {
                            ...u,
                            [field]: value,
                        }
                        : u
                )
            );

            toast.success("User updated");
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
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to reset password");
        }
    };

    if (!isSuperAdmin) {
        return (
            <>
                <div className="pt-32 text-center text-red-700 font-bold">
                    Access denied. Super Admin only.
                </div>
            </>
        );
    }

    return (
        <>

            <div className="min-h-screen bg-[#fff8f2] pt-28 px-3 sm:px-4 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#800020]">
                            Super Admin - User Management
                        </h1>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl shadow p-6 text-center font-semibold text-[#800020]">
                            Loading users...
                        </div>
                    ) : (
                        <>
                            {/* Desktop / Tablet Table */}
                            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
                                <table className="min-w-[1050px] w-full text-sm">
                                    <thead className="bg-[#800020] text-white">
                                        <tr>
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Mobile</th>
                                            <th className="p-3 text-left">Role</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Membership</th>
                                            <th className="p-3 text-left">Active</th>
                                            <th className="p-3 text-left">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} className="border-b">
                                                <td className="p-3 font-semibold">{u.fullName || "-"}</td>
                                                <td className="p-3">{u.email || "-"}</td>
                                                <td className="p-3">{u.mobile || "-"}</td>

                                                <td className="p-3">
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
                                                        <option value="super_admin">super_admin</option>
                                                    </select>
                                                </td>

                                                <td className="p-3">
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
                                                </td>

                                                <td className="p-3">
                                                    <select
                                                        value={u.membershipPlan || "free"}
                                                        onChange={(e) =>
                                                            updateAccess(u._id, "membershipPlan", e.target.value)
                                                        }
                                                        className="w-full border rounded px-2 py-1"
                                                    >
                                                        <option value="free">free</option>
                                                        <option value="premium">premium</option>
                                                        <option value="assisted">assisted</option>
                                                    </select>
                                                </td>

                                                <td className="p-3">
                                                    <button
                                                        onClick={() =>
                                                            updateAccess(u._id, "isActive", !u.isActive)
                                                        }
                                                        className={`w-full px-3 py-2 rounded-lg text-white ${u.isActive ? "bg-red-600" : "bg-green-600"
                                                            }`}
                                                    >
                                                        {u.isActive ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>

                                                <td className="p-3">
                                                    <button
                                                        onClick={() => resetPassword(u._id)}
                                                        className="w-full bg-[#800020] text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Reset Password
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {users.map((u) => (
                                    <div key={u._id} className="bg-white rounded-2xl shadow p-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-[#800020]">
                                                {u.fullName || "-"}
                                            </h3>
                                            <p className="text-sm text-gray-600 break-all">
                                                {u.email || "-"}
                                            </p>
                                            <p className="text-sm text-gray-600">{u.mobile || "-"}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Role
                                                </label>
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
                                                    <option value="super_admin">super_admin</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Status
                                                </label>
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
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500">
                                                    Membership
                                                </label>
                                                <select
                                                    value={u.membershipPlan || "free"}
                                                    onChange={(e) =>
                                                        updateAccess(u._id, "membershipPlan", e.target.value)
                                                    }
                                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                                >
                                                    <option value="free">free</option>
                                                    <option value="premium">premium</option>
                                                    <option value="assisted">assisted</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 pt-2">
                                                <button
                                                    onClick={() =>
                                                        updateAccess(u._id, "isActive", !u.isActive)
                                                    }
                                                    className={`w-full px-3 py-3 rounded-xl text-white font-semibold ${u.isActive ? "bg-red-600" : "bg-green-600"
                                                        }`}
                                                >
                                                    {u.isActive ? "Deactivate" : "Activate"}
                                                </button>

                                                <button
                                                    onClick={() => resetPassword(u._id)}
                                                    className="w-full bg-[#800020] text-white px-3 py-3 rounded-xl font-semibold"
                                                >
                                                    Reset Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {users.length === 0 && (
                                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                                        No users found.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>        </>
    );
}

