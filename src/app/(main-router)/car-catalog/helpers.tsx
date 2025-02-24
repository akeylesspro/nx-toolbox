import { add_document, auth, delete_document, fire_base_TIME_TEMP, set_document } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
import { biUrl } from "@/lib/helpers";

export const updateBrand = async (id: string, data: TObject<any>) => {
    try {
        await set_document("nx-car-catalog", id, { ...data, updated: fire_base_TIME_TEMP() });
    } catch (error) {
        console.error("error from updateBrand ", error);
    }
};

export const addBrand = async (data: TObject<any>) => {
    try {
        const newBrandData = {
            ...data,
            created: fire_base_TIME_TEMP(),
            updated: fire_base_TIME_TEMP(),
        };
        await add_document("nx-car-catalog", newBrandData);
    } catch (error) {
        console.error("error from addBrand ", error);
    }
};

export const deleteBrand = async (id: string) => {
    try {
        await delete_document("nx-car-catalog", id);
    } catch (error) {
        console.error("error from deleteBrand ", error);
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
export interface AiResponse {
    model: string;
    brand: string;
    is_new_brand?: boolean;
    is_new_model?: boolean;
    description?: string;
    error?: string;
}

export const uppercaseName = (name: string) => name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
export const parseAliases = (aliases: string) =>
    aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias !== "");
export const stringifyAliases = (aliases: string[]) => aliases.join(", ");
export const getBrandName = (brand: BrandItem) => brand.brand.toLocaleLowerCase().trim();
export const getModelName = (model: ModelItem) => model.model.toLocaleLowerCase().trim();

interface ValidateBrand {
    brand: string;
    carCatalog: BrandItem[];
    t: (key: string) => string;
    brandValidationError: string;
    models: ModelItem[];
    brandId?: string;
    updatedBrandName?: string;
}

export const validateBrand = async ({ brand, brandValidationError, carCatalog, t, models, brandId, updatedBrandName }: ValidateBrand) => {
    if (!/^[a-zA-Z]{2,}$/.test(brand)) {
        throw new Error(brandValidationError);
    }
    const existsBrand = carCatalog.find(
        (item) =>
            (getBrandName(item) === brand.toLocaleLowerCase() || item.aliases.some((v) => v.toLocaleLowerCase() === brand)) &&
            (brandId ? item.id !== brandId : true)
    );
    if (existsBrand) {
        throw new Error(t("brand_exists").replace("{brandName}", existsBrand.brand));
    }
    if (!models.length) {
        throw new Error(t("models_placeholder"));
    }
    if (updatedBrandName?.toLocaleLowerCase() === "unknown") {
        throw new Error(t("brand_unknown"));
    }
};

interface ValidateModel {
    newModel: ModelItem;
    brandInputValue: string;
    models: ModelItem[];
    modelLengthError: string;
    t: (key: string) => string;
    index?: number;
}

export const validateModel = async ({ newModel, brandInputValue, modelLengthError, index, models, t }: ValidateModel) => {
    /// validate model name
    if (!/^[a-zA-Z0-9-]{2,}$/.test(newModel.model)) {
        throw new Error(modelLengthError);
    }
    /// validate model exists
    const existsModel = models.find(
        (model) =>
            (getModelName(model) === getModelName(newModel) || model.aliases.some((v) => v.toLocaleLowerCase() === getModelName(newModel))) &&
            (index !== undefined ? models.findIndex((model) => getModelName(model) === getModelName(newModel)) !== index : true)
    );
    if (existsModel) {
        throw new Error(t("model_exists").replace("{modelName}", existsModel.model));
    }
    /// call ai assistant to validate brand and model
    const aiResponse = await queryBrandAndModel(brandInputValue, newModel.model);
    console.log("aiResponse", aiResponse);
    
    const { brand: validBrandName, model: validModelName, error, is_new_brand, is_new_model } = aiResponse;
    if (error) {
        throw new Error(t(error));
    }
    /// validate brand and model
    if (validBrandName.toLocaleLowerCase() === "unknown") {
        throw new Error(t("brand_unknown"));
    }
    if (validModelName.toLocaleLowerCase() === "unknown") {
        throw new Error(t("model_unknown").replace("{modelName}", newModel.model).replace("{brandName}", validBrandName));
    }

    /// validate brand and model exists
    if (!is_new_brand && validBrandName.toLocaleLowerCase() !== brandInputValue.toLocaleLowerCase()) {
        throw new Error(t("brand_exists_model_validation").replace("{brandName}", t(validBrandName)));
    }

    const isExistInModels = models.find((model) => getModelName(model) === validModelName.toLocaleLowerCase());
    if (!is_new_model || isExistInModels) {
        const existsModel = models.find((model) => getModelName(model) === validModelName.toLocaleLowerCase());
        if (stringifyAliases(existsModel?.aliases || []) === stringifyAliases(newModel.aliases)) {
            throw new Error(t("model_exists").replace("{modelName}", validModelName));
        }
    }

    return { validModelName: validModelName, validBrandName: validBrandName };
};

export const queryBrandAndModel = async (brand: string, model: string): Promise<AiResponse> => {
    const token = auth.currentUser.accessToken;

    try {
        const response = await axios({
            method: "POST",
            headers: {
                authorization: "bearer " + token,
            },
            url: biUrl + "/car-catalog/query",
            data: { brand, model },
        });
        if (!response.data.success) {
            throw new Error(response.data.error || "reports/available error");
        }
        return response.data.data as AiResponse;
    } catch (error: any) {
        console.error("error from queryBrandAndModel", error);
        return { brand: "unknown", model: "unknown", error: error.message || error };
    }
};
