import { Timestamp } from "firebase-admin/firestore";

export enum OutSmsStatus {
    DELIVERED = "delivered",
    FAILED = "failed",
    NEW = "new",
}
export interface OutSms {
    service: string;
    id: string;
    external_id: string;
    content: string;
    status: OutSmsStatus;
    timestamp: Timestamp;
}
