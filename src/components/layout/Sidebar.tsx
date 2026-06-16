import { NavLink } from 'react-router-dom';
import { 
  Wallet, 
  CalendarDays, 
  MapPin, 
  FileText, 
  Users,
  Heart,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/budget', label: '疗程预算', icon: Wallet },
  { path: '/leave', label: '请假安排', icon: CalendarDays },
  { path: '/travel', label: '交通住宿', icon: MapPin },
  { path: '/reimbursement', label: '报销资料', icon: FileText },
  { path: '/family', label: '家庭分工', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex flex-col z-40">
      <div className="p-6 border-b border-warmGray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-warmGray-800">试管助孕助手</h1>
            <p className="text-xs text-warmGray-500">用心陪伴每一天</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'sidebar-item',
              isActive && 'active'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-warmGray-100">
        <div className="sidebar-item">
          <Settings className="w-5 h-5" />
          <span className="font-medium">设置</span>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
          <p className="text-sm text-warmGray-700 font-medium mb-1">💡 温馨提示</p>
          <p className="text-xs text-warmGray-500">
            记得按时服药，保持心情愉快，祝您早日好孕！
          </p>
        </div>
      </div>
    </aside>
  );
}
