export type DutyRole = '主要陪护' | '陪同就诊' | '后勤支持' | '心理支持' | '工作对接' | '其他';
export type TaskStatus = '待分配' | '进行中' | '已完成' | '已取消';
export type TaskPriority = 'low' | 'medium' | 'high';
export type EmotionLevel = '开心' | '平静' | '焦虑' | '低落' | '崩溃';

export interface FamilyMember {
  id: string;
  name: string;
  role: DutyRole;
  avatar: string;
  phone?: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface DutyRoster {
  id: string;
  date: string;
  memberId: string;
  role: DutyRole;
  notes?: string;
}

export interface StressNote {
  id: string;
  date: string;
  emotion: EmotionLevel;
  note: string;
  triggers: string[];
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  description?: string;
  isImportant: boolean;
}

export interface FamilyStats {
  totalMembers: number;
  pendingTasks: number;
  completedTasks: number;
  completionRate: number;
  upcomingImportantDates: number;
}
