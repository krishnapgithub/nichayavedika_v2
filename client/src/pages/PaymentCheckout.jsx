import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";
import { authHeader } from "../utils/authHeader";

const PLANS = {
    premium: {
        label: "Premium",
        amount: "INR 1,999",
        duration: "3 Months",
        views: "20 profile views",
        benefits: [
            "View contact details after approval",
            "Send interests to matching profiles",
            "Priority listing in search",
            "WhatsApp support",
        ],
    },
    elite: {
        label: "Elite",
        amount: "INR 4,999",
        duration: "6 Months",
        views: "50 profile views",
        benefits: [
            "Everything in Premium",
            "Dedicated relationship manager",
            "Profile boost",
            "Exclusive matches and priority support",
        ],
    },
};

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

export default function PaymentCheckout() {
    const { plan } = useParams();
    const selectedPlan = useMemo(() => PLANS[plan?.toLowerCase()], [plan]);
    const [payment, setPayment] = useState(null);
    const [paymentReference, setPaymentReference] = useState("");
    const [notes, setNotes] = useState("");
    const [creating, setCreating] = useState(false);
    const [paying, setPaying] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState([]);

    const loadHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/payments/my`, {
                headers: authHeader(),
            });
            setHistory(res.data.payments || []);
        } catch (error) {
            console.error("Load payment history failed:", error);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const createRequest = async () => {
        if (!selectedPlan) return;

        try {
            setCreating(true);
            const res = await axios.post(
                `${API_BASE_URL}/api/payments`,
                { plan: plan.toLowerCase() },
                { headers: authHeader() }
            );
            setPayment(res.data.payment);
            toast.success("Payment request created");
            loadHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to create payment request");
        } finally {
            setCreating(false);
        }
    };

    const submitReference = async (event) => {
        event.preventDefault();

        if (!payment?._id) {
            toast.error("Please create a payment request first");
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.put(
                `${API_BASE_URL}/api/payments/${payment._id}/reference`,
                { paymentReference, notes },
                { headers: authHeader() }
            );
            setPayment(res.data.payment);
            toast.success("Payment submitted for verification");
            loadHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to submit payment details");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!selectedPlan) return;

        try {
            setPaying(true);

            const scriptReady = await loadRazorpayScript();
            if (!scriptReady) {
                toast.error("Unable to load Razorpay checkout. Please try again.");
                return;
            }

            const orderRes = await axios.post(
                `${API_BASE_URL}/api/payments/razorpay/order`,
                { plan: plan.toLowerCase() },
                { headers: authHeader() }
            );

            const { keyId, order, payment: paymentRecord } = orderRes.data;
            setPayment(paymentRecord);

            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const options = {
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "NichayaVedika",
                description: `${selectedPlan.label} Membership`,
                order_id: order.id,
                prefill: {
                    name: user.fullName || "",
                    email: user.email || "",
                    contact: user.mobile || "",
                },
                notes: {
                    receiptNumber: paymentRecord.receiptNumber,
                    plan: paymentRecord.plan,
                },
                theme: {
                    color: "#800020",
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(
                            `${API_BASE_URL}/api/payments/razorpay/verify`,
                            {
                                paymentRecordId: paymentRecord._id,
                                ...response,
                            },
                            { headers: authHeader() }
                        );

                        setPayment(verifyRes.data.payment);
                        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                        localStorage.setItem(
                            "user",
                            JSON.stringify({
                                ...storedUser,
                                membershipPlan: verifyRes.data.payment.plan,
                                membershipExpiresAt: verifyRes.data.payment.membershipExpiryDate,
                            })
                        );
                        toast.success("Payment successful. Membership activated.");
                        loadHistory();
                    } catch (error) {
                        toast.error(error.response?.data?.message || "Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast("Payment window closed");
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to start Razorpay payment");
        } finally {
            setPaying(false);
        }
    };

    if (!selectedPlan) {
        return (
            <div className="min-h-screen bg-[#fff8f2] pt-32 px-4 text-center">
                <h1 className="text-3xl font-bold text-[#800020]">Plan not found</h1>
                <Link className="inline-block mt-5 text-[#800020] font-semibold" to="/membership">
                    Back to Membership
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff8f2] pt-40 px-4 pb-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <p className="text-sm font-semibold text-amber-700">Secure membership checkout</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#800020]">
                        {selectedPlan.label} Membership
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Pay securely through Razorpay. Your membership activates only after successful payment verification.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
                    <section className="bg-white rounded-2xl shadow p-6 border border-rose-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#800020]">{selectedPlan.label}</h2>
                                <p className="text-gray-600">{selectedPlan.duration} - {selectedPlan.views}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[#800020]">{selectedPlan.amount}</p>
                                <p className="text-xs text-gray-500">Protected cloud records</p>
                            </div>
                        </div>

                        <ul className="mt-6 space-y-3 text-gray-700">
                            {selectedPlan.benefits.map((benefit) => (
                                <li key={benefit} className="flex gap-3">
                                    <span className="text-amber-600 font-bold">+</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            onClick={handleRazorpayPayment}
                            disabled={paying}
                            className="mt-7 w-full rounded-xl bg-[#800020] px-5 py-3 font-bold text-white disabled:opacity-60"
                        >
                            {paying ? "Opening Razorpay..." : "Pay Securely with Razorpay"}
                        </button>

                        <button
                            type="button"
                            onClick={createRequest}
                            disabled={creating || payment?.status === "submitted"}
                            className="mt-3 w-full rounded-xl border border-[#800020] px-5 py-3 font-bold text-[#800020] disabled:opacity-60"
                        >
                            {creating ? "Creating..." : "Use Manual Payment Fallback"}
                        </button>

                        {payment && (
                            <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-gray-700 border border-rose-100">
                                <p className="font-semibold text-[#800020]">Request No: {payment.receiptNumber}</p>
                                <p>Status: {payment.status}</p>
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-2xl shadow p-6 border border-rose-100">
                        <h2 className="text-xl font-bold text-[#800020]">Manual Payment Fallback</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Use this only if Razorpay is unavailable or admin asked you to submit a reference manually.
                        </p>

                        <form onSubmit={submitReference} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Payment Reference
                                </label>
                                <input
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020]"
                                    placeholder="Example: UPI123456789 / bank receipt number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="4"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020]"
                                    placeholder="Optional details for admin verification"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !payment}
                                className="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-[#800020] disabled:opacity-60"
                            >
                                {submitting ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </form>
                    </section>
                </div>

                <section className="mt-8 bg-white rounded-2xl shadow p-6 border border-rose-100">
                    <h2 className="text-xl font-bold text-[#800020]">My Payment Requests</h2>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-[720px] w-full text-sm">
                            <thead className="bg-[#800020] text-white">
                                <tr>
                                    <th className="p-3 text-left">Receipt</th>
                                    <th className="p-3 text-left">Plan</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item._id} className="border-b">
                                        <td className="p-3 font-semibold">{item.receiptNumber}</td>
                                        <td className="p-3 capitalize">{item.plan}</td>
                                        <td className="p-3">INR {item.amount}</td>
                                        <td className="p-3 capitalize">{item.status}</td>
                                        <td className="p-3">{item.paymentReference || "-"}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td className="p-4 text-center text-gray-500" colSpan="5">
                                            No payment requests yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
