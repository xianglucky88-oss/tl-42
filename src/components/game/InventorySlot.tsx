import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { PixelButton, PixelBadge, PixelProgress, PixelPanel, PixelWindow } from '../ui';
import { useInventoryStore, useInventorySuppliers } from '../../store/useInventoryStore';
import { getCategoryColor } from '../../utils/pixel';

interface InventorySlotProps {
  item: InventoryItem;
  className?: string;
}

const categoryNames: Record<string, string> = {
  food: '食材',
  beverage: '酒水',
  cleaning: '清洁用品',
  amenities: '客房用品',
  maintenance: '维修用品',
  decoration: '装饰品',
};

const InventorySlot: React.FC<InventorySlotProps> = ({ item, className = '' }) => {
  const [showOrder, setShowOrder] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(10);
  const updateItemQuantity = useInventoryStore((state) => state.updateItemQuantity);
  const createOrder = useInventoryStore((state) => state.createOrder);
  const suppliers = useInventorySuppliers();

  const categoryColor = getCategoryColor(item.category);
  const isLowStock = item.quantity <= item.minStock;
  const isCritical = item.quantity <= 0;

  const percentage = Math.min(100, (item.quantity / item.maxStock) * 100);

  const handleUse = () => {
    if (item.quantity > 0) {
      updateItemQuantity(item.id, -1);
    }
  };

  const handleAdd = () => {
    updateItemQuantity(item.id, 1);
  };

  const handleOrder = () => {
    const supplier = suppliers.find(s => s.supplies.includes(item.category));
    if (supplier) {
      createOrder(supplier.id, [{ itemId: item.id, quantity: orderQuantity }]);
      setShowOrder(false);
      setOrderQuantity(10);
    }
  };

  const supplier = suppliers.find(s => s.supplies.includes(item.category));

  return (
    <>
      <motion.div
        className={`pixel-card relative overflow-hidden ${className}`}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {(isLowStock || isCritical) && (
          <motion.div
            className="absolute top-0 right-0 p-2"
            animate={{ scale: isCritical ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
          >
            <AlertTriangle
              size={16}
              className={isCritical ? 'text-[var(--pixel-danger)]' : 'text-[var(--pixel-warning)]'}
            />
          </motion.div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center border-2 border-[var(--pixel-border)]"
              style={{ backgroundColor: categoryColor }}
            >
              <Package size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="pixel-font-display text-sm text-[var(--pixel-text-primary)] truncate">
                  {item.name}
                </h4>
                <PixelBadge variant="default" size="sm">
                  {categoryNames[item.category] || item.category}
                </PixelBadge>
              </div>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                单价: ¥{item.unitPrice}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <PixelProgress
              value={item.quantity}
              max={item.maxStock}
              label="库存"
              showValue={true}
              size="sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                安全库存
              </span>
              <p className="pixel-font-display text-sm text-[var(--pixel-info)]">
                {item.minStock}
              </p>
            </div>
            <div className="text-center">
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                日消耗
              </span>
              <p className="pixel-font-display text-sm text-[var(--pixel-danger)]">
                {item.dailyConsumption}
              </p>
            </div>
            <div className="text-center">
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                可维持
              </span>
              <p className={`pixel-font-display text-sm ${item.quantity / item.dailyConsumption < 3 ? 'text-[var(--pixel-danger)]' : 'text-[var(--pixel-success)]'}`}>
                {Math.floor(item.quantity / Math.max(1, item.dailyConsumption))}天
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <PixelButton
              variant="danger"
              size="sm"
              onClick={handleUse}
              disabled={item.quantity <= 0}
              className="flex-1"
            >
              <Minus size={12} />
            </PixelButton>
            <PixelButton
              variant="success"
              size="sm"
              onClick={handleAdd}
              className="flex-1"
            >
              <Plus size={12} />
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => setShowOrder(true)}
              disabled={!supplier}
              className="flex-2"
            >
              <span className="flex items-center gap-1">
                <ShoppingCart size={12} />
                采购
              </span>
            </PixelButton>
          </div>
        </div>
      </motion.div>

      <PixelWindow
        isOpen={showOrder}
        onClose={() => setShowOrder(false)}
        title={`采购 ${item.name}`}
        width="400px"
      >
        <div className="space-y-4">
          <PixelPanel variant="dark" animate={false}>
            <div className="flex justify-between mb-2">
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                物品
              </span>
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                {item.name}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                单价
              </span>
              <span className="pixel-font-mono text-sm text-[var(--pixel-gold)]">
                ¥{item.unitPrice}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                供应商
              </span>
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                {supplier?.name || '无'}
              </span>
            </div>
          </PixelPanel>

          <div>
            <label className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)] block mb-2">
              采购数量
            </label>
            <div className="flex items-center gap-3">
              <PixelButton
                variant="default"
                size="sm"
                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 5))}
              >
                -5
              </PixelButton>
              <PixelButton
                variant="default"
                size="sm"
                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
              >
                -1
              </PixelButton>
              <input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 pixel-font-mono text-center text-lg bg-[var(--pixel-bg-dark)] border-2 border-[var(--pixel-border)] p-2 text-[var(--pixel-text-primary)]"
              />
              <PixelButton
                variant="default"
                size="sm"
                onClick={() => setOrderQuantity(orderQuantity + 1)}
              >
                +1
              </PixelButton>
              <PixelButton
                variant="default"
                size="sm"
                onClick={() => setOrderQuantity(orderQuantity + 5)}
              >
                +5
              </PixelButton>
            </div>
          </div>

          <div className="pixel-card p-4">
            <div className="flex justify-between items-center">
              <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                总计
              </span>
              <span className="pixel-font-display text-2xl text-[var(--pixel-gold)]">
                ¥{(item.unitPrice * orderQuantity).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <PixelButton
              variant="default"
              onClick={() => setShowOrder(false)}
              className="flex-1"
            >
              取消
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={handleOrder}
              className="flex-1"
            >
              确认采购
            </PixelButton>
          </div>
        </div>
      </PixelWindow>
    </>
  );
};

export default InventorySlot;
