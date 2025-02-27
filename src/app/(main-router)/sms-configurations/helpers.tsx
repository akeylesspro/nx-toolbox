import { add_document, auth, delete_document, fire_base_TIME_TEMP, set_document } from "akeyless-client-commons/helpers";
import { TObject } from "akeyless-types-commons";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
import { biUrl } from "@/lib/helpers";

export const updateConfiguration = async (id: string, data: TObject<any>) => {
    try {
        await set_document("nx-sms-configurations", id, { ...data, updated: fire_base_TIME_TEMP() });
    } catch (error) {
        console.error("error from updateConfiguration ", error);
    }
};

export const addConfiguration = async (data: TObject<any>) => {
    try {
        const newConfigurationData = {
            ...data,
            created: fire_base_TIME_TEMP(),
            updated: fire_base_TIME_TEMP(),
        };
        await add_document("nx-sms-configurations", newConfigurationData);
    } catch (error) {
        console.error("error from addConfiguration ", error);
    }
};

export const deleteConfiguration = async (id: string) => {
    try {
        await delete_document("nx-sms-configurations", id);
    } catch (error) {
        console.error("error from deleteConfiguration ", error);
    }
};

export interface ConfigurationModel {
    model: string;
    brand: string;
    year: string;
}
export interface SmsConfigurationItem {
    id?: string;
    models: ConfigurationModel[];
    name: string;
    configurations_sms: string[];
}

export const parseConfigurations = (configurations: string) => {
    return configurations
        .split("\n")
        .map((c) => c.trim())
        .filter((v) => v !== "");
};

export const stringifyConfigurations = (configurations: string[]) => {
    return configurations.filter((v) => v !== "").join("\n");
};
interface ValidateConfigurationProps {
    data: SmsConfigurationItem;
    currentConfiguration?: SmsConfigurationItem;
    t: (s: string) => string;
    smsConfigurationsData: SmsConfigurationItem[];
}
export const validateConfiguration = async ({ data, currentConfiguration, t, smsConfigurationsData }: ValidateConfigurationProps) => {
    const { configurations_sms, models, name } = data;
    const configurationsSmsValidationError = t("length_error").replace("{entity}", t("configurations_sms")).replace("{length}", "2");

    if (!configurations_sms || configurations_sms.length === 0) {
        throw new Error(configurationsSmsValidationError);
    }

    if (models.length === 0) {
        throw new Error(t("models_placeholder"));
    }
    
    models.forEach((model) => {
        if (!model.brand || !model.model || !model.year) {
            throw new Error(
                t("model_not_valid")
                    .replace("{model}", model.model || "N/A")
                    .replace("{brand}", model.brand || "N/A")
                    .replace("{year}", model.year || "N/A")
            );
        }
    });

    smsConfigurationsData.forEach((configuration) => {
        if (currentConfiguration && configuration.id === currentConfiguration.id) {
            return;
        }
        if (configuration.name.toLowerCase().trim() === name.toLowerCase().trim()) {
            throw new Error(t("name_exists").replace("{name}", name));
        }
        configuration.models.forEach((model) => {
            if (models.some((m) => m.brand === model.brand && m.model === model.model && m.year === model.year)) {
                throw new Error(
                    t("model_exists_in_configuration")
                        .replace("{model}", model.model)
                        .replace("{brand}", model.brand)
                        .replace("{year}", model.year)
                        .replace("{configuration}", configuration.name)
                );
            }
        });
    });
};
