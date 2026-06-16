import { useState, useMemo } from 'react';
import { 
  Plus, User, Calendar, Clock, Heart, MessageCircle, 
  Edit2, Trash2, CheckCircle2, Circle, AlertCircle,
  ChevronLeft, ChevronRight, Star, Frown, Meh, Smile, Laugh
} from 'lucide-react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useLeaveStore } from '@/store/useLeaveStore';
import { formatMoney, formatDisplayDate, formatDate, getWeekDays, getDaysFromNow, isPast, isSameDate } from '@/utils/date';
import type { TaskStatus, EmotionLevel, DutyRole } from '@/types/family';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

const MEMBER_COLORS = [
  'bg-blue-500',
  'bg-primary-500',
  'bg-accent-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
];

const EMOTION_ICONS: Record<EmotionLevel, React.ReactNode> = {
  '开心': <Laugh className="w-5 h-5" />,
  '平静': <Smile className="w-5 h-5" />,
  '焦虑': <Meh className="w-5 h-5" />,
  '低落': <Frown className="w-5 h-5" />,
  '崩溃': <AlertCircle className="w-5 h-5" />,
};

const EMOTION_COLORS: Record<EmotionLevel, string> = {
  '开心': 'text-green-500 bg-green-50',
  '平静': 'text-blue-500 bg-blue-50',
  '焦虑': 'text-yellow-500 bg-yellow-50',
  '低落': 'text-orange-500 bg-orange-50',
  '崩溃': 'text-red-500 bg-red-50',
};

const STATUS_COLORS: Record<TaskStatus, 'success' | 'warning' | 'accent' | 'default'> = {
  '待分配': 'default',
  '进行中': 'warning',
  '已完成': 'success',
  '已取消': 'default',
};

const ROLE_LABELS: Record<DutyRole, string> = {
  '主要陪护': '主陪护',
  '陪同就诊': '陪同',
  '后勤支持': '后勤',
  '心理支持': '心理',
  '工作对接': '工作',
  '其他': '其他',
};

const TASK_STATUS: TaskStatus[] = ['待分配', '进行中', '已完成', '已取消'];

export default function FamilyPage() {
  const { members, tasks, dutyRoster, stressNotes, importantDates, addMember, updateMember, deleteMember, addTask, updateTask, deleteTask, toggleTask, addStressNote, deleteStressNote, addImportantDate, deleteImportantDate, getStats, addDuty, updateDuty, deleteDuty } = useFamilyStore();
  const { treatmentDates } = useLeaveStore();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [stressModalOpen, setStressModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [generateDutyModalOpen, setGenerateDutyModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingDuty, setEditingDuty] = useState<string | null>(null);
  const [selectedTreatmentDate, setSelectedTreatmentDate] = useState<typeof upcomingDates[0] | null>(null);
  
  const [dutyForm, setDutyForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    role: '陪同就诊' as DutyRole,
    notes: '',
  });
  
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '' as DutyRole,
    phone: '',
    notes: '',
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    status: '待分配' as TaskStatus,
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  
  const [stressForm, setStressForm] = useState({
    date: new Date().toISOString().split('T')[0],
    emotion: '平静' as EmotionLevel,
    note: '',
    triggers: '',
  });
  
  const [dateForm, setDateForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isImportant: true,
  });
  
  const [generateDutyForm, setGenerateDutyForm] = useState({
    daysBefore: 1,
    daysAfter: 1,
    memberId: '',
    role: '主要陪护' as DutyRole,
  });

  const stats = useMemo(() => getStats(), [members, tasks, stressNotes, importantDates]);
  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);
  
  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, typeof tasks> = {
      '待分配': [],
      '进行中': [],
      '已完成': [],
      '已取消': [],
    };
    tasks.forEach(t => groups[t.status].push(t));
    return groups;
  }, [tasks]);

  const upcomingDates = useMemo(() => {
    const allDates = [
      ...importantDates.map(d => ({ ...d, type: 'important' as const })),
      ...treatmentDates.filter(t => t.isConfirmed).map(t => ({ 
        id: t.id, 
        title: t.type, 
        date: t.date, 
        description: t.description,
        isImportant: true,
        type: 'treatment' as const,
      })),
    ];
    
    return allDates
      .filter(d => !isPast(d.date))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [importantDates, treatmentDates]);

  const getMemberColor = (index: number) => MEMBER_COLORS[index % MEMBER_COLORS.length];

  const getDutiesForDate = (memberId: string, date: string) => {
    return dutyRoster.filter(d => d.memberId === memberId && d.date === date);
  };

  const handleOpenMemberModal = (member?: typeof members[0]) => {
    if (member) {
      setEditingMember(member.id);
      setMemberForm({
        name: member.name,
        role: member.role,
        phone: member.phone || '',
        notes: member.notes || '',
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        name: '',
        role: '其他',
        phone: '',
        notes: '',
      });
    }
    setMemberModalOpen(true);
  };

  const handleOpenTaskModal = (task?: typeof tasks[0]) => {
    if (task) {
      setEditingTask(task.id);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assigneeId || '',
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        assigneeId: members[0]?.id || '',
        status: '待分配',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
      });
    }
    setTaskModalOpen(true);
  };

  const handleSubmitMember = () => {
    if (!memberForm.name.trim()) return;
    
    const memberData = {
      ...memberForm,
      avatar: memberForm.name.charAt(0).toUpperCase(),
    };
    
    if (editingMember) {
      updateMember(editingMember, memberData);
    } else {
      addMember(memberData);
    }
    
    setMemberModalOpen(false);
  };

  const handleSubmitTask = () => {
    if (!taskForm.title.trim()) return;
    
    if (editingTask) {
      updateTask(editingTask, taskForm);
    } else {
      addTask(taskForm);
    }
    
    setTaskModalOpen(false);
  };

  const handleSubmitStress = () => {
    if (!stressForm.note.trim()) return;
    
    addStressNote({
      ...stressForm,
      triggers: stressForm.triggers ? stressForm.triggers.split(',').map(t => t.trim()) : [],
    });
    
    setStressModalOpen(false);
    setStressForm({
      date: new Date().toISOString().split('T')[0],
      emotion: '平静',
      note: '',
      triggers: '',
    });
  };

  const handleSubmitDate = () => {
    if (!dateForm.title.trim()) return;
    
    addImportantDate(dateForm);
    
    setDateModalOpen(false);
    setDateForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isImportant: true,
    });
  };

  const getRecommendedDays = (treatmentType: string) => {
    switch (treatmentType) {
      case '取卵':
        return { daysBefore: 1, daysAfter: 2 };
      case '移植':
        return { daysBefore: 1, daysAfter: 2 };
      case '复查':
        return { daysBefore: 0, daysAfter: 0 };
      case '检查':
        return { daysBefore: 0, daysAfter: 0 };
      default:
        return { daysBefore: 0, daysAfter: 0 };
    }
  };

  const handleOpenGenerateDutyModal = (date: typeof upcomingDates[0]) => {
    const recommended = getRecommendedDays(date.title);
    setSelectedTreatmentDate(date);
    setGenerateDutyForm({
      daysBefore: recommended.daysBefore,
      daysAfter: recommended.daysAfter,
      memberId: members.length > 0 ? members[0].id : '',
      role: '主要陪护',
    });
    setGenerateDutyModalOpen(true);
  };

  const handleGenerateDuties = () => {
    if (!selectedTreatmentDate || !generateDutyForm.memberId) return;
    
    const treatmentDate = new Date(selectedTreatmentDate.date);
    const { daysBefore, daysAfter, memberId, role } = generateDutyForm;
    
    for (let i = -daysBefore; i <= daysAfter; i++) {
      const date = new Date(treatmentDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const notes = i === 0 
        ? `${selectedTreatmentDate.title}当天` 
        : i < 0 
          ? `${selectedTreatmentDate.title}前${Math.abs(i)}天` 
          : `${selectedTreatmentDate.title}后${i}天`;
      
      addDuty({
        memberId,
        date: dateStr,
        role,
        notes: `${selectedTreatmentDate.title}陪护 · ${notes}`,
      });
    }
    
    setGenerateDutyModalOpen(false);
    setSelectedTreatmentDate(null);
  };

  const handleOpenDutyModal = (duty?: typeof dutyRoster[0], dateStr?: string, memberId?: string) => {
    if (duty) {
      setEditingDuty(duty.id);
      setDutyForm({
        memberId: duty.memberId,
        date: duty.date,
        role: duty.role,
        notes: duty.notes || '',
      });
    } else {
      setEditingDuty(null);
      setDutyForm({
        memberId: memberId || (members.length > 0 ? members[0].id : ''),
        date: dateStr || new Date().toISOString().split('T')[0],
        role: '陪同就诊',
        notes: '',
      });
    }
    setDutyModalOpen(true);
  };

  const handleSubmitDuty = () => {
    if (!dutyForm.memberId || !dutyForm.date) return;
    
    if (editingDuty) {
      updateDuty(editingDuty, dutyForm);
    } else {
      addDuty(dutyForm);
    }
    
    setDutyModalOpen(false);
    setEditingDuty(null);
    setDutyForm({
      memberId: members.length > 0 ? members[0].id : '',
      date: new Date().toISOString().split('T')[0],
      role: '陪同就诊',
      notes: '',
    });
  };

  const prevWeek = () => {
    setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const nextWeek = () => {
    setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">家庭分工</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setStressModalOpen(true)}>
            <Heart className="w-4 h-4" />
            记录心情
          </Button>
          <Button onClick={() => handleOpenTaskModal()}>
            <Plus className="w-4 h-4" />
            添加任务
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="家庭成员"
          value={members.length}
          gradient="from-primary-500 to-primary-600"
          icon={<User className="w-6 h-6 text-white" />}
        />
        <StatCard
          title="待办任务"
          value={stats.pendingTasks}
          gradient="from-accent-500 to-accent-600"
          icon={<Clock className="w-6 h-6 text-white" />}
        />
        <StatCard
          title="完成率"
          value={`${stats.completionRate.toFixed(0)}%`}
          gradient="from-green-500 to-green-600"
          icon={<CheckCircle2 className="w-6 h-6 text-white" />}
        />
        <StatCard
          title="重要日期"
          value={upcomingDates.length}
          gradient="from-purple-500 to-purple-600"
          icon={<Calendar className="w-6 h-6 text-white" />}
          subtitle={`${stats.upcomingImportantDates} 个即将到来`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>陪护轮值周历</CardTitle>
            <div className="flex items-center gap-4">
              <button onClick={prevWeek} className="p-1 hover:bg-warmGray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-warmGray-600" />
              </button>
              <span className="font-medium text-warmGray-800 min-w-[180px] text-center">
                {formatDate(weekDays[0], 'M月d日')} - {formatDate(weekDays[6], 'M月d日')}
              </span>
              <button onClick={nextWeek} className="p-1 hover:bg-warmGray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-warmGray-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <EmptyState
                title="暂无家庭成员"
                description="请先添加家庭成员以安排轮值"
                action={<Button onClick={() => handleOpenMemberModal()}>添加成员</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium text-warmGray-500 bg-warmGray-50 rounded-tl-lg">成员</th>
                      {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => {
                        const date = weekDays[idx];
                        const isToday = isSameDate(date, new Date());
                        return (
                          <th 
                            key={day} 
                            className={`p-2 text-center text-sm font-medium ${isToday ? 'bg-primary-100 text-primary-700' : 'bg-warmGray-50 text-warmGray-500'} ${idx === 6 ? 'rounded-tr-lg' : ''}`}
                          >
                            <div>{day}</div>
                            <div className="text-xs">{formatDate(date, 'd')}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, memberIdx) => (
                      <tr key={member.id} className="border-b border-warmGray-100 last:border-b-0">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${getMemberColor(memberIdx)} text-white flex items-center justify-center text-sm font-medium`}>
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-warmGray-800">{member.name}</p>
                              <p className="text-xs text-warmGray-500">{ROLE_LABELS[member.role]}</p>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((date, dayIdx) => {
                          const dateStr = date.toISOString().split('T')[0];
                          const duties = getDutiesForDate(member.id, dateStr);
                          const isToday = isSameDate(date, new Date());
                          return (
                            <td 
                              key={dayIdx} 
                              className={`p-2 text-center ${isToday ? 'bg-primary-50/50' : ''} group align-top`}
                            >
                              <div className="flex flex-col gap-1 items-center">
                                {duties.map(duty => (
                                  <div 
                                    key={duty.id}
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getMemberColor(memberIdx)} text-white relative group/duty w-full max-w-[80px]`}
                                    onClick={(e) => { e.stopPropagation(); handleOpenDutyModal(duty); }}
                                  >
                                    {ROLE_LABELS[duty.role]}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteDuty(duty.id); }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white rounded-full opacity-0 group-hover/duty:opacity-100 transition-opacity flex items-center justify-center text-[10px] hover:bg-danger-600"
                                      title="删除"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-warmGray-100 text-warmGray-400 hover:text-primary-500 flex items-center justify-center flex-shrink-0"
                                  title="添加轮值"
                                  onClick={() => handleOpenDutyModal(undefined, dateStr, member.id)}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <User className="w-5 h-5 text-primary-500" />
              家庭成员
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleOpenMemberModal()}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <EmptyState
                title="暂无成员"
                description="添加家庭成员以协同安排"
                icon={<User className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              members.map((member, idx) => (
                <div 
                  key={member.id}
                  className="p-3 bg-warmGray-50 rounded-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${getMemberColor(idx)} text-white flex items-center justify-center font-medium`}>
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-warmGray-800">{member.name}</h4>
                          <Badge variant="default">{ROLE_LABELS[member.role]}</Badge>
                        </div>
                        {member.phone && (
                          <p className="text-sm text-warmGray-500">{member.phone}</p>
                        )}
                        {member.notes && (
                          <p className="text-xs text-warmGray-400 mt-1">{member.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleOpenMemberModal(member)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <MessageCircle className="w-5 h-5 text-primary-500" />
            任务看板
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <EmptyState
              title="暂无任务"
              description="点击右上角按钮添加任务"
              icon={<MessageCircle className="w-12 h-12 text-warmGray-300" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TASK_STATUS.map(status => (
                <div key={status} className="bg-warmGray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-warmGray-700">{status}</h4>
                    <Badge variant={STATUS_COLORS[status]}>{tasksByStatus[status].length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus[status].map(task => {
                      const member = members.find(m => m.id === task.assigneeId);
                      const memberIdx = members.findIndex(m => m.id === task.assigneeId);
                      const isOverdue = status !== '已完成' && status !== '已取消' && isPast(task.dueDate);
                      
                      return (
                        <div 
                          key={task.id}
                          className={`p-3 bg-white rounded-lg border-l-4 ${
                            task.priority === 'high' ? 'border-danger-500' :
                            task.priority === 'medium' ? 'border-accent-500' : 'border-warmGray-300'
                          } group`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {task.status === '已完成' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-warmGray-300" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h5 className={`font-medium text-sm ${task.status === '已完成' ? 'text-warmGray-400 line-through' : 'text-warmGray-800'}`}>
                                  {task.title}
                                </h5>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                  <button
                                    onClick={() => handleOpenTaskModal(task)}
                                    className="p-1 hover:bg-warmGray-100 rounded text-warmGray-500 hover:text-primary-500"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-1 hover:bg-warmGray-100 rounded text-warmGray-500 hover:text-danger-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {task.description && (
                                <p className="text-xs text-warmGray-500 mt-1 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {member && (
                                  <div className={`w-5 h-5 rounded-full ${getMemberColor(memberIdx)} text-white flex items-center justify-center text-xs`}>
                                    {member.avatar}
                                  </div>
                                )}
                                <span className={`text-xs ${isOverdue ? 'text-danger-500' : 'text-warmGray-400'}`}>
                                  {formatDisplayDate(task.dueDate)}
                                  {isOverdue && ' · 已逾期'}
                                </span>
                                {task.priority === 'high' && (
                                  <Badge variant="danger" size="sm">高优先级</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Heart className="w-5 h-5 text-primary-500" />
              压力备注
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stressNotes.length === 0 ? (
              <EmptyState
                title="暂无心情记录"
                description="记录心情有助于缓解压力"
                icon={<Heart className="w-12 h-12 text-warmGray-300" />}
                action={<Button variant="secondary" onClick={() => setStressModalOpen(true)}>记录心情</Button>}
              />
            ) : (
              stressNotes.slice(0, 5).map(note => (
                <div key={note.id} className="p-4 bg-warmGray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${EMOTION_COLORS[note.emotion]}`}>
                        {EMOTION_ICONS[note.emotion]}
                      </div>
                      <div>
                        <h4 className="font-medium text-warmGray-800">{note.emotion}</h4>
                        <p className="text-xs text-warmGray-500">{formatDisplayDate(note.date)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteStressNote(note.id)}
                      className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-warmGray-600">{note.note}</p>
                  {note.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.triggers.map((trigger, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-warmGray-100 text-warmGray-600 text-xs rounded-full">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Calendar className="w-5 h-5 text-primary-500" />
              重要日期提醒
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setDateModalOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDates.length === 0 ? (
              <EmptyState
                title="暂无重要日期"
                description="添加重要日期以便提醒"
                icon={<Calendar className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              upcomingDates.map(date => {
                const days = getDaysFromNow(date.date);
                return (
                  <div 
                    key={date.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      date.type === 'treatment' ? 'border-primary-500 bg-primary-50/50' :
                      date.isImportant ? 'border-accent-500 bg-accent-50/50' :
                      'border-warmGray-300 bg-warmGray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {date.isImportant && <Star className="w-4 h-4 text-accent-500 fill-accent-500" />}
                          <h4 className="font-medium text-warmGray-800">{date.title}</h4>
                          {date.type === 'treatment' && (
                            <Badge variant="primary">治疗</Badge>
                          )}
                        </div>
                        <p className="text-sm text-warmGray-600">{formatDisplayDate(date.date)}</p>
                        {date.description && (
                          <p className="text-xs text-warmGray-500 mt-1">{date.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={days <= 3 ? 'danger' : days <= 7 ? 'warning' : 'default'}>
                          {days === 0 ? '今天' : days === 1 ? '明天' : `${days}天后`}
                        </Badge>
                        {date.type === 'treatment' && (
                          <button
                            onClick={() => handleOpenGenerateDutyModal(date)}
                            className="block mt-2 px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors ml-auto"
                          >
                            一键生成陪护
                          </button>
                        )}
                        {date.type !== 'treatment' && (
                          <button
                            onClick={() => deleteImportantDate(date.id)}
                            className="block mt-2 p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={editingMember ? '编辑成员' : '添加成员'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMemberModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitMember} disabled={!memberForm.name.trim()}>
              {editingMember ? '保存修改' : '添加成员'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="姓名"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            placeholder="请输入姓名"
          />
          <Select
            label="角色"
            value={memberForm.role}
            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as DutyRole })}
            options={[
              { value: '主要陪护', label: '主要陪护' },
              { value: '陪同就诊', label: '陪同就诊' },
              { value: '后勤支持', label: '后勤支持' },
              { value: '心理支持', label: '心理支持' },
              { value: '工作对接', label: '工作对接' },
              { value: '其他', label: '其他' },
            ]}
          />
          <Input
            label="联系电话"
            value={memberForm.phone}
            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
            placeholder="紧急联系电话"
          />
          <TextArea
            label="备注"
            value={memberForm.notes}
            onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
            placeholder="擅长的事情、注意事项等..."
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={editingTask ? '编辑任务' : '添加任务'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTaskModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitTask} disabled={!taskForm.title.trim()}>
              {editingTask ? '保存修改' : '添加任务'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="任务标题"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="请输入任务标题"
          />
          <TextArea
            label="任务描述"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="任务详情说明..."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="负责人"
              value={taskForm.assigneeId}
              onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
              options={members.map(m => ({ value: m.id, label: m.name }))}
            />
            <Select
              label="优先级"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
              options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="截止日期"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
            <Select
              label="状态"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
              options={TASK_STATUS.map(s => ({ value: s, label: s }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={stressModalOpen}
        onClose={() => setStressModalOpen(false)}
        title="记录心情"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStressModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitStress} disabled={!stressForm.note.trim()}>
              保存记录
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="日期"
            type="date"
            value={stressForm.date}
            onChange={(e) => setStressForm({ ...stressForm, date: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-2">今天的心情</label>
            <div className="flex justify-between">
              {(['开心', '平静', '焦虑', '低落', '崩溃'] as EmotionLevel[]).map(emotion => (
                <button
                  key={emotion}
                  onClick={() => setStressForm({ ...stressForm, emotion })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    stressForm.emotion === emotion 
                      ? `${EMOTION_COLORS[emotion]} ring-2 ring-offset-2 ring-current` 
                      : 'bg-warmGray-50 text-warmGray-400 hover:bg-warmGray-100'
                  }`}
                >
                  {EMOTION_ICONS[emotion]}
                  <span className="text-xs">{emotion}</span>
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label="想说的话"
            value={stressForm.note}
            onChange={(e) => setStressForm({ ...stressForm, note: e.target.value })}
            placeholder="记录下今天的感受和压力来源..."
            rows={4}
          />
          <Input
            label="触发因素（用逗号分隔）"
            value={stressForm.triggers}
            onChange={(e) => setStressForm({ ...stressForm, triggers: e.target.value })}
            placeholder="如：打针、等待结果、费用压力等"
          />
        </div>
      </Modal>

      <Modal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title="添加重要日期"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitDate} disabled={!dateForm.title.trim()}>
              添加日期
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="事项名称"
            value={dateForm.title}
            onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
            placeholder="如：排卵监测、取卵日等"
          />
          <Input
            label="日期"
            type="date"
            value={dateForm.date}
            onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
          />
          <TextArea
            label="备注"
            value={dateForm.description}
            onChange={(e) => setDateForm({ ...dateForm, description: e.target.value })}
            placeholder="注意事项、需要准备的东西等..."
            rows={2}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dateForm.isImportant}
              onChange={(e) => setDateForm({ ...dateForm, isImportant: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded"
            />
            <span className="text-warmGray-700">标记为重要日期</span>
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={dutyModalOpen}
        onClose={() => setDutyModalOpen(false)}
        title={editingDuty ? '编辑轮值' : '添加轮值'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDutyModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitDuty} disabled={!dutyForm.memberId || !dutyForm.date}>
              {editingDuty ? '保存修改' : '添加轮值'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="家庭成员"
            value={dutyForm.memberId}
            onChange={(e) => setDutyForm({ ...dutyForm, memberId: e.target.value })}
            options={members.map(m => ({ value: m.id, label: `${m.avatar} ${m.name}` }))}
          />
          <Input
            label="日期"
            type="date"
            value={dutyForm.date}
            onChange={(e) => setDutyForm({ ...dutyForm, date: e.target.value })}
          />
          <Select
            label="值班角色"
            value={dutyForm.role}
            onChange={(e) => setDutyForm({ ...dutyForm, role: e.target.value as DutyRole })}
            options={[
              { value: '主要陪护', label: '主要陪护' },
              { value: '陪同就诊', label: '陪同就诊' },
              { value: '后勤支持', label: '后勤支持' },
              { value: '心理支持', label: '心理支持' },
              { value: '工作对接', label: '工作对接' },
              { value: '其他', label: '其他' },
            ]}
          />
          <TextArea
            label="备注"
            value={dutyForm.notes}
            onChange={(e) => setDutyForm({ ...dutyForm, notes: e.target.value })}
            placeholder="如：上午陪同，下午需要返回公司..."
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        isOpen={generateDutyModalOpen}
        onClose={() => setGenerateDutyModalOpen(false)}
        title={selectedTreatmentDate ? `生成${selectedTreatmentDate.title}陪护安排` : '生成陪护安排'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateDutyModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleGenerateDuties} disabled={!generateDutyForm.memberId}>
              生成陪护草稿
            </Button>
          </>
        }
      >
        {selectedTreatmentDate && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-sm text-primary-700 font-medium">{selectedTreatmentDate.title}</p>
              <p className="text-sm text-primary-600">{formatDisplayDate(selectedTreatmentDate.date)}</p>
              {selectedTreatmentDate.description && (
                <p className="text-xs text-primary-500 mt-1">{selectedTreatmentDate.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="提前天数"
                type="number"
                min="0"
                max="7"
                value={generateDutyForm.daysBefore.toString()}
                onChange={(e) => setGenerateDutyForm({ 
                  ...generateDutyForm, 
                  daysBefore: Math.max(0, Math.min(7, parseInt(e.target.value) || 0)) 
                })}
                hint="治疗前需要陪护的天数"
              />
              <Input
                label="后续天数"
                type="number"
                min="0"
                max="14"
                value={generateDutyForm.daysAfter.toString()}
                onChange={(e) => setGenerateDutyForm({ 
                  ...generateDutyForm, 
                  daysAfter: Math.max(0, Math.min(14, parseInt(e.target.value) || 0)) 
                })}
                hint="治疗后需要陪护的天数"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="陪护成员"
                value={generateDutyForm.memberId}
                onChange={(e) => setGenerateDutyForm({ ...generateDutyForm, memberId: e.target.value })}
                options={members.map(m => ({ value: m.id, label: `${m.avatar} ${m.name}` }))}
              />
              <Select
                label="值班角色"
                value={generateDutyForm.role}
                onChange={(e) => setGenerateDutyForm({ ...generateDutyForm, role: e.target.value as DutyRole })}
                options={[
                  { value: '主要陪护', label: '主要陪护' },
                  { value: '陪同就诊', label: '陪同就诊' },
                  { value: '后勤支持', label: '后勤支持' },
                  { value: '心理支持', label: '心理支持' },
                  { value: '工作对接', label: '工作对接' },
                  { value: '其他', label: '其他' },
                ]}
              />
            </div>
            
            <div className="p-3 bg-warmGray-50 rounded-lg">
              <p className="text-sm text-warmGray-600">
                将为以下日期生成陪护草稿：
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(() => {
                  const dates = [];
                  const treatmentDate = new Date(selectedTreatmentDate.date);
                  for (let i = -generateDutyForm.daysBefore; i <= generateDutyForm.daysAfter; i++) {
                    const d = new Date(treatmentDate);
                    d.setDate(d.getDate() + i);
                    dates.push(d);
                  }
                  return dates.map((d, idx) => (
                    <Badge key={idx} variant="default">
                      {formatDate(d, 'M月d日')}
                    </Badge>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
