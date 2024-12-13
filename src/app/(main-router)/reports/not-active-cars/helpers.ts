import { biUrl } from "@/lib/helpers";
import { TObject } from "akeyless-types-commons";
import axios from "axios";

export const fetchNotActiveCars = async (token: string | undefined): Promise<TObject<any>[]> => {
    try {
        const response = await axios({
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
            },
            url: biUrl + "/iot/devices-health",
            data: {
                filter: {
                    status: "not_active",
                },
            },
        });

        return response.data.data;
    } catch (error) {
        console.log("error fetching not active cars", error);
        return [];
    }
};
