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

export const parseAliases = (aliases: string) =>
    aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias !== "");
export const parseName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
export const stringifyAliases = (aliases: string[]) => aliases.join(", ");

interface ValidateBrand {
    brand: string;
    carCatalog: BrandItem[];
    t: (key: string) => string;
    brandValidationError: string;
    models: ModelItem[];
    brandId?: string;
}

export const validateBrand = async ({ brand, brandValidationError, carCatalog, t, models, brandId }: ValidateBrand) => {
    const parsedBrand = parseName(brand);
    if (!/^[a-zA-Z]{2,}$/.test(brand)) {
        throw new Error(brandValidationError);
    }
    if (carCatalog.find((item) => item.brand === parsedBrand && (brandId ? item.id !== brandId : true))) {
        throw new Error(t("brand_exists"));
    }
    if (!models.length) {
        throw new Error(t("models_placeholder"));
    }
};
interface ValidateModel {
    modelName: string;
    models: ModelItem[];
    modelLengthError: string;
    t: (key: string) => string;
    index?: number;
}
export const validateModel = async ({ modelName, modelLengthError, index, models, t }: ValidateModel) => {
    if (!/^[a-zA-Z]{2,}$/.test(modelName)) {
        throw new Error(modelLengthError);
    }

    if (models.find((model) => model.model === modelName && (index ? models.indexOf(model) !== index : true))) {
        throw new Error(t("model_exists"));
    }
    /// check with the server if the model exists
};
