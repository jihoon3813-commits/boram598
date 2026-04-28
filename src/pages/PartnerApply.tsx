import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, ChevronRight, Check } from 'lucide-react';

export default function PartnerApply() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-amber-500/30">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
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
                  <input type="text" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="(주)디엠앤케이" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">대표자명</label>
                  <input type="text" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="홍길동" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">사업자등록번호</label>
                <input type="text" className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="123-45-67890 (- 포함)" />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">회사 주소</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" readOnly className="w-32 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3" placeholder="우편번호" />
                    <button type="button" className="bg-zinc-200 text-zinc-800 px-6 rounded-xl font-bold hover:bg-zinc-300 transition-colors text-sm">
                      주소 검색
                    </button>
                  </div>
                  <input type="text" readOnly className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3" placeholder="기본 주소" />
                  <input type="text" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="상세 주소를 입력해주세요" />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">담당자명</label>
                  <input type="text" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="담당자 이름" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">담당자 연락처</label>
                  <input type="tel" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="010-0000-0000 (- 제외 자동입력)" />
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
                  <span className="text-zinc-500 font-mono hidden sm:inline">https://</span>
                  <input type="text" required className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" placeholder="영문 소문자/숫자 조합" />
                  <span className="text-zinc-500 font-mono">.boram598.com</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">* 입력하신 아이디가 파트너님의 분양몰 접속 주소로 사용됩니다.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">비밀번호</label>
                  <input type="password" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="8자 이상 영문/숫자 조합" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">비밀번호 확인</label>
                  <input type="password" required className="w-full border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="비밀번호 다시 입력" />
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
