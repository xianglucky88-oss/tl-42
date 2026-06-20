import { create } from 'zustand';
import type { InventoryItem, PurchaseOrder, Supplier, ItemCategory } from '../types/inventory';
import { INITIAL_INVENTORY, SUPPLIERS } from '../data/items';
import { useGameStore } from './useGameStore';

interface InventoryStore {
  items: InventoryItem[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  updateItemQuantity: (itemId: string, amount: number) => void;
  createOrder: (supplierId: string, items: { itemId: string; quantity: number }[]) => boolean;
  checkPendingDeliveries: (day: number) => void;
  actions: {
    updateItemQuantity: (itemId: string, amount: number) => void;
    consumeItems: (consumption: Record<string, number>) => void;
    createOrder: (supplierId: string, items: { itemId: string; quantity: number }[]) => boolean;
    deliverOrder: (orderId: string) => void;
    cancelOrder: (orderId: string) => void;
    checkPendingDeliveries: (day: number) => void;
    getLowStockItems: () => InventoryItem[];
    getItemsByCategory: (category: ItemCategory) => InventoryItem[];
    getSupplierById: (supplierId: string) => Supplier | undefined;
    calculateDailyConsumptionCost: () => number;
    resetInventory: () => void;
  };
}

export const useInventoryStore = create<InventoryStore>((set, get) => {
  const updateItemQuantity = (itemId: string, amount: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, Math.min(item.maxStock, item.quantity + amount)) }
          : item
      ),
    }));

  const createOrder = (supplierId: string, orderItems: { itemId: string; quantity: number }[]) => {
    const supplier = get().suppliers.find((s) => s.id === supplierId);
    if (!supplier) return false;

    let totalPrice = 0;
    let totalCost = 0;
    let mainItemName = '';
    let mainQuantity = 0;

    const items = orderItems.map(({ itemId, quantity }) => {
      const item = get().items.find((i) => i.id === itemId);
      if (!item) return null;
      const unitPrice = Math.floor(item.price * supplier.priceModifier);
      totalPrice += unitPrice * quantity;
      totalCost += unitPrice * quantity;
      if (!mainItemName) {
        mainItemName = item.name;
        mainQuantity = quantity;
      }
      return { itemId, quantity, unitPrice };
    }).filter(Boolean) as { itemId: string; quantity: number; unitPrice: number }[];

    if (items.length === 0) return false;

    const currentDay = useGameStore.getState().currentDay;
    const newOrder: PurchaseOrder = {
      id: `order_${Date.now()}`,
      supplierId,
      items,
      totalPrice,
      orderDate: currentDay,
      deliveryDate: currentDay + supplier.deliveryDays,
      status: 'pending',
      itemName: mainItemName,
      quantity: mainQuantity,
      totalCost,
      deliveryDay: currentDay + supplier.deliveryDays,
    };

    set((state) => ({ orders: [...state.orders, newOrder] }));
    return true;
  };

  const checkPendingDeliveries = (day: number) => {
    const pendingOrders = get().orders.filter(
      (o) => o.status === 'pending' && o.deliveryDate <= day
    );
    pendingOrders.forEach((order) => get().actions.deliverOrder(order.id));
  };

  return {
    items: [...INITIAL_INVENTORY],
    suppliers: [...SUPPLIERS],
    orders: [],
    updateItemQuantity,
    createOrder,
    checkPendingDeliveries,

    actions: {
      updateItemQuantity,
      createOrder,
      checkPendingDeliveries,

      consumeItems: (consumption) => {
        set((state) => ({
          items: state.items.map((item) => {
            const amount = consumption[item.id] || 0;
            return {
              ...item,
              quantity: Math.max(0, item.quantity - amount),
            };
          }),
        }));
      },

      deliverOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        order.items.forEach(({ itemId, quantity }) => {
          get().actions.updateItemQuantity(itemId, quantity);
        });

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'delivered' } : o
          ),
        }));
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' } : o
          ),
        }));
      },

      getLowStockItems: () => {
        return get().items.filter((item) => item.quantity <= item.minStock && item.minStock > 0);
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      getSupplierById: (supplierId) => {
        return get().suppliers.find((s) => s.id === supplierId);
      },

      calculateDailyConsumptionCost: () => {
        return get().items.reduce((total, item) => {
          return total + item.consumptionRate * item.price;
        }, 0);
      },

      resetInventory: () => {
        set({
          items: [...INITIAL_INVENTORY],
          suppliers: [...SUPPLIERS],
          orders: [],
        });
      },
    },
  };
});

export const useInventoryItems = () => useInventoryStore((state) => state.items);
export const useInventorySuppliers = () => useInventoryStore((state) => state.suppliers);
export const useInventoryOrders = () => useInventoryStore((state) => state.orders);
export const useInventoryActions = () => useInventoryStore((state) => state.actions);
