import type { Employee, AreaStatus } from '../types/employee';
import type { Room } from '../types/game';
import type { GuestNeed } from '../types/guest';
import type { Difficulty } from '../types/game';

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, {
  incomeMultiplier: number;
  expenseMultiplier: number;
  satisfactionDecay: number;
  patienceDecay: number;
  reputationGainMultiplier: number;
  reputationLossMultiplier: number;
  tipChance: number;
}> = {
  easy: {
    incomeMultiplier: 1.15,
    expenseMultiplier: 0.85,
    satisfactionDecay: 0.7,
    patienceDecay: 0.7,
    reputationGainMultiplier: 1.3,
    reputationLossMultiplier: 0.6,
    tipChance: 0.15,
  },
  normal: {
    incomeMultiplier: 1.0,
    expenseMultiplier: 1.0,
    satisfactionDecay: 1.0,
    patienceDecay: 1.0,
    reputationGainMultiplier: 1.0,
    reputationLossMultiplier: 1.0,
    tipChance: 0.05,
  },
  hard: {
    incomeMultiplier: 0.85,
    expenseMultiplier: 1.2,
    satisfactionDecay: 1.4,
    patienceDecay: 1.5,
    reputationGainMultiplier: 0.7,
    reputationLossMultiplier: 1.5,
    tipChance: 0.0,
  },
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_MULTIPLIERS[difficulty];
}

export function calculateServiceQuality(employees: Employee[], area: string): number {
  const areaEmployees = employees.filter(e => e.assignedArea === area);
  if (areaEmployees.length === 0) return 0;
  
  const totalSkill = areaEmployees.reduce((sum, e) => sum + e.skill * (e.stamina / 100), 0);
  const avgMorale = areaEmployees.reduce((sum, e) => sum + e.morale, 0) / areaEmployees.length;
  
  return Math.min(100, (totalSkill / areaEmployees.length) * (avgMorale / 100) * 1.2);
}

export function calculateDailyIncome(
  rooms: Room[],
  guests: { roomNumber?: number; totalBill: number; paid: boolean }[],
  serviceQuality: number
): number {
  let income = 0;
  
  const occupiedRooms = rooms.filter(r => r.isOccupied);
  const roomIncome = occupiedRooms.reduce((sum, room) => sum + room.price, 0);
  
  const serviceBonus = serviceQuality > 70 ? 1.1 : serviceQuality > 50 ? 1.05 : 1;
  
  income += roomIncome * serviceBonus;
  
  guests.forEach(guest => {
    if (guest.paid) {
      income += guest.totalBill;
    }
  });
  
  return Math.floor(income);
}

export function calculateDailyExpense(
  employees: Employee[],
  inventoryConsumption: number,
  maintenanceCost: number
): number {
  const salaries = employees.reduce((sum, e) => sum + e.salary, 0);
  return salaries + inventoryConsumption + maintenanceCost;
}

export function calculateReputationChange(
  guestSatisfaction: number,
  serviceQuality: number,
  eventsImpact: number
): number {
  const avgSatisfaction = guestSatisfaction;
  const baseChange = (avgSatisfaction - 50) / 10;
  const serviceImpact = (serviceQuality - 50) / 20;
  
  return Math.round(baseChange + serviceImpact + eventsImpact);
}

export function calculateAreaStatus(
  area: string,
  employees: Employee[],
  guests: { needs: GuestNeed[] }[]
): AreaStatus {
  const areaEmployees = employees.filter(e => e.assignedArea === area);
  const quality = calculateServiceQuality(employees, area);
  const efficiency = Math.min(100, areaEmployees.length * 30);
  
  const problems: string[] = [];
  
  if (areaEmployees.length === 0) {
    problems.push('没有员工分配');
  } else if (areaEmployees.some(e => e.stamina < 30)) {
    problems.push('员工体力不足');
  } else if (areaEmployees.some(e => e.morale < 40)) {
    problems.push('员工士气低落');
  }
  
  const unmetNeeds = guests.filter(g => 
    g.needs.some(n => n.status === 'unmet' && n.urgency >= 2)
  ).length;
  
  if (unmetNeeds > 2) {
    problems.push('客人需求未满足');
  }
  
  return {
    type: area as AreaStatus['type'],
    name: area,
    assignedEmployees: areaEmployees.map(e => e.id),
    serviceQuality: quality,
    efficiency,
    problems,
  };
}

export function calculateGuestSatisfaction(
  needs: GuestNeed[],
  patience: number,
  serviceQuality: number
): number {
  let satisfaction = 50;
  
  needs.forEach(need => {
    if (need.status === 'exceeded') {
      satisfaction += need.urgency * 5;
    } else if (need.status === 'met') {
      satisfaction += need.urgency * 3;
    } else if (need.status === 'partial') {
      satisfaction -= need.urgency * 2;
    } else {
      satisfaction -= need.urgency * 4;
    }
  });
  
  satisfaction += (patience - 50) / 5;
  satisfaction += (serviceQuality - 50) / 10;
  
  return Math.max(0, Math.min(100, satisfaction));
}
