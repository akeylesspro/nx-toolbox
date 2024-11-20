export interface FetchDataOptions {
    url: string;
    token?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
}

export interface AsideButtonsProps {
    content: string;
    to: string;
    disabled?: boolean;
}