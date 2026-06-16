import { useState, useMemo } from 'react';
import { 
  Plus, CalendarDays, Calendar, Clock, AlertTriangle, 
  Edit2, Trash2, FileText, User, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock3
} from 'lucide-react';
import { useLeaveStore } from '@/store/useLeaveStore';
import { formatMoney, formatDisplayDate, formatDate, getCalendarDays, isSameDate, getDaysDiff } from '@/utils/date';
import type { LeaveType, LeaveStatus, TreatmentDateType } from '@/types/leave';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const LEAVE_COLORS: Record<LeaveType, string> = {
  '病假': '#F26B6B',
  '年假': '#3DBAB0',
  '事假': '#FF9F6B',
  '调休': '#A78BFA',
};

const STATUS_COLORS: Record<LeaveStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  '已批准': 'success',
  '待审批': 'warning',
  '已取消': 'danger',
};

const TREATMENT_ICONS: Record<TreatmentDateType, React.ReactNode> = {
  '检查': <Calendar className="w-4 h-4" />,
  '取卵': <Clock3 className="w-4 h-4" />,
  '移植': <CheckCircle2 className="w-4 h-4" />,
  '复查': <CalendarDays className="w-4 h-4" />,
  '其他': <Calendar className="w-4 h-4" />,
};

const MATERIAL_LIST = [
  { id: '1', name: '诊断证明书（加盖医院公章）', category: '医院材料', required: true },
  { id: '2', name: '门诊病历复印件', category: '医院材料', required: true },
  { id: '3', name: '检查报告单复印件', category: '医院材料', required: false },
  { id: '4', name: '请假申请单', category: '单位材料', required: true },
  { id: '5', name: '工作交接清单', category: '单位材料', required: false },
  { id: '6', name: '紧急联系人说明', category: '单位材料', required: false },
];

export default function LeavePage() {
  const { records, treatmentDates, leaveTotals, addLeave, updateLeave, deleteLeave, addTreatmentDate, updateTreatmentDate, deleteTreatmentDate, getLeaveBalances, updateLeaveTotals, getRescheduleImpact } = useLeaveStore();
  
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingLeave, setEditingLeave] = useState<string | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<string | null>(null);
  const [rescheduleWarning, setRescheduleWarning] = useState<{ oldDate: string; newDate: string; impact: ReturnType<typeof getRescheduleImpact> } | null>(null);
  
  const [leaveForm, setLeaveForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: '病假' as LeaveType,
    contactPerson: '',
    status: '待审批' as LeaveStatus,
    reason: '',
  });
  
  const [treatmentForm, setTreatmentForm] = useState({
    type: '检查' as TreatmentDateType,
    date: new Date().toISOString().split('T')[0],
    description: '',
    isConfirmed: true,
  });

  const leaveBalances = useMemo(() => getLeaveBalances(), [records, leaveTotals]);
  const calendarDays = useMemo(() => getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()), [currentMonth]);
  
  const pieData = useMemo(() => leaveBalances.map(b => ({
    name: b.type,
    value: b.used,
    color: LEAVE_COLORS[b.type],
  })), [leaveBalances]);

  const totalLeaveDays = useMemo(() => 
    records.filter(r => r.status !== '已取消').reduce((sum, r) => sum + r.days, 0),
  [records]);

  const confirmedTreatments = useMemo(() => 
    treatmentDates.filter(t => t.isConfirmed).sort((a, b) => a.date.localeCompare(b.date)),
  [treatmentDates]);

  const handleOpenLeaveModal = (record?: typeof records[0]) => {
    if (record) {
      setEditingLeave(record.id);
      setLeaveForm({
        startDate: record.startDate,
        endDate: record.endDate,
        type: record.type,
        contactPerson: record.contactPerson,
        status: record.status,
        reason: record.reason,
      });
    } else {
      setEditingLeave(null);
      setLeaveForm({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: '病假',
        contactPerson: '',
        status: '待审批',
        reason: '',
      });
    }
    setLeaveModalOpen(true);
  };

  const handleOpenTreatmentModal = (treatment?: typeof treatmentDates[0]) => {
    if (treatment) {
      setEditingTreatment(treatment.id);
      setTreatmentForm({
        type: treatment.type,
        date: treatment.date,
        description: treatment.description,
        isConfirmed: treatment.isConfirmed,
      });
    } else {
      setEditingTreatment(null);
      setTreatmentForm({
        type: '检查',
        date: new Date().toISOString().split('T')[0],
        description: '',
        isConfirmed: true,
      });
    }
    setTreatmentModalOpen(true);
  };

  const handleSubmitLeave = () => {
    const days = getDaysDiff(leaveForm.startDate, leaveForm.endDate);
    const leaveData = {
      ...leaveForm,
      days: Math.max(1, days),
    };
    
    if (editingLeave) {
      updateLeave(editingLeave, leaveData);
    } else {
      addLeave(leaveData);
    }
    
    setLeaveModalOpen(false);
  };

  const handleSubmitTreatment = () => {
    if (editingTreatment) {
      const oldTreatment = treatmentDates.find(t => t.id === editingTreatment);
      if (oldTreatment && oldTreatment.date !== treatmentForm.date) {
        const impact = getRescheduleImpact(oldTreatment.date, treatmentForm.date);
        if (impact.totalAffected > 0) {
          setRescheduleWarning({
            oldDate: oldTreatment.date,
            newDate: treatmentForm.date,
            impact,
          });
          return;
        }
      }
      updateTreatmentDate(editingTreatment, treatmentForm);
    } else {
      addTreatmentDate(treatmentForm);
    }
    
    setTreatmentModalOpen(false);
  };

  const confirmReschedule = () => {
    if (editingTreatment && rescheduleWarning) {
      updateTreatmentDate(editingTreatment, {
        ...treatmentForm,
        date: rescheduleWarning.newDate,
      });
      setRescheduleWarning(null);
      setTreatmentModalOpen(false);
    }
  };

  const getLeaveForDate = (date: Date) => {
    return records.filter(r => 
      r.status !== '已取消' &&
      new Date(r.startDate) <= date && 
      new Date(r.endDate) >= date
    );
  };

  const getTreatmentForDate = (date: Date) => {
    return treatmentDates.find(t => isSameDate(t.date, date));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">请假安排</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleOpenTreatmentModal()}>
            <Calendar className="w-4 h-4" />
            添加治疗日期
          </Button>
          <Button onClick={() => handleOpenLeaveModal()}>
            <Plus className="w-4 h-4" />
            登记请假
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.map((balance) => (
          <StatCard
            key={balance.type}
            title={balance.type}
            value={`${balance.used} / ${balance.total}`}
            subtitle={`剩余 ${balance.remaining} 天`}
            gradient={`from-[${LEAVE_COLORS[balance.type]}] to-[${LEAVE_COLORS[balance.type]}]/80`}
            icon={<Clock className="w-6 h-6 text-white" />}
            className="bg-opacity-90"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>请假日历</CardTitle>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-1 hover:bg-warmGray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-warmGray-600" />
              </button>
              <span className="font-medium text-warmGray-800 min-w-[120px] text-center">
                {formatDate(currentMonth, 'yyyy年M月')}
              </span>
              <button onClick={nextMonth} className="p-1 hover:bg-warmGray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-warmGray-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-warmGray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                const dayLeaves = getLeaveForDate(date);
                const treatment = getTreatmentForDate(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = isSameDate(date, new Date());
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] p-1 rounded-lg border transition-all ${
                      isCurrentMonth ? 'bg-white border-warmGray-200' : 'bg-warmGray-50 border-transparent opacity-50'
                    } ${isToday ? 'ring-2 ring-primary-400' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-600' : isCurrentMonth ? 'text-warmGray-700' : 'text-warmGray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    {treatment && (
                      <div className="text-xs p-1 bg-primary-100 text-primary-700 rounded mb-1 truncate">
                        {TREATMENT_ICONS[treatment.type]} {treatment.type}
                      </div>
                    )}
                    {dayLeaves.slice(0, 1).map(leave => (
                      <div 
                        key={leave.id}
                        className="text-xs p-1 rounded mb-1 truncate"
                        style={{ backgroundColor: `${LEAVE_COLORS[leave.type]}20`, color: LEAVE_COLORS[leave.type] }}
                      >
                        {leave.type}
                      </div>
                    ))}
                    {dayLeaves.length > 1 && (
                      <div className="text-xs text-warmGray-500">+{dayLeaves.length - 1} 更多</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>假期使用分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}天`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 天`, '已使用']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-warmGray-100">
              <div className="flex items-center justify-between">
                <span className="text-warmGray-600">累计请假</span>
                <span className="text-2xl font-bold text-warmGray-800 font-mono">{totalLeaveDays} 天</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>治疗日期安排</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {confirmedTreatments.length === 0 ? (
              <div className="text-center py-8 text-warmGray-500">
                暂无治疗安排
              </div>
            ) : (
              confirmedTreatments.map(treatment => (
                <div 
                  key={treatment.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    treatment.isConfirmed ? 'border-primary-500 bg-primary-50/50' : 'border-warmGray-300 bg-warmGray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        treatment.isConfirmed ? 'bg-primary-100 text-primary-600' : 'bg-warmGray-200 text-warmGray-600'
                      }`}>
                        {TREATMENT_ICONS[treatment.type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-warmGray-800">{treatment.type}</h4>
                          {treatment.isConfirmed ? (
                            <Badge variant="success">已确认</Badge>
                          ) : (
                            <Badge variant="warning">待确认</Badge>
                          )}
                        </div>
                        <p className="text-sm text-warmGray-600 mt-1">
                          {formatDisplayDate(treatment.date)}
                        </p>
                        {treatment.description && (
                          <p className="text-sm text-warmGray-500 mt-1">{treatment.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenTreatmentModal(treatment)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTreatmentDate(treatment.id)}
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

        <Card>
          <CardHeader>
            <CardTitle>请假记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {records.length === 0 ? (
              <div className="text-center py-8 text-warmGray-500">
                暂无请假记录
              </div>
            ) : (
              records.map(record => (
                <div 
                  key={record.id}
                  className="p-4 bg-warmGray-50 rounded-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: LEAVE_COLORS[record.type] }}
                        />
                        <h4 className="font-medium text-warmGray-800">{record.type}</h4>
                        <Badge variant={STATUS_COLORS[record.status]}>{record.status}</Badge>
                      </div>
                      <p className="text-sm text-warmGray-600">
                        {formatDisplayDate(record.startDate)} - {formatDisplayDate(record.endDate)}
                        <span className="ml-2">共 {record.days} 天</span>
                      </p>
                      <p className="text-sm text-warmGray-500 mt-1">{record.reason}</p>
                      <p className="text-xs text-warmGray-400 mt-1">
                        <User className="w-3 h-3 inline mr-1" />
                        工作交接：{record.contactPerson}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleOpenLeaveModal(record)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLeave(record.id)}
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
            <FileText className="w-5 h-5 text-primary-500" />
            单位请假证明材料清单
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['医院材料', '单位材料'].map(category => (
              <div key={category}>
                <h4 className="font-medium text-warmGray-700 mb-3">{category}</h4>
                <div className="space-y-2">
                  {MATERIAL_LIST.filter(m => m.category === category).map(item => (
                    <label 
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-warmGray-50 rounded-lg cursor-pointer hover:bg-warmGray-100 transition-colors"
                    >
                      <input type="checkbox" className="mt-1 w-4 h-4 text-primary-500 rounded" />
                      <div>
                        <span className="text-warmGray-800">{item.name}</span>
                        {item.required && (
                          <span className="ml-2 text-xs text-danger-500">*必需</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title={editingLeave ? '编辑请假' : '登记请假'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitLeave}>
              {editingLeave ? '保存修改' : '添加请假'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="开始日期"
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
            />
            <Input
              label="结束日期"
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
            />
          </div>
          <div className="p-3 bg-primary-50 rounded-lg text-center">
            <span className="text-primary-700">
              共计 <strong>{getDaysDiff(leaveForm.startDate, leaveForm.endDate)}</strong> 天
            </span>
          </div>
          <Select
            label="请假类型"
            value={leaveForm.type}
            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as LeaveType })}
            options={[
              { value: '病假', label: '病假' },
              { value: '年假', label: '年假' },
              { value: '事假', label: '事假' },
              { value: '调休', label: '调休' },
            ]}
          />
          <Select
            label="审批状态"
            value={leaveForm.status}
            onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value as LeaveStatus })}
            options={[
              { value: '待审批', label: '待审批' },
              { value: '已批准', label: '已批准' },
              { value: '已取消', label: '已取消' },
            ]}
          />
          <Input
            label="工作交接人"
            value={leaveForm.contactPerson}
            onChange={(e) => setLeaveForm({ ...leaveForm, contactPerson: e.target.value })}
            placeholder="请输入同事姓名"
          />
          <TextArea
            label="请假事由"
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            placeholder="简要说明请假原因..."
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        isOpen={treatmentModalOpen}
        onClose={() => setTreatmentModalOpen(false)}
        title={editingTreatment ? '编辑治疗日期' : '添加治疗日期'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTreatmentModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitTreatment}>
              {editingTreatment ? '保存修改' : '添加日期'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="治疗类型"
            value={treatmentForm.type}
            onChange={(e) => setTreatmentForm({ ...treatmentForm, type: e.target.value as TreatmentDateType })}
            options={[
              { value: '检查', label: '检查' },
              { value: '取卵', label: '取卵' },
              { value: '移植', label: '移植' },
              { value: '复查', label: '复查' },
              { value: '其他', label: '其他' },
            ]}
          />
          <Input
            label="治疗日期"
            type="date"
            value={treatmentForm.date}
            onChange={(e) => setTreatmentForm({ ...treatmentForm, date: e.target.value })}
          />
          <TextArea
            label="注意事项"
            value={treatmentForm.description}
            onChange={(e) => setTreatmentForm({ ...treatmentForm, description: e.target.value })}
            placeholder="如：空腹、憋尿、带齐资料等..."
            rows={3}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={treatmentForm.isConfirmed}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, isConfirmed: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded"
            />
            <span className="text-warmGray-700">日期已确认</span>
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={!!rescheduleWarning}
        onClose={() => setRescheduleWarning(null)}
        title="改期影响提示"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRescheduleWarning(null)}>
              取消修改
            </Button>
            <Button variant="danger" onClick={confirmReschedule}>
              确认改期
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-accent-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-warmGray-800 mb-1">改期将影响以下安排</h4>
              <p className="text-sm text-warmGray-600">
                从 {formatDisplayDate(rescheduleWarning?.oldDate || '')} 改到 {formatDisplayDate(rescheduleWarning?.newDate || '')}
              </p>
            </div>
          </div>
          
          {rescheduleWarning?.impact.leaves.length! > 0 && (
            <div>
              <h5 className="font-medium text-warmGray-700 mb-2">受影响的请假：</h5>
              <div className="space-y-2">
                {rescheduleWarning?.impact.leaves.map(leave => (
                  <div key={leave.id} className="p-3 bg-warmGray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>{leave.type}：{formatDisplayDate(leave.startDate)} - {formatDisplayDate(leave.endDate)}</span>
                      <Badge variant="warning">{leave.days}天</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-warmGray-500">
            改期后请记得同步调整请假、交通和住宿安排。
          </p>
        </div>
      </Modal>
    </div>
  );
}
