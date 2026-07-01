import axios from "axios";
import PageContent from "../models/PageContent.js";

const HYDERABAD_LOCATION = {
    latitude: "17.3850",
    longitude: "78.4867",
    timezone: "Asia/Kolkata",
};

const manualContentFilter = {
    pageType: "muhurthalu",
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
};

const getNestedValue = (source, paths) => {
    for (const path of paths) {
        const value = path.split(".").reduce((current, key) => current?.[key], source);

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return "";
};

const toDisplayText = (value) => {
    if (!value) return "";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") {
        return /^\d{4}-\d{2}-\d{2}T/.test(value) ? formatPanchangTime(value) : value;
    }
    if (Array.isArray(value)) return value.map(toDisplayText).filter(Boolean).join(", ");
    if (typeof value === "object") {
        const primary = value.name || value.value || value.title || value.label;
        const startsAt = value.start || value.starts_at || value.start_time;
        const endsAt = value.end || value.ends_at || value.end_time;

        return [primary, startsAt && endsAt ? `${formatPanchangTime(startsAt)} - ${formatPanchangTime(endsAt)}` : ""]
            .filter(Boolean)
            .join(" ");
    }

    return String(value);
};

const formatPanchangTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).replace(/T/, " ").replace(/\+.*$/, "").slice(0, 16);
    }

    return new Intl.DateTimeFormat("te-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: HYDERABAD_LOCATION.timezone,
    }).format(date);
};

const toList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "object") {
        return Object.entries(value)
            .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== "")
            .map(([key, entryValue]) => `${key}: ${entryValue}`);
    }

    return [String(value)];
};

const TELUGU_PANCHANG_LABELS = [
    "వారం",
    "తిథి",
    "నక్షత్రం",
    "కరణం",
    "యోగం",
    "సూర్యోదయం",
    "సూర్యాస్తమయం",
    "చంద్రోదయం",
    "చంద్రాస్తమయం",
    "మాసం",
    "పక్షం",
    "రాహుకాలం",
    "యమగండం",
];

const TELUGU_MUHURTHALU_SECTION_TITLES = [
    "ఈ రోజు తెలుగు పంచాంగం",
    "తెలుగు పండుగలు",
    "వివాహ ముహూర్తాలు",
    "నిశ్చితార్థ ముహూర్తాలు",
];

const mapManualItems = (items) =>
    items.map((item) => ({
        title: item.title,
        price: item.metaLabel || "",
        items: [item.subtitle, ...(item.detailLines || [])].filter(Boolean),
    }));

const getManualMuhurthaluSections = async () => {
    const items = await PageContent.find(manualContentFilter).sort({
        sortOrder: 1,
        createdAt: -1,
    });

    return mapManualItems(items);
};

const buildApiUrl = (baseUrl, query) => {
    const today = query.date || new Date().toISOString().slice(0, 10);
    const year = query.year || today.slice(0, 4);

    return baseUrl
        .replace("{date}", encodeURIComponent(today))
        .replace("{year}", encodeURIComponent(year))
        .replace("{lat}", encodeURIComponent(query.latitude || HYDERABAD_LOCATION.latitude))
        .replace("{latitude}", encodeURIComponent(query.latitude || HYDERABAD_LOCATION.latitude))
        .replace("{lon}", encodeURIComponent(query.longitude || HYDERABAD_LOCATION.longitude))
        .replace("{lng}", encodeURIComponent(query.longitude || HYDERABAD_LOCATION.longitude))
        .replace("{longitude}", encodeURIComponent(query.longitude || HYDERABAD_LOCATION.longitude))
        .replace("{tz}", encodeURIComponent(query.timezone || HYDERABAD_LOCATION.timezone))
        .replace("{timezone}", encodeURIComponent(query.timezone || HYDERABAD_LOCATION.timezone));
};

const normalizeEnvValue = (value) =>
    String(value || "")
        .trim()
        .replace(/^['"]|['"];?$/g, "")
        .replace(/;$/, "")
        .trim();

let prokeralaTokenCache = {
    accessToken: "",
    expiresAt: 0,
};

const isProkeralaUrl = (url) => {
    try {
        return new URL(url).hostname.includes("prokerala.com");
    } catch {
        return false;
    }
};

const getProkeralaApiUrl = (apiUrl) => {
    const cleanUrl = normalizeEnvValue(apiUrl || "https://api.prokerala.com/v2/astrology/panchang");

    try {
        const url = new URL(cleanUrl);

        if (!url.hostname.includes("prokerala.com")) {
            return "https://api.prokerala.com/v2/astrology/panchang";
        }

        if (
            url.hostname.includes("prokerala.com") &&
            (["/", ""].includes(url.pathname) || url.pathname.includes("western_horoscope"))
        ) {
            url.pathname = "/v2/astrology/panchang";
        }

        return url.toString();
    } catch {
        return cleanUrl;
    }
};

const getProkeralaAccessToken = async () => {
    const now = Date.now();

    if (prokeralaTokenCache.accessToken && prokeralaTokenCache.expiresAt > now + 60000) {
        return prokeralaTokenCache.accessToken;
    }

    const clientId = normalizeEnvValue(process.env.PROKERALA_CLIENT_ID || process.env.ASTROLOGY_API_CLIENT_ID);
    const clientSecret = normalizeEnvValue(process.env.PROKERALA_CLIENT_SECRET || process.env.ASTROLOGY_API_CLIENT_SECRET);
    const tokenUrl = normalizeEnvValue(process.env.PROKERALA_TOKEN_URL || "https://api.prokerala.com/token");

    if (!clientId || !clientSecret) {
        throw new Error("Prokerala Client ID/Secret are not configured");
    }

    const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
            grant_type: "client_credentials",
        }),
        {
            auth: {
                username: clientId,
                password: clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 10000,
        }
    );

    const accessToken = response.data?.access_token;

    if (!accessToken) {
        throw new Error("Prokerala token response did not include access_token");
    }

    prokeralaTokenCache = {
        accessToken,
        expiresAt: now + Number(response.data?.expires_in || 3600) * 1000,
    };

    return accessToken;
};

const fetchProkeralaApi = async (query, apiUrl) => {
    const accessToken = await getProkeralaAccessToken();
    const date = query.date || new Date().toISOString().slice(0, 10);
    const latitude = query.latitude || HYDERABAD_LOCATION.latitude;
    const longitude = query.longitude || HYDERABAD_LOCATION.longitude;
    const url = getProkeralaApiUrl(apiUrl);

    const response = await axios.get(url, {
        params: {
            ayanamsa: query.ayanamsa || 1,
            coordinates: `${latitude},${longitude}`,
            datetime: query.datetime || `${date}T06:00:00+05:30`,
            la: query.language || "te",
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    });

    return response.data;
};

const fetchAstrologyApi = async (query) => {
    const apiUrl = normalizeEnvValue(process.env.ASTROLOGY_API_URL || process.env.PROKERALA_API_URL);
    const apiKey = normalizeEnvValue(process.env.ASTROLOGY_API_KEY);
    const apiUserId = normalizeEnvValue(process.env.ASTROLOGY_API_USER_ID);
    const apiMethod = normalizeEnvValue(process.env.ASTROLOGY_API_METHOD || "GET").toUpperCase();
    const apiProvider = normalizeEnvValue(process.env.ASTROLOGY_API_PROVIDER).toLowerCase();
    const hasProkeralaCredentials = Boolean(
        normalizeEnvValue(process.env.PROKERALA_CLIENT_ID || process.env.ASTROLOGY_API_CLIENT_ID) &&
        normalizeEnvValue(process.env.PROKERALA_CLIENT_SECRET || process.env.ASTROLOGY_API_CLIENT_SECRET)
    );

    if (apiProvider === "prokerala" || isProkeralaUrl(apiUrl) || hasProkeralaCredentials) {
        return fetchProkeralaApi(query, apiUrl);
    }

    if (!apiUrl || !apiKey) {
        throw new Error("Astrology API is not configured");
    }

    const date = query.date || new Date().toISOString().slice(0, 10);
    const year = query.year || date.slice(0, 4);
    const url = buildApiUrl(apiUrl, { ...query, date, year });
    const requestData = {
        date,
        day: Number(date.slice(8, 10)),
        month: Number(date.slice(5, 7)),
        year: Number(year),
        hour: 6,
        min: 0,
        lat: query.latitude || HYDERABAD_LOCATION.latitude,
        lon: query.longitude || HYDERABAD_LOCATION.longitude,
        latitude: query.latitude || HYDERABAD_LOCATION.latitude,
        longitude: query.longitude || HYDERABAD_LOCATION.longitude,
        timezone: query.timezone || HYDERABAD_LOCATION.timezone,
        tzone: 5.5,
        tz: query.timezone || HYDERABAD_LOCATION.timezone,
        api_key: apiKey,
        key: apiKey,
    };
    const requestConfig = {
        headers: {
            "x-api-key": apiKey,
            Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
    };

    if (apiUserId) {
        requestConfig.auth = {
            username: apiUserId,
            password: apiKey,
        };
        delete requestConfig.headers.Authorization;
    }

    const response = apiMethod === "POST"
        ? await axios.post(url, requestData, requestConfig)
        : await axios.get(url, {
            ...requestConfig,
            params: requestData,
        });

    return response.data;
};

const normalizeAstrologyData = (apiData) => {
    const data = apiData?.data || apiData?.response || apiData?.result || apiData || {};
    const panchang = data.panchang || data.panchangam || data.daily_panchang || data.today || data;
    const festivals =
        data.festivals ||
        data.telugu_festivals ||
        data.hindu_festivals ||
        panchang.festivals ||
        [];
    const marriageMuhurat =
        data.marriage_muhurat ||
        data.marriage_muhurtham ||
        data.marriage_muhurats ||
        data.vivah_muhurat ||
        [];
    const engagementMuhurat =
        data.engagement_muhurat ||
        data.engagement_muhurtham ||
        data.engagement_muhurats ||
        data.nischitartham_muhurat ||
        [];

    const todayItems = [
        ["వారం", getNestedValue(panchang, ["vaara", "vara", "weekday", "day"])],
        ["తిథి", getNestedValue(panchang, ["tithi.name", "tithi", "tithi_name"])],
        ["నక్షత్రం", getNestedValue(panchang, ["nakshatra.name", "nakshatra", "nakshatra_name", "star"])],
        ["కరణం", getNestedValue(panchang, ["karana.name", "karana"])],
        ["యోగం", getNestedValue(panchang, ["yoga.name", "yoga"])],
        ["సూర్యోదయం", getNestedValue(panchang, ["sunrise"])],
        ["సూర్యాస్తమయం", getNestedValue(panchang, ["sunset"])],
        ["చంద్రోదయం", getNestedValue(panchang, ["moonrise"])],
        ["చంద్రాస్తమయం", getNestedValue(panchang, ["moonset"])],
        ["మాసం", getNestedValue(panchang, ["masa", "masam", "month", "lunar_month"])],
        ["పక్షం", getNestedValue(panchang, ["paksha", "paksham"])],
        ["రాహుకాలం", getNestedValue(panchang, ["rahukaal", "rahukalam", "rahu_kalam"])],
        ["యమగండం", getNestedValue(panchang, ["yamaganda", "yamagandam", "yama_gandam"])],
    ]
        .map(([, value], index) => {
            const text = toDisplayText(value);
            const label = TELUGU_PANCHANG_LABELS[index];

            return text ? `${label}: ${text}` : "";
        })
        .filter(Boolean);

    const sections = [
        {
            title: "ఈ రోజు తెలుగు పంచాంగం",
            price: getNestedValue(panchang, ["date", "day", "weekday"]) || "Today",
            items: todayItems.length > 0 ? todayItems : ["తిథి మరియు నక్షత్రం API నుండి అందుబాటులో లేవు"],
        },
        {
            title: "తెలుగు పండుగలు",
            price: "Upcoming / Yearly",
            items: toList(festivals),
        },
        {
            title: "వివాహ ముహూర్తాలు",
            price: "API",
            items: toList(marriageMuhurat),
        },
        {
            title: "నిశ్చితార్థ ముహూర్తాలు",
            price: "API",
            items: toList(engagementMuhurat),
        },
    ];

    return sections
        .map((section, index) => ({
            ...section,
            title: TELUGU_MUHURTHALU_SECTION_TITLES[index] || section.title,
            items: section.items.map((item) =>
                item.includes("API") ? "తిథి మరియు నక్షత్రం API నుండి అందుబాటులో లేవు" : item
            ),
        }))
        .filter((section) => section.items.length > 0);
};

export const getMuhurthaluContent = async (req, res) => {
    try {
        const manualSections = await getManualMuhurthaluSections();

        try {
            const apiData = await fetchAstrologyApi(req.query);
            const apiSections = normalizeAstrologyData(apiData);

            if (apiSections.length > 0) {
                return res.json({
                    success: true,
                    source: "api",
                    sections: [...apiSections, ...manualSections],
                });
            }

            throw new Error("Astrology API response did not contain supported Muhurthalu fields");
        } catch (apiError) {
            return res.json({
                success: true,
                source: "manual",
                message: apiError.message,
                sections: manualSections,
            });
        }
    } catch (error) {
        console.error("Muhurthalu content error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load Muhurthalu content",
        });
    }
};

export const getMuhurthaluApiContent = async (req, res) => {
    try {
        const apiData = await fetchAstrologyApi(req.query);
        const sections = normalizeAstrologyData(apiData);

        return res.json({
            success: true,
            source: "api",
            sections,
        });
    } catch (error) {
        console.error("Muhurthalu API fetch error:", error.response?.data || error.message);

        return res.status(502).json({
            success: false,
            message: "Unable to fetch Panchangam from API. Please add the details manually.",
        });
    }
};
