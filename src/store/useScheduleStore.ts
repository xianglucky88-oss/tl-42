import { create } from 'zustand';
import type { WeeklySchedule, ScheduleAssignment, ScheduleConflict, ScheduleBonus } from '../types/employee';
import type { AreaType } from '../types/game';

const SCHEDULE_DAYS = 7;

const AREA_MAX_STAFF: Record<string, number> = {
  lobby: 2,
  rooms: 2,
  restaurant: 2,
  garden: 1,
  kitchen: 2,
  maintenance: 1,
  unassigned: 99,
};

interface ScheduleStore {
  schedules: WeeklySchedule[];
  setSchedule: (employeeId: string, dayOffset: number, assignment: ScheduleAssignment) => void;
  setWeekSchedule: (employeeId: string, slots: ScheduleAssignment[]) => void;
  clearSchedule: (employeeId: string) => void;
  detectConflicts: () => ScheduleConflict[];
  calculateBonuses: () => ScheduleBonus[];
  getEmployeeSchedule: (employeeId: string) => WeeklySchedule | undefined;
  getDayAssignments: (dayOffset: number) => { employeeId: string; assignment: ScheduleAssignment }[];
  applyDaySchedule: (dayOffset: number) => { area: AreaType; employeeIds: string[]; restingIds: string[] };
  initSchedules: (employeeIds: string[]) => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => {
  const initSchedules = (employeeIds: string[]) => {
    const existing = get().schedules;
    const existingIds = new Set(existing.map(s => s.employeeId));
    const newSchedules = employeeIds
      .filter(id => !existingIds.has(id))
      .map(id => ({
        employeeId: id,
        slots: Array(SCHEDULE_DAYS).fill('unassigned') as ScheduleAssignment[],
      }));
    set({ schedules: [...existing, ...newSchedules] });
  };

  const setSchedule = (employeeId: string, dayOffset: number, assignment: ScheduleAssignment) => {
    set(state => ({
      schedules: state.schedules.map(s => {
        if (s.employeeId !== employeeId) return s;
        const newSlots = [...s.slots];
        newSlots[dayOffset] = assignment;
        return { ...s, slots: newSlots };
      }),
    }));
  };

  const setWeekSchedule = (employeeId: string, slots: ScheduleAssignment[]) => {
    set(state => ({
      schedules: state.schedules.map(s => {
        if (s.employeeId !== employeeId) return s;
        return { ...s, slots: slots.slice(0, SCHEDULE_DAYS) };
      }),
    }));
  };

  const clearSchedule = (employeeId: string) => {
    set(state => ({
      schedules: state.schedules.map(s => {
        if (s.employeeId !== employeeId) return s;
        return { ...s, slots: Array(SCHEDULE_DAYS).fill('unassigned') as ScheduleAssignment[] };
      }),
    }));
  };

  const detectConflicts = (): ScheduleConflict[] => {
    const { schedules } = get();
    const conflicts: ScheduleConflict[] = [];

    for (const schedule of schedules) {
      let consecutiveWork = 0;
      let hasRest = false;

      for (let day = 0; day < SCHEDULE_DAYS; day++) {
        const assignment = schedule.slots[day];

        if (assignment === 'rest') {
          consecutiveWork = 0;
          hasRest = true;
        } else if (assignment !== 'unassigned') {
          consecutiveWork++;

          if (consecutiveWork >= 4) {
            conflicts.push({
              employeeId: schedule.employeeId,
              dayOffset: day,
              type: 'consecutive_overwork',
              message: `连续工作${consecutiveWork}天，体力透支风险`,
            });
          }
        }

        if (assignment === 'maintenance') {
          const prevAssignment = day > 0 ? schedule.slots[day - 1] : null;
          const nextAssignment = day < SCHEDULE_DAYS - 1 ? schedule.slots[day + 1] : null;
          if (prevAssignment === 'maintenance' || nextAssignment === 'maintenance') {
            conflicts.push({
              employeeId: schedule.employeeId,
              dayOffset: day,
              type: 'consecutive_overwork',
              message: '连续安排维修区域，体力消耗极大',
            });
          }
        }
      }

      if (!hasRest && schedule.slots.some(s => s !== 'unassigned' && s !== 'rest')) {
        conflicts.push({
          employeeId: schedule.employeeId,
          dayOffset: 0,
          type: 'no_rest',
          message: '7天内无休息日，士气将大幅下降',
        });
      }
    }

    for (let day = 0; day < SCHEDULE_DAYS; day++) {
      const areaCounts: Record<string, string[]> = {};
      for (const schedule of schedules) {
        const assignment = schedule.slots[day];
        if (assignment !== 'rest' && assignment !== 'unassigned') {
          if (!areaCounts[assignment]) areaCounts[assignment] = [];
          areaCounts[assignment].push(schedule.employeeId);
        }
      }
      for (const [area, empIds] of Object.entries(areaCounts)) {
        const maxStaff = AREA_MAX_STAFF[area] ?? 2;
        if (empIds.length > maxStaff) {
          for (const empId of empIds) {
            conflicts.push({
              employeeId: empId,
              dayOffset: day,
              type: 'area_overstaffed',
              message: `${area}区域人员过多(${empIds.length}/${maxStaff})，效率浪费`,
            });
          }
        }
      }
    }

    return conflicts;
  };

  const calculateBonuses = (): ScheduleBonus[] => {
    const { schedules } = get();
    const bonuses: ScheduleBonus[] = [];

    for (const schedule of schedules) {
      const workDays = schedule.slots.filter(s => s !== 'rest' && s !== 'unassigned').length;
      const restDays = schedule.slots.filter(s => s === 'rest').length;
      const heavyDays = schedule.slots.filter(s => s === 'maintenance' || s === 'rooms').length;

      let staminaSaved = 0;
      let moraleBoost = 0;
      const reasons: string[] = [];

      if (restDays >= 2) {
        staminaSaved += restDays * 5;
        moraleBoost += 5;
        reasons.push('充足休息');
      }

      if (heavyDays <= 2) {
        staminaSaved += 10;
        reasons.push('合理分配重体力区域');
      }

      if (workDays <= 5 && restDays >= 1) {
        moraleBoost += 8;
        reasons.push('工作休息均衡');
      }

      if (restDays === 0 && workDays > 0) {
        moraleBoost -= 15;
        staminaSaved = 0;
        reasons.length = 0;
        reasons.push('无休息日，士气下降');
      }

      if (workDays === 7) {
        staminaSaved = -20;
        moraleBoost -= 10;
        reasons.length = 0;
        reasons.push('连续7天工作，体力透支');
      }

      if (staminaSaved > 0 || moraleBoost !== 0) {
        bonuses.push({
          employeeId: schedule.employeeId,
          staminaSaved,
          moraleBoost,
          reason: reasons.join('，'),
        });
      }
    }

    return bonuses;
  };

  const getEmployeeSchedule = (employeeId: string) => {
    return get().schedules.find(s => s.employeeId === employeeId);
  };

  const getDayAssignments = (dayOffset: number) => {
    return get().schedules.map(s => ({
      employeeId: s.employeeId,
      assignment: s.slots[dayOffset] ?? 'unassigned',
    }));
  };

  const applyDaySchedule = (dayOffset: number) => {
    const assignments = getDayAssignments(dayOffset);
    const areaMap: Record<string, string[]> = {};
    const restingIds: string[] = [];

    for (const { employeeId, assignment } of assignments) {
      if (assignment === 'rest') {
        restingIds.push(employeeId);
      } else if (assignment !== 'unassigned') {
        if (!areaMap[assignment]) areaMap[assignment] = [];
        areaMap[assignment].push(employeeId);
      }
    }

    const result: { area: AreaType; employeeIds: string[]; restingIds: string[] } = {
      area: 'unassigned' as AreaType,
      employeeIds: [],
      restingIds,
    };

    for (const [area, ids] of Object.entries(areaMap)) {
      for (const id of ids) {
        result.employeeIds.push(id);
        result.area = area as AreaType;
      }
    }

    return result;
  };

  return {
    schedules: [],
    setSchedule,
    setWeekSchedule,
    clearSchedule,
    detectConflicts,
    calculateBonuses,
    getEmployeeSchedule,
    getDayAssignments,
    applyDaySchedule,
    initSchedules,
  };
});

export const useSchedules = () => useScheduleStore(state => state.schedules);
export const useScheduleActions = () => useScheduleStore(state => ({
  setSchedule: state.setSchedule,
  setWeekSchedule: state.setWeekSchedule,
  clearSchedule: state.clearSchedule,
  detectConflicts: state.detectConflicts,
  calculateBonuses: state.calculateBonuses,
  initSchedules: state.initSchedules,
  applyDaySchedule: state.applyDaySchedule,
}));
