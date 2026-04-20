import { Product } from "../../features/product/models/product.model";
import { ProductViewModel } from "./product-view-model";

export interface WhislistResponse {
    id: number;
    userId: string;
    productId: number;
    createdAt: string;
    product:ProductViewModel;
}
