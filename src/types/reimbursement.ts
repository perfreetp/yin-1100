export type ReceiptCategory = '检查费' | '药品费' | '手术费' | '化验费' | '治疗费' | '其他';
export type MaterialCategory = '医院材料' | '社保材料' | '单位材料' | '其他材料';
export type ReimbursementStatus = '未提交' | '已提交' | '审核中' | '已报销' | '已拒绝';

export interface Receipt {
  id: string;
  category: ReceiptCategory;
  amount: number;
  date: string;
  hospital?: string;
  description?: string;
  hasReceipt: boolean;
  isReimbursed: boolean;
}

export interface Reimbursement {
  id: string;
  title: string;
  amount: number;
  submitDate: string;
  expectedDate?: string;
  actualAmount?: number;
  actualDate?: string;
  status: ReimbursementStatus;
  notes?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  description?: string;
  required: boolean;
  isCompleted: boolean;
}

export interface ReimbursementStats {
  totalAmount: number;
  reimbursedAmount: number;
  pendingAmount: number;
  totalReceipts: number;
  reimbursedReceipts: number;
  pendingReceipts: number;
}
