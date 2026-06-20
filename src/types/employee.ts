import type { AreaType } from './game';

export type EmployeeRole = 'receptionist' | 'maid' | 'waiter' | 'handyman' | 'manager';
export type EmployeeStatus = 'idle' | 'working' | 'resting' | 'sick';
export type EmployeeMood = number;

export interface EmployeeSkill {
  name: string;
  level: number;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  avatar: string;
  description: string;
  skill: number;
  level: number;
  exp: number;
  skills: EmployeeSkill[];
  efficiency: number;
  friendliness: number;
  dailyWage: number;
  stamina: number;
  maxStamina: number;
  morale: number;
  salary: number;
  status: EmployeeStatus;
  mood: EmployeeMood;
  assignedArea: AreaType;
  traits: string[];
  backstory: string;
  daysWorked: number;
}

export interface TaskAssignment {
  id: string;
  employeeId: string;
  area: AreaType;
  task: string;
  priority: number;
  startTime?: number;
  endTime?: number;
}

export interface AreaStatus {
  type: AreaType;
  name: string;
  assignedEmployees: string[];
  serviceQuality: number;
  efficiency: number;
  problems: string[];
}
