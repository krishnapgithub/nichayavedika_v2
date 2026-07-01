import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { authHeader } from "../utils/authHeader";
import toast from "react-hot-toast";

const registeringForOptions = ["Self", "Son", "Daughter", "Brother", "Sister"];
const genderOptions = ["Bride", "Groom"];

const getExpectedGender = (registeringFor) => {
    if (["Son", "Brother"].includes(registeringFor)) return "Groom";
    if (["Daughter", "Sister"].includes(registeringFor)) return "Bride";
    return "";
};

const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Dashboard() {
    const [savedUser, setSavedUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
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
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [accountForm, setAccountForm] = useState({
        fullName: savedUser.fullName || "",
        email: savedUser.email || "",
        mobile: savedUser.mobile || "",
        registeringFor: savedUser.registeringFor || "",
        gender: savedUser.gender || "",
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
        fetchPaymentHistory();
    }, []);

    useEffect(() => {
        setAccountForm({
            fullName: savedUser.fullName || "",
            email: savedUser.email || "",
            mobile: savedUser.mobile || "",
            registeringFor: savedUser.registeringFor || "",
            gender: savedUser.gender || "",
        });
    }, [savedUser]);

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

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/payments/my`, {
                headers: authHeader(),
            });

            setPayments(response.data.payments || []);
        } catch (error) {
            console.error("Payment history failed:", error);
        } finally {
            setPaymentsLoading(false);
        }
    };

    const handleAccountChange = (event) => {
        const { name, value } = event.target;

        setAccountForm((current) => {
            const next = {
                ...current,
                [name]: value,
            };

            if (name === "registeringFor") {
                const expectedGender = getExpectedGender(value);

                if (expectedGender) {
                    next.gender = expectedGender;
                }
            }

            return next;
        });
    };

    const saveAccountSettings = async (event) => {
        event.preventDefault();

        const expectedGender = getExpectedGender(accountForm.registeringFor);

        if (expectedGender && accountForm.gender !== expectedGender) {
            toast.error(`${accountForm.registeringFor} registration should be selected as ${expectedGender}`);
            return;
        }

        setIsSavingAccount(true);

        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/auth/me`,
                {
                    fullName: accountForm.fullName.trim(),
                    mobile: accountForm.mobile.trim(),
                    registeringFor: accountForm.registeringFor,
                    gender: accountForm.gender,
                },
                { headers: authHeader() }
            );

            const updatedUser = response.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setSavedUser(updatedUser);
            window.dispatchEvent(new Event("account:user-updated"));
            toast.success("Account settings updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update account settings");
        } finally {
            setIsSavingAccount(false);
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
                    <DashboardCard title="Payment History" link="#payment-history" />
                    <DashboardCard title="Settings" link="#account-settings" />
                </div>

                <section id="payment-history" className="mt-8 rounded-2xl bg-white p-6 shadow-lg scroll-mt-44">
                    <div className="flex flex-col gap-3 border-b border-rose-100 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#800020]">Payment History</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Track membership payments, verification status, and expiry dates.
                            </p>
                        </div>
                        <Link
                            to="/membership"
                            className="rounded-full bg-[#800020] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#5f0018]"
                        >
                            Upgrade Plan
                        </Link>
                    </div>

                    {paymentsLoading ? (
                        <div className="mt-5 rounded-2xl bg-[#fff8f2] p-6 text-center font-semibold text-[#800020]">
                            Loading payment history...
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="mt-5 rounded-2xl bg-[#fff8f2] p-6 text-center">
                            <p className="font-bold text-[#800020]">No payments yet</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Your membership payment requests will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4">
                            {payments.map((payment) => (
                                <PaymentHistoryCard key={payment._id} payment={payment} />
                            ))}
                        </div>
                    )}
                </section>

                <section id="account-settings" className="mt-8 rounded-2xl bg-white p-6 shadow-lg scroll-mt-44">
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

                    <form onSubmit={saveAccountSettings} className="mt-6 rounded-2xl border border-rose-100 bg-[#fff8f2] p-5">
                        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[#800020]">Registration Information</h3>
                                <p className="text-sm text-gray-600">Update your account details. Email is locked because it is your primary login ID.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSavingAccount}
                                className="rounded-full bg-[#800020] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#5f0018] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingAccount ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <AccountInput label="Name" name="fullName" value={accountForm.fullName} onChange={handleAccountChange} required />
                            <AccountInput label="Email" name="email" value={accountForm.email} disabled />
                            <AccountInput label="Phone Number" name="mobile" value={accountForm.mobile} onChange={handleAccountChange} required />
                            <AccountSelect label="Registering For" name="registeringFor" value={accountForm.registeringFor} onChange={handleAccountChange} options={registeringForOptions} required />
                            <AccountSelect label="Gender" name="gender" value={accountForm.gender} onChange={handleAccountChange} options={genderOptions} required />
                        </div>
                    </form>

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
                            <SettingsLink label="Track payment history" to="#payment-history" />
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

function PaymentHistoryCard({ payment }) {
    const status = String(payment.status || "pending").toLowerCase();
    const statusClass = statusClasses[status] || statusClasses.pending;

    return (
        <article className="rounded-2xl border border-rose-100 bg-[#fff8f2] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#800020]">
                            {payment.receiptNumber || "Payment Request"}
                        </h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass}`}>
                            {status}
                        </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-700">
                        {payment.plan} Membership - {payment.currency || "INR"} {payment.amount}
                    </p>
                </div>

                <div className="text-sm font-semibold text-gray-600 md:text-right">
                    <p>Requested: {formatDate(payment.createdAt)}</p>
                    <p>Verified: {formatDate(payment.verifiedAt)}</p>
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <PaymentDetail label="Provider" value={payment.provider || "manual"} />
                <PaymentDetail label="Reference" value={payment.paymentReference || payment.razorpayPaymentId || "-"} />
                <PaymentDetail label="Start Date" value={formatDate(payment.membershipStartDate)} />
                <PaymentDetail label="Expiry Date" value={formatDate(payment.membershipExpiryDate)} />
            </div>

            {(payment.notes || payment.adminNotes) && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {payment.notes && (
                        <PaymentDetail label="Your Notes" value={payment.notes} />
                    )}
                    {payment.adminNotes && (
                        <PaymentDetail label="Admin Notes" value={payment.adminNotes} />
                    )}
                </div>
            )}
        </article>
    );
}

function PaymentDetail({ label, value }) {
    return (
        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-gray-800">{value || "-"}</p>
        </div>
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

function AccountInput({ label, disabled = false, ...props }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-bold text-gray-700">{label}</span>
            <input
                {...props}
                disabled={disabled}
                className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#800020] focus:ring-2 focus:ring-rose-100 disabled:bg-gray-100 disabled:text-gray-500"
            />
        </label>
    );
}

function AccountSelect({ label, options, ...props }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-bold text-gray-700">{label}</span>
            <select
                {...props}
                className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#800020] focus:ring-2 focus:ring-rose-100"
            >
                <option value="">Select</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
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
