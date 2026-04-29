import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserCircle, 
  Package, 
  Megaphone, 
  FolderOpen, 
  BarChart, 
  Settings as SettingsIcon,
  Home,
  RefreshCw,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminToken') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { name: '고객관리', path: '/admin/customers', icon: <Users size={20} /> },
    { name: '파트너관리', path: '/admin/partners', icon: <UserCircle size={20} /> },
    { name: '제품관리', path: '/admin/products', icon: <Package size={20} /> },
    { name: '프로모션관리', path: '/admin/promotions', icon: <Megaphone size={20} /> },
    { name: '자료실', path: '/admin/library', icon: <FolderOpen size={20} /> },
    { name: '통계분석', path: '/admin/statistics', icon: <BarChart size={20} /> },
    { name: '설정', path: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  const currentTitle = menuItems.find(m => 
    location.pathname.startsWith(m.path) || 
    (m.path === '/admin/customers' && (location.pathname === '/admin' || location.pathname === '/admin/'))
  )?.name || '대시보드';

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <img 
              src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777447152/KakaoTalk_20260429_161516963_ejwlfu.png" 
              alt="Logo" 
              className="h-8 w-auto brightness-0 invert" 
            />
            <div className="mt-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">본사 어드민</div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path) || (item.path === '/admin/customers' && (location.pathname === '/admin' || location.pathname === '/admin/'));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900"
            >
              <Menu size={24} />
            </button>
            <div className="font-black text-lg text-zinc-900 truncate">
              {currentTitle}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => window.location.reload()} className="p-2 lg:px-3 lg:py-1.5 rounded-md bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all flex items-center gap-2">
              <RefreshCw size={18} className="lg:w-4 lg:h-4" />
              <span className="hidden lg:inline text-sm font-bold">새로고침</span>
            </button>
            <Link to="/" target="_blank" className="px-3 py-2 lg:px-4 lg:py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm">
              <Home size={18} className="lg:w-4 lg:h-4" />
              <span className="hidden lg:inline text-sm font-bold">홈페이지</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
