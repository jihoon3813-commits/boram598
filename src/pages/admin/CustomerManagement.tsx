import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, Plus, FileDown, MoreHorizontal, X, 
  Copy, Phone, MapPin, Calendar, CreditCard, 
  Clock, User, Package, History, CheckCircle2,
  ChevronDown, Trash2, Save, Send, RefreshCw, CheckSquare
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

declare global {
  interface Window {
    daum: any;
  }
}

const DEFAULT_STATUSES = [
  { name: '상담대기', isActive: true, allowPartnerEdit: true },
  { name: '부재/통화중', isActive: true, allowPartnerEdit: true },
  { name: '상담중', isActive: true, allowPartnerEdit: true },
  { name: '계약완료', isActive: true, allowPartnerEdit: false },
  { name: '취소/거부', isActive: true, allowPartnerEdit: true },
];

// Helper: Get KST Timestamp (YYYY-MM-DD HH:mm)
const getKSTTimestamp = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return kst.toISOString().replace('T', ' ').substring(0, 16);
};

// Helper: Format Phone (010-0000-0000)
const formatPhone = (val: string) => {
  const nums = val.replace(/[^0-9]/g, '');
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return nums.slice(0, 3) + '-' + nums.slice(3);
  return nums.slice(0, 3) + '-' + nums.slice(3, 7) + '-' + nums.slice(7, 11);
};

// Helper: Format DOB (1981-11-15)
const formatDOB = (val: string) => {
  const nums = val.replace(/[^0-9]/g, '');
  if (nums.length <= 4) return nums;
  if (nums.length <= 6) return nums.slice(0, 4) + '-' + nums.slice(4);
  return nums.slice(0, 4) + '-' + nums.slice(4, 6) + '-' + nums.slice(6, 8);
};

// Helper: Format Display Date (YY-MM-DD HH:mm)
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "-";
  // dateStr is usually "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"
  const [datePart, timePart] = dateStr.split(' ');
  const shortDate = datePart.substring(2); // YY-MM-DD
  return timePart ? `${shortDate} ${timePart}` : shortDate;
};

export default function CustomerManagement() {
  const location = useLocation();
  const isPartnerAdmin = location.pathname.startsWith('/partner');
  
  // Convex API
  const globalSettings = useQuery(api.settings.get);
  const customers = useQuery(api.customers.list);
  const partners = useQuery(api.partners.list);
  const productGroups = useQuery(api.products.listGroups);
  const allProducts = useQuery(api.products.listProducts, {});
  
  const updateCustomer = useMutation(api.customers.updateCustomerRecord);
  const addCustomerBatch = useMutation(api.customers.addBatch);

  // States
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const selectedCustomer = customers?.find(c => c._id === selectedCustomerId) || null;
  const [pendingList, setPendingList] = useState<any[]>([]);

  
  // Registration Form States
  const [regForm, setRegForm] = useState({ 
    name: '', phone: '', dob: '', gender: '남', address: '', detailAddress: '', 
    partnerId: '', categoryId: '', productId: '', preferredTime: '', note: '', paymentType: '' 
  });

  // Filter & Search States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    period: '전체',
    startDate: '',
    endDate: '',
    categoryFilter: '',
    statusFilter: '',
    partnerFilter: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    pageSize: 50
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const removeBatch = useMutation(api.customers.removeBatch);

  // Clear selection on filter change
  useEffect(() => {
    setSelectedIds([]);
  }, [searchParams]);

  useEffect(() => {
    if (isPartnerAdmin) {
      try {
        const info = localStorage.getItem('activePartner');
        if (info) {
          const parsed = JSON.parse(info);
          setPartnerInfo(parsed);
          setRegForm(prev => ({ ...prev, partnerId: parsed._id }));
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
    }
  }, [isPartnerAdmin]);

  const selectedRegProductObj = allProducts?.find(p => p._id === regForm.productId);
  const availableRegMethods = useMemo(() => {
    if (!regForm.productId) return ['60개월 렌탈', '신한 48페이'];
    return selectedRegProductObj?.paymentMethods || ['60개월 렌탈', '신한 48페이'];
  }, [regForm.productId, selectedRegProductObj]);

  useEffect(() => {
    if (availableRegMethods.length === 1 && regForm.paymentType !== availableRegMethods[0]) {
      setRegForm(prev => ({ ...prev, paymentType: availableRegMethods[0] }));
    } else if (regForm.paymentType && !availableRegMethods.includes(regForm.paymentType)) {
      setRegForm(prev => ({ ...prev, paymentType: '' }));
    }
  }, [availableRegMethods]);

  // Handle Address Search
  const handleAddressSearch = (onComplete: (addr: string) => void) => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        let fullAddr = data.roadAddress;
        let extraAddr = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddr += data.bname;
          if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
        }
        onComplete(fullAddr);
      }
    }).open();
  };

  // Filter products based on selected category and visibility
  const filteredCategories = productGroups?.filter(g => {
    if (isPartnerAdmin && partnerInfo?.visibleProductGroupIds) {
      return partnerInfo.visibleProductGroupIds.includes(g._id);
    }
    // HQ can see all
    return true;
  }) || [];

  const filteredProducts = allProducts?.filter(p => p.groupId === regForm.categoryId) || [];

  // Filter logic
  const getFilteredCustomers = () => {
    if (!customers) return [];
    
    let filtered = [...customers];

    // Partner restriction
    if (isPartnerAdmin && partnerInfo) {
      filtered = filtered.filter(c => c.partnerId === partnerInfo._id);
    }

    // 1. Search Term
    if (searchParams.searchTerm) {
      const term = searchParams.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.phone?.includes(term) ||
        c.productName?.toLowerCase().includes(term) ||
        c.partnerName?.toLowerCase().includes(term)
      );
    }

    // 2. Period Filter
    if (searchParams.period !== '전체') {
      const now = new Date();
      let startLimit = new Date(0);
      
      if (searchParams.period === '당월') {
        startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (searchParams.period === '3개월') {
        startLimit = new Date(now.setMonth(now.getMonth() - 3));
      } else if (searchParams.period === '6개월') {
        startLimit = new Date(now.setMonth(now.getMonth() - 6));
      } else if (searchParams.period === '1년') {
        startLimit = new Date(now.setFullYear(now.getFullYear() - 1));
      } else if (searchParams.period === '기간선택' && searchParams.startDate) {
        startLimit = new Date(searchParams.startDate);
      }

      const endLimit = (searchParams.period === '기간선택' && searchParams.endDate) 
        ? new Date(searchParams.endDate) 
        : new Date();
      endLimit.setHours(23, 59, 59, 999);

      filtered = filtered.filter(c => {
        const cDate = new Date(c.regDate);
        return cDate >= startLimit && cDate <= endLimit;
      });
    }

    // 3. Status Filter
    if (searchParams.statusFilter) {
      filtered = filtered.filter(c => c.status === searchParams.statusFilter);
    }

    // 4. Product Category Filter
    if (searchParams.categoryFilter) {
      filtered = filtered.filter(c => c.categoryId === searchParams.categoryFilter);
    }

    // 5. Partner Filter
    if (searchParams.partnerFilter) {
      filtered = filtered.filter(c => c.partnerId === searchParams.partnerFilter);
    }

    // Sorting: prioritize updatedAt (Last modified) as requested
    filtered.sort((a, b) => {
      const timeA = a.updatedAt || a.regDate || "";
      const timeB = b.updatedAt || b.regDate || "";
      
      if (searchParams.sortOrder === 'asc') {
        return timeA.localeCompare(timeB);
      }
      return timeB.localeCompare(timeA);
    });

    return filtered;
  };

  const displayCustomers = getFilteredCustomers();

  // Helper for 24h labels
  const getLabelInfo = (customer: any) => {
    if (!customer.regDate) return null;
    
    const now = new Date();
    // Normalize dates for browser compatibility
    const regDate = new Date(customer.regDate.replace(' ', 'T'));
    const updatedAt = customer.updatedAt ? new Date(customer.updatedAt.replace(' ', 'T')) : null;
    
    // Check if actually modified (updatedAt exists and is different from regDate)
    const isActuallyModified = updatedAt && customer.updatedAt !== customer.regDate;
    const isModifiedWithin24h = isActuallyModified && (now.getTime() - updatedAt.getTime()) < 24 * 60 * 60 * 1000;
    
    // Check if new registration within 24h
    const isNewWithin24h = (now.getTime() - regDate.getTime()) < 24 * 60 * 60 * 1000;
    
    // Prioritize Red (Modified) over Blue (New) as per user request
    if (isModifiedWithin24h) return { color: 'bg-red-500', text: '정보수정' };
    if (isNewWithin24h) return { color: 'bg-blue-500', text: '신규등록' };
    
    return null;
  };

  const addToPending = () => {
    if (!regForm.name || !regForm.phone) { alert("이름과 연락처는 필수입니다."); return; }
    if (!regForm.paymentType) { alert("결제 방식을 선택해주세요."); return; }

    const selectedPartner = partners?.find(p => p._id === regForm.partnerId);
    const selectedCategory = productGroups?.find(g => g._id === regForm.categoryId);
    const selectedProduct = allProducts?.find(p => p._id === regForm.productId);

    setPendingList([...pendingList, {
      ...regForm,
      partnerName: selectedPartner?.name || '본사직영',
      partnerLoginId: selectedPartner?.loginId || 'admin',
      categoryName: selectedCategory?.name,
      productName: selectedProduct?.name,
      status: '상담대기'
    }]);
    setRegForm({ name: '', phone: '', dob: '', gender: '남', address: '', detailAddress: '', partnerId: isPartnerAdmin ? (partnerInfo?._id || '') : '', categoryId: '', productId: '', preferredTime: '', note: '', paymentType: '' });
  };

  const resetForm = () => {
    setRegForm(prev => ({ 
      ...prev, 
      name: '', 
      phone: '', 
      dob: '', 
      address: '', 
      detailAddress: '',
      productId: '',
      preferredTime: '',
      note: '',
      paymentType: ''
    }));
  };

  const directRegister = async () => {
    if (!regForm.name || !regForm.phone) { alert("이름과 연락처는 필수입니다."); return; }
    if (!regForm.paymentType) { alert("결제 방식을 선택해주세요."); return; }
    
    try {
      const selectedPartner = partners?.find(p => p._id === regForm.partnerId) || (isPartnerAdmin ? partnerInfo : null);
      const selectedCategory = productGroups?.find(g => g._id === regForm.categoryId);
      const selectedProduct = allProducts?.find(p => p._id === regForm.productId);

      await addCustomerBatch({
        customers: [{
          name: regForm.name,
          phone: regForm.phone,
          dob: regForm.dob,
          gender: regForm.gender,
          address: regForm.address,
          detailAddress: regForm.detailAddress,
          partnerId: (regForm.partnerId || (isPartnerAdmin ? partnerInfo?._id : undefined)) as any,
          partnerName: selectedPartner?.name || '본사직영',
          partnerLoginId: selectedPartner?.loginId || 'admin',
          categoryId: regForm.categoryId,
          categoryName: selectedCategory?.name,
          productId: regForm.productId,
          productName: selectedProduct?.name,
          paymentType: regForm.paymentType,
          status: '상담대기',
          note: regForm.note,
        }]
      });
      alert("등록되었습니다.");
      resetForm();
      setIsRegModalOpen(false);
    } catch (e: any) {
      alert(`등록 실패: ${e.message}`);
    }
  };

  const uploadBatch = async () => {
    if (pendingList.length === 0) return;
    if (!confirm(`${pendingList.length}명의 고객을 일괄 등록하시겠습니까?`)) return;
    
    try {
      console.log("Uploading batch:", pendingList);
      // Keep useful descriptive fields, only strip statusHistory which is handled by backend
      const cleanedCustomers = pendingList.map(({ statusHistory, ...rest }) => rest);
      console.log("Cleaned data:", cleanedCustomers);
      await addCustomerBatch({ customers: cleanedCustomers as any });
      setPendingList([]);
      alert("일괄 등록되었습니다.");
    } catch (e: any) {
      console.error("Batch upload error:", e);
      alert(`등록 실패: ${e.message || e.toString()}`);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다.");
  };

  const openModal = (customer: any) => {
    setSelectedCustomerId(customer._id);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status: string, memo: string) => {
    if (!selectedCustomer) return;
    try {
      console.log("Updating status:", { id: selectedCustomer._id, status, memo });
      await updateCustomer({
        id: selectedCustomer._id,
        status,
        memo,
        updatedBy: isPartnerAdmin ? (partnerInfo?.name || 'partner') : 'admin'
      });
      alert("변경되었습니다.");
    } catch (e: any) {
      console.error("Update failed detailed error:", e);
      alert(`변경 실패: ${e.message || '알 수 없는 오류'}`);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length > 0 && selectedIds.length === displayCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayCustomers.map(c => c._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length}명의 고객 정보를 영구 삭제하시겠습니까?`)) return;
    
    try {
      await removeBatch({ ids: selectedIds as any });
      setSelectedIds([]);
      alert("삭제되었습니다.");
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  const availableStatuses = (() => {
    const dbStatuses = globalSettings?.statuses ?? [];
    let statuses = dbStatuses.length > 0 ? dbStatuses : DEFAULT_STATUSES;
    
    if (!isPartnerAdmin) {
      // For HQ Admin, ensure current status is ALWAYS in the list
      if (selectedCustomer && !statuses.find((s: any) => s.name === selectedCustomer.status)) {
        statuses = [...statuses, { name: selectedCustomer.status, isActive: true, allowPartnerEdit: true }];
      }
      return statuses;
    }
    return statuses.filter((s: any) => s.isActive && s.allowPartnerEdit);
  })();

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Search & Register */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="px-1">
          <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">고객 통합 관리</h1>
          <p className="text-zinc-500 mt-1 font-medium text-sm lg:text-base">전체 고객의 인입 경로와 진행 상태를 실시간으로 모니터링합니다.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isSelectionMode && selectedIds.length > 0 && !isPartnerAdmin && (
            <button 
              onClick={handleDeleteSelected}
              className="bg-red-50 text-red-600 px-6 py-4 lg:px-8 lg:py-4 rounded-2xl lg:rounded-3xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <Trash2 size={20} /> <span className="whitespace-nowrap">{selectedIds.length}명 삭제</span>
            </button>
          )}
          {!isPartnerAdmin && (
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds([]);
              }}
              className={`px-6 py-4 lg:px-8 lg:py-4 rounded-2xl lg:rounded-3xl font-black transition-all flex items-center justify-center gap-2 border ${isSelectionMode ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              <CheckSquare size={20} /> <span className="whitespace-nowrap">{isSelectionMode ? '선택 모드 해제' : '고객 선택/삭제'}</span>
            </button>
          )}
          <button 
            onClick={() => setIsRegModalOpen(true)}
            className="bg-amber-500 text-zinc-950 px-6 py-4 lg:px-8 lg:py-4 rounded-2xl lg:rounded-3xl font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> <span className="whitespace-nowrap">고객 직접 등록</span>
          </button>
          <button className="bg-white border border-zinc-200 text-zinc-600 px-6 py-4 lg:px-8 lg:py-4 rounded-2xl lg:rounded-3xl font-black hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
            <FileDown size={20} /> <span className="whitespace-nowrap">엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* Filter Console */}
      <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl border border-zinc-200 p-5 lg:p-8 space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {/* Integrated Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">통합 검색</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="이름, 연락처, 상품..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                value={searchParams.searchTerm}
                onChange={e => setSearchParams({...searchParams, searchTerm: e.target.value})}
              />
            </div>
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">조회 기간</label>
            <select 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
              value={searchParams.period}
              onChange={e => setSearchParams({...searchParams, period: e.target.value})}
            >
              {['전체', '당월', '3개월', '6개월', '1년', '기간선택'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {searchParams.period === '기간선택' && (
              <div className="flex items-center gap-1 mt-2">
                <input type="date" className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-2 text-[10px]" value={searchParams.startDate} onChange={e => setSearchParams({...searchParams, startDate: e.target.value})} />
                <input type="date" className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-2 text-[10px]" value={searchParams.endDate} onChange={e => setSearchParams({...searchParams, endDate: e.target.value})} />
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">상품 필터</label>
            <select 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
              value={searchParams.categoryFilter}
              onChange={e => setSearchParams({...searchParams, categoryFilter: e.target.value})}
            >
              <option value="">전체 상품</option>
              {productGroups?.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">상태 필터</label>
            <select 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
              value={searchParams.statusFilter}
              onChange={e => setSearchParams({...searchParams, statusFilter: e.target.value})}
            >
              <option value="">전체 상태</option>
              {globalSettings?.statuses?.map((s: any) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Partner Filter (Only for HQ) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">파트너사 필터</label>
            <select 
              className={`w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none ${isPartnerAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isPartnerAdmin}
              value={isPartnerAdmin ? partnerInfo?._id : searchParams.partnerFilter}
              onChange={e => setSearchParams({...searchParams, partnerFilter: e.target.value})}
            >
              <option value="">전체 파트너</option>
              <option value="admin">본사직영</option>
              {partners?.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-zinc-100">
           <div className="flex items-center gap-6">
              {/* Sort By */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase">정렬</span>
                <div className="flex bg-zinc-100 rounded-xl p-1">
                  {[
                    { label: '등록일', val: 'regDate' },
                    { label: '수정일', val: 'updatedAt' }
                  ].map(s => (
                    <button 
                      key={s.val}
                      onClick={() => setSearchParams({...searchParams, sortBy: s.val})}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${searchParams.sortBy === s.val ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setSearchParams({...searchParams, sortOrder: searchParams.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-xl text-zinc-500 hover:bg-zinc-200"
                >
                  {searchParams.sortOrder === 'asc' ? <ChevronDown size={16} className="rotate-180" /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase">보기</span>
                <select 
                  className="bg-transparent border-none text-xs font-black focus:ring-0 cursor-pointer"
                  value={searchParams.pageSize}
                  onChange={e => setSearchParams({...searchParams, pageSize: Number(e.target.value)})}
                >
                  {[20, 50, 100].map(n => <option key={n} value={n}>{n}개씩</option>)}
                </select>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-zinc-600">신규등록(24h)</span>
                </div>
                <div className="w-px h-2 bg-zinc-200" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black text-zinc-600">정보수정(24h)</span>
                </div>
              </div>
              <div className="text-xs font-bold text-zinc-400">
                검색 결과: <span className="text-zinc-900">{displayCustomers.length}</span>건
              </div>
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
            <thead className="bg-zinc-50 text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-widest text-[10px]">
              <tr>
                {isSelectionMode && !isPartnerAdmin && (
                  <th className="py-5 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-all cursor-pointer"
                      checked={selectedIds.length > 0 && selectedIds.length === displayCustomers.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="py-5 px-8 w-12 text-center">No.</th>
                <th className="py-5 px-8">등록일</th>
                <th className="py-5 px-8">파트너</th>
                <th className="py-5 px-8">고객명</th>
                <th className="py-5 px-8">연락처</th>
                <th className="py-5 px-8 text-left">상품</th>
                <th className="py-5 px-8 text-left">결제방식</th>
                <th className="py-5 px-8 text-center">진행상태</th>
                <th className="py-5 px-8 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {displayCustomers.slice(0, searchParams.pageSize).map((customer, i) => {
                const label = getLabelInfo(customer);
                return (
                <tr key={customer._id} className={`group hover:bg-zinc-50 cursor-pointer transition-colors relative ${selectedIds.includes(customer._id) ? 'bg-amber-50/50' : ''}`} onClick={() => openModal(customer)}>
                  {isSelectionMode && !isPartnerAdmin && (
                    <td className="py-5 px-4 w-10 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-all cursor-pointer"
                        checked={selectedIds.includes(customer._id)}
                        onChange={(e) => toggleSelect(customer._id, e as any)}
                      />
                    </td>
                  )}
                  <td className="py-5 px-8 w-12 text-center text-zinc-400 font-medium relative">
                    {label && <div className={`absolute left-0 top-1 bottom-1 w-1 ${label.color} rounded-r-full`} />}
                    {displayCustomers.length - i}
                  </td>
                  <td className="py-5 px-8 text-zinc-500 font-medium">{formatDisplayDate(customer.regDate)}</td>
                  <td className="py-5 px-8">
                    <p className="text-zinc-900 font-bold">{customer.partnerName || '본사'}</p>
                    <p className="text-[10px] text-zinc-400">{customer.partnerLoginId || 'admin'}</p>
                  </td>
                  <td className="py-5 px-8 font-black text-zinc-900">{customer.name}</td>
                  <td className="py-5 px-8 text-zinc-600 font-bold">{customer.phone}</td>
                  <td className="py-5 px-8">
                    <span className="text-zinc-900 font-bold">{customer.categoryName || '-'}</span>
                    {customer.productName && <span className="text-zinc-400 ml-1 text-xs">({customer.productName})</span>}
                  </td>
                  <td className="py-5 px-8">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      customer.paymentType === '신한 48페이' 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {customer.paymentType || '60개월 렌탈'}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black shadow-sm ${
                      customer.status === '상담대기' ? 'bg-amber-100 text-amber-700' : 
                      customer.status === '계약완료' ? 'bg-green-100 text-green-700' : 
                      customer.status === '상담중' ? 'bg-blue-100 text-blue-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button className="w-9 h-9 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          
          {(displayCustomers.length === 0) && (
            <div className="py-40 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200">
                <Search size={40} />
              </div>
              <p className="text-zinc-400 font-black text-xl">검색 결과가 없습니다.</p>
              <button onClick={() => setSearchParams({...searchParams, searchTerm: '', period: '전체', statusFilter: '', partnerFilter: '', categoryFilter: ''})} className="text-amber-500 font-bold hover:underline">필터 초기화</button>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                  <User size={24} className="text-amber-500" /> 고객 직접 등록
                </h2>
                <p className="text-xs font-bold text-zinc-400 mt-1">상담을 신청할 고객 정보를 입력하세요.</p>
              </div>
              <button onClick={() => setIsRegModalOpen(false)} className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {!isPartnerAdmin && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">파트너사</label>
                      <select 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                        value={regForm.partnerId}
                        onChange={e => setRegForm({...regForm, partnerId: e.target.value})}
                      >
                        <option value="">본사직영</option>
                        {partners?.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({p.loginId})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">고객명 *</label>
                    <input type="text" placeholder="홍길동" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-black focus:outline-none" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">연락처 *</label>
                    <input type="text" placeholder="010-0000-0000" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-black focus:outline-none" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: formatPhone(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">생년월일</label>
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:outline-none" value={regForm.dob} onChange={e => setRegForm({...regForm, dob: formatDOB(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">성별</label>
                    <div className="flex bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                      {['남', '여'].map(g => (
                        <button 
                          key={g}
                          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${regForm.gender === g ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
                          onClick={() => setRegForm({...regForm, gender: g})}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">상품 카테고리</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:outline-none"
                      value={regForm.categoryId}
                      onChange={e => setRegForm({...regForm, categoryId: e.target.value, productId: ''})}
                    >
                      <option value="">카테고리 선택</option>
                      {filteredCategories.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">가전제품</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 text-sm font-bold focus:outline-none disabled:opacity-50"
                      value={regForm.productId}
                      disabled={!regForm.categoryId}
                      onChange={e => setRegForm({...regForm, productId: e.target.value})}
                    >
                      <option value="">상품 선택</option>
                      {filteredProducts.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">선호 통화 시간</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                      value={regForm.preferredTime}
                      onChange={e => setRegForm({...regForm, preferredTime: e.target.value})}
                    >
                      <option value="">시간 선택</option>
                      {["10시~12시", "13시~14시", "14시~15시", "15시~16시", "16시~18시"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">결제 방식 *</label>
                    <div className="flex bg-zinc-50 border border-zinc-200 rounded-2xl p-1">
                      {['60개월 렌탈', '신한 48페이'].filter(pt => availableRegMethods.includes(pt)).map(pt => (
                        <button 
                          key={pt}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${regForm.paymentType === pt ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
                          onClick={() => setRegForm({...regForm, paymentType: pt})}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">주소</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm" value={regForm.address} />
                      <button 
                        onClick={() => handleAddressSearch((addr) => setRegForm(prev => ({ ...prev, address: addr })))} 
                        className="bg-zinc-900 text-white px-8 rounded-2xl text-sm font-black hover:bg-zinc-800 transition-all"
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">상세주소</label>
                    <input type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm focus:outline-none" value={regForm.detailAddress} onChange={e => setRegForm({...regForm, detailAddress: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">비고</label>
                    <input 
                      type="text" 
                      placeholder="특이사항 입력"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm focus:outline-none"
                      value={regForm.note}
                      onChange={e => setRegForm({...regForm, note: e.target.value})}
                    />
                  </div>
               </div>

               {/* Pending List inside Modal */}
               {pendingList.length > 0 && (
                 <div className="mt-12 pt-10 border-t-2 border-dashed border-zinc-100 space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                       <Send className="text-amber-500" size={18} /> 일괄 등록 대기 중 ({pendingList.length})
                     </h3>
                     <button onClick={() => setPendingList([])} className="text-[10px] font-black text-zinc-400 hover:text-red-500 uppercase tracking-widest">목록 비우기</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {pendingList.map((item, i) => (
                       <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3 flex items-center gap-4 group">
                         <div className="flex-1">
                            <p className="text-zinc-900 font-black text-xs">{item.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold">{item.phone}</p>
                         </div>
                         <button onClick={() => setPendingList(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-300 hover:text-red-500">
                           <X size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                   <button 
                    onClick={async () => { await uploadBatch(); setIsRegModalOpen(false); }}
                    className="w-full py-5 bg-zinc-900 text-white rounded-2xl text-sm font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-2"
                   >
                     위 {pendingList.length}명 한꺼번에 등록하기
                   </button>
                 </div>
               )}
            </div>

            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between gap-4">
               <button onClick={() => setIsRegModalOpen(false)} className="px-8 py-4 border border-zinc-200 rounded-2xl font-bold text-zinc-500 hover:bg-white transition-all order-2 sm:order-1">닫기</button>
               <div className="flex gap-3 order-1 sm:order-2">
                 <button onClick={addToPending} className="flex-1 sm:flex-none px-6 py-4 bg-white border-2 border-amber-500 text-amber-600 rounded-2xl font-black hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> 목록에 추가
                 </button>
                 <button onClick={directRegister} className="flex-1 sm:flex-none px-8 py-4 bg-amber-500 text-zinc-950 rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} /> 즉시 등록
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Detailed Customer Modal */}
      {isModalOpen && selectedCustomerId && selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCustomerId(null);
          }}
          globalSettings={globalSettings}
          isPartnerAdmin={isPartnerAdmin}
          partnerInfo={partnerInfo}
          availableStatuses={availableStatuses}
          onUpdateStatus={handleUpdateStatus}
          onAddressSearch={(callback: (addr: string) => void) => handleAddressSearch(callback)}
          onSave={async (data: any) => {
            try {
              // Strip internal fields before sending to mutation
              // updatedAt is managed by backend, sending it will cause schema error
              const { _id, _creationTime, statusHistory, updatedAt, ...updateData } = data;
              await updateCustomer({ 
                id: _id, 
                ...updateData, 
                updatedBy: (isPartnerAdmin ? partnerInfo?.name : 'admin') || 'system'
              });
              alert("최종 저장되었습니다.");
              setIsModalOpen(false);
              setSelectedCustomerId(null);
            } catch (e) { 
              console.error(e);
              alert("저장 실패"); 
            }
          }}
        />
      )}
    </div>
  );
}

function CustomerDetailModal({ 
  customer, onClose, globalSettings, isPartnerAdmin, partnerInfo, 
  availableStatuses, onUpdateStatus, onAddressSearch, onSave
}: any) {
  const [localData, setLocalData] = useState({ ...customer });
  const [statusMemo, setStatusMemo] = useState('');
  const [newStatus, setNewStatus] = useState(customer.status);

  const productGroups = useQuery(api.products.listGroups);
  const allProducts = useQuery(api.products.listProducts, {});

  const filteredProducts = allProducts?.filter(p => p.groupId === localData.categoryId) || [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
              <User size={24} className="text-amber-500" /> 고객 상세 정보
            </h2>
            <p className="text-xs font-bold text-zinc-400 mt-1">ID: {customer._id}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Forms */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Section 1: Progress & Status */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <RefreshCw size={14} /> 진행 상태 관리
                </h3>
                <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">진행 상태 변경</label>
                      <select 
                        className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                      >
                        {!availableStatuses.find((s: any) => s.name === customer.status) && (
                          <option value={customer.status}>{customer.status} (수정 권한 없음)</option>
                        )}
                        {availableStatuses.map((s: any) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">상태 변경 메모</label>
                      <input 
                        type="text" 
                        placeholder="변경 사유나 특이사항 입력"
                        className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                        value={statusMemo}
                        onChange={e => setStatusMemo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={async () => {
                        await onUpdateStatus(newStatus, statusMemo);
                        setStatusMemo(''); // Clear local memo after successful parent call
                      }}
                      className="bg-zinc-900 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      <Save size={18} /> 상태 저장
                    </button>
                  </div>
                </div>
              </section>

              {/* Section 2: Payment & Schedule Info */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={14} /> 결제 및 상담 일정 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { label: "신규등록일", key: "regDate", icon: <Calendar size={16} /> },
                    { label: "제품결제일", key: "productPayDate", icon: <Calendar size={16} /> },
                    { label: "초회납입일", key: "firstPayDate", icon: <Calendar size={16} /> },
                    { label: "해약처리일", key: "cancelDate", icon: <Calendar size={16} />, color: "text-red-500" },
                    { label: "청약철회일", key: "withdrawDate", icon: <Calendar size={16} />, color: "text-zinc-400" },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-1">
                        {item.icon} {item.label}
                      </label>
                      <input 
                        type="date" 
                        className={`w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none ${item.color || 'text-zinc-900 font-bold'}`}
                        value={localData[item.key]?.split(' ')[0] || ''}
                        onChange={e => setLocalData({...localData, [item.key]: e.target.value})}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-1">
                      <CreditCard size={16} /> 결제 방식 (렌탈/48페이)
                    </label>
                    <div className="flex bg-zinc-50 border border-zinc-200 rounded-2xl p-1">
                      {['60개월 렌탈', '신한 48페이'].map(pt => (
                        <button 
                          key={pt}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${localData.paymentType === pt ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                          onClick={() => setLocalData({...localData, paymentType: pt})}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-1">
                      <CreditCard size={16} /> 납입방법
                    </label>
                    <div className="flex bg-zinc-50 border border-zinc-200 rounded-2xl p-1">
                      {['카드', '계좌이체'].map(m => (
                        <button 
                          key={m}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${localData.payMethod === m ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                          onClick={() => setLocalData({...localData, payMethod: m})}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase">비고</label>
                  <textarea 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-[2rem] px-6 py-5 text-sm focus:outline-none h-24"
                    value={localData.note || ''}
                    onChange={e => setLocalData({...localData, note: e.target.value})}
                    placeholder="추가적인 상담 메모나 요청사항을 입력하세요."
                  />
                </div>
              </section>

              {/* Section 3: Customer Information */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={14} /> 기본 고객 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">고객명</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-black pr-12"
                        value={localData.name || ''}
                        onChange={e => setLocalData({...localData, name: e.target.value})}
                      />
                      <button onClick={() => handleCopy(localData.name)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">연락처</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-black pr-12"
                        value={localData.phone || ''}
                        onChange={e => setLocalData({...localData, phone: formatPhone(e.target.value)})}
                      />
                      <button onClick={() => handleCopy(localData.phone)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">성별</label>
                    <div className="flex bg-zinc-50 border border-zinc-200 rounded-2xl p-1">
                      {['남', '여'].map(g => (
                        <button 
                          key={g}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${localData.gender === g ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                          onClick={() => setLocalData({...localData, gender: g})}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">생년월일</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold"
                      value={localData.dob || ''}
                      placeholder="YYYY-MM-DD"
                      onChange={e => setLocalData({...localData, dob: formatDOB(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">주소</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm" value={localData.address || ''} />
                      <button 
                        onClick={() => onAddressSearch((addr: string) => setLocalData({ ...localData, address: addr }))} 
                        className="bg-zinc-900 text-white px-6 rounded-2xl text-sm font-bold"
                      >
                        검색
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">상세주소</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm"
                      value={localData.detailAddress || ''}
                      onChange={e => setLocalData({...localData, detailAddress: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Section 4: Application Product Info */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package size={14} /> 신청 상품 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">상품 유형</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
                      value={localData.categoryId || ''}
                      onChange={e => {
                        const cat = productGroups?.find(g => g._id === e.target.value);
                        setLocalData({...localData, categoryId: e.target.value as any, categoryName: cat?.name || ''});
                      }}
                    >
                      <option value="">카테고리 선택</option>
                      {productGroups?.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">가전제품</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
                      value={localData.productId || ''}
                      onChange={e => {
                        const prod = allProducts?.find(p => p._id === e.target.value);
                        setLocalData({...localData, productId: e.target.value as any, productName: prod?.name || ''});
                      }}
                    >
                      <option value="">상품 선택</option>
                      {filteredProducts.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-1">
                      <Clock size={16} /> 선호 통화 시간
                    </label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none"
                      value={localData.preferredTime || ''}
                      onChange={e => setLocalData({...localData, preferredTime: e.target.value})}
                    >
                      <option value="">시간 선택</option>
                      {["10시~12시", "13시~14시", "14시~15시", "15시~16시", "16시~18시"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
              </section>

              {/* Section 5: Partner Info */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   🏢 파트너 정보
                </h3>
                <div className="bg-zinc-900 text-white rounded-3xl p-8 grid grid-cols-2 gap-10">
                   <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">파트너사</p>
                      <p className="text-xl font-black">{customer.partnerName || '본사직영'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">파트너 ID</p>
                      <p className="text-xl font-black">{customer.partnerLoginId || 'admin'}</p>
                   </div>
                </div>
              </section>

            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-zinc-100 pt-10 lg:pt-0 lg:pl-10 space-y-8">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2">
                 <History size={16} className="text-amber-500" /> 상태 변경 이력
              </h3>
              
              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-zinc-100" />
                
                {[...customer.statusHistory].reverse().map((log, idx) => (
                  <div key={idx} className="relative pl-12">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-zinc-300 ring-4 ring-white" />
                    {idx === 0 && <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 animate-ping" />}
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          log.status === '상담대기' ? 'bg-amber-100 text-amber-700' :
                          log.status === '계약완료' ? 'bg-green-100 text-green-700' :
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400">{formatDisplayDate(log.updatedAt)}</span>
                      </div>
                      <p className="text-sm font-bold text-zinc-800">{log.memo || '-'}</p>
                      <p className="text-[10px] text-zinc-400">By: {log.updatedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-8 py-3.5 border border-zinc-200 rounded-2xl font-bold text-zinc-500 hover:bg-white transition-all">닫기</button>
          <button 
            onClick={() => onSave(localData)}
            className="px-10 py-3.5 bg-zinc-900 text-white rounded-2xl font-black shadow-xl shadow-zinc-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={20} /> 최종 저장
          </button>
        </div>
      </div>
    </div>
  );
}
