export type ItemCategory = 'food' | 'beverage' | 'supplies' | 'maintenance' | 'decoration';
export type SupplierReliability = 'low' | 'medium' | 'high';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  icon: string;
  quantity: number;
  unit: string;
  price: number;
  unitPrice: number;
  consumptionRate: number;
  dailyConsumption: number;
  minStock: number;
  maxStock: number;
  quality: number;
}

export interface Supplier {
  id: string;
  name: string;
  description: string;
  reliability: SupplierReliability;
  priceModifier: number;
  qualityModifier: number;
  categories: ItemCategory[];
  supplies: string[];
  deliveryDays: number;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  totalPrice: number;
  orderDate: number;
  deliveryDate: number;
  status: 'pending' | 'delivered' | 'cancelled';
  itemName: string;
  quantity: number;
  totalCost: number;
  deliveryDay: number;
}

export interface ConsumptionRecord {
  itemId: string;
  quantity: number;
  day: number;
  reason: string;
}
