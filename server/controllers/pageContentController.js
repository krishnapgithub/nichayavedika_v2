import PageContent from "../models/PageContent.js";

const PAGE_TYPES = ["success", "events", "muhurthalu", "contact"];

const activeContentFilter = (pageType) => ({
    pageType,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

const normalizePayload = (body) => {
    const detailLines = Array.isArray(body.detailLines)
        ? body.detailLines
        : String(body.detailLines || "")
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);

    return {
        pageType: body.pageType,
        title: body.title?.trim(),
        subtitle: body.subtitle?.trim() || "",
        metaLabel: body.metaLabel?.trim() || "",
        detailLines,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder || 0),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    };
};

export const getPublicPageContent = async (req, res) => {
    try {
        const { pageType } = req.params;

        if (!PAGE_TYPES.includes(pageType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid page type",
            });
        }

        const items = await PageContent.find(activeContentFilter(pageType)).sort({
            sortOrder: 1,
            createdAt: -1,
        });

        res.json({ success: true, items });
    } catch (error) {
        console.error("Get public page content error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load page content",
        });
    }
};

export const getAllPageContent = async (req, res) => {
    try {
        const { pageType = "all" } = req.query;
        const filter = pageType === "all" ? {} : { pageType };

        const items = await PageContent.find(filter).sort({
            pageType: 1,
            sortOrder: 1,
            createdAt: -1,
        });

        res.json({ success: true, items });
    } catch (error) {
        console.error("Get admin page content error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load admin content",
        });
    }
};

export const createPageContent = async (req, res) => {
    try {
        const payload = normalizePayload(req.body);

        if (!PAGE_TYPES.includes(payload.pageType) || !payload.title) {
            return res.status(400).json({
                success: false,
                message: "Page type and title are required",
            });
        }

        const item = await PageContent.create(payload);

        res.status(201).json({
            success: true,
            message: "Content added successfully",
            item,
        });
    } catch (error) {
        console.error("Create page content error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to add content",
        });
    }
};

export const updatePageContent = async (req, res) => {
    try {
        const payload = normalizePayload(req.body);

        if (!PAGE_TYPES.includes(payload.pageType) || !payload.title) {
            return res.status(400).json({
                success: false,
                message: "Page type and title are required",
            });
        }

        const item = await PageContent.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Content item not found",
            });
        }

        res.json({
            success: true,
            message: "Content updated successfully",
            item,
        });
    } catch (error) {
        console.error("Update page content error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update content",
        });
    }
};

export const deletePageContent = async (req, res) => {
    try {
        const item = await PageContent.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Content item not found",
            });
        }

        res.json({
            success: true,
            message: "Content deleted successfully",
        });
    } catch (error) {
        console.error("Delete page content error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete content",
        });
    }
};
