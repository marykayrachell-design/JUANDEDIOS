export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  subcategory_id: string;
  sku: string;
  description: string;
  stock: number;
  unit: string;
  low_stock_threshold: number;
  created_at: string;
  category?: Category;
  subcategory?: Subcategory;
}

export interface Donor {
  id: string;
  name: string;
  contact_info: string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  id_number: string;
  contact_info: string;
  created_at: string;
}

export interface DonationIn {
  id: string;
  donor_id: string;
  product_id: string;
  quantity: number;
  date: string;
  notes: string;
  created_at: string;
  donor?: Donor;
  product?: Product;
}

export interface DonationOut {
  id: string;
  beneficiary_id: string;
  product_id: string;
  quantity: number;
  delivered_by: string;
  date: string;
  notes: string;
  created_at: string;
  beneficiary?: Beneficiary;
  product?: Product;
}
