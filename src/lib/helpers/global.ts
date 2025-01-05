export const baseUrl = () => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8003";
    try {
        new URL(url);
        return url;
    } catch {
        throw new Error("Invalid base URL format.");
    }
};

export const isBrowser = (): boolean => typeof window !== "undefined";

export const QAmode = process.env.NEXT_PUBLIC_MODE === "qa";

export const is_local = process.env.NEXT_PUBLIC_IS_LOCAL === "true";

export const biUrl = is_local ? "http://localhost:9002/api/bi" : QAmode ? "https://nx-api.xyz/api/bi" : "https://nx-api.info/api/bi";

export const devicesUrl = is_local
    ? "http://localhost:9001/api/devices"
    : QAmode
    ? "https://nx-api.xyz/api/devices"
    : "https://nx-api.info/api/devices";


