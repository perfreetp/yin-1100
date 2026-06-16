import { useState, useMemo } from 'react';
import { 
  Plus, FileText, Receipt as ReceiptIcon, Upload, CheckCircle, Clock, 
  Edit2, Trash2, CheckSquare, Square, Download,
  Stethoscope, Pill, Scissors, Microscope, MoreHorizontal,
  Package, ChevronDown, ChevronUp, AlertTriangle, X
} from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { formatMoney, formatDisplayDate } from '@/utils/date';
import type { ReceiptCategory, ReimbursementStatus, MaterialCategory, MaterialItem, Receipt } from '@/types/reimbursement';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

const PAGE_TABS = ['票据管理', '报销包整理'] as const;
type PageTab = typeof PAGE_TABS[number];

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
const MATERIAL_CATEGORIES: MaterialCategory[] = ['医院材料', '社保材料', '单位材料', '其他材料'];

export default function ReimbursementPage() {
  const {
    receipts, reimbursements, materials,
    addReceipt, updateReceipt, deleteReceipt,
    addReimbursement, updateReimbursement, deleteReimbursement,
    addMaterial, updateMaterial, toggleMaterial, deleteMaterial,
    getStats,
    addReceiptToReimbursement, removeReceiptFromReimbursement,
    addMaterialToReimbursement, removeMaterialFromReimbursement,
  } = useReimbursementStore();
  
  const [pageTab, setPageTab] = useState<PageTab>('票据管理');
  const [activeTab, setActiveTab] = useState<ReceiptCategory | 'all'>('all');
  const [expandedReimbursementId, setExpandedReimbursementId] = useState<string | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedReimbursementId, setSelectedReimbursementId] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [reimbursementModalOpen, setReimbursementModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);
  const [editingReimbursement, setEditingReimbursement] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  
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
  
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: '医院材料' as MaterialCategory,
    description: '',
    required: true,
    isCompleted: false,
  });

  const stats = useMemo(() => getStats(), [receipts, reimbursements]);

  const filteredReceipts = useMemo(() => {
    if (activeTab === 'all') return receipts;
    return receipts.filter(r => r.category === activeTab);
  }, [receipts, activeTab]);

  const groupedMaterials = useMemo(() => {
    const groups: Record<MaterialCategory, MaterialItem[]> = {
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

  const categoryProgress = useMemo(() => {
    const total = stats.totalAmount;
    if (total === 0) return 0;
    return (stats.reimbursedAmount / total) * 100;
  }, [stats]);

  const getReceiptReimbursement = (receiptId: string) => {
    return reimbursements.find(r => r.receiptIds.includes(receiptId));
  };

  const getReimbursementDetail = (reimbursementId: string) => {
    const reimbursement = reimbursements.find(r => r.id === reimbursementId);
    if (!reimbursement) return null;

    const includedReceipts = receipts.filter(r => reimbursement.receiptIds.includes(r.id));
    const missingReceipts = receipts.filter(r => !reimbursement.receiptIds.includes(r.id) && !r.isReimbursed);
    const includedMaterials = materials.filter(m => reimbursement.materialIds.includes(m.id));
    const missingMaterials = materials.filter(m => !reimbursement.materialIds.includes(m.id));
    const requiredMaterials = materials.filter(m => m.required);
    const missingRequired = requiredMaterials.filter(m => !reimbursement.materialIds.includes(m.id));
    const totalIncludedAmount = includedReceipts.reduce((sum, r) => sum + r.amount, 0);
    
    const totalRequired = requiredMaterials.length;
    const completedRequired = requiredMaterials.filter(m => reimbursement.materialIds.includes(m.id)).length;
    const progress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

    return {
      reimbursement,
      includedReceipts,
      missingReceipts,
      includedMaterials,
      missingMaterials,
      requiredMaterials,
      missingRequired,
      totalIncludedAmount,
      progress,
    };
  };

  const handleOpenReceiptModal = (receipt?: Receipt) => {
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

  const handleOpenMaterialModal = (material?: MaterialItem) => {
    if (material) {
      setEditingMaterial(material.id);
      setMaterialForm({
        name: material.name,
        category: material.category,
        description: material.description || '',
        required: material.required,
        isCompleted: material.isCompleted,
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({
        name: '',
        category: '医院材料',
        description: '',
        required: true,
        isCompleted: false,
      });
    }
    setMaterialModalOpen(true);
  };

  const handleSubmitMaterial = () => {
    if (!materialForm.name.trim()) return;
    
    if (editingMaterial) {
      updateMaterial(editingMaterial, materialForm);
    } else {
      addMaterial(materialForm);
    }
    
    setMaterialModalOpen(false);
  };

  const generateSummaryText = (reimbursementId: string) => {
    const detail = getReimbursementDetail(reimbursementId);
    if (!detail) return '';
    
    const { reimbursement, includedReceipts, includedMaterials, missingRequired, totalIncludedAmount } = detail;
    
    let text = `📋 ${reimbursement.title} - 报销整理摘要\n`;
    text += `${'='.repeat(40)}\n\n`;
    text += `📅 提交日期：${formatDisplayDate(reimbursement.submitDate)}\n`;
    text += `📊 申请状态：${reimbursement.status}\n`;
    text += `💰 申请金额：${formatMoney(reimbursement.amount)}\n`;
    text += `✅ 已归入票据金额：${formatMoney(totalIncludedAmount)}\n`;
    text += `📝 预计可报金额：${formatMoney(totalIncludedAmount)}\n\n`;
    
    text += `🧾 票据明细 (${includedReceipts.length}张)\n`;
    text += `${'-'.repeat(30)}\n`;
    if (includedReceipts.length === 0) {
      text += `  暂无归入票据\n`;
    } else {
      const groupedByCategory = includedReceipts.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = { count: 0, amount: 0, items: [] };
        acc[r.category].count++;
        acc[r.category].amount += r.amount;
        acc[r.category].items.push(r);
        return acc;
      }, {} as Record<string, { count: number; amount: number; items: typeof includedReceipts }>);
      
      Object.entries(groupedByCategory).forEach(([category, data]) => {
        text += `\n  ${category} (${data.count}张，共${formatMoney(data.amount)})\n`;
        data.items.forEach(r => {
          text += `    • ${formatDisplayDate(r.date)} ${r.hospital || ''}：${formatMoney(r.amount)}\n`;
          if (r.description) text += `      ${r.description}\n`;
        });
      });
    }
    
    text += `\n📄 材料准备情况\n`;
    text += `${'-'.repeat(30)}\n`;
    text += `  已准备：${includedMaterials.length} 份\n`;
    if (missingRequired.length > 0) {
      text += `  ❌ 还缺少的必需材料 (${missingRequired.length}份)：\n`;
      missingRequired.forEach(m => {
        text += `    • [ ] ${m.name}`;
        if (m.description) text += ` (${m.description})`;
        text += `\n`;
      });
    } else {
      text += `  ✅ 所有必需材料已准备齐全！\n`;
    }
    
    if (includedMaterials.length > 0) {
      text += `\n  ✅ 已归入材料 (${includedMaterials.length}份)：\n`;
      includedMaterials.forEach(m => {
        text += `    • [x] ${m.name}`;
        if (m.required) text += ` *必需`;
        if (m.description) text += ` (${m.description})`;
        text += `\n`;
      });
    }
    
    text += `\n${'='.repeat(40)}\n`;
    text += `📱 生成时间：${new Date().toLocaleString('zh-CN')}\n`;
    
    return text;
  };

  const handleExportSummary = async (reimbursementId: string) => {
    const text = generateSummaryText(reimbursementId);
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      alert('摘要已复制到剪贴板，可以发给家人了！');
    } catch {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `报销摘要_${reimbursements.find(r => r.id === reimbursementId)?.title || '报销'}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenPackageModal = (reimbursementId: string) => {
    setSelectedReimbursementId(reimbursementId);
    setPackageModalOpen(true);
  };

  const toggleReimbursementExpand = (id: string) => {
    setExpandedReimbursementId(expandedReimbursementId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">报销资料</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleOpenReimbursementModal()}>
            <FileText className="w-4 h-4" />
            报销申请
          </Button>
          {pageTab === '票据管理' && (
            <Button onClick={() => handleOpenReceiptModal()}>
              <Plus className="w-4 h-4" />
              添加票据
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-warmGray-200">
        {PAGE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setPageTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              pageTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-warmGray-500 hover:text-warmGray-700'
            }`}
          >
            {tab === '报销包整理' && <Package className="w-4 h-4 inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {pageTab === '票据管理' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="票据总额"
              value={stats.totalAmount}
              isMoney
              gradient="from-primary-500 to-primary-600"
              icon={<ReceiptIcon className="w-6 h-6 text-white" />}
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
                <ReceiptIcon className="w-5 h-5 text-primary-500" />
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
                    icon={<ReceiptIcon className="w-12 h-12 text-warmGray-300" />}
                  />
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {filteredReceipts.map(receipt => {
                      const relatedReimbursement = getReceiptReimbursement(receipt.id);
                      return (
                        <div 
                          key={receipt.id}
                          className="p-4 bg-warmGray-50 rounded-xl group flex items-start justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${RECEIPT_COLORS[receipt.category]}`}>
                              {CATEGORY_ICONS[receipt.category]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium text-warmGray-800">
                                  {receipt.hospital || '医院票据'}
                                </h4>
                                <Badge variant={receipt.isReimbursed ? 'success' : 'warning'}>
                                  {receipt.isReimbursed ? '已报销' : '待报销'}
                                </Badge>
                                {!receipt.hasReceipt && (
                                  <Badge variant="danger">无票据</Badge>
                                )}
                                {relatedReimbursement && (
                                  <Badge variant="primary" size="sm">
                                    归入：{relatedReimbursement.title}
                                  </Badge>
                                )}
                                {!relatedReimbursement && !receipt.isReimbursed && (
                                  <Badge variant="default" size="sm">
                                    待整理
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-warmGray-600">
                                {receipt.category} · {formatDisplayDate(receipt.date)}
                              </p>
                              {receipt.description && (
                                <p className="text-xs text-warmGray-500 mt-1">{receipt.description}</p>
                              )}
                              {relatedReimbursement && (relatedReimbursement.status === '已提交' || relatedReimbursement.status === '审核中' || relatedReimbursement.status === '已报销') && (
                                <p className="text-xs text-primary-600 mt-1">
                                  该申请{relatedReimbursement.status}，票据已锁定
                                </p>
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
                      );
                    })}
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
                <Button variant="ghost" size="sm" onClick={() => handleOpenMaterialModal()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {MATERIAL_CATEGORIES.map(category => {
                  const items = groupedMaterials[category];
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-warmGray-700 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div 
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-warmGray-50 rounded-lg group"
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
                            <div className="flex-1 min-w-0">
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenMaterialModal(item); }}
                                className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteMaterial(item.id); }}
                                className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
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
                          {application.actualAmount !== undefined && application.actualAmount > 0 && (
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
        </>
      )}

      {pageTab === '报销包整理' && (
        <div className="space-y-4">
          {reimbursements.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="暂无报销申请"
                  description="先创建报销申请，然后在这里整理票据和材料"
                  icon={<Package className="w-12 h-12 text-warmGray-300" />}
                  action={<Button onClick={() => handleOpenReimbursementModal()}>创建报销申请</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            reimbursements.map(application => {
              const detail = getReimbursementDetail(application.id);
              if (!detail) return null;
              const isExpanded = expandedReimbursementId === application.id;
              
              return (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleReimbursementExpand(application.id)}
                            className="p-1 hover:bg-warmGray-100 rounded-lg text-warmGray-500"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-warmGray-800 text-base">{application.title}</h3>
                              <Badge variant={STATUS_COLORS[application.status]}>
                                {application.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-warmGray-500">
                              {formatDisplayDate(application.submitDate)} · 申请金额 {formatMoney(application.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-warmGray-700">
                              已归入 {formatMoney(detail.totalIncludedAmount)}
                            </p>
                            <p className="text-xs text-warmGray-500">
                              {detail.includedReceipts.length} 张票据 · {detail.includedMaterials.length} 份材料
                            </p>
                          </div>
                          {detail.missingRequired.length > 0 && (
                            <div className="flex items-center gap-1 text-accent-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">缺{detail.missingRequired.length}份材料</span>
                            </div>
                          )}
                          <Button size="sm" variant="secondary" onClick={() => handleOpenPackageModal(application.id)}>
                            管理
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <ProgressBar progress={detail.progress} height="sm" />
                        <p className="text-xs text-warmGray-500 mt-1">
                          材料准备进度：{detail.progress.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="border-t border-warmGray-100 pt-4 space-y-6">
                      <div>
                        <h4 className="font-medium text-warmGray-700 mb-3 flex items-center gap-2">
                          <ReceiptIcon className="w-4 h-4" />
                          已归入票据 ({detail.includedReceipts.length}张，共{formatMoney(detail.totalIncludedAmount)})
                        </h4>
                        {detail.includedReceipts.length === 0 ? (
                          <p className="text-sm text-warmGray-500 bg-warmGray-50 p-3 rounded-lg">
                            暂无归入的票据，点击"管理"添加
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {detail.includedReceipts.map(r => (
                              <div key={r.id} className="flex items-center justify-between p-3 bg-warmGray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded ${RECEIPT_COLORS[r.category]}`}>
                                    {CATEGORY_ICONS[r.category]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-warmGray-800">{r.category}</p>
                                    <p className="text-xs text-warmGray-500">{formatDisplayDate(r.date)} · {r.hospital}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-medium text-warmGray-800">{formatMoney(r.amount)}</span>
                                  <button
                                    onClick={() => removeReceiptFromReimbursement(application.id, r.id)}
                                    className="p-1 hover:bg-white rounded text-warmGray-400 hover:text-danger-500"
                                    title="移出"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-warmGray-700 mb-3 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          已归入材料 ({detail.includedMaterials.length}份)
                        </h4>
                        {detail.includedMaterials.length === 0 ? (
                          <p className="text-sm text-warmGray-500 bg-warmGray-50 p-3 rounded-lg">
                            暂无归入的材料，点击"管理"添加
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {detail.includedMaterials.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-3 bg-warmGray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4 text-primary-500" />
                                  <span className="text-sm text-warmGray-800">{m.name}</span>
                                  <span className="text-xs text-warmGray-400">({m.category})</span>
                                  {m.required && <span className="text-xs text-danger-500">*必需</span>}
                                </div>
                                <button
                                  onClick={() => removeMaterialFromReimbursement(application.id, m.id)}
                                  className="p-1 hover:bg-white rounded text-warmGray-400 hover:text-danger-500"
                                  title="移出"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {detail.missingRequired.length > 0 && (
                        <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl">
                          <h4 className="font-medium text-accent-700 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            还缺少的必需材料
                          </h4>
                          <div className="space-y-1">
                            {detail.missingRequired.map(m => (
                              <p key={m.id} className="text-sm text-accent-600 flex items-center gap-2">
                                <Square className="w-3.5 h-3.5" />
                                {m.name}
                                {m.description && <span className="text-xs text-accent-500">({m.description})</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-primary-700 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            整理摘要
                          </h4>
                          <Button 
                            size="sm" 
                            variant="primary" 
                            onClick={() => handleExportSummary(application.id)}
                          >
                            <Download className="w-4 h-4" />
                            导出清单
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-primary-600 mb-1">已归入金额</p>
                            <p className="font-mono font-semibold text-primary-800">{formatMoney(detail.totalIncludedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-600 mb-1">预计可报金额</p>
                            <p className="font-mono font-semibold text-green-600">{formatMoney(detail.totalIncludedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-600 mb-1">材料缺口</p>
                            <p className={`font-semibold ${detail.missingRequired.length > 0 ? 'text-accent-600' : 'text-green-600'}`}>
                              {detail.missingRequired.length > 0 ? `缺 ${detail.missingRequired.length} 份` : '已齐全'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-primary-600 mb-1">完成进度</p>
                            <p className="font-semibold text-primary-800">{detail.progress.toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

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

      <Modal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title={editingMaterial ? '编辑材料' : '添加材料'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMaterialModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitMaterial} disabled={!materialForm.name.trim()}>
              {editingMaterial ? '保存修改' : '添加材料'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="材料名称"
            value={materialForm.name}
            onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
            placeholder="如：身份证复印件、病历本等"
          />
          <Select
            label="材料分类"
            value={materialForm.category}
            onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value as MaterialCategory })}
            options={MATERIAL_CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <TextArea
            label="材料说明"
            value={materialForm.description}
            onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
            placeholder="材料用途、注意事项等..."
            rows={2}
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={materialForm.required}
                onChange={(e) => setMaterialForm({ ...materialForm, required: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-warmGray-700">必需材料</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={materialForm.isCompleted}
                onChange={(e) => setMaterialForm({ ...materialForm, isCompleted: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-warmGray-700">已准备好</span>
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        title="管理报销包"
        size="lg"
        footer={
          <Button onClick={() => setPackageModalOpen(false)}>完成</Button>
        }
      >
        {selectedReimbursementId && (() => {
          const detail = getReimbursementDetail(selectedReimbursementId);
          if (!detail) return null;
          
          return (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="font-medium text-warmGray-700 mb-3">选择归入的票据</h4>
                {receipts.length === 0 ? (
                  <p className="text-sm text-warmGray-500 bg-warmGray-50 p-3 rounded-lg">暂无票据，请先添加票据</p>
                ) : (
                  <div className="space-y-2">
                    {receipts.map(r => {
                      const isIncluded = detail.reimbursement.receiptIds.includes(r.id);
                      return (
                        <label 
                          key={r.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isIncluded ? 'bg-primary-50 border border-primary-200' : 'bg-warmGray-50 hover:bg-warmGray-100'
                          }`}
                        >
                          <button
                            onClick={() => isIncluded 
                              ? removeReceiptFromReimbursement(selectedReimbursementId, r.id)
                              : addReceiptToReimbursement(selectedReimbursementId, r.id)
                            }
                          >
                            {isIncluded ? (
                              <CheckSquare className="w-5 h-5 text-primary-500" />
                            ) : (
                              <Square className="w-5 h-5 text-warmGray-400" />
                            )}
                          </button>
                          <div className={`p-1.5 rounded ${RECEIPT_COLORS[r.category]}`}>
                            {CATEGORY_ICONS[r.category]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-warmGray-800">{r.category}</p>
                            <p className="text-xs text-warmGray-500">{formatDisplayDate(r.date)} · {r.hospital}</p>
                          </div>
                          <span className="font-mono font-medium text-warmGray-800">{formatMoney(r.amount)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-warmGray-700 mb-3">选择归入的材料</h4>
                {MATERIAL_CATEGORIES.map(category => {
                  const items = groupedMaterials[category];
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4">
                      <p className="text-sm text-warmGray-500 mb-2">{category}</p>
                      <div className="space-y-2">
                        {items.map(m => {
                          const isIncluded = detail.reimbursement.materialIds.includes(m.id);
                          return (
                            <label 
                              key={m.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isIncluded ? 'bg-primary-50 border border-primary-200' : 'bg-warmGray-50 hover:bg-warmGray-100'
                              }`}
                            >
                              <button
                                onClick={() => isIncluded
                                  ? removeMaterialFromReimbursement(selectedReimbursementId, m.id)
                                  : addMaterialToReimbursement(selectedReimbursementId, m.id)
                                }
                              >
                                {isIncluded ? (
                                  <CheckSquare className="w-5 h-5 text-primary-500" />
                                ) : (
                                  <Square className="w-5 h-5 text-warmGray-400" />
                                )}
                              </button>
                              <div className="flex-1">
                                <span className={m.required ? 'text-warmGray-800 font-medium' : 'text-warmGray-700'}>
                                  {m.name}
                                </span>
                                {m.required && <span className="ml-2 text-xs text-danger-500">*必需</span>}
                                {m.description && (
                                  <p className="text-xs text-warmGray-500 mt-0.5">{m.description}</p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
