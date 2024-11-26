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
