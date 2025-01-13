import { api } from "@/app/api/client";
import { ReactNode, useEffect, useState } from "react"

export const useAvailableTriggersActions = (type: string) => {
    const [loading, setLoading] = useState(true);
    const [availableData, setAvailableData] = useState<{
        id: string;
        name: string;
        image: string;
        icon?: ReactNode;
        className?: string;
    }[]>([]);

    const fetchAvailableData = async() => {
        try {
            const response = await api.get(`/api/v1/${type}/available`);
            const data = response.data;
            setAvailableData(data.data);
        } catch (err: any) {
            console.log("Errro: ", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAvailableData();
    }, [type]);

    return {loading, availableData};
}