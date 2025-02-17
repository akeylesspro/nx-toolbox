import { add_document, collections, fire_base_TIME_TEMP, set_document } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
import { Timestamp } from "firebase-admin/firestore";
import { doc, setDoc } from "firebase/firestore";

export const updateBrand = async (id: string, data: TObject<any>) => {
    try {
        await set_document("nx-brands", id, { ...data, updated: fire_base_TIME_TEMP() });
    } catch (error) {
        console.error("error from updateBrand ", error);
    }
};

export const addBrand = async (data: TObject<any>, t: (key: string) => string) => {
    try {
        const rootSiteRef = doc(collections.sites);
        const installationSiteRef = doc(collections.sites);
        const brandRef = doc(collections.brands);
        const created = fire_base_TIME_TEMP();
        const updated = fire_base_TIME_TEMP();
        const newBrandData = {
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
            brand: brandRef.id,
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
            brand: brandRef.id,
            name: data.language === "he" ? "התקנות חדשות" : "New installations",
            color: "#000000",
            type: "installation_site_root",
            sites: [],
            cars: [],
            polygons: [],
            address: "",
            phone: "",
            email: "",
        };
        await Promise.all([setDoc(brandRef, newBrandData), setDoc(rootSiteRef, rootSite), setDoc(installationSiteRef, installationSite)]);
    } catch (error) {
        console.error("error from addBrand ", error);
    }
};

export interface ModelItem {
    model: string;
    aliases: string[];
}

export interface BrandItem {
    brand: string;
    aliases: string[];
    models: ModelItem[];
    id?: string;
    updated?: Timestamp;
}
