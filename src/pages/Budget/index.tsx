import { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingDown, TrendingUp, Edit2, Trash2, Stethoscope, Pill, Scissors, Microscope, MoreHorizontal } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { calculateStageStats, groupExpensesByMonth } from '@/utils/calculation';
import { formatMoney, formatDisplayDate } from '@/utils/date';
import type { ExpenseCategory, StageName } from '@/types/budget';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ExpenseChart from '@/components/charts/ExpenseChart';
import Timeline from '@/components/ui/Timeline';
import EmptyState from '@/components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  '检查费': <Stethoscope className="w-4 h-4" />,
  '药品费': <Pill className="w-4 h-4" />,
  '手术费': <Scissors className="w-4 h-4" />,
  '化验费': <Microscope className="w-4 h-4" />,
  '其他': <MoreHorizontal className="w-4 h-4" />,
};

const STAGE_COLORS: Record<StageName, string> = {
  '术前检查': 'from-blue-500 to-blue-600',
  '促排卵': 'from-primary-500 to-primary-600',
  '取卵': 'from-accent-500 to-accent-600',
  '移植': 'from-pink-500 to-pink-600',
  '黄体支持': 'from-purple-500 to-purple-600',
  '其他': 'from-warmGray-500 to-warmGray-600',
};

const STATUS_COLORS = {
  '已完成': 'success',
  '进行中': 'warning',
  '未开始': 'default',
} as const;

export default function BudgetPage() {
  const { stages, expenses, addExpense, updateExpense, deleteExpense, updateStageBudget, getTotalBudget, getTotalExpense } = useBudgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{ id: string; stageId: string; category: ExpenseCategory; amount: number; date: string; description: string } | null>(null);
  const [formData, setFormData] = useState({
    stageId: '',
    category: '检查费' as ExpenseCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const stageStats = useMemo(() => calculateStageStats(stages, expenses), [stages, expenses]);
  const monthlyExpenses = useMemo(() => groupExpensesByMonth(expenses), [expenses]);
  const totalBudget = getTotalBudget();
  const totalExpense = getTotalExpense();
  const remaining = totalBudget - totalExpense;
  const progress = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const isOverBudget = totalExpense > totalBudget;

  const timelineItems = useMemo(() => expenses.map(exp => ({
    id: exp.id,
    date: exp.date,
    title: exp.description,
    description: `${stageStats.find(s => s.id === exp.stageId)?.name || ''}`,
    amount: exp.amount,
    category: exp.category,
    icon: CATEGORY_ICONS[exp.category],
  })), [expenses, stageStats]);

  const handleOpenModal = (expense?: typeof editingExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        stageId: expense.stageId,
        category: expense.category,
        amount: expense.amount.toString(),
        date: expense.date,
        description: expense.description,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        stageId: stages.find(s => s.status === '进行中')?.id || stages[0]?.id || '',
        category: '检查费',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.stageId || !formData.amount || !formData.date) return;
    
    const expenseData = {
      stageId: formData.stageId,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条支出记录吗？')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">疗程预算</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          登记支出
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="总预算"
          value={totalBudget}
          isMoney
          gradient="from-primary-500 to-primary-600"
          icon={<Wallet className="w-6 h-6 text-white" />}
        />
        <StatCard
          title="已支出"
          value={totalExpense}
          isMoney
          gradient="from-accent-500 to-accent-600"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend={totalBudget > 0 ? Math.round(progress) : undefined}
        />
        <StatCard
          title="剩余预算"
          value={remaining}
          isMoney
          gradient={isOverBudget ? 'from-danger-500 to-danger-600' : 'from-green-500 to-green-600'}
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          subtitle={isOverBudget ? '已超支，请控制支出' : '预算充足'}
        />
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            <Wallet className="w-5 h-5 text-primary-500" />
            总体进度
          </h2>
          <span className="text-sm text-warmGray-500">
            {progress.toFixed(1)}% 已使用
          </span>
        </div>
        <ProgressBar progress={progress} isOverBudget={isOverBudget} height="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>阶段预算</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stageStats.map((stage) => (
              <div key={stage.id} className="p-4 bg-warmGray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${STAGE_COLORS[stage.name]}`} />
                    <span className="font-medium text-warmGray-800">{stage.name}</span>
                    <Badge variant={STATUS_COLORS[stage.status]}>{stage.status}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-warmGray-800">
                      {formatMoney(stage.spent)} / {formatMoney(stage.budgetAmount)}
                    </p>
                    <p className={`text-sm ${stage.isOverBudget ? 'text-danger-500' : 'text-warmGray-500'}`}>
                      {stage.isOverBudget 
                        ? `超支 ${formatMoney(Math.abs(stage.remaining))}` 
                        : `剩余 ${formatMoney(stage.remaining)}`}
                    </p>
                  </div>
                </div>
                <ProgressBar progress={stage.progress} isOverBudget={stage.isOverBudget} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支出记录</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <EmptyState
                title="暂无支出记录"
                description="点击右上角按钮登记您的第一笔支出"
                action={<Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4" /> 登记支出</Button>}
              />
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                {expenses.slice(0, 10).map((expense) => {
                  const stage = stageStats.find(s => s.id === expense.stageId);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-warmGray-50 rounded-lg hover:bg-warmGray-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-primary-500">
                          {CATEGORY_ICONS[expense.category]}
                        </div>
                        <div>
                          <p className="font-medium text-warmGray-800">{expense.description}</p>
                          <div className="flex items-center gap-2 text-sm text-warmGray-500">
                            <span>{formatDisplayDate(expense.date)}</span>
                            <span>·</span>
                            <span>{expense.category}</span>
                            <span>·</span>
                            <span>{stage?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-warmGray-800">
                          {formatMoney(expense.amount)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => handleOpenModal({
                              id: expense.id,
                              stageId: expense.stageId,
                              category: expense.category,
                              amount: expense.amount,
                              date: expense.date,
                              description: expense.description,
                            })}
                            className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExpenseChart monthlyData={monthlyExpenses} stageData={stageStats} />

      <Card>
        <CardHeader>
          <CardTitle>支出时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            items={timelineItems}
            formatDate={formatDisplayDate}
            formatAmount={formatMoney}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? '编辑支出' : '登记支出'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.amount || !formData.date}>
              {editingExpense ? '保存修改' : '添加支出'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="治疗阶段"
            value={formData.stageId}
            onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
            options={stages.map(s => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="支出类别"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            options={[
              { value: '检查费', label: '检查费' },
              { value: '药品费', label: '药品费' },
              { value: '手术费', label: '手术费' },
              { value: '化验费', label: '化验费' },
              { value: '其他', label: '其他' },
            ]}
          />
          <Input
            label="金额 (元)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="请输入金额"
          />
          <Input
            label="日期"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <TextArea
            label="支出说明"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="简要描述这笔支出的用途..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
