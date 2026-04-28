import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import PartnerApply from './pages/PartnerApply';
import { RefreshCw } from 'lucide-react';
import AdminLayout from './layouts/AdminLayout';
import PartnerLayout from './layouts/PartnerLayout';
import CustomerManagement from './pages/admin/CustomerManagement';
import PartnerManagement from './pages/admin/PartnerManagement';
import Settings from './pages/admin/Settings';
import ProductManagement from './pages/admin/ProductManagement';
import PartnerDashboard from './pages/partner/Dashboard';
import PartnerSettings from './pages/partner/Settings';
import AdminLogin from './pages/admin/Login';
import PartnerLogin from './pages/partner/Login';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 mb-6">
      <RefreshCw size={40} className="animate-spin-slow opacity-20" />
    </div>
    <h2 className="text-2xl font-black text-zinc-900 mb-2">{title}</h2>
    <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
      현재 해당 기능을 고도화 작업 중에 있습니다.<br />
      보다 완벽한 서비스 제공을 위해 잠시만 기다려 주세요.
    </p>
    <div className="mt-8 flex gap-2">
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// Error Boundary to catch runtime errors inside child routes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl m-4">
          <h2 className="text-lg font-bold text-red-700 mb-2">페이지 오류 발생</h2>
          <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto bg-white p-4 rounded-lg border border-red-100 max-h-64">
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/partner-apply" element={<PartnerApply />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        
        {/* HQ Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ErrorBoundary><CustomerManagement /></ErrorBoundary>} />
          <Route path="customers" element={<ErrorBoundary><CustomerManagement /></ErrorBoundary>} />
          <Route path="partners" element={<ErrorBoundary><PartnerManagement /></ErrorBoundary>} />
          <Route path="products" element={<ErrorBoundary><ProductManagement /></ErrorBoundary>} />
          <Route path="promotions" element={<ErrorBoundary><Placeholder title="프로모션 관리" /></ErrorBoundary>} />
          <Route path="library" element={<ErrorBoundary><Placeholder title="자료실" /></ErrorBoundary>} />
          <Route path="statistics" element={<ErrorBoundary><Placeholder title="통계분석" /></ErrorBoundary>} />
          <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        </Route>

        {/* Partner Admin */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<ErrorBoundary><CustomerManagement /></ErrorBoundary>} />
          <Route path="dashboard" element={<ErrorBoundary><PartnerDashboard /></ErrorBoundary>} />
          <Route path="customers" element={<ErrorBoundary><CustomerManagement /></ErrorBoundary>} />
          <Route path="settings" element={<ErrorBoundary><PartnerSettings /></ErrorBoundary>} />
        </Route>
        <Route path="/:partnerId" element={<Landing />} />
      </Routes>
    </Router>
  );
}
