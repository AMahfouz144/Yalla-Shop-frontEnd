export interface ProfileResponse {
    id: string,
    userName: string,
    fullName: string,
    email: string,
    emailConfirmed: boolean,
    address: string | null,
    phoneNumber: string | null
}

