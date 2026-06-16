import type { Expense, BudgetStage, StageStats, MonthlyExpense } from '@/types/budget';
import type { LeaveRecord, LeaveBalance, LeaveType } from '@/types/leave';
import type { Travel, Accommodation } from '@/types/travel';
import type { Receipt, ReimbursementStats, ReceiptCategory } from '@/types/reimbursement';

export function calculateTotalBudget(stages: BudgetStage[]): number {
  return stages.reduce((sum, stage) => sum + stage.budgetAmount, 0);
}

export function calculateTotalExpense(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export function calculateStageExpense(stageId: string, expenses: Expense[]): number {
  return expenses
    .filter(exp => exp.stageId === stageId)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

export function calculateStageStats(stages: BudgetStage[], expenses: Expense[]): StageStats[] {
  return stages.map(stage => {
    const spent = calculateStageExpense(stage.id, expenses);
    const remaining = stage.budgetAmount - spent;
    const progress = stage.budgetAmount > 0 ? (spent / stage.budgetAmount) * 100 : 0;
    
    return {
      ...stage,
      spent,
      remaining,
      progress,
      isOverBudget: spent > stage.budgetAmount,
    };
  });
}

export function groupExpensesByMonth(expenses: Expense[]): MonthlyExpense[] {
  const grouped = new Map<string, number>();
  
  expenses.forEach(exp => {
    const month = exp.date.substring(0, 7);
    grouped.set(month, (grouped.get(month) || 0) + exp.amount);
  });
  
  return Array.from(grouped.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateLeaveDaysByMonth(records: LeaveRecord[]): Map<string, number> {
  const grouped = new Map<string, number>();
  
  records.forEach(record => {
    if (record.status !== '已取消') {
      const month = record.startDate.substring(0, 7);
      grouped.set(month, (grouped.get(month) || 0) + record.days);
    }
  });
  
  return grouped;
}

export function calculateLeaveBalance(records: LeaveRecord[], totals: Record<LeaveType, number>): LeaveBalance[] {
  const types: LeaveType[] = ['病假', '年假', '事假', '调休'];
  
  return types.map(type => {
    const used = records
      .filter(r => r.type === type && r.status !== '已取消')
      .reduce((sum, r) => sum + r.days, 0);
    
    return {
      type,
      total: totals[type] || 0,
      used,
      remaining: (totals[type] || 0) - used,
    };
  });
}

export function calculateTravelCost(travels: Travel[], accommodations: Accommodation[]): {
  totalTravelCost: number;
  totalAccommodationCost: number;
  totalCost: number;
  totalNights: number;
} {
  const totalTravelCost = travels
    .filter(t => t.status !== '已取消')
    .reduce((sum, t) => sum + t.cost, 0);
  
  const totalNights = accommodations
    .filter(a => a.status !== '已取消')
    .reduce((sum, a) => {
      const nights = Math.ceil((new Date(a.checkOutDate).getTime() - new Date(a.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(1, nights);
    }, 0);
  
  const totalAccommodationCost = accommodations
    .filter(a => a.status !== '已取消')
    .reduce((sum, a) => sum + a.totalCost, 0);
  
  return {
    totalTravelCost,
    totalAccommodationCost,
    totalCost: totalTravelCost + totalAccommodationCost,
    totalNights,
  };
}

export function calculateReimbursementStats(receipts: Receipt[]): ReimbursementStats {
  let totalAmount = 0;
  let reimbursedAmount = 0;
  let reimbursedReceipts = 0;
  let pendingReceipts = 0;
  
  receipts.forEach(receipt => {
    totalAmount += receipt.amount;
    if (receipt.isReimbursed) {
      reimbursedAmount += receipt.amount;
      reimbursedReceipts += 1;
    } else {
      pendingReceipts += 1;
    }
  });
  
  return {
    totalReceipts: receipts.length,
    totalAmount,
    reimbursedAmount,
    pendingAmount: totalAmount - reimbursedAmount,
    reimbursedReceipts,
    pendingReceipts,
  };
}

export function getProgressColor(progress: number, isOverBudget: boolean): string {
  if (isOverBudget) return 'bg-danger-500';
  if (progress >= 90) return 'bg-accent-500';
  if (progress >= 70) return 'bg-primary-400';
  return 'bg-primary-500';
}
