export interface CartData {
    cart_id: string;
    cart_user_id: string;
    cart_item_id: string;
    cart_item_name: string;
    cart_item_price: string;
    cart_item_quantity: string;
    cart_item_image: string;
    cart_item_desc: string;
    selected?: boolean;
}