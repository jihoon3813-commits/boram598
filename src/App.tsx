import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Minus, 
  Tv, 
  RefreshCcw, 
  Palmtree, 
  Ship, 
  Heart, 
  CreditCard, 
  ChevronRight,
  Menu,
  X,
  Award,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Phone
} from 'lucide-react';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-zinc-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors duration-500 ${scrolled ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span className={`font-extrabold text-xl tracking-tight transition-colors duration-500 ${scrolled ? 'text-zinc-900' : 'text-white'}`}>
            보람상조<span className={scrolled ? 'text-amber-600' : 'text-amber-400'}>피플</span>
          </span>
        </div>
        
        <div className={`hidden md:flex gap-10 text-sm font-semibold tracking-wide transition-colors duration-500 ${scrolled ? 'text-zinc-600' : 'text-zinc-200'}`}>
          <a href="#comparison" className="hover:text-amber-500 transition-colors">가치비교</a>
          <a href="#pricing" className="hover:text-amber-500 transition-colors">상품안내</a>
          <a href="#benefits" className="hover:text-amber-500 transition-colors">핵심혜택</a>
          <a href="#conversion" className="hover:text-amber-500 transition-colors">프리미엄전환</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="#contact" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all">
            간편 상담신청
          </a>
          <button className={`md:hidden ${scrolled ? 'text-zinc-900' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-100 shadow-xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-center">
              <a href="#comparison" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">가치비교</a>
              <a href="#pricing" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">상품안내</a>
              <a href="#benefits" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">핵심혜택</a>
              <a href="#conversion" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">프리미엄전환</a>
              <a href="#contact" onClick={() => setIsOpen(false)} className="bg-zinc-900 text-white py-3 rounded-xl font-bold">지금 바로 상담하기</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [formData, setFormData] = useState({ name: '', phone: '', product: '' });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500/30">
      <Navbar />

      {/* --- Section 1: Hero Section (Sophisticated & Cinematic) --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 pt-20">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2560" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-start justify-center">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-bold letter tracking-widest mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                SAMSUNG & LG 프리미엄 가전 한정 혜택
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.15] mb-8 tracking-tight">
                최신 가전은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">오늘 받고</span>, <br />
                만기 시 <span className="relative inline-block">
                  <span className="relative z-10">100% 돌려받는</span>
                  <div className="absolute bottom-1 md:bottom-3 left-0 w-full h-3 md:h-5 bg-amber-500/30 -z-10" />
                </span><br />
                격이 다른 소비의 시작.
              </h1>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-zinc-300 text-lg md:text-2xl font-light mb-12 leading-relaxed max-w-2xl">
                월 29,900원의 선이자 혜택으로 <br className="hidden md:block" />우리 집 공간의 품격을 올리고 납입금 전액은 자산으로 남깁니다.
              </p>
            </FadeIn>

            <FadeIn delay={0.7} className="flex flex-col sm:flex-row gap-5 items-center">
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-10 py-5 bg-white text-zinc-950 rounded-full text-lg font-bold transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
              >
                0원으로 프리미엄 가전 신청
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">
                누적 신청 <span className="text-amber-400 font-bold">1,248</span>건 돌파
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 2: Value Comparison (Minimalist & Impactful) --- */}
      <section id="comparison" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <FadeIn>
              <h2 className="text-sm font-bold text-amber-600 tracking-widest uppercase mb-4">Value Proposition</h2>
              <h3 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">소비할 것인가, 저축할 것인가?</h3>
              <p className="mt-6 text-zinc-500 text-lg flex items-center justify-center gap-2">
                같은 가전을 들여도 <span className="font-bold text-zinc-800 border-b border-zinc-800">결과는 완전히 다릅니다.</span>
              </p>
            </FadeIn>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto relative">
            {/* The Old Way */}
            <FadeIn delay={0.2} className="bg-zinc-50 rounded-[2.5rem] p-10 md:p-14 border border-zinc-100 flex flex-col h-full opacity-80 filter grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center justify-between mb-12">
                <h4 className="text-2xl font-bold text-zinc-400">기존 할부/공기 구매</h4>
                <div className="w-12 h-12 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center">
                  <Minus strokeWidth={3} />
                </div>
              </div>
              <ul className="space-y-8 flex-1">
                {[
                  { title: "비용 소멸", desc: "매달 내는 할부금은 그대로 지출 처리되어 사라집니다." },
                  { title: "이자 부담", desc: "장기 할부 시 보이지 않는 이자가 제품가에 포함됩니다." },
                  { title: "감가상각의 늪", desc: "가전의 가치는 0원이 되지만 할부금은 여전히 남습니다." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <X className="text-zinc-400 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-zinc-700 text-lg mb-1">{item.title}</p>
                      <p className="text-zinc-500 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12 pt-8 border-t border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-2">Result</p>
                <p className="text-3xl font-black text-zinc-300">순수 지출 발생</p>
              </div>
            </FadeIn>

            {/* Absolute VS Badge for Tablet/Desktop */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 bg-white rounded-full items-center justify-center shadow-xl border border-zinc-100">
              <span className="font-black text-2xl text-zinc-300 italic">VS</span>
            </div>

            {/* The B299 Way */}
            <FadeIn delay={0.4} className="bg-zinc-950 text-white rounded-[2.5rem] p-10 md:p-14 border border-zinc-800 flex flex-col h-full shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                  보람 플랜 <span className="text-amber-500 italic">B299</span>
                </h4>
                <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Check strokeWidth={3} />
                </div>
              </div>
              <ul className="space-y-8 flex-1 relative z-10">
                {[
                  { title: "안전한 자산 형성", desc: "납입하는 금액 전체가 보람상조를 통한 자산으로 저축됩니다." },
                  { title: "최신 가전 선이자 지급", desc: "저축에 대한 선이자 개념으로 최신 가전을 즉시 제공합니다." },
                  { title: "100% 전액 환급", desc: "만기 유지 시 지금까지 낸 금액을 1원도 빠짐없이 돌려드립니다." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="text-amber-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-white text-lg mb-1">{item.title}</p>
                      <p className="text-zinc-400 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12 pt-8 border-t border-zinc-800 relative z-10">
                <p className="text-amber-500/70 font-bold uppercase tracking-widest text-sm mb-2">Result</p>
                <p className="text-3xl font-black text-amber-500">자산 형성 + 무료 가전</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 3: Pricing Table (Elegant Cards) --- */}
      <section id="pricing" className="py-32 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <h2 className="text-sm font-bold text-zinc-500 tracking-widest uppercase mb-4">Investment Plan</h2>
            <h3 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">당신의 라이프스타일에 맞춘 설계</h3>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((unit, i) => (
              <FadeIn key={unit} delay={i * 0.1}>
                <div className={`p-8 rounded-[2rem] bg-white transition-all duration-300 h-full flex flex-col
                  ${unit === 1 ? 'ring-2 ring-zinc-900 shadow-xl' : 'border border-zinc-200 shadow-sm hover:shadow-md'}`}
                >
                  {unit === 1 && (
                    <div className="self-start px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-full mb-6 tracking-wide">
                      BEST CHOICE
                    </div>
                  )}
                  {unit !== 1 && <div className="h-6 mb-6" />} {/* Spacer to align with Best Choice */}

                  <div className="mb-8">
                    <h4 className="text-zinc-400 text-sm font-semibold tracking-widest uppercase mb-2">{unit}구좌 패키지</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-zinc-900">{(unit * 2.99).toFixed(2)}</span>
                      <span className="text-zinc-500 font-medium">만 / 월</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-10">
                    <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                      <span className="text-zinc-500 text-sm">만기 환급률</span>
                      <span className="font-bold text-amber-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                      <span className="text-zinc-500 text-sm">총 환급액</span>
                      <span className="font-bold text-zinc-900">{(unit * 598).toLocaleString()}만원</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-zinc-500 text-sm">제휴 가전</span>
                      <span className="font-medium text-zinc-700 text-right text-sm">최신 프리미엄<br/>라인업 지원</span>
                    </div>
                  </div>

                  <a 
                    href="#contact" 
                    className={`block w-full text-center py-4 rounded-xl font-bold transition-all
                      ${unit === 1 ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100'}`}
                  >
                    이 조건으로 신청
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="mt-20">
            <div className="bg-white p-10 md:p-14 rounded-[2.5rem] border border-zinc-200 flex flex-col lg:flex-row items-center gap-10">
              <div className="lg:w-1/3">
                <h4 className="text-2xl font-black mb-4">납입 및 환급 로드맵</h4>
                <p className="text-zinc-500 leading-relaxed font-light">가입 즉시 가전을 수령하고, 만기 시 전액 환급받는 가장 투명하고 안전한 플랜입니다.</p>
              </div>
              <div className="lg:w-2/3 w-full">
                <div className="h-4 bg-zinc-100 rounded-full flex overflow-hidden mb-8 w-full">
                  <div className="h-full bg-amber-500 w-[30%]" />
                  <div className="h-full bg-zinc-900 w-[70%]" />
                </div>
                <div className="flex justify-between relative">
                  <div className="w-[30%]">
                    <p className="font-bold text-amber-600">1~60회 (5년)</p>
                    <p className="text-sm text-zinc-500 mt-1">가전제품 부금 납입</p>
                  </div>
                  <div className="w-[70%] pl-6 border-l border-zinc-200">
                    <p className="font-bold text-zinc-900">61~200회 (만기)</p>
                    <p className="text-sm text-zinc-500 mt-1">상조 부금 납입 및 자산화</p>
                  </div>
                  <div className="absolute right-0 top-0 bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-xl -mt-4 shadow-lg flex items-center gap-2">
                    <RefreshCcw size={14} /> 100% 환급 달성
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 4: Bento Grid Benefits --- */}
      <section id="benefits" className="py-32 bg-zinc-950 text-zinc-100 relative overflow-hidden">
         {/* Abstract background glow */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn className="mb-16">
            <h2 className="text-sm font-bold text-amber-500 tracking-widest uppercase mb-4">Core Benefits</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">수준이 다른 보람의 특권</h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[240px]">
            {/* Benefit 1 (Large) */}
            <FadeIn delay={0.1} className="md:col-span-6 lg:col-span-8 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-10 flex border-t-zinc-800/80 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1000" alt="Home Appliance" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" />
              <div className="relative z-20 flex flex-col justify-between h-full">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-400">
                  <Tv size={28} />
                </div>
                <div>
                  <h4 className="text-3xl font-black mb-3">최고의 브랜드, 즉시 배송</h4>
                  <p className="text-zinc-400 font-light leading-relaxed max-w-md">삼성, LG 등 메이저 브랜드의 최신 홈 가전을 가입 즉시 원하는 곳으로 안전하게 배송 및 설치해 드립니다.</p>
                </div>
              </div>
            </FadeIn>

            {/* Benefit 2 */}
            <FadeIn delay={0.2} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 flex flex-col justify-between">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <RefreshCcw size={24} />
               </div>
               <div>
                 <h4 className="text-xl font-bold mb-2">100% 전액 환급</h4>
                 <p className="text-sm text-zinc-400 font-light leading-relaxed">만기 시까지 유지하신 납입금 전액을 한 치의 오차 없이 돌려드립니다.</p>
               </div>
            </FadeIn>

            {/* Benefit 3 */}
            <FadeIn delay={0.3} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 flex flex-col justify-between">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <Palmtree size={24} />
               </div>
               <div>
                 <h4 className="text-xl font-bold mb-2">프리미엄 리조트 멤버십</h4>
                 <p className="text-sm text-zinc-400 font-light leading-relaxed">전국 럭셔리 호텔 및 리조트를 최대 80% 할인된 회원가로 제공합니다.</p>
               </div>
            </FadeIn>

             {/* Benefit 4 */}
             <FadeIn delay={0.4} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 flex flex-col justify-between">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-500">
                  <ArrowRightLeft size={24} />
               </div>
               <div>
                 <h4 className="text-xl font-bold mb-2">라이프 플랜 전환</h4>
                 <p className="text-sm text-zinc-400 font-light leading-relaxed">크루즈, 웨딩, 장례 등 상황에 맞춰 필요한 서비스로 언제든 전환 가능합니다.</p>
               </div>
            </FadeIn>

             {/* Benefit 5 */}
             <FadeIn delay={0.5} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 flex flex-col justify-between overflow-hidden relative">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                 <Award size={100} />
               </div>
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white relative z-10">
                  <Award size={24} />
               </div>
               <div className="relative z-10">
                 <h4 className="text-xl font-bold mb-2">33만 건의 신뢰 증명</h4>
                 <p className="text-sm text-zinc-400 font-light leading-relaxed">압도적인 누적 행사 건수로 증명되는 대한민국 1등 상조의 자부심.</p>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 5: Affiliate Cards (Minimalist Clean) --- */}
      <section className="py-32 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-50 rounded-[3rem] p-10 md:p-20 flex flex-col lg:flex-row items-center gap-16 border border-zinc-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-zinc-200/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <FadeIn className="lg:w-1/2 relative z-10">
              <h2 className="text-sm font-bold text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                <CreditCard size={16} /> Affiliate Benefits
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-8">
                제휴카드 결제 시 <br />
                실부담금 <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 border-b-2 border-zinc-900">단 4,900원</span>
              </h3>
              <p className="text-zinc-500 text-lg leading-relaxed font-light mb-10">
                보람상조 하나/국민/롯데 제휴카드로 실적 조건을 충족하시면, 최대 월 25,000원의 청구 할인을 통해 체감 비용을 극적으로 낮출 수 있습니다.
              </p>
              
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">전월 실적 30만원 이상</span>
                  <span className="font-bold text-zinc-900">11,000원 할인</span>
                </div>
                <div className="flex justify-between items-center p-5 border-b border-zinc-100 bg-zinc-50/50">
                  <span className="text-zinc-600 font-medium">전월 실적 70만원 이상</span>
                  <span className="font-bold text-zinc-900">15,000원 할인</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-zinc-900 text-white">
                  <span className="font-medium">전월 실적 100만원 이상</span>
                  <span className="font-bold text-amber-400">최대 25,000원 할인</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:w-1/2 relative z-10 w-full max-w-sm mx-auto">
               <div className="relative aspect-[1.58/1]">
                 <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[20px] shadow-2xl transform -rotate-6 translate-x-4 translate-y-4 opacity-50" />
                 <div className="absolute inset-0 bg-gradient-to-bl from-zinc-100 to-white rounded-[20px] shadow-xl border border-zinc-200 transform rotate-2 p-6 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <div className="w-12 h-9 bg-zinc-200 rounded-lg flex items-center justify-center border border-zinc-300">
                       <div className="w-6 h-4 bg-zinc-300 flex space-x-1 p-0.5">
                         <div className="flex-1 bg-zinc-400" />
                         <div className="flex-1 bg-zinc-400" />
                         <div className="flex-1 bg-zinc-400" />
                       </div>
                     </div>
                     <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">Platinum</span>
                   </div>
                   <div>
                     <p className="font-mono text-xl tracking-[0.2em] text-zinc-600 mb-2">4000 1234 5678 9010</p>
                     <div className="flex justify-between items-end">
                       <p className="text-xs text-zinc-500 font-medium uppercase">Boram Exclusive</p>
                       <div className="flex">
                         <div className="w-6 h-6 rounded-full bg-red-500/80" />
                         <div className="w-6 h-6 rounded-full bg-amber-500/80 -ml-2 mix-blend-multiply" />
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 6: Premium Conversion Service --- */}
      <section id="conversion" className="py-32 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <h2 className="text-sm font-bold text-zinc-500 tracking-widest uppercase mb-4">Premium Lifestyle</h2>
            <h3 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">당신의 빛나는 모든 순간과 함께</h3>
            <p className="mt-6 text-zinc-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              상조 서비스의 경계를 넘어, 인생의 소중한 순간들을 위한 프리미엄 서비스로 제약 없이 전환하실 수 있습니다.
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Cruise */}
            <FadeIn delay={0.1} className="group overflow-hidden rounded-[2.5rem] relative aspect-[4/5] bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&q=80&w=1200" alt="Luxury Cruise" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-10 md:p-12">
                <Ship className="text-white mb-6" size={32} />
                <h4 className="text-3xl font-black text-white mb-4 tracking-tight">럭셔리 크루즈 여행</h4>
                <p className="text-zinc-300 font-light leading-relaxed">지중해, 알래스카, 동남아 등 세계 유수의 명소를 누비는 초호화 크루즈 여행으로 완벽한 재충전을 선사합니다.</p>
              </div>
            </FadeIn>

            {/* Wedding */}
            <FadeIn delay={0.3} className="group overflow-hidden rounded-[2.5rem] relative aspect-[4/5] bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200" alt="Premium Wedding" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-10 md:p-12">
                <Heart className="text-white mb-6" size={32} />
                <h4 className="text-3xl font-black text-white mb-4 tracking-tight">프리미엄 웨딩 패키지</h4>
                <p className="text-zinc-300 font-light leading-relaxed">최고급 링컨 리무진 웨딩카 지원부터 하이엔드 드레스까지, 생애 가장 빛나는 순간을 완벽하게 디자인합니다.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 7: Lead Form / Contact --- */}
      <section id="contact" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-5">
              <FadeIn>
                <div className="w-16 h-16 bg-zinc-950 flex items-center justify-center rounded-2xl text-white mb-8">
                  <Phone size={32} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
                  지금 바로 <br />
                  <span className="text-amber-500">VIP 상담</span>을<br />
                  신청하세요.
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light mb-12">
                  단 한 번의 상담으로 고객님의 평생 자산 플랜과 <br className="hidden md:block" />가전 혜택을 명확히 안내해 드립니다.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-l-2 border-zinc-200 pl-4">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest w-24">고객센터</p>
                    <p className="text-2xl font-black text-zinc-900 tracking-wider">1588-XXXX</p>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-zinc-200 pl-4">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest w-24">운영시간</p>
                    <p className="text-zinc-600 font-medium">평일 09:00 ~ 18:00 <span className="text-zinc-400 text-sm font-light">(주말/공휴일 휴무)</span></p>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7 w-full">
              <FadeIn delay={0.2} className="bg-zinc-50 border border-zinc-200 p-10 md:p-14 rounded-[2.5rem] shadow-xl">
                 <h3 className="text-2xl font-black text-zinc-900 mb-8">무료 간편 상담 신청</h3>
                 
                 <form className="space-y-8">
                   <div className="grid md:grid-cols-2 gap-8">
                     <div className="relative">
                        <input 
                          type="text" 
                          id="name"
                          required
                          className="peer w-full bg-transparent border-0 border-b-2 border-zinc-300 py-3 text-zinc-900 placeholder-transparent focus:ring-0 focus:border-zinc-900 transition-colors"
                          placeholder="성함"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <label htmlFor="name" className="absolute left-0 -top-3.5 text-xs font-bold text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900">
                          이름
                        </label>
                     </div>
                     <div className="relative">
                        <input 
                          type="tel" 
                          id="phone"
                          required
                          className="peer w-full bg-transparent border-0 border-b-2 border-zinc-300 py-3 text-zinc-900 placeholder-transparent focus:ring-0 focus:border-zinc-900 transition-colors"
                          placeholder="연락처"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <label htmlFor="phone" className="absolute left-0 -top-3.5 text-xs font-bold text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900">
                          연락처 (- 제외)
                        </label>
                     </div>
                   </div>

                   <div className="relative pt-4">
                      <select 
                        required
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-4 text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:outline-none appearance-none font-medium"
                        value={formData.product}
                        onChange={(e) => setFormData({...formData, product: e.target.value})}
                      >
                        <option value="" disabled className="text-zinc-400">원하시는 가전 품목을 선택해주세요</option>
                        <option value="TV">삼성 / LG 대형 TV (QLED/OLED)</option>
                        <option value="FRIDGE">프리미엄 세탁기 / 건조기 타워</option>
                        <option value="WASHER">오브제 / 비스포크 4도어 냉장고</option>
                        <option value="LAPTOP">최신형 노트북 / 프리미엄 PC</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 mt-2 -translate-y-1/2 text-zinc-400 rotate-90 pointer-events-none" />
                   </div>

                   <div className="flex items-start gap-3 bg-zinc-100 p-4 rounded-xl border border-zinc-200">
                      <input type="checkbox" id="privacy" className="mt-1 w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" defaultChecked />
                      <label htmlFor="privacy" className="text-xs text-zinc-500 leading-relaxed font-light cursor-pointer select-none">
                        본인은 (주)디엠앤케이가 제공하는 상담 서비스 이용을 위해 개인정보 수집 및 마케팅 활용에 동의합니다. 수집된 정보는 상담 목적 외에 사용되지 않습니다.
                      </label>
                   </div>

                   <button type="button" className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl hover:bg-zinc-800 transition-colors shadow-xl active:scale-[0.98]">
                      혜택 확인 및 상담 신청하기
                   </button>
                 </form>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
               <ShieldCheck size={24} className="text-zinc-600" />
               <span className="font-extrabold text-xl tracking-tight text-white">
                 보람상조<span className="text-amber-500">피플</span>
               </span>
            </div>
            <div className="flex gap-6 text-sm font-bold tracking-wide">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="text-white hover:text-amber-500 transition-colors">개인정보처리방침</a>
            </div>
          </div>

          <div className="text-xs font-light space-y-2 leading-relaxed opacity-60 flex flex-col md:flex-row md:justify-between items-start md:items-end">
            <div>
              <p>(주)디엠앤케이 | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890</p>
              <p>주소: 서울시 송파구 법원로 11길 25 B동 1306, 1307호 | 통신판매업신고: 제2024-서울-0000호</p>
              <p className="mt-6 font-medium">ⓒ 2024 BORAM SANGJO PEOPLE B299. All Rights Reserved.</p>
            </div>
            <div className="mt-8 md:mt-0 flex gap-4">
               {/* Badges mimicking certifications */}
               <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold">K-CS</div>
               <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold">1등</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
