export interface LoginResponse {
    token: string;
    tokenExpiryTime: Date;
    userId: string;
    fullName: string;
    userName: string;
    role: string;
}
