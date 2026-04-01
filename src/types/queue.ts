export type ReturnRiskJobMessage = {
  request_id: string;
  order_id: string;
  user_id: string;
  reason: string;
  product_category: string;
  payment_type: 'COD' | 'prepaid';
  organization_id: string;
};
