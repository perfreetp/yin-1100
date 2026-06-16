export type LeaveType = '病假' | '年假' | '事假' | '调休';
export type LeaveStatus = '待审批' | '已批准' | '已取消';
export type TreatmentDateType = '检查' | '取卵' | '移植' | '复查' | '其他';

export interface LeaveRecord {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: LeaveType;
  treatmentDateId?: string;
  contactPerson: string;
  status: LeaveStatus;
  reason: string;
}

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

export interface TreatmentDate {
  id: string;
  type: TreatmentDateType;
  date: string;
  description: string;
  isConfirmed: boolean;
}

export interface RescheduleImpact {
  leaves: LeaveRecord[];
  totalAffected: number;
}

export interface MonthlyLeaveStats {
  month: string;
  days: number;
  type: LeaveType;
}
