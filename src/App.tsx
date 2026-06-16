import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BudgetPage from '@/pages/Budget';
import LeavePage from '@/pages/Leave';
import TravelPage from '@/pages/Travel';
import ReimbursementPage from '@/pages/Reimbursement';
import FamilyPage from '@/pages/Family';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/budget" replace />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="travel" element={<TravelPage />} />
          <Route path="reimbursement" element={<ReimbursementPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="*" element={<Navigate to="/budget" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
