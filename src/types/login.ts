export interface IsFlags {
    admin: boolean;
    super_admin: boolean;
    client_admin: boolean;
    site_admin: boolean;
    tester: boolean;
    developer: boolean;
}
export interface DecodedUser {
    user_id: string;
    phone_number: string;
}
