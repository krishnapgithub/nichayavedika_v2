import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function usePageContent(pageType, fallbackItems = []) {
    const [items, setItems] = useState(fallbackItems);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        const loadItems = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/api/page-content/public/${pageType}`);
                const loadedItems = res.data.items || [];

                if (!ignore) {
                    setItems(loadedItems.length > 0 ? loadedItems : fallbackItems);
                }
            } catch (error) {
                console.error(`Load ${pageType} content failed:`, error);
                if (!ignore) setItems(fallbackItems);
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadItems();

        return () => {
            ignore = true;
        };
    }, [pageType]);

    return { items, loading };
}
