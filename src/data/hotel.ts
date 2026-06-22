import type { Room, Facility, DailyStats } from '../types/game';
import type { HotelAttributeLevel, HotelAttributeKey } from '../types/guest';

export const INITIAL_HOTEL_DATA = {
  name: '百年酒店',
  money: 5000,
  reputation: 30,
  rating: 2,
  description: '这家拥有百年历史的酒店曾是小镇的骄傲，但如今已日渐衰落。墙壁上的裂缝诉说着曾经的辉煌，而你，是它最后的希望。',
  foundedYear: 1924,
};

export const ATTRIBUTE_META: Record<HotelAttributeKey, { name: string; icon: string; description: string }> = {
  room: { name: '客房品质', icon: '🛏️', description: '房间的舒适度、隔音、装修等整体品质' },
  service: { name: '服务水平', icon: '👨‍💼', description: '员工的服务态度、专业度和响应速度' },
  food: { name: '餐饮质量', icon: '🍽️', description: '餐饮的口味、种类和新鲜度' },
  facilities: { name: '设施状态', icon: '🏗️', description: '公共设施、设备的维护和现代化程度' },
  location: { name: '环境氛围', icon: '📍', description: '酒店的位置、周边环境和整体氛围' },
  cleanliness: { name: '清洁程度', icon: '🧹', description: '客房和公共区域的清洁卫生水平' },
};

export const KEYWORD_TO_ATTRIBUTE: Record<string, HotelAttributeKey> = {
  '安静': 'room', '舒适': 'room', '房间小': 'room', '隔音差': 'room', '吵': 'room',
  '有特色': 'room', '房间': 'room', '装修': 'room', '床': 'room',
  '服务好': 'service', '热情': 'service', '周到': 'service', '贴心': 'service',
  '专业': 'service', '友好': 'service', '冷漠': 'service', '前台好': 'service',
  '服务': 'service', '态度': 'service',
  '美味': 'food', '早餐一般': 'food', '菜好吃': 'food', '餐饮': 'food',
  '茶点不错': 'food', '咖啡不错': 'food', '软食可口': 'food',
  '设施陈旧': 'facilities', '空调一般': 'facilities', '设施': 'facilities',
  '设备': 'facilities', '老旧': 'facilities',
  '历史感': 'location', '位置好': 'location', '氛围好': 'location', '有故事感': 'location',
  '怀旧': 'location', '安静舒适': 'location', '温馨': 'location', '回忆满满': 'location',
  '方便': 'location', '位置': 'location', '氛围': 'location',
  '干净': 'cleanliness', '整洁': 'cleanliness', '脏乱': 'cleanliness',
  '清洁': 'cleanliness', '卫生': 'cleanliness', '异味': 'cleanliness',
  '满意': 'service', '推荐': 'service', '值得': 'service', '惊喜': 'service',
  '失望': 'service', '糟糕': 'facilities', '拥挤': 'room', '闷热': 'facilities',
  '一般': 'service', '还行': 'service', '普通': 'service', '标准': 'service',
  '常规': 'service', '正常': 'service', '基础': 'service',
  '价格贵': 'room', '灵感': 'location',
};

export const INITIAL_HOTEL_ATTRIBUTES: HotelAttributeLevel[] = [
  { key: 'room', name: ATTRIBUTE_META.room.name, level: 1, maxLevel: 10, upgradeCost: 500, description: ATTRIBUTE_META.room.description, icon: ATTRIBUTE_META.room.icon },
  { key: 'service', name: ATTRIBUTE_META.service.name, level: 1, maxLevel: 10, upgradeCost: 600, description: ATTRIBUTE_META.service.description, icon: ATTRIBUTE_META.service.icon },
  { key: 'food', name: ATTRIBUTE_META.food.name, level: 1, maxLevel: 10, upgradeCost: 450, description: ATTRIBUTE_META.food.description, icon: ATTRIBUTE_META.food.icon },
  { key: 'facilities', name: ATTRIBUTE_META.facilities.name, level: 1, maxLevel: 10, upgradeCost: 800, description: ATTRIBUTE_META.facilities.description, icon: ATTRIBUTE_META.facilities.icon },
  { key: 'location', name: ATTRIBUTE_META.location.name, level: 2, maxLevel: 10, upgradeCost: 700, description: ATTRIBUTE_META.location.description, icon: ATTRIBUTE_META.location.icon },
  { key: 'cleanliness', name: ATTRIBUTE_META.cleanliness.name, level: 1, maxLevel: 10, upgradeCost: 400, description: ATTRIBUTE_META.cleanliness.description, icon: ATTRIBUTE_META.cleanliness.icon },
];

export function getUpgradeCost(level: number, baseCost: number): number {
  return Math.round(baseCost * Math.pow(1.5, level - 1));
}

export function getBadReviewResolveLevel(attributeKey: HotelAttributeKey): number {
  const thresholds: Record<HotelAttributeKey, number> = {
    room: 3,
    service: 3,
    food: 3,
    facilities: 4,
    location: 3,
    cleanliness: 3,
  };
  return thresholds[attributeKey];
}

export const INITIAL_ROOMS: Room[] = [
  { id: 'room_101', number: 101, type: 'single', price: 80, condition: 60, isOccupied: false },
  { id: 'room_102', number: 102, type: 'single', price: 80, condition: 55, isOccupied: false },
  { id: 'room_103', number: 103, type: 'single', price: 80, condition: 70, isOccupied: false },
  { id: 'room_201', number: 201, type: 'double', price: 120, condition: 50, isOccupied: false },
  { id: 'room_202', number: 202, type: 'double', price: 120, condition: 45, isOccupied: false },
  { id: 'room_301', number: 301, type: 'suite', price: 200, condition: 40, isOccupied: false },
];

export const INITIAL_FACILITIES: Facility[] = [
  { id: 'fac_lobby', name: '大堂', type: 'lobby', condition: 50, efficiency: 60 },
  { id: 'fac_kitchen', name: '厨房', type: 'kitchen', condition: 55, efficiency: 55 },
  { id: 'fac_dining', name: '餐厅', type: 'dining', condition: 45, efficiency: 50 },
  { id: 'fac_garden', name: '花园', type: 'garden', condition: 30, efficiency: 40 },
  { id: 'fac_boiler', name: '锅炉房', type: 'utility', condition: 35, efficiency: 45 },
];

export const INITIAL_DAILY_STATS: DailyStats[] = [];

export const AREA_INFO = {
  front_desk: { name: '前台', icon: 'concierge-bell', color: '#C9A227' },
  rooms: { name: '客房', icon: 'bed', color: '#2D5A27' },
  restaurant: { name: '餐厅', icon: 'utensils', color: '#8B2635' },
  maintenance: { name: '维修', icon: 'wrench', color: '#666666' },
  unassigned: { name: '未分配', icon: 'user-x', color: '#999999' },
};
