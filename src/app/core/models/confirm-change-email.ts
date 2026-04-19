export interface ConfirmChangeEmail {
    userId: string;
    emailChangeToken: string;
    newEmail: string;
}
