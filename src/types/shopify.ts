export type ShopifyReturnWebhookPayload = {
  id: number | string;
  order_id?: number | string;
  name?: string;
  note?: string;
  gateway?: string;
  customer?: {
    id?: number | string;
    email?: string;
  };
  line_items?: Array<{
    id?: number | string;
    name?: string;
    product_id?: number | string;
    product_type?: string;
  }>;
  [key: string]: unknown;
};

export type ParsedReturnEvent = {
  orderId: string;
  userId: string;
  paymentType: 'COD' | 'prepaid';
  reason: string;
  productCategory: string;
};
