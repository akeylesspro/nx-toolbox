import { add_document, collections, fire_base_TIME_TEMP, set_document } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
import { doc, setDoc } from "firebase/firestore";

export const updateClient = async (id: string, data: TObject<any>) => {
    try {
        await set_document("nx-clients", id, { ...data, updated: fire_base_TIME_TEMP() });
    } catch (error) {
        console.error("error from updateClient ", error);
    }
};

export const addClient = async (data: TObject<any>, t: (key: string) => string) => {
    try {
        const rootSiteRef = doc(collections.sites);
        const installationSiteRef = doc(collections.sites);
        const clientRef = doc(collections.clients);
        const created = fire_base_TIME_TEMP();
        const updated = fire_base_TIME_TEMP();
        const newClientData = {
            ...data,
            created,
            updated,
            root_site: rootSiteRef.id,
            installation_root_site: installationSiteRef.id,
        };
        const rootSite = {
            created,
            updated,
            location: { lat: 0, lng: 0 },
            sites: [installationSiteRef.id],
            client: clientRef.id,
            name: data.name,
            type: "root",
            color: "#000000",
            polygons: [],
            cars: [],
            phone: "",
            address: "",
            email: "",
        };
        const installationSite = {
            created,
            updated,
            location: { lat: 0, lng: 0 },
            client: clientRef.id,
            name: t("new_installations"),
            color: "#000000",
            type: "installation_site_root",
            sites: [],
            cars: [],
            polygons: [],
            address: "",
            phone: "",
            email: "",
        };
        await Promise.all([setDoc(clientRef, newClientData), setDoc(rootSiteRef, rootSite), setDoc(installationSiteRef, installationSite)]);
    } catch (error) {
        console.error("error from addClient ", error);
    }
};
