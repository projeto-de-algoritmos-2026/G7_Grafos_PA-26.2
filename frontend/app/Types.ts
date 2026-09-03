export type Products = {
    id: number;
    name: string;
    price: number;
    stock: number;
    product_images: { id: number; image_url: string; order: number }[];
    created_at: string;
    rating?: number | null;
};

export type ProductImage = {
    id: number;
    product_id: number;
    image_url: string;
    order: number;
};