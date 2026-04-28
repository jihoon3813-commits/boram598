import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, X, ExternalLink, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function PartnerManagement() {
  const partners = useQuery(api.partners.list);
  const productGroups = useQuery(api.products.listGroups);
  const createPartner = useMutation(api.partners.create);
  const updatePartner = useMutation(api.partners.update);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('전체');
  
  // Form State
  const [formData, setFormData] = useState<any>({
    loginId: '',
    password: '',
    name: '',
    managerName: '',
    managerPhone: '',
    status: '정상',
    visibleProductGroupIds: []
  });

  const openModal = (partner: any) => {
    if (partner) {
      setSelectedPartner(partner);
      setFormData({
        ...partner,
        password: '', // Don't show password
        visibleProductGroupIds: partner.visibleProductGroupIds || []
      });
    } else {
      setSelectedPartner(null);
      setFormData({
        loginId: '',
        password: '',
        name: '',
        managerName: '',
        managerPhone: '',
        status: '정상',
        subdomain: '',
        visibleProductGroupIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.loginId || !formData.name || !formData.managerName || !formData.managerPhone) {
        alert('필수 정보를 입력해주세요.');
        return;
      }

      const payload = {
        ...formData,
        subdomain: formData.loginId, // Default subdomain to loginId
      };

      if (selectedPartner) {
        // Update
        const { _id, _creationTime, ...cleanPayload } = payload;
        const updatePayload = { ...cleanPayload, id: _id };
        if (!updatePayload.password) delete updatePayload.password;
        await updatePartner(updatePayload);
        alert('파트너 정보가 수정되었습니다.');
      } else {
        // Create
        if (!formData.password) {
          alert('비밀번호를 입력해주세요.');
          return;
        }
        await createPartner(payload);
        alert('신규 파트너가 등록되었습니다.');
      }
      closeModal();
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const toggleCategory = (groupId: string) => {
    const current = formData.visibleProductGroupIds || [];
    if (current.includes(groupId)) {
      setFormData({ ...formData, visibleProductGroupIds: current.filter((id: string) => id !== groupId) });
    } else {
      setFormData({ ...formData, visibleProductGroupIds: [...current, groupId] });
    }
  };

  const filteredPartners = useMemo(() => {
    if (!partners) return [];
    return partners.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.loginId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.managerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const targetStatus = filterStatus === '정상' ? 'active' : filterStatus === '승인대기' ? 'pending' : 'suspended';
      const matchesStatus = filterStatus === '전체' || p.status === targetStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [partners, searchQuery, filterStatus]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-2xl shadow-xl border border-zinc-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <input 
              type="text" 
              id="partner-search-input"
              name="partner-search-input"
              autoComplete="off"
              placeholder="파트너명, 아이디, 담당자 검색" 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          </div>
          <select 
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>전체</option>
            <option>정상</option>
            <option>승인대기</option>
            <option>정지</option>
          </select>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3.5 rounded-xl text-sm font-black hover:bg-zinc-800 transition-all shadow-lg active:scale-95" onClick={() => openModal(null)}>
          <Plus size={18} /> 파트너 등록
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] lg:rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
          <thead className="bg-zinc-50 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="py-3 px-4">아이디</th>
              <th className="py-3 px-4">파트너명</th>
              <th className="py-3 px-4">담당자</th>
              <th className="py-3 px-4">연락처</th>
              <th className="py-3 px-4 text-center">상태</th>
              <th className="py-3 px-4 text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!partners ? (
              <tr><td colSpan={6} className="py-20 text-center text-zinc-400">데이터를 불러오는 중...</td></tr>
            ) : filteredPartners?.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-zinc-400">검색 결과가 없습니다.</td></tr>
            ) : filteredPartners?.map((partner) => (
              <tr key={partner._id} className="hover:bg-zinc-50 transition-colors">
                <td className="py-3 px-4 font-mono">{partner.loginId}</td>
                <td className="py-3 px-4 font-bold">{partner.name}</td>
                <td className="py-3 px-4">{partner.managerName}</td>
                <td className="py-3 px-4">{partner.managerPhone}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    partner.status === 'active' ? 'bg-green-100 text-green-700' : 
                    partner.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {partner.status === 'active' ? '정상' : partner.status === 'pending' ? '승인대기' : '정지'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => openModal(partner)} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded hover:bg-zinc-200 transition-colors text-xs font-bold">
                    관리
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 lg:p-8 border-b border-zinc-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
                <h2 className="text-xl lg:text-2xl font-black text-zinc-900 truncate">
                  {selectedPartner ? '파트너 상세 정보' : '신규 파트너 등록'}
                </h2>
                {selectedPartner && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <a 
                      href={`/?partner=${selectedPartner.loginId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-black text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm whitespace-nowrap"
                    >
                      <ExternalLink size={14} /> 분양몰 보기
                    </a>
                    <a 
                      href={`/partner/login?loginId=${selectedPartner.loginId}&auto=true`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-[10px] font-black text-white hover:bg-zinc-800 transition-all shadow-sm whitespace-nowrap"
                    >
                      <ShieldCheck size={14} /> 어드민 접속
                    </a>
                  </div>
                )}
              </div>
              <button onClick={closeModal} className="absolute lg:static top-6 right-6 p-2 rounded-full hover:bg-white border border-transparent hover:border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 lg:p-10 overflow-y-auto flex-1 space-y-10">
              
              <section>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 계정 및 상태 정보
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">아이디</label>
                    <input 
                      type="text" 
                      id="partner-login-id"
                      name="partner-login-id"
                      autoComplete="off"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all disabled:opacity-50" 
                      value={formData.loginId} 
                      onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                      disabled={!!selectedPartner}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">비밀번호 {selectedPartner && '(변경 시에만)'}</label>
                    <input 
                      type="password" 
                      id="partner-password-field"
                      name="partner-password-field"
                      autoComplete="new-password"
                      placeholder={selectedPartner ? "변경할 비밀번호 입력" : "비밀번호 입력"} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">파트너 상태</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="pending">승인대기</option>
                      <option value="active">정상</option>
                      <option value="suspended">정지</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 회사 및 담당자 정보
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">파트너명 (회사명)</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">담당자명</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" 
                      value={formData.managerName}
                      onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">담당자 연락처</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" 
                      value={formData.managerPhone}
                      onChange={(e) => setFormData({...formData, managerPhone: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Category Selection Section */}
              <section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                    <CheckSquare size={18} className="text-amber-500" /> 
                    가전 카테고리 노출 설정
                  </h3>
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Visibility Control</span>
                </div>
                <p className="text-xs text-zinc-500 mb-6">
                  해당 파트너의 분양몰에서 노출할 카테고리를 선택하세요. <br />
                  <span className="text-amber-600 font-bold">* 아무것도 선택하지 않으면 모든 카테고리가 기본으로 노출됩니다.</span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productGroups?.map((group) => {
                    const isChecked = formData.visibleProductGroupIds?.includes(group._id);
                    return (
                      <button
                        key={group._id}
                        onClick={() => toggleCategory(group._id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          isChecked 
                          ? 'bg-white border-zinc-900 ring-2 ring-zinc-900/5 shadow-md translate-y-[-2px]' 
                          : 'bg-white/50 border-zinc-200 hover:border-zinc-300 grayscale opacity-70'
                        }`}
                      >
                        {isChecked ? (
                          <div className="bg-zinc-900 text-white rounded-md p-1">
                            <CheckSquare size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="border-2 border-zinc-200 rounded-md p-1">
                            <Square size={14} className="text-transparent" />
                          </div>
                        )}
                        <span className={`text-xs font-bold ${isChecked ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          {group.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

            </div>
            
            <div className="p-6 lg:p-8 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <div />
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={closeModal} className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl border border-zinc-200 bg-white text-zinc-600 font-bold hover:bg-zinc-50 transition-all">취소</button>
                <button 
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-zinc-900 text-white font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
