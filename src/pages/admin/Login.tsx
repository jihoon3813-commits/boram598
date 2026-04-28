import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const navigate = useNavigate();
  const globalSettings = useQuery(api.settings.get);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!globalSettings) {
      alert('설정 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const correctId = 'admin';
    const correctPassword = globalSettings.adminPassword || 'admin1234';

    if (formData.id === correctId && formData.password === correctPassword) {
      localStorage.setItem('adminToken', 'true');
      navigate('/admin');
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8">
            <img 
              src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
              alt="Logo" 
              className="h-12 w-auto brightness-0 invert mx-auto" 
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-bold mb-4">
            <ShieldCheck size={14} />
            HEADQUARTERS ADMIN
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">본사 관리 시스템 로그인</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Admin ID</label>
              <input 
                type="text" 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                placeholder="관리자 아이디"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
              >
                본사 시스템 접속
                <ChevronRight size={20} />
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center">
            <Link to="/" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> 홈페이지
            </Link>
            <Link to="/partner/login" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors">
              파트너 로그인은 이쪽으로 <ChevronRight size={14} className="inline" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
