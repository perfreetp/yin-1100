import type { BudgetStage, Expense } from '@/types/budget';
import type { LeaveRecord, LeaveBalance, TreatmentDate, LeaveType } from '@/types/leave';
import type { Travel, Accommodation } from '@/types/travel';
import type { Receipt, Reimbursement, MaterialItem } from '@/types/reimbursement';
import type { FamilyMember, Task, DutyRoster, StressNote, ImportantDate, DutyRole, TaskStatus, TaskPriority, EmotionLevel } from '@/types/family';
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
    type: '火车',
    departure: '北京',
    destination: '天津',
    departureDate: formatDate(addDays(today, -1)),
    departureTime: '08:00',
    arrivalDate: formatDate(addDays(today, -1)),
    arrivalTime: '08:35',
    flightNumber: 'G1234',
    cost: 55,
    status: '已完成',
    notes: '术前检查',
  },
  {
    id: 'travel-2',
    type: '火车',
    departure: '北京',
    destination: '天津',
    departureDate: formatDate(today),
    departureTime: '07:30',
    arrivalDate: formatDate(today),
    arrivalTime: '08:05',
    flightNumber: 'G5678',
    cost: 55,
    status: '已预订',
    notes: '取卵手术',
  },
  {
    id: 'travel-3',
    type: '火车',
    departure: '天津',
    destination: '北京',
    departureDate: formatDate(addDays(today, 3)),
    departureTime: '14:00',
    arrivalDate: formatDate(addDays(today, 3)),
    arrivalTime: '14:35',
    flightNumber: 'G8765',
    cost: 55,
    status: '已预订',
    notes: '出院返程',
  },
];

export const mockAccommodations: Accommodation[] = [
  {
    id: 'acc-1',
    name: '天津中心妇产医院附近公寓',
    type: '公寓',
    address: '天津市南开区南开三马路156号',
    checkInDate: formatDate(addDays(today, -1)),
    checkOutDate: formatDate(addDays(today, 3)),
    nightlyRate: 300,
    totalCost: 1200,
    confirmationNumber: 'HTL20240615001',
    status: '已入住',
    notes: '有电梯、安静，离医院步行5分钟',
  },
  {
    id: 'acc-2',
    name: '天津中心妇产医院附近公寓',
    type: '公寓',
    address: '天津市南开区南开三马路156号',
    checkInDate: formatDate(addDays(today, 14)),
    checkOutDate: formatDate(addDays(today, 17)),
    nightlyRate: 300,
    totalCost: 900,
    confirmationNumber: '',
    status: '待预订',
    notes: '移植期间住宿，需提前预订',
  },
];

export const mockReceipts: Receipt[] = [
  {
    id: 'receipt-1',
    category: '检查费',
    amount: 2800,
    date: formatDate(addDays(today, -55)),
    hospital: '天津中心妇产医院',
    description: '夫妻双方孕前检查',
    hasReceipt: true,
    isReimbursed: false,
  },
  {
    id: 'receipt-2',
    category: '药品费',
    amount: 8500,
    date: formatDate(addDays(today, -20)),
    hospital: '天津中心妇产医院',
    description: '促排卵药物（果纳芬等）',
    hasReceipt: true,
    isReimbursed: false,
  },
  {
    id: 'receipt-3',
    category: '手术费',
    amount: 3000,
    date: formatDate(today),
    hospital: '天津中心妇产医院',
    description: '取卵手术定金',
    hasReceipt: true,
    isReimbursed: false,
  },
  {
    id: 'receipt-4',
    category: '化验费',
    amount: 1200,
    date: formatDate(addDays(today, -50)),
    hospital: '天津中心妇产医院',
    description: '血液检查、染色体分析',
    hasReceipt: true,
    isReimbursed: true,
  },
];

export const mockReimbursements: Reimbursement[] = [
  {
    id: 'reim-1',
    title: '商业保险报销-术前检查',
    amount: 2800,
    submitDate: formatDate(addDays(today, -30)),
    expectedDate: formatDate(addDays(today, 10)),
    actualAmount: 0,
    actualDate: '',
    status: '审核中',
    notes: '已提交材料，等待审核',
  },
];

export const mockMaterials: MaterialItem[] = [
  { id: 'mat-1', name: '门诊病历本', category: '医院材料', description: '每次就诊的病历记录', required: true, isCompleted: true },
  { id: 'mat-2', name: '诊断证明书（加盖公章）', category: '医院材料', description: '取卵后找医生开具', required: true, isCompleted: false },
  { id: 'mat-3', name: '所有收费票据原件', category: '医院材料', description: '检查、药品、手术发票', required: true, isCompleted: false },
  { id: 'mat-4', name: '费用明细清单', category: '医院材料', description: '医院打印', required: true, isCompleted: false },
  { id: 'mat-5', name: '出院小结', category: '医院材料', description: '如有住院', required: false, isCompleted: false },
  { id: 'mat-6', name: '身份证复印件', category: '社保材料', description: '夫妻双方', required: true, isCompleted: true },
  { id: 'mat-7', name: '结婚证复印件', category: '社保材料', description: '', required: true, isCompleted: true },
  { id: 'mat-8', name: '社保卡复印件', category: '社保材料', description: '', required: true, isCompleted: true },
  { id: 'mat-9', name: '生育服务单', category: '社保材料', description: '准生证', required: true, isCompleted: false },
  { id: 'mat-10', name: '单位请假证明', category: '单位材料', description: 'HR开具', required: false, isCompleted: false },
  { id: 'mat-11', name: '单位介绍信', category: '单位材料', description: '如单位报销需要', required: false, isCompleted: false },
  { id: 'mat-12', name: '银行卡复印件', category: '其他材料', description: '用于报销打款', required: true, isCompleted: true },
  { id: 'mat-13', name: '报销申请表', category: '其他材料', description: '填写完整', required: true, isCompleted: false },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'member-1',
    name: '小雨',
    role: '主要陪护',
    avatar: '👩',
    phone: '138****1234',
    notes: '患者本人',
  },
  {
    id: 'member-2',
    name: '大伟',
    role: '陪同就诊',
    avatar: '👨',
    phone: '139****5678',
    notes: '配偶，负责陪同就诊',
  },
  {
    id: 'member-3',
    name: '妈妈',
    role: '后勤支持',
    avatar: '👵',
    phone: '136****9012',
    notes: '负责做饭、照顾生活',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '取卵当日早晨办理住院手续',
    description: '7:30到医院，带身份证、结婚证，空腹',
    assigneeId: 'member-2',
    dueDate: formatDate(addDays(today, 1)),
    status: '待分配',
    priority: 'high',
  },
  {
    id: 'task-2',
    title: '准备术后营养餐',
    description: '清淡饮食，多吃蛋白质，避免辛辣',
    assigneeId: 'member-3',
    dueDate: formatDate(addDays(today, 1)),
    status: '进行中',
    priority: 'high',
  },
  {
    id: 'task-3',
    title: '预约移植日住宿',
    description: '提前2周预订，确认有电梯、安静',
    assigneeId: 'member-2',
    dueDate: formatDate(addDays(today, 7)),
    status: '待分配',
    priority: 'medium',
  },
  {
    id: 'task-4',
    title: '整理术前检查报告',
    description: '按时间顺序整理，方便医生查阅',
    assigneeId: 'member-1',
    dueDate: formatDate(addDays(today, -1)),
    status: '已完成',
    priority: 'medium',
  },
  {
    id: 'task-5',
    title: '购买蛋白粉和保健品',
    description: '术后补充营养',
    assigneeId: 'member-3',
    dueDate: formatDate(today),
    status: '进行中',
    priority: 'low',
  },
];

export const mockDutyRoster: DutyRoster[] = [
  {
    id: 'duty-1',
    date: formatDate(addDays(today, 0)),
    memberId: 'member-2',
    role: '陪同就诊',
    notes: '手术当天全程陪同',
  },
  {
    id: 'duty-2',
    date: formatDate(addDays(today, 1)),
    memberId: 'member-2',
    role: '陪同就诊',
    notes: '术后观察',
  },
  {
    id: 'duty-3',
    date: formatDate(addDays(today, 1)),
    memberId: 'member-3',
    role: '后勤支持',
    notes: '送饭、陪护',
  },
  {
    id: 'duty-4',
    date: formatDate(addDays(today, 2)),
    memberId: 'member-3',
    role: '后勤支持',
    notes: '家中照顾',
  },
];

export const mockStressNotes: StressNote[] = [
  {
    id: 'stress-1',
    date: formatDate(addDays(today, -3)),
    emotion: '焦虑',
    note: '促排卵最后几天，肚子有点涨，有点紧张明天的取卵手术。希望一切顺利...',
    triggers: ['手术焦虑', '身体不适'],
  },
  {
    id: 'stress-2',
    date: formatDate(addDays(today, -10)),
    emotion: '开心',
    note: '卵泡监测结果很好，医生说有12个优质卵泡，开心！',
    triggers: ['好消息'],
  },
];

export const mockImportantDates: ImportantDate[] = [
  {
    id: 'imp-1',
    title: '取卵手术',
    date: formatDate(addDays(today, 1)),
    description: '全麻取卵，7:30到医院',
    isImportant: true,
  },
  {
    id: 'imp-2',
    title: '移植手术',
    date: formatDate(addDays(today, 15)),
    description: '胚胎移植，提前1小时憋尿',
    isImportant: true,
  },
  {
    id: 'imp-3',
    title: '结婚纪念日',
    date: formatDate(addDays(today, 20)),
    description: '结婚5周年，希望能有好消息',
    isImportant: false,
  },
  {
    id: 'imp-4',
    title: '验孕日',
    date: formatDate(addDays(today, 29)),
    description: '移植后14天抽血',
    isImportant: true,
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
