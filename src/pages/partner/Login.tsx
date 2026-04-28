import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function PartnerLogin() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('loginId') || '';
  const [formData, setFormData] = useState({ id: initialId, password: '' });
  const navigate = useNavigate();
  
  // Fetch partner info for auto-login or manual login validation
  const partnerInfo = useQuery(api.partners.getByLoginId, formData.id ? { loginId: formData.id } : "skip");

  // Update ID if query param changes
  useEffect(() => {
    if (initialId && !formData.id) {
      setFormData(prev => ({ ...prev, id: initialId }));
    }
  }, [initialId]);

  // Handle auto-login
  useEffect(() => {
    const isAuto = searchParams.get('auto') === 'true';
    if (isAuto && partnerInfo) {
      localStorage.setItem('activePartner', JSON.stringify(partnerInfo));
      const timer = setTimeout(() => {
        navigate('/partner');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, partnerInfo, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerInfo) {
      localStorage.setItem('activePartner', JSON.stringify(partnerInfo));
      navigate('/partner');
    } else {
      alert('존재하지 않는 아이디입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link to="/" className="mb-8">
            <img 
              src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
              alt="Logo" 
              className="h-12 w-auto brightness-0 invert" 
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
            <UserCircle size={14} />
            PARTNER CENTER
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">파트너 센터 로그인</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Partner ID</label>
              <input 
                type="text" 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                placeholder="파트너 아이디"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-white text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-lg"
              >
                파트너 센터 접속
                <ChevronRight size={20} />
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center">
            <Link to="/" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> 홈페이지
            </Link>
            <Link to="/admin/login" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors">
              본사 로그인은 이쪽으로 <ChevronRight size={14} className="inline" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
