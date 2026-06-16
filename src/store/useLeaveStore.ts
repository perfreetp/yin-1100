import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeaveRecord, LeaveBalance, TreatmentDate, LeaveType } from '@/types/leave';
import { mockLeaves, mockLeaveBalances, mockTreatmentDates, mockLeaveTotals } from '@/mock';
import { generateId, datesOverlap } from '@/utils/date';
import { calculateLeaveBalance } from '@/utils/calculation';

interface LeaveState {
  records: LeaveRecord[];
  treatmentDates: TreatmentDate[];
  leaveTotals: Record<LeaveType, number>;
  
  addLeave: (leave: Omit<LeaveRecord, 'id'>) => void;
  updateLeave: (id: string, data: Partial<LeaveRecord>) => void;
  deleteLeave: (id: string) => void;
  addTreatmentDate: (date: Omit<TreatmentDate, 'id'>) => void;
  updateTreatmentDate: (id: string, data: Partial<TreatmentDate>) => void;
  deleteTreatmentDate: (id: string) => void;
  updateLeaveTotals: (type: LeaveType, total: number) => void;
  getLeaveBalances: () => LeaveBalance[];
  getAffectedLeaves: (treatmentDateId: string) => LeaveRecord[];
  getRescheduleImpact: (oldDate: string, newDate: string) => {
    leaves: LeaveRecord[];
    totalAffected: number;
  };
  resetToMock: () => void;
}

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      records: mockLeaves,
      treatmentDates: mockTreatmentDates,
      leaveTotals: mockLeaveTotals,

      addLeave: (leave) => {
        const newLeave: LeaveRecord = {
          ...leave,
          id: generateId(),
        };
        set((state) => ({
          records: [newLeave, ...state.records].sort(
            (a, b) => b.startDate.localeCompare(a.startDate)
          ),
        }));
      },

      updateLeave: (id, data) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteLeave: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      addTreatmentDate: (date) => {
        const newDate: TreatmentDate = {
          ...date,
          id: generateId(),
        };
        set((state) => ({
          treatmentDates: [...state.treatmentDates, newDate].sort(
            (a, b) => a.date.localeCompare(b.date)
          ),
        }));
      },

      updateTreatmentDate: (id, data) => {
        set((state) => ({
          treatmentDates: state.treatmentDates.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        }));
      },

      deleteTreatmentDate: (id) => {
        set((state) => ({
          treatmentDates: state.treatmentDates.filter((d) => d.id !== id),
        }));
      },

      updateLeaveTotals: (type, total) => {
        set((state) => ({
          leaveTotals: {
            ...state.leaveTotals,
            [type]: total,
          },
        }));
      },

      getLeaveBalances: () => calculateLeaveBalance(get().records, get().leaveTotals),

      getAffectedLeaves: (treatmentDateId) => {
        const treatmentDate = get().treatmentDates.find(
          (d) => d.id === treatmentDateId
        );
        if (!treatmentDate) return [];
        
        return get().records.filter((r) =>
          r.treatmentDateId === treatmentDateId ||
          datesOverlap(r.startDate, r.endDate, treatmentDate.date, treatmentDate.date)
        );
      },

      getRescheduleImpact: (oldDate, newDate) => {
        const affectedLeaves = get().records.filter((r) =>
          datesOverlap(r.startDate, r.endDate, oldDate, oldDate)
        );
        
        return {
          leaves: affectedLeaves,
          totalAffected: affectedLeaves.length,
        };
      },

      resetToMock: () => {
        set({
          records: mockLeaves,
          treatmentDates: mockTreatmentDates,
          leaveTotals: mockLeaveTotals,
        });
      },
    }),
    {
      name: 'ivf-leave-storage',
    }
  )
);
