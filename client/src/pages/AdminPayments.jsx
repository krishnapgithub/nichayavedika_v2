import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";
import { authHeader } from "../utils/authHeader";

const FILTERS = ["all", "pending", "submitted", "success", "failed", "cancelled"];

const statusClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState("");

    const fetchPayments = async (nextStatus = status) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_BASE_URL}/api/payments/admin/all?status=${nextStatus}`,
                { headers: authHeader() }
            );
            setPayments(res.data.payments || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const changeFilter = (nextStatus) => {
        setStatus(nextStatus);
        fetchPayments(nextStatus);
    };

    const updateStatus = async (paymentId, nextStatus) => {
        try {
            setUpdatingId(paymentId);
            const res = await axios.put(
                `${API_BASE_URL}/api/payments/admin/${paymentId}/status`,
                { status: nextStatus },
                { headers: authHeader() }
            );

            setPayments((prev) =>
                prev.map((payment) =>
                    payment._id === paymentId ? res.data.payment : payment
                )
            );
            toast.success(res.data.message || "Payment updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update payment");
        } finally {
            setUpdatingId("");
        }
    };

    return (
        <div className="min-h-screen bg-[#fff8f2] pt-40 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-amber-700">Admin verification</p>
                        <h1 className="text-3xl font-bold text-[#800020]">Payment Requests</h1>
                        <p className="text-gray-600 mt-1">
                            Review submitted references and activate memberships after confirmation.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => changeFilter(filter)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize border ${
                                    status === filter
                                        ? "bg-[#800020] text-white border-[#800020]"
                                        : "bg-white text-gray-700 border-rose-100"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow p-6 text-center font-semibold text-[#800020]">
                        Loading payment requests...
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {payments.map((payment) => {
                            const user = payment.user || {};
                            const canVerify = ["pending", "submitted"].includes(payment.status);

                            return (
                                <article
                                    key={payment._id}
                                    className="bg-white rounded-2xl shadow border border-rose-100 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">{payment.receiptNumber}</p>
                                            <h2 className="text-xl font-bold text-[#800020]">
                                                {user.fullName || "Member"}
                                            </h2>
                                            <p className="text-sm text-gray-600">{user.mobile || user.email || "-"}</p>
                                        </div>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                                statusClasses[payment.status] || statusClasses.pending
                                            }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-xl bg-rose-50 p-3">
                                            <p className="text-gray-500">Plan</p>
                                            <p className="font-bold text-[#800020] capitalize">{payment.plan}</p>
                                        </div>
                                        <div className="rounded-xl bg-rose-50 p-3">
                                            <p className="text-gray-500">Amount</p>
                                            <p className="font-bold text-[#800020]">INR {payment.amount}</p>
                                        </div>
                                        <div className="rounded-xl bg-rose-50 p-3 col-span-2">
                                            <p className="text-gray-500">Reference</p>
                                            <p className="font-semibold text-gray-800 break-words">
                                                {payment.paymentReference || "Not submitted"}
                                            </p>
                                        </div>
                                    </div>

                                    {payment.notes && (
                                        <p className="mt-4 text-sm text-gray-700 bg-[#fff8f2] rounded-xl p-3">
                                            {payment.notes}
                                        </p>
                                    )}

                                    <div className="mt-5 flex gap-3">
                                        <button
                                            type="button"
                                            disabled={!canVerify || updatingId === payment._id}
                                            onClick={() => updateStatus(payment._id, "success")}
                                            className="flex-1 rounded-xl bg-green-600 px-4 py-2 font-bold text-white disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canVerify || updatingId === payment._id}
                                            onClick={() => updateStatus(payment._id, "failed")}
                                            className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </article>
                            );
                        })}

                        {payments.length === 0 && (
                            <div className="md:col-span-2 xl:col-span-3 bg-white rounded-2xl shadow p-8 text-center text-gray-600">
                                No payment requests found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
