export interface ResponseModel<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}