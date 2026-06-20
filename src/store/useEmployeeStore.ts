import { create } from 'zustand';
import type { Employee, EmployeeMood, EmployeeStatus } from '../types/employee';
import type { AreaType } from '../types/game';
import { INITIAL_EMPLOYEES } from '../data/employees';
import { calculateServiceQuality } from '../utils/formula';

interface EmployeeStore {
  employees: Employee[];
  assignEmployee: (employeeId: string, area: AreaType) => void;
  restAllEmployees: () => void;
  actions: {
    assignEmployee: (employeeId: string, area: AreaType) => void;
    updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
    updateEmployeeStamina: (employeeId: string, amount: number) => void;
    updateEmployeeMorale: (employeeId: string, amount: number) => void;
    updateEmployeeMood: (employeeId: string, mood: EmployeeMood) => void;
    updateEmployeeStatus: (employeeId: string, status: EmployeeStatus) => void;
    getAreaEmployees: (area: AreaType) => Employee[];
    getAreaQuality: (area: AreaType) => number;
    calculateDailyStaminaDrain: () => void;
    restAllEmployees: () => void;
    resetEmployees: () => void;
  };
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => {
  const assignEmployee = (employeeId: string, area: AreaType) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === employeeId ? { ...emp, assignedArea: area } : emp
      ),
    }));

  const restAllEmployees = () => {
    set((state) => ({
      employees: state.employees.map((emp) => ({
        ...emp,
        stamina: Math.min(100, emp.stamina + 30),
        mood: (emp.stamina + 30 > 50 ? 50 : emp.mood) as EmployeeMood,
        status: 'idle' as EmployeeStatus,
      })),
    }));
  };

  return {
    employees: [...INITIAL_EMPLOYEES],
    assignEmployee,
    restAllEmployees,

    actions: {
      assignEmployee,
      updateEmployee: (employeeId, updates) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, ...updates } : emp
          ),
        })),

      updateEmployeeStamina: (employeeId, amount) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, stamina: Math.max(0, Math.min(100, emp.stamina + amount)) }
              : emp
          ),
        })),

      updateEmployeeMorale: (employeeId, amount) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId
              ? { ...emp, morale: Math.max(0, Math.min(100, emp.morale + amount)) }
              : emp
          ),
        })),

      updateEmployeeMood: (employeeId, mood) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, mood } : emp
          ),
        })),

      updateEmployeeStatus: (employeeId, status) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, status } : emp
          ),
        })),

      getAreaEmployees: (area) => {
        return get().employees.filter((emp) => emp.assignedArea === area);
      },

      getAreaQuality: (area) => {
        return calculateServiceQuality(get().employees, area);
      },

      calculateDailyStaminaDrain: () => {
        set((state) => ({
          employees: state.employees.map((emp) => {
            if (emp.assignedArea === 'unassigned') return emp;
            
            const drain = emp.assignedArea === 'maintenance' ? 20 : 
                          emp.assignedArea === 'rooms' ? 15 : 10;
            
            let mood: EmployeeMood = emp.mood;
            if (emp.stamina - drain < 30) {
              mood = 20 as EmployeeMood;
            } else if (emp.morale < 40) {
              mood = 30 as EmployeeMood;
            } else if (emp.morale > 70 && emp.stamina > 50) {
              mood = 80 as EmployeeMood;
            }
            
            return {
              ...emp,
              stamina: Math.max(0, emp.stamina - drain),
              mood,
              daysWorked: emp.daysWorked + 1,
            };
          }),
        }));
      },

      restAllEmployees,

      resetEmployees: () => {
        set({ employees: [...INITIAL_EMPLOYEES] });
      },
    },
  };
});

export const useEmployees = () => useEmployeeStore((state) => state.employees);
export const useEmployeeById = (id: string) => 
  useEmployeeStore((state) => state.employees.find((e) => e.id === id));
export const useEmployeeActions = () => useEmployeeStore((state) => state.actions);
