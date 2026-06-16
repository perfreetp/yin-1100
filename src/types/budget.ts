export type StageName = '术前检查' | '促排卵' | '取卵' | '移植' | '黄体支持' | '其他';
export type ExpenseCategory = '检查费' | '药品费' | '手术费' | '化验费' | '其他';
export type StageStatus = '未开始' | '进行中' | '已完成';

export interface BudgetStage {
  id: string;
  name: StageName;
  budgetAmount: number;
  actualAmount: number;
  startDate: string;
  endDate: string;
  status: StageStatus;
}

export interface Expense {
  id: string;
  stageId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptId?: string;
  createdAt: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalExpense: number;
  remaining: number;
  progress: number;
  isOverBudget: boolean;
}

export interface StageStats extends BudgetStage {
  spent: number;
  remaining: number;
  progress: number;
  isOverBudget: boolean;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}
