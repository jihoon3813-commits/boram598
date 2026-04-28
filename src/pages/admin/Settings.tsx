import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Lock, Save, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Settings() {
  const globalSettings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);
  
  const [statuses, setStatuses] = useState<Array<{name: string; isActive: boolean; allowPartnerEdit: boolean}>>([]);
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [initialized, setInitialized] = useState(false);

  // Sync from server only once data is loaded
  useEffect(() => {
    if (globalSettings !== undefined && !initialized) {
      setStatuses(globalSettings?.statuses ?? []);
      setPrivacyPolicy(globalSettings?.privacyPolicy ?? "");
      setInitialized(true);
    }
  }, [globalSettings, initialized]);

  const handleAddStatus = () => {
    setStatuses(prev => [...prev, { name: '', isActive: true, allowPartnerEdit: true }]);
  };

  const handleRemoveStatus = (index: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setStatuses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStatusChange = (index: number, field: string, value: string | boolean) => {
    setStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = { ...newStatuses[index], [field]: value };
      return newStatuses;
    });
  };

  const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
    setStatuses(prev => {
      const newStatuses = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newStatuses.length) return prev;
      
      const temp = newStatuses[index];
      newStatuses[index] = newStatuses[targetIndex];
      newStatuses[targetIndex] = temp;
      return newStatuses;
    });
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      const validStatuses = statuses.filter(s => s.name.trim() !== '');
      await updateSettings({ 
        statuses: validStatuses,
        privacyPolicy: privacyPolicy
      });
      setStatuses(validStatuses);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Settings save error:", error);
      setSaveStatus('error');
      alert("저장 중 오류가 발생했습니다.");
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handlePasswordChange = async () => {
    if (!password || password !== confirmPassword) {
      alert("비밀번호가 일치하지 않거나 입력되지 않았습니다.");
      return;
    }
    try {
      await updateSettings({ adminPassword: password });
      alert("비밀번호가 변경되었습니다.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  if (globalSettings === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 font-bold animate-pulse">설정 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 lg:space-y-8 pb-20 px-1 lg:px-0">
      {/* Admin Password Setting */}
      <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
          <div className="p-2 bg-zinc-900 text-white rounded-md">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black text-zinc-900">본사 관리자 계정 설정</h2>
            <p className="text-[10px] lg:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Admin Security Control</p>
          </div>
        </div>
        <div className="p-5 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="변경할 비밀번호" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] lg:text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handlePasswordChange}
              className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-lg text-sm font-black hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              비밀번호 업데이트
            </button>
          </div>
        </div>
      </section>

      {/* Status Management */}
      <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 lg:p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-md shadow-lg shadow-amber-500/20">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-black text-zinc-900">진행 상태 설정</h2>
              <p className="text-[10px] lg:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Workflow Status Mapping</p>
            </div>
          </div>
          <button 
            onClick={handleAddStatus}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-md text-sm font-black hover:bg-zinc-800 transition-all shadow-lg"
          >
            <Plus size={18} /> 상태 추가하기
          </button>
        </div>
        
        <div className="p-5 lg:p-8">
          {statuses.length === 0 ? (
            <div className="text-center text-zinc-300 py-20 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-100">
              <SettingsIcon size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold">등록된 진행 상태가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Header */}
              <div className="hidden lg:flex items-center gap-4 px-6 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <div className="w-10"></div>
                <div className="flex-1">상태명</div>
                <div className="w-24 text-center">사용여부</div>
                <div className="w-24 text-center">파트너권한</div>
                <div className="w-12"></div>
              </div>

              {/* Status Items */}
              {statuses.map((status, index) => (
                <div key={index} className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-5 lg:p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all group">
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="flex lg:flex-col gap-1">
                      <button 
                        onClick={() => handleMoveStatus(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        onClick={() => handleMoveStatus(index, 'down')}
                        disabled={index === statuses.length - 1}
                        className="p-2 rounded-lg bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="flex-1 lg:hidden">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status Name</p>
                      <input 
                        type="text" 
                        value={status.name} 
                        onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                        className="w-full bg-transparent text-lg font-black text-zinc-900 focus:outline-none"
                        placeholder="상태명"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveStatus(index)}
                      className="lg:hidden p-3 text-red-500 bg-red-50 rounded-md"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="hidden lg:block flex-1">
                    <input 
                      type="text" 
                      value={status.name} 
                      onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                      className="w-full bg-transparent text-sm font-black text-zinc-900 focus:outline-none"
                      placeholder="상태명 입력"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                    <div className="flex flex-col lg:items-center gap-2 bg-zinc-50 lg:bg-transparent p-3 lg:p-0 rounded-md lg:w-24">
                      <span className="lg:hidden text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={status.isActive} 
                          onChange={(e) => handleStatusChange(index, 'isActive', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex flex-col lg:items-center gap-2 bg-zinc-50 lg:bg-transparent p-3 lg:p-0 rounded-md lg:w-24">
                      <span className="lg:hidden text-[10px] font-black text-zinc-400 uppercase tracking-widest">Partner Edit</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={status.allowPartnerEdit} 
                          onChange={(e) => handleStatusChange(index, 'allowPartnerEdit', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemoveStatus(index)}
                    className="hidden lg:block p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Privacy Policy Setting */}
      <section className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 lg:p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-md shadow-lg shadow-blue-600/20">
             <CheckCircle size={20} />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black text-zinc-900">개인정보 동의 내용 설정</h2>
            <p className="text-[10px] lg:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Privacy & Consent Terms</p>
          </div>
        </div>
        <div className="p-5 lg:p-8">
          <textarea 
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            placeholder="상담 신청 시 고객에게 노출될 개인정보 수집 동의 약관 내용을 입력하세요."
            className="w-full h-80 bg-zinc-50 border border-zinc-200 rounded-lg px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none leading-relaxed"
          />
        </div>
      </section>

      {/* Save FAB for Mobile */}
      <div className="fixed bottom-6 right-6 lg:static flex justify-end z-50">
        <button 
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-3 px-8 py-5 lg:py-4 rounded-xl lg:rounded-lg font-black text-lg lg:text-base transition-all shadow-2xl active:scale-95 ${
            saveStatus === 'saved' 
              ? 'bg-green-600 text-white' 
              : saveStatus === 'saving'
              ? 'bg-zinc-400 text-white cursor-not-allowed'
              : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          {saveStatus === 'saved' ? (
            <><CheckCircle size={22} className="lg:w-5 lg:h-5" /> 저장 완료</>
          ) : saveStatus === 'saving' ? (
            <><Save size={22} className="animate-spin lg:w-5 lg:h-5" /> 저장 중...</>
          ) : (
            <><Save size={22} className="lg:w-5 lg:h-5" /> 전체 설정 저장</>
          )}
        </button>
      </div>
    </div>
  );
}
