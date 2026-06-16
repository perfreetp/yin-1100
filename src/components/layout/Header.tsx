import { Bell, Search, Download, Upload } from 'lucide-react';
import { formatDate } from '@/utils/date';
import Button from '@/components/ui/Button';
import { useFamilyStore } from '@/store/useFamilyStore';
import { exportData, importData } from '@/utils/storage';

export default function Header() {
  const upcomingDates = useFamilyStore(state => state.getUpcomingImportantDates(7));
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivf-data-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importData(content)) {
            alert('数据导入成功！');
            window.location.reload();
          } else {
            alert('数据导入失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-warmGray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm text-warmGray-500">
            {formatDate(new Date(), 'yyyy年M月d日 EEEE')}
          </p>
          <h2 className="text-xl font-bold text-warmGray-800">
            今天也要加油哦 💪
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {upcomingDates.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent-50 rounded-full">
              <Bell className="w-4 h-4 text-accent-500 animate-pulse-soft" />
              <span className="text-sm text-accent-700">
                最近提醒：{upcomingDates[0].title}
              </span>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmGray-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 bg-warmGray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-48 transition-all"
            />
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleImport} title="导入数据">
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleExport} title="导出数据">
            <Download className="w-4 h-4" />
          </Button>
          
          <button className="relative p-2 rounded-full hover:bg-warmGray-100 transition-colors">
            <Bell className="w-5 h-5 text-warmGray-600" />
            {upcomingDates.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
