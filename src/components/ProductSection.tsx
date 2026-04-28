import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  X, 
  ChevronRight, 
  CreditCard, 
  Wallet, 
  ExternalLink,
  Phone,
  ChevronDown,
  Sparkles,
  Grid3X3,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

// --- Product Detail Modal ---
function ProductDetailModal({ product, showDetail, onClose }: { product: any; showDetail: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50 shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-zinc-900 mb-1">{product.name}</h3>
            {product.modelName && product.modelName !== '정보없음' && (
              <p className="text-sm text-zinc-500 font-medium">모델명: {product.modelName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Thumbnail */}
          <div className="flex justify-center mb-8">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="max-w-sm w-full h-auto rounded-2xl border border-zinc-100 object-contain"
            />
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap gap-3 mb-8">
            {product.paymentMethods?.map((m: string, i: number) => (
              <span 
                key={i} 
                className={`px-4 py-2 rounded-full text-sm font-bold border ${
                  m === "신한 48페이" 
                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Detail HTML */}
          {showDetail && product.detailHtml && (
            <div
              className="prose prose-zinc max-w-none product-detail-content"
              dangerouslySetInnerHTML={{ __html: product.detailHtml }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- Full Product Catalog Modal ---
function ProductCatalogModal({
  groups,
  initialGroupId,
  onClose,
  onConsultClick,
}: {
  groups: any[];
  initialGroupId?: string | null;
  onClose: () => void;
  onConsultClick: (productName: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(initialGroupId || groups[0]?.group?._id || '');
  const [detailProduct, setDetailProduct] = useState<any>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialGroupId) setActiveTab(initialGroupId);
  }, [initialGroupId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const activeGroupData = groups.find((g) => g.group._id === activeTab);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col mx-4"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm">
                <Grid3X3 size={20} strokeWidth={2.5} />
              </div>
              가전 제품 안내
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {/* Tabs */}
          <div ref={tabRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {groups.map(({ group }) => (
              <button
                key={group._id}
                onClick={() => setActiveTab(group._id)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === group._id
                    ? group.isVirtual 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-zinc-900 text-white shadow-md'
                    : group.isVirtual
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {group.isVirtual && <ShieldCheck size={14} />}
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {activeGroupData?.products.map((product: any) => (
              <div
                key={product._id}
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all flex flex-col h-full"
              >
                <div
                  onClick={() => setDetailProduct(product)}
                  className="cursor-pointer flex flex-col flex-1"
                >
                  <div className="aspect-square bg-zinc-50 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-sm font-bold text-zinc-900 mb-3 leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {product.paymentMethods?.map((m: string, i: number) => (
                        <span 
                          key={i} 
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            m === "신한 48페이" 
                              ? "bg-blue-50 text-blue-600" 
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 md:px-4 md:pb-4">
                  <button
                    onClick={() => onConsultClick(product.name)}
                    className="w-full py-2 text-center text-[11px] md:text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-lg transition-all"
                  >
                    가입상담 신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
          {(!activeGroupData?.products || activeGroupData.products.length === 0) && (
            <div className="p-20 text-center text-zinc-400">
              <p className="font-bold text-lg">등록된 제품이 없습니다.</p>
              <p className="text-sm mt-2">관리자가 제품을 등록하면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detail Modal on top */}
      <AnimatePresence>
        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            showDetail={activeGroupData.group.fetchDetail !== false}
            onClose={() => setDetailProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Quick Consultation Bar ---
function QuickConsultBar({
  productName,
  onClose,
  onContactClick,
}: {
  productName: string;
  onClose: () => void;
  onContactClick: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[300] bg-zinc-950 border-t border-zinc-800 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Phone size={18} className="text-amber-500 shrink-0" />
          <p className="text-white text-xs md:text-sm font-medium truncate">
            <span className="text-amber-500 font-bold">{productName}</span> 궁금하신가요?
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={onContactClick}
            className="bg-amber-500 text-zinc-950 font-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.97] flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
          >
            상담 신청 <ArrowRight size={14} className="hidden xs:block" />
          </button>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Product Card (for inline section) ---
function ProductCard({
  product,
  fetchDetail,
  onDetailClick,
  onConsultClick,
}: {
  product: any;
  fetchDetail?: boolean;
  onDetailClick: () => void;
  onConsultClick: () => void;
}) {
  return (
    <div className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div onClick={onDetailClick} className="cursor-pointer flex flex-col flex-1">
        <div className="aspect-square bg-zinc-50 p-4 sm:p-6 flex items-center justify-center overflow-hidden relative">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {fetchDetail && (
            <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/5 flex items-center justify-center transition-all duration-300">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                 <ExternalLink size={16} className="text-zinc-600" />
               </div>
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h4 className="text-[13px] sm:text-sm font-bold text-zinc-900 leading-tight mb-2 sm:mb-3">
            {product.name}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {product.paymentMethods?.map((m: string, i: number) => (
              <span
                key={i}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  m === "신한 48페이" 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 md:px-5 md:pb-5">
        <button
          onClick={onConsultClick}
          className="w-full py-2 sm:py-2.5 text-center text-[10px] md:text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-xl transition-all"
        >
          가입상담 신청하기
        </button>
      </div>
    </div>
  );
}

// --- Shinhan Pay Guidance Modal ---
function ShinhanPayModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-blue-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-zinc-900">신한 48PAY 상세 안내</h3>
              <p className="text-sm text-blue-600 font-bold">48개월 무이자급 스마트 할부 결제</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-500 shadow-sm transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10">
          <div className="space-y-10">
            {/* Main Benefits */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="text-blue-600 font-black text-3xl mb-2">48<span className="text-lg ml-1">개월</span></div>
                <p className="text-zinc-900 font-bold mb-1">국내 최장기 슬림할부</p>
                <p className="text-zinc-500 text-xs leading-relaxed">월 납입 부담을 최소화하는 스마트한 분할 납부 솔루션</p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="text-amber-500 font-black text-3xl mb-2">8<span className="text-lg ml-1">%</span></div>
                <p className="text-zinc-900 font-bold mb-1">결제 금액 캐시백</p>
                <p className="text-zinc-500 text-xs leading-relaxed">이자 상당액을 캐시백으로 돌려받아 실질적 무이자 혜택 제공</p>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h4 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                이용 방식 안내
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-1">1~5회차 납부</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">할부 원금과 수수료를 납부하지만, 8% 캐시백으로 이자 부담을 상쇄합니다.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-1">6~48회차 납부</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">수수료 및 이자가 전액 면제되어 할부 원금만 분할 납부합니다.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-1">상조 만기 시 100% 환급</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">가전 할부 납입을 포함한 상조 납입금 전액을 만기 시 돌려받습니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex gap-2 items-start text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <p className="text-zinc-700">신한카드(개인) 한도 내에서 별도의 심사 없이 즉시 이용 가능합니다.</p>
              </div>
              <div className="flex gap-2 items-start text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <p className="text-zinc-700">중도 상환 수수료가 없어 언제든 원금 상환이 자유롭습니다.</p>
              </div>
              <div className="flex gap-2 items-start text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <p className="text-zinc-700">법인, 체크, 선불, 기프트카드는 이용이 제한됩니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-zinc-50 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98]"
          >
            내용 확인 완료
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Export ---
export default function ProductSection({
  onContactClick,
  activePartner,
}: {
  onContactClick: (productName?: string) => void;
  activePartner?: any;
}) {
  const mainProducts = useQuery(api.products.listMainProducts, activePartner ? { partnerId: activePartner._id } : {});
  const [detailProduct, setDetailProduct] = useState<any>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogGroupId, setCatalogGroupId] = useState<string | null>(null);
  const [quickConsult, setQuickConsult] = useState<string | null>(null);
  const [showShinhanPay, setShowShinhanPay] = useState(false);

  const handleConsultClick = (productName: string) => {
    setQuickConsult(productName);
  };

  const filteredMainProducts = mainProducts;

  const handleMoreClick = (groupId: string) => {
    setCatalogGroupId(groupId);
    setCatalogOpen(true);
  };

  const openFullCatalog = () => {
    setCatalogGroupId(null);
    setCatalogOpen(true);
  };

  if (!filteredMainProducts || filteredMainProducts.length === 0) {
    return null;
  }

  return (
    <>
      <section id="products" className="py-32 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-4">
              Premium Electronics
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-6">
              선택할 수 있는 <br className="md:hidden" /> 프리미엄 가전
            </h3>
            <p className="text-zinc-500 text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-light px-4">
              삼성, LG 등 국내 최고 브랜드의 <br className="md:hidden" /> 프리미엄 가전을 만나보세요.
            </p>
          </div>

          {/* Payment Methods Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-zinc-50 rounded-[2rem] p-6 md:p-10 border border-zinc-200 relative overflow-hidden group hover:border-zinc-300 transition-all">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/10 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                    <CreditCard size={20} className="sm:hidden" />
                    <CreditCard size={28} className="hidden sm:block" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-zinc-900">60개월 렌탈</h4>
                </div>
                <p className="text-zinc-500 leading-relaxed font-light mb-4">
                  월 납입금을 60개월 동안 렌탈 방식으로 결제합니다. 상조 만기 후 납입금 전액이 환급됩니다.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                  <Sparkles size={14} /> 만기 시 전액 환급
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-[2rem] p-6 md:p-10 border border-zinc-200 relative overflow-hidden group hover:border-zinc-300 transition-all">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <Wallet size={20} className="sm:hidden" />
                    <Wallet size={28} className="hidden sm:block" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-zinc-900">48개월 무이자(급) 할부</h4>
                </div>
                <p className="text-zinc-500 leading-relaxed font-light mb-4">
                  신한카드 48PAY 서비스를 통해 48개월 무이자(급) 할부로 결제합니다. 마찬가지로 만기 후 전액 환급됩니다.
                </p>
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs font-bold border border-green-200 whitespace-nowrap shrink-0">
                    <Sparkles size={12} /> 만기 시 전액 환급
                  </div>
                  <button 
                    onClick={() => setShowShinhanPay(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <ExternalLink size={12} /> 신한 48PAY 안내
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Groups */}
          {filteredMainProducts.map(({ group, products }) => (
            <div key={group._id} className={`mb-20 last:mb-0 ${group.isVirtual ? 'bg-blue-50/30 p-8 sm:p-10 rounded-[3rem] border border-blue-100/50 relative overflow-hidden' : ''}`}>
              {group.isVirtual && (
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <ShieldCheck size={200} className="text-blue-600" />
                </div>
              )}
              <div className="flex items-end justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  {group.isVirtual && (
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <ShieldCheck size={24} />
                    </div>
                  )}
                  <h4 className={`text-2xl md:text-3xl font-black ${group.isVirtual ? 'text-blue-900' : 'text-zinc-900'}`}>
                    {group.name}
                  </h4>
                </div>
                <button
                  onClick={() => handleMoreClick(group._id)}
                  className={`flex items-center gap-1 text-sm font-bold transition-colors group/btn ${group.isVirtual ? 'text-blue-600 hover:text-blue-800' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  전체보기 <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.slice(0, group.displayCount).map((product: any) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onDetailClick={() => setDetailProduct(product)}
                    onConsultClick={() => handleConsultClick(product.name)}
                  />
                ))}
              </div>

              {products.length > group.displayCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => handleMoreClick(group._id)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-all text-sm"
                  >
                    <ChevronDown size={18} /> 더보기 (+{products.length - group.displayCount}개)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            showDetail={filteredMainProducts.find(g => g.products.some((p: any) => p._id === detailProduct._id))?.group.fetchDetail !== false}
            onClose={() => setDetailProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Shinhan Pay Modal */}
      <AnimatePresence>
        {showShinhanPay && (
          <ShinhanPayModal onClose={() => setShowShinhanPay(false)} />
        )}
      </AnimatePresence>

      {/* Full Catalog Modal */}
      <AnimatePresence>
        {catalogOpen && mainProducts && (
          <ProductCatalogModal
            groups={filteredMainProducts}
            initialGroupId={catalogGroupId}
            onClose={() => setCatalogOpen(false)}
            onConsultClick={handleConsultClick}
          />
        )}
      </AnimatePresence>

      {/* Quick Consultation Bar */}
      <AnimatePresence>
        {quickConsult && (
          <QuickConsultBar
            productName={quickConsult}
            onClose={() => setQuickConsult(null)}
            onContactClick={() => {
              const name = quickConsult;
              setQuickConsult(null);
              onContactClick(name);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Export the catalog modal open function for the Navbar
export { ProductCatalogModal };
