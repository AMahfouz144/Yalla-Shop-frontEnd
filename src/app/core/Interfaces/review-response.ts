export interface ReviewResponse {
    id: number;
    productId: number;
    userId: string;
    reviewerName: string | null;
    rating: number;
    comment: string;
    createdAt: Date;
}
