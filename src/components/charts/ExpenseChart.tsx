import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MonthlyExpense, StageStats } from '@/types/budget';
import { formatMoney } from '@/utils/date';
import { cn } from '@/lib/utils';

interface ExpenseChartProps {
  monthlyData: MonthlyExpense[];
  stageData: StageStats[];
}

type ChartType = 'monthly' | 'stage' | 'category';

const COLORS = ['#3DBAB0', '#FF9F6B', '#7C8794', '#F26B6B', '#A78BFA', '#34D399'];

export default function ExpenseChart({ monthlyData, stageData }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<ChartType>('monthly');

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    stageData.forEach(stage => {
      categories[stage.name] = (categories[stage.name] || 0) + stage.spent;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [stageData]);

  const chartTabs: { type: ChartType; label: string }[] = [
    { type: 'monthly', label: '月度趋势' },
    { type: 'stage', label: '阶段对比' },
    { type: 'category', label: '类别占比' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-warmGray-100">
          <p className="text-sm font-medium text-warmGray-800 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatMoney(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-warmGray-800">花费分析</h3>
        <div className="flex gap-1 p-1 bg-warmGray-100 rounded-full">
          {chartTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setChartType(tab.type)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-full transition-all',
                chartType === tab.type
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-warmGray-600 hover:text-warmGray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'monthly' && (
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
              <XAxis dataKey="month" stroke="#9AA5B1" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9AA5B1" tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                name="花费金额"
                stroke="#3DBAB0"
                strokeWidth={3}
                dot={{ fill: '#3DBAB0', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#FF9F6B' }}
              />
            </LineChart>
          )}

          {chartType === 'stage' && (
            <BarChart data={stageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
              <XAxis dataKey="name" stroke="#9AA5B1" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9AA5B1" tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budgetAmount" name="预算" fill="#CBD2D9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="已花费" fill="#3DBAB0" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}

          {chartType === 'category' && (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#9AA5B1' }}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
