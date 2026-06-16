import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Receipt, Reimbursement, MaterialItem, MaterialCategory } from '@/types/reimbursement';
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
  addReimbursement: (reimbursement: Partial<Reimbursement> & Omit<Reimbursement, 'id' | 'receiptIds' | 'materialIds'>) => void;
  updateReimbursement: (id: string, data: Partial<Reimbursement>) => void;
  deleteReimbursement: (id: string) => void;
  addMaterial: (material: Omit<MaterialItem, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<MaterialItem>) => void;
  toggleMaterial: (id: string) => void;
  deleteMaterial: (id: string) => void;
  
  addReceiptToReimbursement: (reimbursementId: string, receiptId: string) => void;
  removeReceiptFromReimbursement: (reimbursementId: string, receiptId: string) => void;
  addMaterialToReimbursement: (reimbursementId: string, materialId: string) => void;
  removeMaterialFromReimbursement: (reimbursementId: string, materialId: string) => void;
  
  getStats: () => ReturnType<typeof calculateReimbursementStats>;
  getMaterialsByCategory: () => Record<MaterialCategory, MaterialItem[]>;
  getReimbursementDetail: (reimbursementId: string) => {
    reimbursement: Reimbursement | undefined;
    includedReceipts: Receipt[];
    missingReceipts: Receipt[];
    includedMaterials: MaterialItem[];
    missingMaterials: MaterialItem[];
    requiredMaterials: MaterialItem[];
    totalIncludedAmount: number;
    progress: number;
  } | null;
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
          reimbursements: state.reimbursements.map((r) => ({
            ...r,
            receiptIds: r.receiptIds.filter((rid) => rid !== id),
          })),
        }));
      },

      addReimbursement: (reimbursement) => {
        const newReimbursement: Reimbursement = {
          ...reimbursement,
          id: generateId(),
          receiptIds: reimbursement.receiptIds || [],
          materialIds: reimbursement.materialIds || [],
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
          reimbursements: state.reimbursements.map((r) => ({
            ...r,
            materialIds: r.materialIds.filter((mid) => mid !== id),
          })),
        }));
      },

      addReceiptToReimbursement: (reimbursementId, receiptId) => {
        set((state) => ({
          reimbursements: state.reimbursements.map((r) =>
            r.id === reimbursementId && !r.receiptIds.includes(receiptId)
              ? { ...r, receiptIds: [...r.receiptIds, receiptId] }
              : r
          ),
        }));
      },

      removeReceiptFromReimbursement: (reimbursementId, receiptId) => {
        set((state) => ({
          reimbursements: state.reimbursements.map((r) =>
            r.id === reimbursementId
              ? { ...r, receiptIds: r.receiptIds.filter((id) => id !== receiptId) }
              : r
          ),
        }));
      },

      addMaterialToReimbursement: (reimbursementId, materialId) => {
        set((state) => ({
          reimbursements: state.reimbursements.map((r) =>
            r.id === reimbursementId && !r.materialIds.includes(materialId)
              ? { ...r, materialIds: [...r.materialIds, materialId] }
              : r
          ),
        }));
      },

      removeMaterialFromReimbursement: (reimbursementId, materialId) => {
        set((state) => ({
          reimbursements: state.reimbursements.map((r) =>
            r.id === reimbursementId
              ? { ...r, materialIds: r.materialIds.filter((id) => id !== materialId) }
              : r
          ),
        }));
      },

      getStats: () => calculateReimbursementStats(get().receipts),

      getMaterialsByCategory: () => {
        const categories: MaterialCategory[] = ['医院材料', '社保材料', '单位材料', '其他材料'];
        const grouped = {} as Record<MaterialCategory, MaterialItem[]>;
        categories.forEach((cat) => {
          grouped[cat] = [];
        });
        get().materials.forEach((m) => {
          if (grouped[m.category]) {
            grouped[m.category].push(m);
          }
        });
        return grouped;
      },

      getReimbursementDetail: (reimbursementId) => {
        const reimbursement = get().reimbursements.find((r) => r.id === reimbursementId);
        if (!reimbursement) return null;

        const allReceipts = get().receipts;
        const allMaterials = get().materials;

        const includedReceipts = allReceipts.filter((r) => reimbursement.receiptIds.includes(r.id));
        const missingReceipts = allReceipts.filter((r) => !reimbursement.receiptIds.includes(r.id) && !r.isReimbursed);
        const includedMaterials = allMaterials.filter((m) => reimbursement.materialIds.includes(m.id));
        const missingMaterials = allMaterials.filter((m) => !reimbursement.materialIds.includes(m.id));
        const requiredMaterials = allMaterials.filter((m) => m.required);

        const totalIncludedAmount = includedReceipts.reduce((sum, r) => sum + r.amount, 0);
        
        const totalRequired = requiredMaterials.length;
        const completedRequired = requiredMaterials.filter((m) => reimbursement.materialIds.includes(m.id)).length;
        const progress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

        return {
          reimbursement,
          includedReceipts,
          missingReceipts,
          includedMaterials,
          missingMaterials,
          requiredMaterials,
          totalIncludedAmount,
          progress,
        };
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
