import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";
import { authHeader } from "../utils/authHeader";

const PAGE_TYPES = [
    { value: "success", label: "Success" },
    { value: "events", label: "Events" },
    { value: "muhurthalu", label: "Muhurthalu" },
    { value: "contact", label: "Contact Us" },
];

const emptyForm = {
    pageType: "success",
    title: "",
    subtitle: "",
    metaLabel: "",
    detailLines: "",
    sortOrder: 0,
    expiresAt: "",
    isActive: true,
};

const PAGE_HELP_TEXT = {
    muhurthalu:
        "Manual provision: add Telugu Panchangam details, marriage/engagement muhurthalu, or upcoming Telugu festivals here when API data is unavailable or needs review.",
};

const MUHURTHALU_TEMPLATES = [
    {
        title: "తెలుగు క్యాలెండర్",
        subtitle: "ప్రతి సంవత్సరానికి తెలుగు పంచాంగం మరియు పండుగల సమాచారం.",
        metaLabel: "API / Yearly",
        detailLines: "పంచాంగం\nతెలుగు పండుగలు\nమాసం మరియు పక్షం",
        sortOrder: 0,
    },
    {
        title: "వివాహ ముహూర్తాలు",
        subtitle: "తెలుగు హిందూ సంప్రదాయానికి అనుగుణంగా శుభ వివాహ దినాలు.",
        metaLabel: "Manual / API",
        detailLines: "శుభ తేదీలు\nపంచాంగ వివరాలు\nకుటుంబ పురోహితునితో నిర్ధారించుకోవాలి",
        sortOrder: 1,
    },
    {
        title: "నిశ్చితార్థ ముహూర్తాలు",
        subtitle: "నిశ్చితార్థానికి అనుకూలమైన శుభ దినాలు మరియు సూచనలు.",
        metaLabel: "Manual / API",
        detailLines: "సరైన రోజు ఎంపిక\nశుభ సమయ సూచనలు\nకుటుంబ అనుకూలత",
        sortOrder: 2,
    },
];

const toDateInput = (value) => {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
};

export default function AdminPageContent() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("success");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingPanchang, setFetchingPanchang] = useState(false);

    const filteredItems = useMemo(
        () => items.filter((item) => item.pageType === filter),
        [items, filter]
    );
    const suggestedMuhurthaluTemplates = useMemo(() => {
        if (filter !== "muhurthalu") return [];

        const savedTitles = new Set(filteredItems.map((item) => item.title));

        return MUHURTHALU_TEMPLATES.filter(
            (template) => !savedTitles.has(template.title)
        );
    }, [filter, filteredItems]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/page-content/admin/all`, {
                headers: authHeader(),
            });
            setItems(res.data.items || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load content");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = (pageType = filter) => {
        setEditingId("");
        setForm({ ...emptyForm, pageType });
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilterChange = (pageType) => {
        setFilter(pageType);
        resetForm(pageType);
    };

    const editItem = (item) => {
        setEditingId(item._id);
        setForm({
            pageType: item.pageType,
            title: item.title || "",
            subtitle: item.subtitle || "",
            metaLabel: item.metaLabel || "",
            detailLines: (item.detailLines || []).join("\n"),
            sortOrder: item.sortOrder || 0,
            expiresAt: toDateInput(item.expiresAt),
            isActive: item.isActive !== false,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const useTemplate = (template) => {
        setEditingId("");
        setForm({
            ...emptyForm,
            pageType: "muhurthalu",
            title: template.title,
            subtitle: template.subtitle,
            metaLabel: template.metaLabel,
            detailLines: template.detailLines,
            sortOrder: template.sortOrder,
            isActive: true,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const fetchPanchangFromApi = async () => {
        try {
            setFetchingPanchang(true);
            const res = await axios.get(`${API_BASE_URL}/api/panchang/admin/muhurthalu`, {
                headers: authHeader(),
            });
            const section = (res.data.sections || [])[0];

            if (!section) {
                toast.error("No Panchangam details returned from API");
                return;
            }

            setEditingId("");
            setForm({
                ...emptyForm,
                pageType: "muhurthalu",
                title: section.title || "ఈ రోజు తెలుగు పంచాంగం",
                subtitle: "API నుండి తెచ్చిన సమాచారం. దయచేసి పరిశీలించి అవసరమైతే మార్చండి.",
                metaLabel: section.price || "API",
                detailLines: (section.items || []).join("\n"),
                sortOrder: 0,
                isActive: true,
            });
            toast.success("Panchangam loaded. Please review and click Add.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to fetch Panchangam from API");
        } finally {
            setFetchingPanchang(false);
        }
    };

    const saveItem = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            const payload = {
                ...form,
                sortOrder: Number(form.sortOrder || 0),
                detailLines: form.detailLines
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                expiresAt: form.expiresAt || null,
            };

            if (editingId) {
                await axios.put(
                    `${API_BASE_URL}/api/page-content/admin/${editingId}`,
                    payload,
                    { headers: authHeader() }
                );
                toast.success("Content updated");
            } else {
                await axios.post(`${API_BASE_URL}/api/page-content/admin`, payload, {
                    headers: authHeader(),
                });
                toast.success("Content added");
            }

            resetForm(form.pageType);
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save content");
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (itemId) => {
        if (!window.confirm("Delete this content item?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/page-content/admin/${itemId}`, {
                headers: authHeader(),
            });
            toast.success("Content deleted");
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete content");
        }
    };

    const isExpired = (item) => item.expiresAt && new Date(item.expiresAt) <= new Date();

    return (
        <div className="min-h-screen bg-[#fff8f2] pt-40 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <p className="text-sm font-semibold text-amber-700">Admin configuration</p>
                    <h1 className="text-3xl font-bold text-[#800020]">Configurable Pages</h1>
                    <p className="text-gray-600 mt-1">
                        Manage Success, Events, Muhurthalu, and Contact content. Empty expiry date means it stays visible.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {PAGE_TYPES.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => handleFilterChange(type.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-bold ${
                                filter === type.value
                                    ? "border-[#800020] bg-[#800020] text-white"
                                    : "border-rose-100 bg-white text-gray-700"
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}

                    {filter === "muhurthalu" && (
                        <button
                            type="button"
                            onClick={fetchPanchangFromApi}
                            disabled={fetchingPanchang}
                            className="rounded-full bg-[#800020] px-5 py-2 text-sm font-bold text-white shadow transition hover:bg-[#5c0017] disabled:cursor-wait disabled:opacity-60"
                        >
                            {fetchingPanchang ? "Fetching..." : "Get Panchangam from API"}
                        </button>
                    )}
                </div>

                {PAGE_HELP_TEXT[filter] && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        {PAGE_HELP_TEXT[filter]}
                    </div>
                )}

                {filter === "muhurthalu" && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#800020]">
                                Fetch Today Panchangam
                            </h2>
                            <p className="text-sm text-gray-600">
                                This uses one API hit, fills the form, and waits for admin review before saving.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchPanchangFromApi}
                            disabled={fetchingPanchang}
                            className="rounded-xl bg-[#800020] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[#5c0017] disabled:cursor-wait disabled:opacity-60"
                        >
                            {fetchingPanchang ? "Fetching..." : "Get Panchangam from API"}
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
                    <form onSubmit={saveItem} className="bg-white rounded-2xl shadow border border-rose-100 p-5">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold text-[#800020]">
                                {editingId ? "Edit Content" : "Add Content"}
                            </h2>

                            {filter === "muhurthalu" && (
                                <button
                                    type="button"
                                    onClick={fetchPanchangFromApi}
                                    disabled={fetchingPanchang}
                                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {fetchingPanchang ? "Fetching..." : "Get Panchangam from API"}
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <label className="text-sm font-semibold text-gray-700">
                                Page
                                <select
                                    value={form.pageType}
                                    onChange={(e) => handleChange("pageType", e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                >
                                    {PAGE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm font-semibold text-gray-700">
                                Title
                                <input
                                    value={form.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                    required
                                />
                            </label>

                            <label className="text-sm font-semibold text-gray-700">
                                Subtitle / Description
                                <textarea
                                    value={form.subtitle}
                                    onChange={(e) => handleChange("subtitle", e.target.value)}
                                    rows="3"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                />
                            </label>

                            <label className="text-sm font-semibold text-gray-700">
                                Label / Date / Location
                                <input
                                    value={form.metaLabel}
                                    onChange={(e) => handleChange("metaLabel", e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                    placeholder="Example: Hyderabad, Coming Soon, Support"
                                />
                            </label>

                            <label className="text-sm font-semibold text-gray-700">
                                Detail Lines
                                <textarea
                                    value={form.detailLines}
                                    onChange={(e) => handleChange("detailLines", e.target.value)}
                                    rows="5"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                    placeholder="One detail per line"
                                />
                            </label>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="text-sm font-semibold text-gray-700">
                                    Sort Order
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => handleChange("sortOrder", e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                    />
                                </label>

                                <label className="text-sm font-semibold text-gray-700">
                                    Expiry Date
                                    <input
                                        type="date"
                                        value={form.expiresAt}
                                        onChange={(e) => handleChange("expiresAt", e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
                                    />
                                </label>
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => handleChange("isActive", e.target.checked)}
                                />
                                Active
                            </label>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-[#800020] px-5 py-3 font-bold text-white disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : editingId ? "Update" : "Add"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => resetForm()}
                                    className="rounded-xl border border-[#800020] px-5 py-3 font-bold text-[#800020]"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>

                    <section className="bg-white rounded-2xl shadow border border-rose-100 p-5">
                        <h2 className="text-xl font-bold text-[#800020] mb-4">Current Content</h2>

                        {loading ? (
                            <div className="p-5 text-center text-[#800020] font-semibold">Loading...</div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredItems.map((item) => (
                                    <article key={item._id} className="rounded-2xl border border-rose-100 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#800020]">{item.title}</h3>
                                                <p className="text-sm text-gray-600">{item.metaLabel || "-"}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                !item.isActive
                                                    ? "bg-gray-100 text-gray-600"
                                                    : isExpired(item)
                                                        ? "bg-red-50 text-red-700"
                                                        : "bg-green-50 text-green-700"
                                            }`}>
                                                {!item.isActive ? "Inactive" : isExpired(item) ? "Expired" : "Visible"}
                                            </span>
                                        </div>

                                        {item.subtitle && <p className="mt-3 text-sm text-gray-700">{item.subtitle}</p>}
                                        <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
                                            {(item.detailLines || []).map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>

                                        <p className="mt-3 text-xs text-gray-500">
                                            Expiry: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "No expiry"}
                                        </p>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => editItem(item)}
                                                className="rounded-xl bg-[#800020] px-4 py-2 text-sm font-bold text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteItem(item._id)}
                                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}

                                {filter === "muhurthalu" && suggestedMuhurthaluTemplates.length > 0 && (
                                    <div className="grid gap-4">
                                        <div className="rounded-2xl bg-[#fff8f2] p-5 text-center text-gray-600">
                                            API starter details. Use any item below to save and customize it manually.
                                        </div>

                                        {suggestedMuhurthaluTemplates.map((template) => (
                                            <article key={template.title} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-[#800020]">{template.title}</h3>
                                                        <p className="text-sm font-semibold text-amber-700">{template.metaLabel}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => useTemplate(template)}
                                                        className="rounded-xl bg-[#800020] px-4 py-2 text-sm font-bold text-white"
                                                    >
                                                        Use
                                                    </button>
                                                </div>
                                                <p className="mt-3 text-sm text-gray-700">{template.subtitle}</p>
                                                <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
                                                    {template.detailLines.split("\n").map((line) => (
                                                        <li key={line}>{line}</li>
                                                    ))}
                                                </ul>
                                            </article>
                                        ))}
                                    </div>
                                )}

                                {filteredItems.length === 0 && filter !== "muhurthalu" && (
                                    <div className="rounded-2xl bg-[#fff8f2] p-8 text-center text-gray-600">
                                        No content added for this page yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
