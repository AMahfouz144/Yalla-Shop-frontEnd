export interface PromoRequest {
  code: string;
}

export interface PromoResult {
  code: string;
  discount: number;
  message: string;
}
