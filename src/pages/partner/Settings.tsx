import { useState, useEffect } from 'react';
import { Lock, Save, CheckCircle, UserCircle } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function PartnerSettings() {
  const updatePartner = useMutation(api.partners.update);
  
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const info = localStorage.getItem('activePartner');
    if (info) {
      setPartnerInfo(JSON.parse(info));
    }
  }, []);

  const handlePasswordChange = async () => {
    if (!partnerInfo?._id) return;
    if (!password || password !== confirmPassword) {
      alert("비밀번호가 일치하지 않거나 입력되지 않았습니다.");
      return;
    }
    
    setSaveStatus('saving');
    try {
      await updatePartner({ 
        id: partnerInfo._id, 
        password: password 
      });
      setSaveStatus('saved');
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveStatus('idle'), 2000);
      alert("비밀번호가 변경되었습니다.");
    } catch (error) {
      setSaveStatus('error');
      alert("변경 중 오류가 발생했습니다.");
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (!partnerInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 font-bold animate-pulse">로그인 정보를 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 lg:space-y-8 pb-20 px-1 lg:px-0">
      <div className="bg-zinc-900 text-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20">
              <UserCircle size={40} />
            </div>
            <div>
              <p className="text-[10px] lg:text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Partner Profile</p>
              <h2 className="text-2xl lg:text-3xl font-black">{partnerInfo.name} <span className="text-zinc-500 text-lg lg:text-xl font-bold">님</span></h2>
              <p className="text-zinc-400 text-xs lg:text-sm font-medium mt-1">ID: {partnerInfo.loginId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-sm font-bold">정상 가동 중</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
          <div className="p-2 bg-zinc-900 text-white rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black text-zinc-900">비밀번호 변경</h2>
            <p className="text-[10px] lg:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Account Security Update</p>
          </div>
        </div>
        <div className="p-6 lg:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="변경할 새 비밀번호" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handlePasswordChange}
              disabled={saveStatus === 'saving'}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 text-white' 
                  : saveStatus === 'saving'
                  ? 'bg-zinc-400 text-white cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {saveStatus === 'saved' ? (
                <><CheckCircle size={18} /> 변경 완료</>
              ) : saveStatus === 'saving' ? (
                <><Save size={18} className="animate-spin" /> 처리 중...</>
              ) : (
                <><Save size={18} /> 비밀번호 업데이트</>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
         <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
            <CheckCircle size={20} />
         </div>
         <div>
            <h4 className="text-sm font-black text-blue-900 mb-1">보안 안내</h4>
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              비밀번호는 주기적으로 변경하는 것이 안전합니다. 영문, 숫자, 특수문자를 조합하여 8자 이상의 강력한 비밀번호를 사용하시기 바랍니다.
            </p>
         </div>
      </div>
    </div>
  );
}
