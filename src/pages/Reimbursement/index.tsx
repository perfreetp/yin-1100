import { useState, useMemo } from 'react';
import { 
  Plus, FileText, Receipt, Upload, CheckCircle, Clock, 
  Edit2, Trash2, CheckSquare, Square, Download,
  Stethoscope, Pill, Scissors, Microscope, MoreHorizontal
} from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { formatMoney, formatDisplayDate } from '@/utils/date';
import type { ReceiptCategory, ReimbursementStatus, MaterialCategory } from '@/types/reimbursement';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

const CATEGORY_ICONS: Record<ReceiptCategory, React.ReactNode> = {
  '检查费': <Stethoscope className="w-4 h-4" />,
  '药品费': <Pill className="w-4 h-4" />,
  '手术费': <Scissors className="w-4 h-4" />,
  '化验费': <Microscope className="w-4 h-4" />,
  '治疗费': <Stethoscope className="w-4 h-4" />,
  '其他': <MoreHorizontal className="w-4 h-4" />,
};

const RECEIPT_COLORS: Record<ReceiptCategory, string> = {
  '检查费': 'bg-blue-100 text-blue-600',
  '药品费': 'bg-green-100 text-green-600',
  '手术费': 'bg-purple-100 text-purple-600',
  '化验费': 'bg-yellow-100 text-yellow-600',
  '治疗费': 'bg-pink-100 text-pink-600',
  '其他': 'bg-warmGray-100 text-warmGray-600',
};

const STATUS_COLORS: Record<ReimbursementStatus, 'success' | 'warning' | 'accent' | 'default' | 'danger'> = {
  '未提交': 'default',
  '已提交': 'warning',
  '审核中': 'accent',
  '已报销': 'success',
  '已拒绝': 'danger',
};

const RECEIPT_CATEGORIES: ReceiptCategory[] = ['检查费', '药品费', '手术费', '化验费', '治疗费', '其他'];

export default function ReimbursementPage() {
  const { receipts, reimbursements, materials, addReceipt, updateReceipt, deleteReceipt, addReimbursement, updateReimbursement, deleteReimbursement, toggleMaterial, getStats } = useReimbursementStore();
  
  const [activeTab, setActiveTab] = useState<ReceiptCategory | 'all'>('all');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [reimbursementModalOpen, setReimbursementModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);
  const [editingReimbursement, setEditingReimbursement] = useState<string | null>(null);
  
  const [receiptForm, setReceiptForm] = useState({
    category: '检查费' as ReceiptCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    hospital: '',
    description: '',
    hasReceipt: true,
    isReimbursed: false,
  });
  
  const [reimbursementForm, setReimbursementForm] = useState({
    title: '',
    amount: '',
    submitDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    actualAmount: '',
    actualDate: '',
    status: '未提交' as ReimbursementStatus,
    notes: '',
  });

  const stats = useMemo(() => getStats(), [receipts, reimbursements]);

  const filteredReceipts = useMemo(() => {
    if (activeTab === 'all') return receipts;
    return receipts.filter(r => r.category === activeTab);
  }, [receipts, activeTab]);

  const groupedMaterials = useMemo(() => {
    const groups: Record<MaterialCategory, typeof materials> = {
      '医院材料': [],
      '社保材料': [],
      '单位材料': [],
      '其他材料': [],
    };
    materials.forEach(m => groups[m.category].push(m));
    return groups;
  }, [materials]);

  const categoryStats = useMemo(() => {
    return RECEIPT_CATEGORIES.map(cat => ({
      category: cat,
      total: receipts.filter(r => r.category === cat).reduce((sum, r) => sum + r.amount, 0),
      count: receipts.filter(r => r.category === cat).length,
    })).filter(s => s.count > 0);
  }, [receipts]);

  const handleOpenReceiptModal = (receipt?: typeof receipts[0]) => {
    if (receipt) {
      setEditingReceipt(receipt.id);
      setReceiptForm({
        category: receipt.category,
        amount: receipt.amount.toString(),
        date: receipt.date,
        hospital: receipt.hospital || '',
        description: receipt.description || '',
        hasReceipt: receipt.hasReceipt,
        isReimbursed: receipt.isReimbursed,
      });
    } else {
      setEditingReceipt(null);
      setReceiptForm({
        category: '检查费',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        hospital: '',
        description: '',
        hasReceipt: true,
        isReimbursed: false,
      });
    }
    setReceiptModalOpen(true);
  };

  const handleOpenReimbursementModal = (reimbursement?: typeof reimbursements[0]) => {
    if (reimbursement) {
      setEditingReimbursement(reimbursement.id);
      setReimbursementForm({
        title: reimbursement.title,
        amount: reimbursement.amount.toString(),
        submitDate: reimbursement.submitDate,
        expectedDate: reimbursement.expectedDate || '',
        actualAmount: reimbursement.actualAmount?.toString() || '',
        actualDate: reimbursement.actualDate || '',
        status: reimbursement.status,
        notes: reimbursement.notes || '',
      });
    } else {
      setEditingReimbursement(null);
      setReimbursementForm({
        title: '',
        amount: '',
        submitDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        actualAmount: '',
        actualDate: '',
        status: '未提交',
        notes: '',
      });
    }
    setReimbursementModalOpen(true);
  };

  const handleSubmitReceipt = () => {
    const receiptData = {
      ...receiptForm,
      amount: parseFloat(receiptForm.amount) || 0,
    };
    
    if (editingReceipt) {
      updateReceipt(editingReceipt, receiptData);
    } else {
      addReceipt(receiptData);
    }
    
    setReceiptModalOpen(false);
  };

  const handleSubmitReimbursement = () => {
    const reimbursementData = {
      ...reimbursementForm,
      amount: parseFloat(reimbursementForm.amount) || 0,
      actualAmount: reimbursementForm.actualAmount ? parseFloat(reimbursementForm.actualAmount) : undefined,
    };
    
    if (editingReimbursement) {
      updateReimbursement(editingReimbursement, reimbursementData);
    } else {
      addReimbursement(reimbursementData);
    }
    
    setReimbursementModalOpen(false);
  };

  const categoryProgress = useMemo(() => {
    const total = stats.totalAmount;
    if (total === 0) return 0;
    return (stats.reimbursedAmount / total) * 100;
  }, [stats]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">报销资料</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleOpenReimbursementModal()}>
            <FileText className="w-4 h-4" />
            报销申请
          </Button>
          <Button onClick={() => handleOpenReceiptModal()}>
            <Plus className="w-4 h-4" />
            添加票据
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="票据总额"
          value={stats.totalAmount}
          isMoney
          gradient="from-primary-500 to-primary-600"
          icon={<Receipt className="w-6 h-6 text-white" />}
          subtitle={`${receipts.length} 张票据`}
        />
        <StatCard
          title="已报销"
          value={stats.reimbursedAmount}
          isMoney
          gradient="from-green-500 to-green-600"
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          subtitle={`${stats.reimbursedReceipts} 张已报销`}
        />
        <StatCard
          title="待报销"
          value={stats.pendingAmount}
          isMoney
          gradient="from-accent-500 to-accent-600"
          icon={<Clock className="w-6 h-6 text-white" />}
          subtitle={`${stats.pendingReceipts} 张待报销`}
        />
        <StatCard
          title="报销进度"
          value={`${categoryProgress.toFixed(0)}%`}
          gradient="from-purple-500 to-purple-600"
          icon={<Upload className="w-6 h-6 text-white" />}
          subtitle={`${reimbursements.length} 次申请`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            <Receipt className="w-5 h-5 text-primary-500" />
            报销总进度
          </h2>
          <span className="text-sm text-warmGray-500">
            {formatMoney(stats.reimbursedAmount)} / {formatMoney(stats.totalAmount)}
          </span>
        </div>
        <ProgressBar progress={categoryProgress} height="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>票据管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-warmGray-100 text-warmGray-600 hover:bg-warmGray-200'
                }`}
              >
                全部 ({receipts.length})
              </button>
              {RECEIPT_CATEGORIES.map(cat => {
                const count = receipts.filter(r => r.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === cat 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-warmGray-100 text-warmGray-600 hover:bg-warmGray-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {filteredReceipts.length === 0 ? (
              <EmptyState
                title="暂无票据"
                description="点击右上角按钮添加您的票据"
                icon={<Receipt className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredReceipts.map(receipt => (
                  <div 
                    key={receipt.id}
                    className="p-4 bg-warmGray-50 rounded-xl group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${RECEIPT_COLORS[receipt.category]}`}>
                        {CATEGORY_ICONS[receipt.category]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-warmGray-800">
                            {receipt.hospital || '医院票据'}
                          </h4>
                          <Badge variant={receipt.isReimbursed ? 'success' : 'warning'}>
                            {receipt.isReimbursed ? '已报销' : '待报销'}
                          </Badge>
                          {!receipt.hasReceipt && (
                            <Badge variant="danger">无票据</Badge>
                          )}
                        </div>
                        <p className="text-sm text-warmGray-600">
                          {receipt.category} · {formatDisplayDate(receipt.date)}
                        </p>
                        {receipt.description && (
                          <p className="text-xs text-warmGray-500 mt-1">{receipt.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-warmGray-800">
                        {formatMoney(receipt.amount)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleOpenReceiptModal(receipt)}
                          className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReceipt(receipt.id)}
                          className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分类统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.length === 0 ? (
              <div className="text-center py-8 text-warmGray-500">
                暂无数据
              </div>
            ) : (
              categoryStats.map(stat => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${RECEIPT_COLORS[stat.category]}`}>
                        {CATEGORY_ICONS[stat.category]}
                      </div>
                      <span className="text-sm text-warmGray-600">{stat.category}</span>
                    </div>
                    <span className="font-mono font-medium text-warmGray-800">
                      {formatMoney(stat.total)}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={stats.totalAmount > 0 ? (stat.total / stats.totalAmount) * 100 : 0} 
                    height="sm"
                  />
                  <p className="text-xs text-warmGray-400 mt-1">{stat.count} 张票据</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckSquare className="w-5 h-5 text-primary-500" />
              报销材料清单
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(['医院材料', '社保材料', '单位材料', '其他材料'] as MaterialCategory[]).map(category => {
              const items = groupedMaterials[category];
              if (items.length === 0) return null;
              return (
                <div key={category} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-warmGray-700 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <label 
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-warmGray-50 rounded-lg cursor-pointer hover:bg-warmGray-100 transition-colors"
                      >
                        <button
                          onClick={() => toggleMaterial(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-primary-500" />
                          ) : (
                            <Square className="w-5 h-5 text-warmGray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <span className={item.isCompleted ? 'text-warmGray-400 line-through' : 'text-warmGray-800'}>
                            {item.name}
                          </span>
                          {item.required && (
                            <span className="ml-2 text-xs text-danger-500">*必需</span>
                          )}
                          {item.description && (
                            <p className="text-xs text-warmGray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <FileText className="w-5 h-5 text-primary-500" />
              报销申请记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reimbursements.length === 0 ? (
              <EmptyState
                title="暂无报销申请"
                description="点击右上角按钮创建报销申请"
                icon={<FileText className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              reimbursements.map(application => (
                <div 
                  key={application.id}
                  className="p-4 bg-warmGray-50 rounded-xl group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-warmGray-800">{application.title}</h4>
                        <Badge variant={STATUS_COLORS[application.status]}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-warmGray-600">
                        申请金额：{formatMoney(application.amount)}
                      </p>
                      {application.actualAmount !== undefined && (
                        <p className="text-sm text-green-600">
                          实际到账：{formatMoney(application.actualAmount)}
                        </p>
                      )}
                      <p className="text-xs text-warmGray-500 mt-1">
                        提交日期：{formatDisplayDate(application.submitDate)}
                        {application.expectedDate && ` · 预计到账：${formatDisplayDate(application.expectedDate)}`}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleOpenReimbursementModal(application)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReimbursement(application.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {application.status !== '未提交' && (
                    <div className="pt-2 border-t border-warmGray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-warmGray-500">进度</span>
                        <span className="text-warmGray-600">
                          {application.status === '已提交' && '已提交，等待审核'}
                          {application.status === '审核中' && '医保部门审核中'}
                          {application.status === '已报销' && '报销完成'}
                          {application.status === '已拒绝' && '请补充材料后重新提交'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title={editingReceipt ? '编辑票据' : '添加票据'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiptModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReceipt}>
              {editingReceipt ? '保存修改' : '添加票据'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="票据类别"
              value={receiptForm.category}
              onChange={(e) => setReceiptForm({ ...receiptForm, category: e.target.value as ReceiptCategory })}
              options={RECEIPT_CATEGORIES.map(c => ({ value: c, label: c }))}
            />
            <Input
              label="金额 (元)"
              type="number"
              value={receiptForm.amount}
              onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
              placeholder="票据金额"
            />
          </div>
          <Input
            label="日期"
            type="date"
            value={receiptForm.date}
            onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
          />
          <Input
            label="医院名称"
            value={receiptForm.hospital}
            onChange={(e) => setReceiptForm({ ...receiptForm, hospital: e.target.value })}
            placeholder="开具票据的医院"
          />
          <TextArea
            label="备注"
            value={receiptForm.description}
            onChange={(e) => setReceiptForm({ ...receiptForm, description: e.target.value })}
            placeholder="票据详情说明..."
            rows={2}
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={receiptForm.hasReceipt}
                onChange={(e) => setReceiptForm({ ...receiptForm, hasReceipt: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-warmGray-700">有纸质票据</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={receiptForm.isReimbursed}
                onChange={(e) => setReceiptForm({ ...receiptForm, isReimbursed: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-warmGray-700">已报销</span>
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={reimbursementModalOpen}
        onClose={() => setReimbursementModalOpen(false)}
        title={editingReimbursement ? '编辑报销申请' : '创建报销申请'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReimbursementModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReimbursement}>
              {editingReimbursement ? '保存修改' : '创建申请'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="申请标题"
            value={reimbursementForm.title}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, title: e.target.value })}
            placeholder="如：2024年第一次报销"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="申请金额 (元)"
              type="number"
              value={reimbursementForm.amount}
              onChange={(e) => setReimbursementForm({ ...reimbursementForm, amount: e.target.value })}
              placeholder="申请报销的总金额"
            />
            <Select
              label="当前状态"
              value={reimbursementForm.status}
              onChange={(e) => setReimbursementForm({ ...reimbursementForm, status: e.target.value as ReimbursementStatus })}
              options={[
                { value: '未提交', label: '未提交' },
                { value: '已提交', label: '已提交' },
                { value: '审核中', label: '审核中' },
                { value: '已报销', label: '已报销' },
                { value: '已拒绝', label: '已拒绝' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="提交日期"
              type="date"
              value={reimbursementForm.submitDate}
              onChange={(e) => setReimbursementForm({ ...reimbursementForm, submitDate: e.target.value })}
            />
            <Input
              label="预计到账日期"
              type="date"
              value={reimbursementForm.expectedDate}
              onChange={(e) => setReimbursementForm({ ...reimbursementForm, expectedDate: e.target.value })}
            />
          </div>
          {(reimbursementForm.status === '已报销' || reimbursementForm.actualAmount) && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="实际到账金额 (元)"
                type="number"
                value={reimbursementForm.actualAmount}
                onChange={(e) => setReimbursementForm({ ...reimbursementForm, actualAmount: e.target.value })}
                placeholder="实际报销到账金额"
              />
              <Input
                label="实际到账日期"
                type="date"
                value={reimbursementForm.actualDate}
                onChange={(e) => setReimbursementForm({ ...reimbursementForm, actualDate: e.target.value })}
              />
            </div>
          )}
          <TextArea
            label="备注"
            value={reimbursementForm.notes}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, notes: e.target.value })}
            placeholder="报销相关备注信息..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
