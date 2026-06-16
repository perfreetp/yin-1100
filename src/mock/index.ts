import type { BudgetStage, Expense } from '@/types/budget';
import type { LeaveRecord, LeaveBalance, TreatmentDate, LeaveType } from '@/types/leave';
import type { Travel, Accommodation } from '@/types/travel';
import type { Receipt, Reimbursement, MaterialItem } from '@/types/reimbursement';
import type { FamilyMember, Task, DutyRoster, StressNote, ImportantDate } from '@/types/family';
import { generateId } from '@/utils/date';

const today = new Date();
const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

export const mockStages: BudgetStage[] = [
  {
    id: 'stage-1',
    name: '术前检查',
    budgetAmount: 5000,
    actualAmount: 4800,
    startDate: formatDate(addDays(today, -60)),
    endDate: formatDate(addDays(today, -30)),
    status: '已完成',
  },
  {
    id: 'stage-2',
    name: '促排卵',
    budgetAmount: 15000,
    actualAmount: 12500,
    startDate: formatDate(addDays(today, -25)),
    endDate: formatDate(addDays(today, -5)),
    status: '已完成',
  },
  {
    id: 'stage-3',
    name: '取卵',
    budgetAmount: 8000,
    actualAmount: 3000,
    startDate: formatDate(today),
    endDate: formatDate(addDays(today, 3)),
    status: '进行中',
  },
  {
    id: 'stage-4',
    name: '移植',
    budgetAmount: 10000,
    actualAmount: 0,
    startDate: formatDate(addDays(today, 14)),
    endDate: formatDate(addDays(today, 17)),
    status: '未开始',
  },
  {
    id: 'stage-5',
    name: '黄体支持',
    budgetAmount: 3000,
    actualAmount: 0,
    startDate: formatDate(addDays(today, 18)),
    endDate: formatDate(addDays(today, 45)),
    status: '未开始',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    stageId: 'stage-1',
    category: '检查费',
    amount: 2800,
    date: formatDate(addDays(today, -55)),
    description: '夫妻双方孕前检查',
    createdAt: formatDate(addDays(today, -55)),
  },
  {
    id: 'exp-2',
    stageId: 'stage-1',
    category: '化验费',
    amount: 1200,
    date: formatDate(addDays(today, -50)),
    description: '血液检查、染色体分析',
    createdAt: formatDate(addDays(today, -50)),
  },
  {
    id: 'exp-3',
    stageId: 'stage-1',
    category: '其他',
    amount: 800,
    date: formatDate(addDays(today, -35)),
    description: 'B超监测',
    createdAt: formatDate(addDays(today, -35)),
  },
  {
    id: 'exp-4',
    stageId: 'stage-2',
    category: '药品费',
    amount: 8500,
    date: formatDate(addDays(today, -20)),
    description: '促排卵药物（果纳芬等）',
    createdAt: formatDate(addDays(today, -20)),
  },
  {
    id: 'exp-5',
    stageId: 'stage-2',
    category: '检查费',
    amount: 3000,
    date: formatDate(addDays(today, -10)),
    description: '卵泡监测6次',
    createdAt: formatDate(addDays(today, -10)),
  },
  {
    id: 'exp-6',
    stageId: 'stage-2',
    category: '化验费',
    amount: 1000,
    date: formatDate(addDays(today, -8)),
    description: '激素水平检测',
    createdAt: formatDate(addDays(today, -8)),
  },
  {
    id: 'exp-7',
    stageId: 'stage-3',
    category: '手术费',
    amount: 3000,
    date: formatDate(today),
    description: '取卵手术定金',
    createdAt: formatDate(today),
  },
];

export const mockLeaves: LeaveRecord[] = [
  {
    id: 'leave-1',
    startDate: formatDate(addDays(today, -55)),
    endDate: formatDate(addDays(today, -55)),
    days: 1,
    type: '年假',
    contactPerson: '李经理',
    status: '已批准',
    reason: '术前检查',
  },
  {
    id: 'leave-2',
    startDate: formatDate(addDays(today, -1)),
    endDate: formatDate(addDays(today, 3)),
    days: 5,
    type: '病假',
    contactPerson: '李经理',
    status: '已批准',
    reason: '取卵手术及术后休息',
  },
  {
    id: 'leave-3',
    startDate: formatDate(addDays(today, 13)),
    endDate: formatDate(addDays(today, 17)),
    days: 5,
    type: '病假',
    contactPerson: '李经理',
    status: '待审批',
    reason: '胚胎移植手术',
  },
];

export const mockLeaveBalances: LeaveBalance[] = [
  { type: '年假', total: 15, used: 1, remaining: 14 },
  { type: '病假', total: 10, used: 10, remaining: 0 },
  { type: '事假', total: 5, used: 0, remaining: 5 },
  { type: '调休', total: 3, used: 0, remaining: 3 },
];

export const mockTreatmentDates: TreatmentDate[] = [
  {
    id: 'treat-1',
    type: '取卵',
    date: formatDate(addDays(today, 1)),
    description: '全麻取卵手术，需空腹8小时',
    isConfirmed: true,
  },
  {
    id: 'treat-2',
    type: '移植',
    date: formatDate(addDays(today, 15)),
    description: '鲜胚移植，提前憋尿',
    isConfirmed: true,
  },
  {
    id: 'treat-3',
    type: '复查',
    date: formatDate(addDays(today, 29)),
    description: '移植后14天抽血验孕',
    isConfirmed: false,
  },
];

export const mockTravels: Travel[] = [
  {
    id: 'travel-1',
    type: '高铁',
    route: '北京 → 天津',
    departureTime: `${formatDate(addDays(today, -1))} 08:00`,
    arrivalTime: `${formatDate(addDays(today, -1))} 08:35`,
    transportNo: 'G1234',
    cost: 55,
    status: '已完成',
    notes: '术前检查',
  },
  {
    id: 'travel-2',
    type: '高铁',
    route: '北京 → 天津',
    departureTime: `${formatDate(today)} 07:30`,
    arrivalTime: `${formatDate(today)} 08:05`,
    transportNo: 'G5678',
    cost: 55,
    status: '已预订',
    notes: '取卵手术',
  },
  {
    id: 'travel-3',
    type: '高铁',
    route: '天津 → 北京',
    departureTime: `${formatDate(addDays(today, 3))} 14:00`,
    arrivalTime: `${formatDate(addDays(today, 3))} 14:35`,
    transportNo: 'G8765',
    cost: 55,
    status: '已预订',
    notes: '出院返程',
  },
];

export const mockAccommodations: Accommodation[] = [
  {
    id: 'acc-1',
    hotelName: '天津中心妇产医院附近公寓',
    checkIn: formatDate(addDays(today, -1)),
    checkOut: formatDate(addDays(today, 3)),
    nights: 4,
    cost: 1200,
    status: '已入住',
    address: '天津市南开区南开三马路156号',
    phone: '022-12345678',
  },
  {
    id: 'acc-2',
    hotelName: '天津中心妇产医院附近公寓',
    checkIn: formatDate(addDays(today, 14)),
    checkOut: formatDate(addDays(today, 17)),
    nights: 3,
    cost: 900,
    status: '待预订',
    address: '天津市南开区南开三马路156号',
    phone: '022-12345678',
  },
];

export const mockReceipts: Receipt[] = [
  {
    id: 'receipt-1',
    type: '检查',
    amount: 2800,
    date: formatDate(addDays(today, -55)),
    imageUrl: '',
    hospital: '天津中心妇产医院',
    isReimbursed: false,
  },
  {
    id: 'receipt-2',
    type: '药品',
    amount: 8500,
    date: formatDate(addDays(today, -20)),
    imageUrl: '',
    hospital: '天津中心妇产医院',
    isReimbursed: false,
  },
  {
    id: 'receipt-3',
    type: '门诊',
    amount: 3000,
    date: formatDate(today),
    imageUrl: '',
    hospital: '天津中心妇产医院',
    isReimbursed: false,
  },
];

export const mockReimbursements: Reimbursement[] = [
  {
    id: 'reim-1',
    receiptIds: ['receipt-1'],
    category: '商业保险',
    totalAmount: 2800,
    reimbursedAmount: 0,
    status: '待提交',
    notes: '准备近期提交',
  },
];

export const mockMaterials: MaterialItem[] = [
  { id: 'mat-1', name: '门诊病历本', category: '基础材料', isCompleted: true, notes: '' },
  { id: 'mat-2', name: '诊断证明书（加盖公章）', category: '基础材料', isCompleted: false, notes: '取卵后找医生开具' },
  { id: 'mat-3', name: '所有收费票据原件', category: '基础材料', isCompleted: false, notes: '检查、药品、手术发票' },
  { id: 'mat-4', name: '费用明细清单', category: '基础材料', isCompleted: false, notes: '医院打印' },
  { id: 'mat-5', name: '身份证复印件', category: '个人材料', isCompleted: true, notes: '夫妻双方' },
  { id: 'mat-6', name: '结婚证复印件', category: '个人材料', isCompleted: true, notes: '' },
  { id: 'mat-7', name: '单位请假证明', category: '单位报销', isCompleted: false, notes: 'HR开具' },
  { id: 'mat-8', name: '银行卡信息', category: '个人材料', isCompleted: true, notes: '用于报销打款' },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'member-1',
    name: '小雨',
    role: '患者',
    phone: '138****1234',
    avatar: '👩',
    color: 'bg-primary-400',
  },
  {
    id: 'member-2',
    name: '大伟',
    role: '配偶',
    phone: '139****5678',
    avatar: '👨',
    color: 'bg-accent-400',
  },
  {
    id: 'member-3',
    name: '妈妈',
    role: '父母',
    phone: '136****9012',
    avatar: '👵',
    color: 'bg-pink-400',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '取卵当日早晨办理住院手续',
    description: '7:30到医院，带身份证、结婚证，空腹',
    memberId: 'member-2',
    dueDate: formatDate(addDays(today, 1)),
    status: '待办',
    priority: '高',
  },
  {
    id: 'task-2',
    title: '准备术后营养餐',
    description: '清淡饮食，多吃蛋白质，避免辛辣',
    memberId: 'member-3',
    dueDate: formatDate(addDays(today, 1)),
    status: '待办',
    priority: '高',
  },
  {
    id: 'task-3',
    title: '预约移植日住宿',
    description: '提前2周预订，确认有电梯、安静',
    memberId: 'member-2',
    dueDate: formatDate(addDays(today, 7)),
    status: '待办',
    priority: '中',
  },
  {
    id: 'task-4',
    title: '整理术前检查报告',
    description: '按时间顺序整理，方便医生查阅',
    memberId: 'member-1',
    dueDate: formatDate(addDays(today, -1)),
    status: '已完成',
    priority: '中',
  },
  {
    id: 'task-5',
    title: '购买蛋白粉和保健品',
    description: '术后补充营养',
    memberId: 'member-3',
    dueDate: formatDate(today),
    status: '进行中',
    priority: '低',
  },
];

export const mockDutyRoster: DutyRoster[] = [
  {
    id: 'duty-1',
    date: formatDate(addDays(today, 0)),
    memberId: 'member-2',
    shiftType: '全天',
    notes: '手术当天全程陪同',
  },
  {
    id: 'duty-2',
    date: formatDate(addDays(today, 1)),
    memberId: 'member-2',
    shiftType: '上午',
    notes: '术后观察',
  },
  {
    id: 'duty-3',
    date: formatDate(addDays(today, 1)),
    memberId: 'member-3',
    shiftType: '下午',
    notes: '送饭、陪护',
  },
  {
    id: 'duty-4',
    date: formatDate(addDays(today, 2)),
    memberId: 'member-3',
    shiftType: '全天',
    notes: '家中照顾',
  },
];

export const mockStressNotes: StressNote[] = [
  {
    id: 'stress-1',
    date: formatDate(addDays(today, -3)),
    moodLevel: 3,
    content: '促排卵最后几天，肚子有点涨，有点紧张明天的取卵手术。希望一切顺利...',
    isPrivate: true,
  },
  {
    id: 'stress-2',
    date: formatDate(addDays(today, -10)),
    moodLevel: 4,
    content: '卵泡监测结果很好，医生说有12个优质卵泡，开心！',
    isPrivate: false,
  },
];

export const mockImportantDates: ImportantDate[] = [
  {
    id: 'imp-1',
    title: '取卵手术',
    date: formatDate(addDays(today, 1)),
    type: '治疗',
    color: 'bg-primary-500',
    description: '全麻取卵，7:30到医院',
  },
  {
    id: 'imp-2',
    title: '移植手术',
    date: formatDate(addDays(today, 15)),
    type: '治疗',
    color: 'bg-accent-500',
    description: '胚胎移植，提前1小时憋尿',
  },
  {
    id: 'imp-3',
    title: '结婚纪念日',
    date: formatDate(addDays(today, 20)),
    type: '纪念日',
    color: 'bg-pink-500',
    description: '结婚5周年，希望能有好消息',
  },
  {
    id: 'imp-4',
    title: '验孕日',
    date: formatDate(addDays(today, 29)),
    type: '复查',
    color: 'bg-primary-500',
    description: '移植后14天抽血',
  },
];

export const mockLeaveTotals: Record<LeaveType, number> = {
  '年假': 15,
  '病假': 10,
  '事假': 5,
  '调休': 3,
};

export function generateMockData() {
  return {
    stages: mockStages,
    expenses: mockExpenses,
    leaves: mockLeaves,
    leaveBalances: mockLeaveBalances,
    treatmentDates: mockTreatmentDates,
    travels: mockTravels,
    accommodations: mockAccommodations,
    receipts: mockReceipts,
    reimbursements: mockReimbursements,
    materials: mockMaterials,
    familyMembers: mockFamilyMembers,
    tasks: mockTasks,
    dutyRoster: mockDutyRoster,
    stressNotes: mockStressNotes,
    importantDates: mockImportantDates,
  };
}
