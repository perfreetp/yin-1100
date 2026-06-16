import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetStage, Expense, StageName, ExpenseCategory } from '@/types/budget';
import { mockStages, mockExpenses } from '@/mock';
import { generateId } from '@/utils/date';
import { calculateTotalBudget, calculateTotalExpense, calculateStageExpense } from '@/utils/calculation';

interface BudgetState {
  stages: BudgetStage[];
  expenses: Expense[];
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateStageBudget: (stageId: string, amount: number) => void;
  updateStageStatus: (stageId: string, status: BudgetStage['status']) => void;
  addStage: (stage: Omit<BudgetStage, 'id' | 'actualAmount'>) => void;
  getTotalBudget: () => number;
  getTotalExpense: () => number;
  getStageExpense: (stageId: string) => number;
  getStageByName: (name: StageName) => BudgetStage | undefined;
  resetToMock: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      stages: mockStages,
      expenses: mockExpenses,

      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        }));
      },

      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      updateStageBudget: (stageId, amount) => {
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, budgetAmount: amount } : s
          ),
        }));
      },

      updateStageStatus: (stageId, status) => {
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, status } : s
          ),
        }));
      },

      addStage: (stage) => {
        const newStage: BudgetStage = {
          ...stage,
          id: generateId(),
          actualAmount: 0,
        };
        set((state) => ({
          stages: [...state.stages, newStage],
        }));
      },

      getTotalBudget: () => calculateTotalBudget(get().stages),
      getTotalExpense: () => calculateTotalExpense(get().expenses),
      getStageExpense: (stageId) => calculateStageExpense(stageId, get().expenses),

      getStageByName: (name) => get().stages.find((s) => s.name === name),

      resetToMock: () => {
        set({ stages: mockStages, expenses: mockExpenses });
      },
    }),
    {
      name: 'ivf-budget-storage',
    }
  )
);
