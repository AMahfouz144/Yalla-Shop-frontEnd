/** Matches YallaShop API envelope */
export interface ApiWrapper<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}
