import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Truck, Filter } from 'lucide-react';
import {
  InventorySlot,
  PixelPanel,
  PixelButton,
  PixelBadge,
} from '../components';
import { useInventoryStore, useInventoryItems, useInventoryOrders, useInventorySuppliers } from '../store/useInventoryStore';
import { useCurrentDay } from '../store/useGameStore';
import { getCategoryColor } from '../utils/pixel';

const categoryNames: Record<string, string> = {
  food: '食材',
  beverage: '酒水',
  cleaning: '清洁用品',
  amenities: '客房用品',
  maintenance: '维修用品',
  decoration: '装饰品',
};

const InventoryPage: React.FC = () => {
  const items = useInventoryItems();
  const orders = useInventoryOrders();
  const suppliers = useInventorySuppliers();
  const checkPendingDeliveries = useInventoryStore((state) => state.checkPendingDeliveries);
  const currentDay = useCurrentDay();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Object.keys(categoryNames)];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(i => i.category === selectedCategory);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-1">
                库存管理
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                管理酒店物资库存，及时采购补给
              </p>
            </div>
            <div className="flex gap-3">
              {lowStockItems.length > 0 && (
                <PixelBadge variant="warning" size="lg">
                  <span className="flex items-center gap-2">
                    <Package size={14} />
                    库存不足: {lowStockItems.length}
                  </span>
                </PixelBadge>
              )}
              <PixelButton
                variant="primary"
                onClick={() => checkPendingDeliveries(currentDay)}
              >
                <span className="flex items-center gap-2">
                  <Truck size={14} />
                  检查配送
                </span>
              </PixelButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <Package size={24} className="text-[var(--pixel-info)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  物品种类
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-info)]">
                  {items.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} className="text-[var(--pixel-warning)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  库存不足
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-warning)]">
                  {lowStockItems.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-[var(--pixel-success)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  待配送
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-success)]">
                  {pendingOrders.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <Filter size={24} className="text-[var(--pixel-gold)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  供应商
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-gold)]">
                  {suppliers.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {categories.map(cat => (
            <PixelButton
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {cat === 'all' ? '全部' : categoryNames[cat]}
            </PixelButton>
          ))}
        </motion.div>

        {pendingOrders.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <PixelPanel title={`待配送订单 (${pendingOrders.length})`} variant="dark">
              <div className="space-y-2">
                {pendingOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-[var(--pixel-bg-dark)] px-4 py-3 border-2 border-[var(--pixel-border)]">
                    <div className="flex items-center gap-3">
                      <Truck size={18} className="text-[var(--pixel-warning)]" />
                      <div>
                        <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                          {order.itemName} x{order.quantity}
                        </p>
                        <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                          供应商: {suppliers.find(s => s.id === order.supplierId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="pixel-font-mono text-sm text-[var(--pixel-gold)]">
                        ¥{order.totalCost.toLocaleString()}
                      </p>
                      <PixelBadge variant="warning" size="sm">
                        {order.deliveryDay - 0 > 0 ? `${order.deliveryDay}天后到达` : '今日到达'}
                      </PixelBadge>
                    </div>
                  </div>
                ))}
              </div>
            </PixelPanel>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
            >
              <InventorySlot item={item} />
            </motion.div>
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Package size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
              该分类暂无物品
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
