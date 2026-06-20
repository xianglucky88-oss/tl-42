import type { Room, Facility, DailyStats } from '../types/game';

export const INITIAL_HOTEL_DATA = {
  name: '百年酒店',
  money: 5000,
  reputation: 30,
  rating: 2,
  description: '这家拥有百年历史的酒店曾是小镇的骄傲，但如今已日渐衰落。墙壁上的裂缝诉说着曾经的辉煌，而你，是它最后的希望。',
  foundedYear: 1924,
};

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
