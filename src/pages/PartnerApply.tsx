import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, ChevronRight, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function PartnerApply() {
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    ceoName: '',
    businessNumber: '',
    zipCode: '',
    address: '',
    detailAddress: '',
    managerName: '',
    managerPhone: '',
    loginId: '',
    password: '',
    confirmPassword: '',
  });

  // Formatting helpers
  const formatBusinessNumber = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 10);
    if (raw.length <= 3) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`;
  };

  const formatPhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  };

  const handleAddressSearch = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        let fullAddr = data.roadAddress;
        let extraAddr = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddr += data.bname;
          if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
        }

        setForm(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddr
        }));
      }
    }).open();
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-amber-500/30">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-zinc-400" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
              alt="Logo" 
              className="h-12 w-auto" 
            />
          </Link>
          <div className="text-sm font-bold text-zinc-500">
            공식 파트너 신청
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">함께 성장할 <span className="text-amber-500">파트너</span>를 모십니다.</h1>
          <p className="text-zinc-500 text-lg">간단한 정보 입력으로 보람상조 피플의 프리미엄 분양몰을 시작하세요.</p>
        </motion.div>

        <form className="space-y-8">
          
          {/* Section 1: 추천인 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">1</span>
              추천인 (상위 파트너)
            </h2>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">상위 파트너 검색</label>
              <div className="flex gap-2">
                <input type="text" className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow" placeholder="상위 파트너의 아이디 또는 회사명을 검색하세요" readOnly />
                <button type="button" className="bg-zinc-900 text-white px-6 rounded-xl font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2">
                  <Search size={18} /> 검색
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">* 추천인이 없는 경우 본사 직속 파트너로 배정됩니다.</p>
            </div>
          </section>

          {/* Section 2: 회사 정보 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">2</span>
              회사 및 담당자 정보
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">회사명 (상호)</label>
                  <input 
                    type="text" 
                    required 
                    autoComplete="off"
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="주식회사 회사명" 
                    value={form.companyName}
                    onChange={e => setForm({...form, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">대표자명</label>
                  <input 
                    type="text" 
                    required 
                    autoComplete="off"
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="홍길동" 
                    value={form.ceoName}
                    onChange={e => setForm({...form, ceoName: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">사업자등록번호</label>
                <input 
                  type="text" 
                  autoComplete="off"
                  inputMode="numeric"
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="123-45-67890" 
                  value={form.businessNumber}
                  onChange={e => setForm({...form, businessNumber: formatBusinessNumber(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">회사 주소</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      className="w-32 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3" 
                      placeholder="우편번호" 
                      value={form.zipCode}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddressSearch}
                      className="bg-zinc-200 text-zinc-800 px-6 rounded-xl font-bold hover:bg-zinc-300 transition-colors text-sm"
                    >
                      주소 검색
                    </button>
                  </div>
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3" 
                    placeholder="기본 주소" 
                    value={form.address}
                  />
                  <input 
                    type="text" 
                    required 
                    autoComplete="off"
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="상세 주소를 입력해주세요" 
                    value={form.detailAddress}
                    onChange={e => setForm({...form, detailAddress: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">담당자명</label>
                  <input 
                    type="text" 
                    required 
                    autoComplete="off"
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="담당자 이름" 
                    value={form.managerName}
                    onChange={e => setForm({...form, managerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">담당자 연락처</label>
                  <input 
                    type="tel" 
                    required 
                    autoComplete="off"
                    inputMode="numeric"
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="010-0000-0000" 
                    value={form.managerPhone}
                    onChange={e => setForm({...form, managerPhone: formatPhone(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: 분양몰 정보 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">3</span>
              분양몰 및 계정 정보
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">아이디 (서브도메인 겸용)</label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono hidden sm:inline">borampeople.vercel.app/</span>
                  <input 
                    type="text" 
                    required 
                    autoComplete="off"
                    className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" 
                    placeholder="영문 소문자/숫자 조합" 
                    value={form.loginId}
                    onChange={e => setForm({...form, loginId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">* 입력하신 아이디가 파트너님의 분양몰 접속 주소로 사용됩니다.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">비밀번호</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      autoComplete="new-password"
                      className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12" 
                      placeholder="8자 이상 영문/숫자 조합" 
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">비밀번호 확인</label>
                  <input 
                    type="password" 
                    required 
                    autoComplete="new-password"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      form.confirmPassword && form.password !== form.confirmPassword 
                        ? 'border-red-500' 
                        : form.confirmPassword && form.password === form.confirmPassword 
                          ? 'border-green-500' 
                          : 'border-zinc-300'
                    }`} 
                    placeholder="비밀번호 다시 입력" 
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: 동의 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 bg-amber-50/30">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="w-6 h-6 border-2 border-zinc-300 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                  <Check size={16} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">개인정보 수집 및 파트너 이용약관 동의 (필수)</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  (주)디엠앤케이는 파트너 승인 및 분양몰 개설을 위해 위와 같이 최소한의 개인정보를 수집합니다. 수집된 정보는 파트너 계약 해지 시까지 안전하게 보관됩니다.
                </p>
              </div>
            </label>
          </section>

          {/* Submit */}
          <div className="pt-6">
            <button 
              type="button" 
              className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-xl
                ${agreed ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-2xl hover:-translate-y-1' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
              disabled={!agreed}
            >
              파트너 신청 완료하기 <ChevronRight size={20} />
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
