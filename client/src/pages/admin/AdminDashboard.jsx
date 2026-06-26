// ==========================================
// Imports
// ==========================================
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import toast from "react-hot-toast";

// ==========================================
// Admin Dashboard
// ==========================================
export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // Load Pending Users
    // ==========================================
    const loadPendingUsers = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/pending-users`
            );

            setUsers(response.data.users || []);
        } catch (error) {
            toast.error("Failed to load pending users");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Approve User
    // ==========================================
    const approveUser = async (id) => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/admin/users/${id}/approve`
            );

            toast.success("User approved successfully");
            loadPendingUsers();
        } catch (error) {
            toast.error("Approval failed");
        }
    };

    // ==========================================
    // Reject User
    // ==========================================
    const rejectUser = async (id) => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/admin/users/${id}/reject`
            );

            toast.success("User rejected successfully");
            loadPendingUsers();
        } catch (error) {
            toast.error("Reject failed");
        }
    };

    // ==========================================
    // Initial Load
    // ==========================================
    useEffect(() => {
        loadPendingUsers();
    }, []);


    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser || savedUser.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">
                    Access denied. Admins only.
                </h1>
            </div>
        );
    }

    // ==========================================
    // Render
    // ==========================================
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[#800020] mb-6">
                    NichayaVedika Admin Dashboard
                </h1>

                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Pending Registrations ({users.length})
                    </h2>

                    {loading ? (
                        <p>Loading pending users...</p>
                    ) : users.length === 0 ? (
                        <p className="text-gray-500">
                            No pending registrations.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#800020] text-white">
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Email</th>
                                        <th className="p-3 text-left">Mobile</th>
                                        <th className="p-3 text-left">Gender</th>
                                        <th className="p-3 text-left">For</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b">
                                            <td className="p-3">{user.fullName}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">{user.mobile}</td>
                                            <td className="p-3">{user.gender}</td>
                                            <td className="p-3">{user.registeringFor}</td>
                                            <td className="p-3">
                                                <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center space-x-2">
                                                <button
                                                    onClick={() => approveUser(user._id)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => rejectUser(user._id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}