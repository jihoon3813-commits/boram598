import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ProductSection, { ProductCatalogModal } from '../components/ProductSection';
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
  Phone,
  Trophy,
  MapPin,
  Users,
  Car,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// --- Components ---

const Navbar = ({ onContactClick, onProductsClick }: { onContactClick: () => void; onProductsClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchParams] = useSearchParams();
  const partnerName = searchParams.get('partner');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      // On mobile, hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 
      ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-zinc-200 py-4 shadow-sm' : 'bg-transparent py-6'}
      ${(visible || isOpen) ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
            alt="Logo" 
            className={`h-12 w-auto transition-all duration-500 ${scrolled ? '' : 'brightness-0 invert'}`} 
          />
        </Link>
        
        <div className={`hidden md:flex gap-10 text-sm font-semibold tracking-wide transition-colors duration-500 ${scrolled ? 'text-zinc-600' : 'text-zinc-200'}`}>
          <a href="#comparison" className="hover:text-amber-500 transition-colors">가치비교</a>
          <a href="#pricing" className="hover:text-amber-500 transition-colors">상품안내</a>
          <button onClick={onProductsClick} className="hover:text-amber-500 transition-colors">가전제품안내</button>
          <a href="#benefits" className="hover:text-amber-500 transition-colors">핵심혜택</a>
          <a href="#conversion" className="hover:text-amber-500 transition-colors">프리미엄전환</a>
        </div>

        <div className="flex items-center gap-4">
          {!partnerName && (
            <Link to="/partner-apply" className="hidden sm:flex items-center gap-2 bg-zinc-800 text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-700 transition-all">
              파트너 신청
            </Link>
          )}
          <button 
            onClick={onContactClick}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all"
          >
            간편 상담신청
          </button>
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
              <button onClick={() => { setIsOpen(false); onProductsClick(); }} className="text-zinc-800 font-medium">가전제품안내</button>
              <a href="#benefits" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">핵심혜택</a>
              <a href="#conversion" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">프리미엄전환</a>
              {!partnerName && <Link to="/partner-apply" onClick={() => setIsOpen(false)} className="text-zinc-800 font-medium">파트너 신청</Link>}
              <button 
                onClick={() => { setIsOpen(false); onContactClick(); }}
                className="bg-zinc-900 text-white py-3 rounded-xl font-bold"
              >
                지금 바로 상담하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FadeIn = ({ children, delay = 0, className = "", ...props }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

const ContactForm = ({ formData, setFormData, handleSubmit, submitting, submitted, mainProducts, privacyPolicy, availableMethods }: any) => (
  <form className="space-y-8">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative">
        <input 
          type="text" 
          id="name"
          required
          className="peer w-full bg-transparent border-0 border-b-2 border-zinc-300 py-3 px-4 text-zinc-900 placeholder-transparent focus:ring-0 focus:border-zinc-900 transition-colors"
          placeholder="성함"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <label htmlFor="name" className="absolute left-4 -top-3.5 text-xs font-bold text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900">
          이름
        </label>
      </div>
      <div className="relative">
        <input 
          type="tel" 
          id="phone"
          required
          maxLength={13}
          className="peer w-full bg-transparent border-0 border-b-2 border-zinc-300 py-3 px-4 text-zinc-900 placeholder-transparent focus:ring-0 focus:border-zinc-900 transition-colors"
          placeholder="연락처"
          value={formData.phone}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
            let formatted = raw;
            if (raw.length <= 3) formatted = raw;
            else if (raw.length <= 7) formatted = raw.slice(0, 3) + '-' + raw.slice(3);
            else formatted = raw.slice(0, 3) + '-' + raw.slice(3, 7) + '-' + raw.slice(7);
            setFormData({...formData, phone: formatted});
          }}
        />
        <label htmlFor="phone" className="absolute left-4 -top-3.5 text-xs font-bold text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900">
          연락처
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
        <option value="상담 시 선택">상담 시 선택</option>
        {Array.from(new Map((mainProducts || []).flatMap(({ products }: any) => products).map((p: any) => [p._id, p])).values()).map((p: any) => (
          <option key={p._id} value={p.name}>{p.name}</option>
        ))}
      </select>
      <ChevronRight className="absolute right-4 top-1/2 mt-2 -translate-y-1/2 text-zinc-400 rotate-90 pointer-events-none" />
    </div>

    <div className="space-y-3">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">결제 방식 선택 (필수)</label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'rental', label: '60개월 렌탈', value: '60개월 렌탈' },
          { id: 'pay48', label: '신한 48페이', value: '신한 48페이' }
        ].filter(type => availableMethods.includes(type.value)).map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setFormData({ ...formData, paymentType: type.value })}
            className={`py-4 rounded-xl text-sm font-bold border-2 transition-all ${
              formData.paymentType === type.value
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-start gap-3 bg-zinc-100 p-4 rounded-xl border border-zinc-200">
      <input type="checkbox" id="privacy" className="mt-1 w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" defaultChecked />
      <label htmlFor="privacy" className="text-xs text-zinc-500 leading-relaxed font-light cursor-pointer select-none">
        {privacyPolicy || '본인은 (주)라이프앤조이가 제공하는 상담 서비스 이용을 위해 개인정보 수집 및 마케팅 활용에 동의합니다. 수집된 정보는 상담 목적 외에 사용되지 않습니다.'}
      </label>
    </div>

    <button
      type="button"
      onClick={handleSubmit}
      disabled={submitting}
      className={`w-full font-bold py-5 rounded-2xl transition-colors shadow-xl active:scale-[0.98] ${
        submitting ? 'bg-zinc-400 text-zinc-200 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'
      }`}
    >
      {submitting ? '신청 중...' : '혜택 확인 및 상담 신청하기'}
    </button>
  </form>
);

export default function Landing() {
  const [searchParams] = useSearchParams();
  const partnerName = searchParams.get('partner');
  const [formData, setFormData] = useState({ name: '', phone: '', product: '', paymentType: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  
  const activePartner = useQuery(api.partners.getByLoginId, partnerName ? { loginId: partnerName } : "skip");
  const mainProducts = useQuery(api.products.listMainProducts, partnerName ? (activePartner ? { partnerId: activePartner._id } : "skip") : {});
  const globalSettings = useQuery(api.settings.get);
  const addCustomer = useMutation(api.customers.add);

  const allProductsList = useMemo(() => {
    if (!mainProducts) return [];
    return Array.from(new Map(mainProducts.flatMap(({ products }: any) => products).map((p: any) => [p._id, p])).values());
  }, [mainProducts]);

  const selectedProductObj = allProductsList.find((p: any) => p.name === formData.product);
  const availableMethods = useMemo(() => {
    if (!formData.product || formData.product === "상담 시 선택") return ['60개월 렌탈', '신한 48페이'];
    return selectedProductObj?.paymentMethods || ['60개월 렌탈', '신한 48페이'];
  }, [formData.product, selectedProductObj]);

  // Auto-select if only one option available
  useEffect(() => {
    if (availableMethods.length === 1 && formData.paymentType !== availableMethods[0]) {
      setFormData(prev => ({ ...prev, paymentType: availableMethods[0] }));
    } else if (formData.paymentType && !availableMethods.includes(formData.paymentType)) {
      setFormData(prev => ({ ...prev, paymentType: '' }));
    }
  }, [availableMethods]);

  const filteredMainProducts = mainProducts;

  const openConsultModal = (productName?: string) => {
    if (productName) {
      setFormData(prev => ({ ...prev, product: productName }));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { alert('이름을 입력해주세요.'); return; }
    if (formData.phone.replace(/[^0-9]/g, '').length < 10) { alert('연락처를 정확히 입력해주세요.'); return; }
    if (!formData.product) { alert('희망 품목을 선택해주세요.'); return; }
    if (!formData.paymentType) { alert('결제 방식을 선택해주세요.'); return; }
    setSubmitting(true);
    try {
      await addCustomer({
        name: formData.name.trim(),
        phone: formData.phone,
        status: '상담대기',
        productId: formData.product,
        productName: formData.product,
        paymentType: formData.paymentType,
        partnerId: activePartner?._id,
        partnerName: activePartner?.name || '본사직영',
        partnerLoginId: activePartner?.loginId || 'admin', // Ensure login ID is recorded for display
      });
      alert('상담 신청이 완료되었습니다! 빠른 시일 내 연락드리겠습니다.');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', product: '', paymentType: '' });
      setSubmitted(false);
    } catch (err) {
      console.error(err);
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500/30">
      <Navbar onContactClick={() => setIsModalOpen(true)} onProductsClick={() => setIsCatalogOpen(true)} />

      {/* Product Catalog Modal */}
      <AnimatePresence>
        {isCatalogOpen && filteredMainProducts && filteredMainProducts.length > 0 && (
          <ProductCatalogModal
            groups={filteredMainProducts}
            initialGroupId={null}
            onClose={() => setIsCatalogOpen(false)}
            onConsultClick={() => { setIsCatalogOpen(false); setIsModalOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center px-6 py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-black text-zinc-900">간편 상담 신청</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ContactForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  handleSubmit={handleSubmit} 
                  submitting={submitting} 
                  submitted={submitted} 
                  mainProducts={filteredMainProducts}
                  privacyPolicy={globalSettings?.privacyPolicy}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Section 1: Hero Section (Sophisticated & Cinematic) --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 pt-20">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777179649/Gemini_Generated_Image_nldu0cnldu0cnldu_cxwgom.png" 
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
                삼성 & LG 프리미엄 가전 한정 혜택
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <h1 className="text-[1.75rem] sm:text-5xl md:text-7xl font-black text-white leading-[1.4] md:leading-[1.2] mb-8 tracking-tighter">
                최신 가전은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">먼저 받고,</span> <br />
                만기 시, <span className="relative inline-block">
                  <span className="relative z-10">100% 돌려 받는</span>
                  <div className="absolute bottom-1 md:bottom-3 left-0 w-full h-2 md:h-5 bg-amber-500/30 -z-10" />
                </span><br />
                격이 다른 소비의 시작
              </h1>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-zinc-300 text-lg md:text-2xl font-light mb-12 leading-relaxed max-w-2xl">
                월 29,900원의 부담없는 금액으로 <br className="hidden md:block" />우리 집 공간의 품격을 올리고 납입금 전액은 자산으로 남깁니다.
              </p>
            </FadeIn>

            <FadeIn delay={0.7} className="flex flex-col sm:flex-row gap-5 items-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white text-zinc-950 rounded-full text-base sm:text-lg font-bold transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 group whitespace-nowrap"
              >
                늦기전에 프리미엄 가전 신청
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 2: Value Comparison (Minimalist & Impactful) --- */}
      <section id="comparison" className="py-16 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-20">
            <FadeIn>
              <h2 className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-4">Value Proposition</h2>
              <h3 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                소비할 것인가, <br className="md:hidden" /> 돌려받을 것인가?
              </h3>
              <p className="mt-6 text-zinc-500 text-lg text-center leading-relaxed">
                같은 가전을 들여도 <br className="md:hidden" /> <span className="font-bold text-zinc-800 border-b border-zinc-800 whitespace-nowrap">결과는 완전히 다릅니다.</span>
              </p>
            </FadeIn>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto relative">
            {/* The Old Way */}
            <FadeIn delay={0.2} className="bg-zinc-50 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 border border-zinc-200 flex flex-col h-full transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 group/old">
              <div className="flex items-center justify-between mb-6 md:mb-12">
                <h4 className="text-xl md:text-2xl font-bold text-zinc-500 group-hover/old:text-zinc-900 transition-colors">기존 할부 / 구매</h4>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center group-hover/old:bg-zinc-100 transition-colors shrink-0">
                  <Minus strokeWidth={3} size={20} className="md:w-6 md:h-6" />
                </div>
              </div>
              <ul className="space-y-4 md:space-y-8 flex-1">
                {[
                  { title: "비용 소멸", desc: "매달 내는 할부금은 그대로 지출 처리되어 사라집니다." },
                  { title: "이자 부담", desc: "장기 할부 시 보이지 않는 이자가 제품가에 포함됩니다." },
                  { title: "감가상각의 늪", desc: "가전의 가치는 0원이 되지만 할부금은 여전히 남습니다." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 md:gap-4 items-start">
                    <X className="text-zinc-300 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="font-bold text-zinc-600 text-base md:text-lg mb-0.5 group-hover/old:text-zinc-800 transition-colors">{item.title}</p>
                      <p className="text-zinc-400 text-xs md:text-base leading-relaxed font-light group-hover/old:text-zinc-500 transition-colors">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 md:mt-12 pt-4 md:pt-8 border-t border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] sm:text-sm mb-1 sm:mb-2">Result</p>
                <p className="text-lg sm:text-3xl font-black text-zinc-400 group-hover/old:text-zinc-600 transition-colors whitespace-nowrap">순수 지출 발생</p>
              </div>
            </FadeIn>

            {/* Absolute VS Badge for Tablet/Desktop */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 bg-white rounded-full items-center justify-center shadow-xl border border-zinc-100">
              <span className="font-black text-2xl text-zinc-300 italic">VS</span>
            </div>

            {/* The B299 Way */}
            <FadeIn delay={0.4} className="bg-zinc-950 text-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 border border-zinc-800 flex flex-col h-full shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full" />
              
              <div className="flex items-center justify-between mb-6 md:mb-12 relative z-10">
                <h4 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                  보람상조 플랜
                </h4>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                  <Check strokeWidth={3} size={20} className="md:w-6 md:h-6" />
                </div>
              </div>
              <ul className="space-y-4 md:space-y-8 flex-1 relative z-10">
                {[
                  { title: "안전한 자산 형성", desc: "납입하는 금액 전체가 보람상조를 통한 자산으로 유지됩니다." },
                  { title: "최신 가전 렌탈료 전액 지원", desc: "가입 후 받으신 가전제품의 렌탈료를 상조 만기 시 전액 지원해 드립니다." },
                  { title: "100% 전액 환급", desc: "만기 유지 시 지금까지 낸 금액을 1원도 빠짐없이 돌려드립니다." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 md:gap-4 items-start">
                    <CheckCircle2 className="text-amber-500 shrink-0 mt-1" size={18} />
                    <div>
                      <p className="font-bold text-white text-base md:text-lg mb-0.5">{item.title}</p>
                      <p className="text-zinc-400 text-xs md:text-base leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 md:mt-12 pt-4 md:pt-8 border-t border-zinc-800 relative z-10">
                <p className="text-amber-500/70 font-bold uppercase tracking-widest text-[10px] sm:text-sm mb-1 sm:mb-2">Result</p>
                <p className="text-lg sm:text-3xl font-black text-amber-500 whitespace-nowrap">자산 형성 + 가전 혜택</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 3: Pricing Table (Light Mode - Current) --- */}
      <section id="pricing" className="py-16 sm:py-32 bg-zinc-100 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-10 md:mb-20 flex flex-col items-center">
            <img 
              src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
              alt="Boram Sangjo Logo" 
              className="h-12 w-auto mb-6 opacity-80"
            />

            <h3 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
              당신의 <br className="md:hidden" /> 라이프 스타일에 <br className="md:hidden" /> 맞춘 설계
            </h3>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((unit, i) => (
              <FadeIn key={unit} delay={i * 0.1}>
                <div className={`py-5 px-5 sm:p-8 rounded-[2rem] transition-all duration-300 h-full flex flex-col
                  ${unit === 2 
                    ? 'bg-zinc-900 text-white ring-4 ring-zinc-900/10 shadow-2xl lg:scale-105 z-10' 
                    : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm hover:shadow-md'}`}
                >
                  {unit === 2 && (
                    <div className="self-start px-3 py-1 bg-amber-500 text-zinc-950 text-[10px] sm:text-xs font-black rounded-full mb-4 md:mb-6 tracking-wide shadow-lg shadow-amber-500/20">
                      BEST CHOICE
                    </div>
                  )}
                  {unit !== 2 && <div className="hidden md:block h-6 mb-6" />}

                  <div className="mb-3 md:mb-8">
                    <h4 className={`${unit === 2 ? 'text-zinc-400' : 'text-zinc-400'} text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1 sm:mb-2`}>{unit}구좌 패키지</h4>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl sm:text-4xl font-black ${unit === 2 ? 'text-white' : 'text-zinc-900'}`}>{(unit * 29900).toLocaleString()}</span>
                      <span className={`${unit === 2 ? 'text-zinc-400' : 'text-zinc-500'} font-medium text-sm sm:text-lg ml-1`}>원 / 월</span>
                    </div>
                  </div>

                  <div className={`flex-1 space-y-2 sm:space-y-4 mb-4 sm:mb-10`}>
                    <div className={`flex justify-between items-center py-1.5 sm:py-3 border-b ${unit === 2 ? 'border-zinc-800' : 'border-zinc-100'}`}>
                      <span className={`${unit === 2 ? 'text-zinc-400' : 'text-zinc-500'} text-xs sm:text-sm`}>만기 환급률</span>
                      <span className="font-bold text-amber-500">100%</span>
                    </div>
                    <div className={`flex justify-between items-center py-1.5 sm:py-3 border-b ${unit === 2 ? 'border-zinc-800' : 'border-zinc-100'}`}>
                      <span className={`${unit === 2 ? 'text-zinc-400' : 'text-zinc-500'} text-xs sm:text-sm`}>총 환급액</span>
                      <span className={`font-bold ${unit === 2 ? 'text-white' : 'text-zinc-900'} text-sm sm:text-base`}>{(unit * 598).toLocaleString()}만원</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => openConsultModal(`${unit}구좌 패키지`)}
                    className={`block w-full text-center py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all
                      ${unit === 2 ? 'bg-white text-zinc-900 hover:bg-zinc-100' : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100'}`}
                  >
                    이 조건으로 신청
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="mt-10 md:mt-20">
            <div className="bg-white p-5 md:p-14 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 flex flex-col lg:flex-row items-center gap-6 md:gap-10">
              <div className="lg:w-1/3">
                <h4 className="text-xl md:text-2xl font-black mb-2 md:mb-4">납입 및 환급 로드맵</h4>
                <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-light">가입 즉시 가전을 수령하고, 만기 시 전액 환급받는 가장 투명하고 안전한 플랜입니다.</p>
              </div>
              <div className="lg:w-2/3 w-full relative">
                {/* Mobile Roadmap Badge - Above Bar */}
                <div className="flex md:hidden justify-end mb-2">
                  <div className="text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 overflow-hidden border border-white/10 whitespace-nowrap"
                       style={{ background: 'linear-gradient(to right, #f59e0b 30%, #09090b 30%)' }}>
                    <RefreshCcw size={12} /> 100% 환급 달성
                  </div>
                </div>

                <div className="h-4 bg-zinc-100 rounded-full flex overflow-hidden mb-6 w-full">
                  <div className="h-full bg-amber-500 w-[30%]" />
                  <div className="h-full bg-zinc-900 w-[70%]" />
                </div>
                <div className="flex justify-between relative">
                  <div className="w-[30%]">
                    <p className="font-bold text-amber-600">1~60회 (5년)</p>
                    <p className="text-sm text-zinc-500 mt-1">가전+상조 부금 납입</p>
                  </div>
                  <div className="w-[70%] pl-6 border-l border-zinc-200">
                    <p className="font-bold text-zinc-900">61~200회 (만기)</p>
                    <p className="text-sm text-zinc-500 mt-1">상조 부금 납입 및 자산화</p>
                  </div>

                  {/* PC Roadmap Badge - Original Absolute Position */}
                  <div className="hidden md:flex absolute right-0 top-0 text-white text-[10px] font-bold px-4 py-2 rounded-xl -mt-4 shadow-xl items-center gap-2 overflow-hidden border border-white/10 whitespace-nowrap"
                       style={{ background: 'linear-gradient(to right, #f59e0b 30%, #09090b 30%)' }}>
                    <RefreshCcw size={14} /> 100% 환급 달성
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      {/* --- Section 3.5: Products Section --- */}
      <ProductSection 
        onContactClick={(productName) => openConsultModal(productName)} 
        activePartner={activePartner}
      />

      {/* --- Section 4: Bento Grid Benefits --- */}
      <section id="benefits" className="py-16 md:py-32 bg-zinc-950 text-zinc-100 relative overflow-hidden">
         {/* Abstract background glow */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn className="mb-16">
            <h2 className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-4">Core Benefits</h2>
            <h3 className="text-2xl md:text-5xl font-black text-white tracking-tight whitespace-nowrap">수준이 다른 보람상조의 특권</h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-[140px] md:auto-rows-[240px]">
            {/* Benefit 1 (Large) */}
            <FadeIn delay={0.1} className="md:col-span-6 lg:col-span-8 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-6 md:p-10 border-t-zinc-800/80 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" alt="Home Appliance" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50" />
              <div className="relative z-20 flex flex-col justify-between h-full">
                <div className="flex items-center gap-4 md:block">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-400 border border-white/20 shrink-0 md:mb-8">
                    <Tv size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h4 className="text-xl md:text-3xl font-black text-white whitespace-nowrap">최고의 브랜드 즉시 배송</h4>
                </div>
                <p className="text-zinc-300 font-light leading-relaxed max-w-md mt-4 md:mt-0">삼성, LG 등 메이저 브랜드의 최신 홈 가전을 가입 즉시 원하는 곳으로 안전하게 배송 및 설치해 드립니다.</p>
              </div>
            </FadeIn>

            {/* Benefit 2 */}
            <FadeIn delay={0.2} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
               <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600" alt="Refund" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-20 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 h-full">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white relative z-20 border border-white/10 shrink-0 md:mb-8">
                    <RefreshCcw size={24} />
                 </div>
                 <div className="md:mt-auto">
                   <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white whitespace-nowrap">100% 전액 환급</h4>
                   <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed">만기 시까지 유지하신 납입금 전액을 한 치의 오차 없이 돌려드립니다.</p>
                 </div>
               </div>
            </FadeIn>

            {/* Benefit 3 */}
            <FadeIn delay={0.3} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
               <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600" alt="Resort" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-20 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 h-full">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white relative z-20 border border-white/10 shrink-0 md:mb-8">
                    <Palmtree size={24} />
                 </div>
                 <div className="md:mt-auto">
                   <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white whitespace-nowrap">프리미엄 리조트 멤버십</h4>
                   <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed">전국 럭셔리 호텔 및 리조트를 최대 80% 할인된 회원가로 제공합니다.</p>
                 </div>
               </div>
            </FadeIn>

             {/* Benefit 4 */}
             <FadeIn delay={0.4} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
               <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600" alt="Life Plan" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-20 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 h-full">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-500 relative z-20 border border-white/10 shrink-0 md:mb-8">
                    <ArrowRightLeft size={24} />
                 </div>
                 <div className="md:mt-auto">
                   <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white whitespace-nowrap">라이프 플랜 전환</h4>
                   <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed">크루즈, 웨딩, 장례 등 상황에 맞춰 필요한 서비스로 언제든 전환 가능합니다.</p>
                 </div>
               </div>
            </FadeIn>

             {/* Benefit 5 */}
             <FadeIn delay={0.5} className="md:col-span-3 lg:col-span-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group">
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
               <img src="https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=600" alt="Trust" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-20 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 h-full">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white relative z-20 border border-white/10 shrink-0 md:mb-8">
                    <Award size={24} />
                 </div>
                 <div className="md:mt-auto">
                   <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white whitespace-nowrap">33만 건의 신뢰 증명</h4>
                   <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed">압도적인 누적 행사 건수로 증명되는 대한민국 1등 상조의 자부심.</p>
                 </div>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Section 5: Affiliate Cards (Detailed Benefits) --- */}
      <section className="py-32 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-20">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-6">보람상조 제휴카드 혜택</h2>
              <p className="text-blue-600 text-base md:text-xl font-bold leading-relaxed max-w-3xl mx-auto px-4">
                "하나카드, 국민카드, 롯데카드 제휴로 <br className="md:hidden" />
                자동이체 등록 시 매월 청구 할인 제공"
              </p>
            </FadeIn>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {/* Card 1: KB 국민카드 */}
            <FadeIn className="bg-zinc-50 rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
                {/* Image Area (Placeholder) */}
                <div className="w-[70%] sm:w-full lg:w-1/2 aspect-[1.58/1] bg-zinc-100 rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center border border-zinc-200 mx-auto">
                  <img 
                    src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777336662/04494_img_imuqfu.png" 
                    alt="KB Kookmin Card" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content Area */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <div className="mb-6 lg:mb-8">
                    <h4 className="text-lg sm:text-xl font-black text-zinc-900 mb-1">KB 국민카드(보람상조)</h4>
                    <p className="text-sm sm:text-lg font-bold text-red-600 whitespace-nowrap">월 납입금 <span className="text-lg sm:text-2xl">최대 27,000원</span> 할인</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-6">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">전월 이용실적</th>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">할인금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <tr>
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 whitespace-nowrap">40만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">15,000원 청구할인</td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 whitespace-nowrap">80만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">19,000원 청구할인</td>
                        </tr>
                        <tr className="bg-zinc-50/50">
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 font-bold whitespace-nowrap">120만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-black text-blue-600 whitespace-nowrap">27,000원 청구할인</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="space-y-1 text-xs text-zinc-500 font-light">
                    <p>• 연회비 15,000원 / 상조 부금 자동이체 필수</p>
                    <p>• 발급신청 <span className="font-bold text-zinc-900">1899-0070</span> (전화신청) 또는 온라인 신청</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Card 2: Lotte Card */}
            <FadeIn delay={0.1} className="bg-zinc-50 rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
                {/* Image Area (Placeholder) */}
                <div className="w-[70%] sm:w-full lg:w-1/2 aspect-[1.58/1] bg-zinc-100 rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center border border-zinc-200 mx-auto">
                  <img 
                    src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777336662/2224_ckgnks.png" 
                    alt="Lotte Card" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content Area */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <div className="mb-6 lg:mb-8">
                    <h4 className="text-lg sm:text-xl font-black text-zinc-900 mb-1">LOCA x Special SE 롯데카드</h4>
                    <p className="text-sm sm:text-lg font-bold text-red-600 whitespace-nowrap">월 납입금 <span className="text-lg sm:text-2xl">최대 25,000원</span> 할인</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-6">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">전월 이용실적</th>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">할인금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <tr>
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 whitespace-nowrap">30만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">13,000원 청구할인</td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 whitespace-nowrap">70만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">15,000원 청구할인</td>
                        </tr>
                        <tr className="bg-zinc-50/50">
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 font-bold whitespace-nowrap">150만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-black text-blue-600 whitespace-nowrap">25,000원 청구할인</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="space-y-1 text-xs text-zinc-500 font-light">
                    <p>• 연회비 20,000원 / 상조 부금 자동이체 필수</p>
                    <p>• 발급신청 <span className="font-bold text-zinc-900">1588-8100</span> (전화신청) 또는 온라인 신청</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Card 3: Hana Card */}
            <FadeIn delay={0.2} className="bg-zinc-50 rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
                {/* Image Area (Placeholder) */}
                <div className="w-[70%] sm:w-full lg:w-1/2 aspect-[1.58/1] bg-zinc-100 rounded-2xl sm:rounded-3xl relative overflow-hidden flex items-center justify-center border border-zinc-200 mx-auto">
                  <img 
                    src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777336662/13258_v06xvv.png" 
                    alt="Hana Card" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content Area */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <div className="mb-6 lg:mb-8">
                    <h4 className="text-lg sm:text-xl font-black text-zinc-900 mb-1">하나카드(보람상조그룹)</h4>
                    <p className="text-sm sm:text-lg font-bold text-red-600 whitespace-nowrap">월 납입금 <span className="text-lg sm:text-2xl">최대 19,000원</span> 할인</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-6">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">전월 이용실적</th>
                          <th className="px-3 sm:px-6 py-3 font-bold text-zinc-600">할인금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        <tr>
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 whitespace-nowrap">30만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">12,000원 청구할인</td>
                        </tr>
                        <tr className="bg-zinc-50/50">
                          <td className="px-3 sm:px-6 py-4 text-zinc-600 font-bold whitespace-nowrap">100만원 이상</td>
                          <td className="px-3 sm:px-6 py-4 font-black text-blue-600 whitespace-nowrap">19,000원 청구할인</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="space-y-1 text-xs text-zinc-500 font-light">
                    <p>• 연회비 20,000원(국내외 겸용) / 상조 부금 자동이체 필수</p>
                    <p>• 발급신청 <span className="font-bold text-zinc-900">1800-1111</span> (전화신청) 또는 온라인 신청</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
          
          <p className="text-center text-zinc-400 text-xs mt-12 font-light">
            * 1구좌 기준 제휴카드할인 적용금액이며, 카드 사정에 따라 혜택이 변경 될 수 있습니다.
          </p>
        </div>
      </section>

      {/* --- Section 4: Premium Lifestyle (Conversion) --- */}
      <section id="conversion" className="py-40 bg-zinc-950 relative overflow-hidden">
        {/* Luxury Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <FadeIn>
              <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Premium Lifestyle</span>
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">
                당신의 빛나는 <br className="md:hidden" /> 모든 순간과 함께
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                상조 서비스의 경계를 넘어, 인생의 소중한 순간들을 위한 <br className="hidden md:block" />
                프리미엄 서비스로 제약 없이 전환하실 수 있습니다.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Cruise */}
            <FadeIn delay={0.1}>
              <div className="group relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[3rem] border border-white/10 bg-zinc-900 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80" 
                  alt="Luxury Cruise" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 sm:mb-8 border border-white/20 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                    <Ship size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-6 whitespace-nowrap">럭셔리 크루즈 여행</h3>
                  <p className="text-zinc-300 text-sm sm:text-lg leading-relaxed font-light max-w-md mb-4 sm:mb-8">
                    지중해, 알래스카, 동남아 등 세계 유수의 명소를 누비는 초호화 크루즈 여행으로 완벽한 재충전을 선사합니다.
                  </p>
                  <a 
                    href="https://www.borampeople.co.kr/Cruise/Landing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white text-white hover:text-zinc-950 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 w-fit"
                  >
                    <span className="text-xs sm:text-sm font-bold">서비스 바로가기</span>
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Wedding */}
            <FadeIn delay={0.2}>
              <div className="group relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[3rem] border border-white/10 bg-zinc-900 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" 
                  alt="Premium Wedding" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 sm:mb-8 border border-white/20 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                    <Heart size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-6 whitespace-nowrap">프리미엄 웨딩 패키지</h3>
                  <p className="text-zinc-300 text-sm sm:text-lg leading-relaxed font-light max-w-md mb-4 sm:mb-8">
                    최고급 링컨 리무진 웨딩카 지원부터 하이엔드 드레스까지, 생애 가장 빛나는 순간을 완벽하게 디자인합니다.
                  </p>
                  <a 
                    href="https://www.borampeople.co.kr/Wedding/Landing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white text-white hover:text-zinc-950 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 w-fit"
                  >
                    <span className="text-xs sm:text-sm font-bold">서비스 바로가기</span>
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>


      {/* --- Section 5: Differentiation (What Makes Us Different) --- */}
      <section className="py-16 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-10 md:mb-20">
            <h2 className="text-2xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4 md:mb-6">보람상조 무엇이 다를까요?</h2>
            <p className="text-zinc-500 text-base md:text-xl font-light px-4">차원이 다른 품격 있는 <br className="md:hidden" /> 서비스로 고객에게 보답합니다.</p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16">
            {/* Column 1: Reliability */}
            <FadeIn delay={0.1} className="bg-white py-10 px-8 sm:px-10 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
              <div className="pb-3 border-b-2 border-zinc-900 inline-block mb-8">
                <h4 className="text-xs font-black text-zinc-900 tracking-widest uppercase">Reliability</h4>
              </div>
              <h5 className="text-xl font-black text-zinc-900 mb-8 leading-tight">믿을 수 있는 <br />대한민국 대표 상조기업</h5>
              <div className="space-y-6">
                {[
                  { icon: <ShieldCheck size={22} />, text: "한국상조공제조합 소비자 피해 보상보험 체결" },
                  { icon: <Phone size={22} />, text: "365일 연중무휴 24시간 긴급 콜센터 운영" },
                  { icon: <MapPin size={22} />, text: "전국 직영망 연 1만 5천여건의 행사 진행" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                      {item.icon}
                    </div>
                    <p className="text-zinc-600 text-sm font-medium leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Column 2: Know-how */}
            <FadeIn delay={0.2} className="bg-white py-10 px-8 sm:px-10 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
              <div className="pb-3 border-b-2 border-zinc-900 inline-block mb-8">
                <h4 className="text-xs font-black text-zinc-900 tracking-widest uppercase">Know-how</h4>
              </div>
              <h5 className="text-xl font-black text-zinc-900 mb-8 leading-tight">31년 전통의 <br />독보적인 노하우</h5>
              <div className="space-y-6">
                {[
                  { icon: <Heart size={22} />, text: "내 부모 내 형제처럼 정성을 다하는 섬김의 행사 진행" },
                  { icon: <BookOpen size={22} />, text: "직영 시스템으로 직접 교육한 전문인력 양성" },
                  { icon: <Users size={22} />, text: "각 분야별 현장 경험과 노하우를 겸비한 5,000명의 전문인력 보유" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-500">
                      {item.icon}
                    </div>
                    <p className="text-zinc-600 text-sm font-medium leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Column 3: Premium Service */}
            <FadeIn delay={0.3} className="bg-white py-10 px-8 sm:px-10 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
              <div className="pb-3 border-b-2 border-zinc-900 inline-block mb-8">
                <h4 className="text-xs font-black text-zinc-900 tracking-widest uppercase">Premium Service</h4>
              </div>
              <h5 className="text-xl font-black text-zinc-900 mb-8 leading-tight">고객 감동을 위한 <br />고품격 전문 서비스</h5>
              <div className="space-y-6">
                {[
                  { icon: <Car size={22} />, text: "국내 최초 링컨콘티넨탈 리무진 서비스" },
                  { icon: <Sparkles size={22} />, text: "장례 행렬 선두차 꽃장식 제공 (실용신안 등록)" },
                  { icon: <Tv size={22} />, text: "국내 최초 온라인 추모관 운영 및 관리" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-500">
                      {item.icon}
                    </div>
                    <p className="text-zinc-600 text-sm font-medium leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Bottom Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { 
                title: "내 부모 내 형제처럼", 
                sub: "특별한 장례서비스 제공", 
                desc: "보람상조 전문 인력의 프리미엄 케어",
                icon: <Heart size={18} className="text-red-500" />
              },
              { 
                title: "가입 금액 그대로", 
                sub: "인상 없이 처음과 같이", 
                desc: "물가 상승 걱정 없는 확정형 가격제",
                icon: <ShieldCheck size={18} className="text-blue-600" />
              },
              { 
                title: "누구에게나 자유로운", 
                sub: "양수 및 양도가 가능 상품", 
                desc: "가족, 지인에게 서비스 권리 양도 가능",
                icon: <ArrowRightLeft size={18} className="text-zinc-900" />
              },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.2} className="bg-zinc-50 border border-zinc-100 py-8 px-10 rounded-[2rem] hover:bg-white hover:shadow-xl hover:border-zinc-200 transition-all duration-500">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <p className="text-amber-600 text-[13px] font-bold mb-1">{card.title}</p>
                <h6 className="text-lg font-black text-zinc-900 mb-3">{card.sub}</h6>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">{card.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* --- Section 6: Trust & Heritage (Awards) --- */}
      <section className="relative overflow-hidden">
        {/* Header Part with Gradient */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-24 text-center px-6">
          <FadeIn>
            <h2 className="text-xl md:text-3xl font-black text-white mb-6">왜 보람상조인가요?</h2>
            <p className="text-zinc-400 text-base md:text-xl font-light mb-10 px-4">대한민국 대표 상조기업, <br className="md:hidden" /> 보람상조 그 이름만으로도 충분합니다.</p>
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
              <h3 className="relative text-3xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">
                올해 브랜드 대상 <br className="md:hidden" /> 12년 연속 1위
              </h3>
            </div>
          </FadeIn>
        </div>

        {/* Awards Detail Part */}
        <div className="bg-[#0a1229] py-16 md:py-32 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="lg:w-3/5">
              <FadeIn className="mb-8 md:mb-12">
                <span className="text-amber-500 font-bold tracking-widest uppercase mb-4 block">Exemplary Company</span>
                <h4 className="text-white text-xl sm:text-3xl md:text-4xl font-black leading-tight mb-6">
                  국민이 인정한 모범 상조 기업 <br />
                  <span className="text-amber-500 whitespace-nowrap">대한민국 상조 업계 최다</span> <span className="whitespace-nowrap">대상 수상</span>
                </h4>
              </FadeIn>

              {/* Major Awards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                {[
                  { title: "국가 소비자 중심 브랜드 대상", years: "9년 연속" },
                  { title: "대한민국 퍼스트브랜드 대상", years: "8년 연속" },
                  { title: "코리아탑어워드 명품 브랜드 대상", years: "6년 연속" },
                  { title: "한국의 영향력 있는 CEO 대상", years: "5년 연속" },
                ].map((award, i) => (
                  <FadeIn key={i} delay={i * 0.1} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 sm:p-6 rounded-2xl flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-0 group hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 sm:mb-4 relative text-amber-500 shrink-0">
                      <Trophy size={36} className="sm:w-12 sm:h-12" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-[10px] sm:text-xs mb-1">{award.title}</p>
                      <p className="text-white font-black text-base sm:text-lg">{award.years} 대상 수상</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Additional Awards List */}
              <FadeIn delay={0.4} className="space-y-4 border-t border-white/10 pt-8">
                <p className="text-zinc-400 text-sm leading-relaxed flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    "대한민국 CEO 리더십 대상 4년 연속 수상",
                    "행복더함 사회공헌 캠페인대상 3년 연속수상",
                    "고객감동 경영대상 3년 연속 수상",
                    "KCAB 한국 소비자평가 최고의 브랜드 대상수상",
                    "KOREA TOP AWARDS 공감경영 나눔실천 CEO 부문 대상 5년 연속수상",
                    "대한민국 창조경영 사회책임경영, 혁신브랜드 3년 연속 2관왕 수상"
                  ].map((text, i) => (
                    <span key={i} className="flex items-center gap-2 text-zinc-300">
                      <div className="w-1 h-1 bg-amber-500 rounded-full" /> {text}
                    </span>
                  ))}
                </p>
              </FadeIn>
            </div>

            <div className="hidden lg:block lg:w-2/5 relative">
              <FadeIn delay={0.3} className="relative z-10">
                <img 
                  src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777276561/%ED%8A%B8%EB%A1%9C%ED%94%BC_tplfnu.png" 
                  alt="Boram Sangjo Trophy" 
                  className="w-full h-auto drop-shadow-[0_0_50px_rgba(245,158,11,0.3)]"
                />
              </FadeIn>
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
            </div>
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
                <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
                  지금 바로 <br />
                  <span className="text-amber-500">VIP 상담</span>을<br />
                  신청하세요.
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light mb-12">
                  단 한 번의 상담으로 고객님의 평생 자산 플랜과 <br className="hidden md:block" />가전 혜택을 명확히 안내해 드립니다.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-l-2 border-zinc-200 pl-4">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest w-24">전화상담</p>
                    <p className="text-2xl font-black text-zinc-900 tracking-wider">1588-0883</p>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-zinc-200 pl-4">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest w-24">운영시간</p>
                    <p className="text-zinc-600 font-medium">평일 09:00 ~ 18:00 <span className="text-zinc-400 text-sm font-light">(주말/공휴일 휴무)</span></p>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7 w-full">
              <FadeIn delay={0.2} className="bg-zinc-50 border border-zinc-200 p-8 sm:p-10 md:p-14 rounded-[2.5rem] shadow-xl">
                 <h3 className="text-2xl font-black text-zinc-900 mb-8">무료 간편 상담 신청</h3>
                 <ContactForm 
                    formData={formData} 
                    setFormData={setFormData} 
                    handleSubmit={handleSubmit} 
                    submitting={submitting} 
                    submitted={submitted} 
                    privacyPolicy={globalSettings?.privacyPolicy}
                    availableMethods={availableMethods}
                  />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-zinc-950 text-zinc-500 py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777120929/%EB%A1%9C%EA%B3%A0_%EB%B0%B0%EA%B2%BD%EC%82%AD%EC%A0%9C_ss9wsm.png" 
                alt="Logo" 
                className="h-14 w-auto brightness-0 invert opacity-80" 
              />
            </Link>
            <div className="flex gap-8 text-sm font-bold tracking-wide">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="text-white hover:text-amber-500 transition-colors font-black">개인정보처리방침</a>
              <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:text-white transition-colors">본사 로그인</a>
              <a href="/partner/login" target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:text-white transition-colors">파트너 로그인</a>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left: Company Info */}
            <div className="lg:col-span-8 space-y-12">
              {/* Distributor */}
              <div className="space-y-3">
                <h5 className="text-zinc-200 font-black text-sm uppercase tracking-widest border-l-4 border-amber-500 pl-3">총판사</h5>
                <div className="text-xs font-light space-y-1.5 leading-relaxed opacity-80">
                  <p className="text-zinc-300 font-bold text-sm">(주)라이프앤조이 | 대표 : 김지훈</p>
                  <p>경기도 하남시 미사대로 510, 624호(아이에스비즈타워)</p>
                  <p>사업자등록번호: 388-86-02921 | 통신판매신고번호: 2024-경기하남-1853호</p>
                  <p>E-mail: lifenjoy0296@gmail.com | 개인정보보호책임자: 김지훈(lifenjoy0296@gmail.co.kr)</p>
                  <p className="mt-3 text-zinc-600">Copyright(c)2026 LIFE&JOY Co.,Ltd. All Right Reserved.</p>
                </div>
              </div>

              {/* Service Organizer */}
              <div className="space-y-3">
                <h5 className="text-zinc-200 font-black text-sm uppercase tracking-widest border-l-4 border-zinc-700 pl-3">상조서비스 주관사</h5>
                <div className="text-xs font-light space-y-1.5 leading-relaxed opacity-80">
                  <p className="text-zinc-300 font-bold text-sm">보람상조피플(주) | 대표 : 김충현</p>
                  <p>서울특별시 성동구 광나루로 130, 서울숲TI캐슬 7층</p>
                  <p>사업자등록번호: 220-87-79209 | 통신판매업신고번호: 제2014-서울성동-0606호</p>
                  <p className="mt-3 text-zinc-600">Copyright(c)2026 BORAM Co.,Ltd. All Right Reserved.</p>
                </div>
              </div>
            </div>

            {/* Right: Customer Center */}
            <div className="lg:col-span-4 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800/50">
              <h5 className="text-zinc-100 font-black text-lg mb-6 flex items-center gap-2">
                <Phone size={20} className="text-amber-500" />
                보람상조피플(주) 고객센터
              </h5>
              <div className="space-y-6">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">고객센터</p>
                  <p className="text-3xl font-black text-white tracking-tighter">1588-7979</p>
                </div>
                <div>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">24시 긴급행사(장례접수)</p>
                  <p className="text-3xl font-black text-amber-500 tracking-tighter">1577-1009</p>
                </div>
                <div className="pt-6 border-t border-zinc-800 space-y-2 text-xs font-medium">
                  <p className="flex justify-between">
                    <span className="text-zinc-500">일반 상담</span>
                    <span className="text-zinc-300">09:00 ~ 18:00</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-zinc-500">긴급행사 운영</span>
                    <span className="text-zinc-300">연중무휴 24시간</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
