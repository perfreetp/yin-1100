import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Receipt, Reimbursement, MaterialItem } from '@/types/reimbursement';
import { mockReceipts, mockReimbursements, mockMaterials } from '@/mock';
import { generateId } from '@/utils/date';
import { calculateReimbursementStats } from '@/utils/calculation';

interface ReimbursementState {
  receipts: Receipt[];
  reimbursements: Reimbursement[];
  materials: MaterialItem[];
  
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateReceipt: (id: string, data: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
  addReimbursement: (reimbursement: Omit<Reimbursement, 'id'>) => void;
  updateReimbursement: (id: string, data: Partial<Reimbursement>) => void;
  deleteReimbursement: (id: string) => void;
  addMaterial: (material: Omit<MaterialItem, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<MaterialItem>) => void;
  toggleMaterial: (id: string) => void;
  deleteMaterial: (id: string) => void;
  getStats: () => ReturnType<typeof calculateReimbursementStats>;
  getMaterialsByCategory: () => Record<string, MaterialItem[]>;
  resetToMock: () => void;
}

export const useReimbursementStore = create<ReimbursementState>()(
  persist(
    (set, get) => ({
      receipts: mockReceipts,
      reimbursements: mockReimbursements,
      materials: mockMaterials,

      addReceipt: (receipt) => {
        const newReceipt: Receipt = {
          ...receipt,
          id: generateId(),
        };
        set((state) => ({
          receipts: [newReceipt, ...state.receipts].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        }));
      },

      updateReceipt: (id, data) => {
        set((state) => ({
          receipts: state.receipts.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteReceipt: (id) => {
        set((state) => ({
          receipts: state.receipts.filter((r) => r.id !== id),
        }));
      },

      addReimbursement: (reimbursement) => {
        const newReimbursement: Reimbursement = {
          ...reimbursement,
          id: generateId(),
        };
        set((state) => ({
          reimbursements: [newReimbursement, ...state.reimbursements],
        }));
      },

      updateReimbursement: (id, data) => {
        set((state) => ({
          reimbursements: state.reimbursements.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteReimbursement: (id) => {
        set((state) => ({
          reimbursements: state.reimbursements.filter((r) => r.id !== id),
        }));
      },

      addMaterial: (material) => {
        const newMaterial: MaterialItem = {
          ...material,
          id: generateId(),
        };
        set((state) => ({
          materials: [...state.materials, newMaterial],
        }));
      },

      updateMaterial: (id, data) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }));
      },

      toggleMaterial: (id) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
          ),
        }));
      },

      deleteMaterial: (id) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        }));
      },

      getStats: () => calculateReimbursementStats(get().receipts),

      getMaterialsByCategory: () => {
        const grouped: Record<string, MaterialItem[]> = {};
        get().materials.forEach((m) => {
          if (!grouped[m.category]) {
            grouped[m.category] = [];
          }
          grouped[m.category].push(m);
        });
        return grouped;
      },

      resetToMock: () => {
        set({
          receipts: mockReceipts,
          reimbursements: mockReimbursements,
          materials: mockMaterials,
        });
      },
    }),
    {
      name: 'ivf-reimbursement-storage',
    }
  )
);
