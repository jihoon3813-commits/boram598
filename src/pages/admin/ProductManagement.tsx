import { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  GripVertical, 
  Trash2, 
  ExternalLink, 
  Settings, 
  Eye, 
  EyeOff,
  ChevronRight,
  MoreVertical,
  Layers,
  Save,
  X,
  Menu
} from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableProductItem({ product, onUpdate, onDelete, onEdit }: { product: any, onUpdate: (id: any, data: any) => void, onDelete: (id: any) => void, onEdit: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white border border-zinc-200 rounded-xl p-3 lg:p-4 flex items-center gap-3 lg:gap-4 group hover:border-zinc-300 transition-all shadow-sm mb-3"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-600 px-1">
        <GripVertical size={20} />
      </div>
      
      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
          <h4 className="font-bold text-zinc-900 truncate text-sm lg:text-base">{product.name}</h4>
          <span className="text-[9px] lg:text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 w-fit">
            {product.modelName || '모델명 없음'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] lg:text-xs text-zinc-500">
          <span className="truncate">{product.paymentMethods.join(' / ')}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 lg:gap-2">
        <button 
          onClick={onEdit}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-lg"
        >
          <Settings size={18} />
        </button>
        <button 
          onClick={() => {
            const methods = [...(product.paymentMethods || [])];
            const has48Pay = methods.includes("신한 48페이");
            const newMethods = has48Pay 
              ? methods.filter(m => m !== "신한 48페이")
              : [...methods, "신한 48페이"];
            onUpdate(product._id, { paymentMethods: newMethods });
          }}
          className={`px-2 lg:px-3 py-2 rounded-lg text-[9px] lg:text-[10px] font-black transition-all ${
            product.paymentMethods?.includes("신한 48페이") 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          48Pay
        </button>
        <div className="hidden lg:flex items-center gap-1">
          <button 
            onClick={() => onUpdate(product._id, { showOnMain: !product.showOnMain })}
            className={`p-2 rounded-lg transition-colors ${product.showOnMain ? 'text-amber-600 bg-amber-50' : 'text-zinc-400 bg-zinc-100'}`}
          >
            {product.showOnMain ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button 
            onClick={() => onDelete(product._id)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <a 
            href={product.originalUrl} 
            target="_blank" 
            rel="noreferrer"
            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function ProductManagement() {
  const groups = useQuery(api.products.listGroups);
  const addGroup = useMutation(api.products.addGroup);
  const updateGroup = useMutation(api.products.updateGroup);
  const deleteGroup = useMutation(api.products.deleteGroup);
  
  const [selectedGroupId, setSelectedGroupId] = useState<any>(null);
  const products = useQuery(api.products.listProducts, selectedGroupId ? { groupId: selectedGroupId } : "skip");
  const addProduct = useMutation(api.products.addProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const reorderProducts = useMutation(api.products.reorderProducts);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [isFetching, setIsFetching] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [modalPaymentMethods, setModalPaymentMethods] = useState<string[]>(['60개월 렌탈', '신한 48페이']);

  useEffect(() => {
    if (isProductModalOpen) {
      if (editingProduct) {
        setModalPaymentMethods(editingProduct.paymentMethods || []);
      } else {
        setModalPaymentMethods(['60개월 렌탈', '신한 48페이']);
      }
    }
  }, [isProductModalOpen, editingProduct]);

  const fetchProducts = useAction(api.crawler.fetchProductsFromUrlV3);
  
  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && products) {
      const oldIndex = products.findIndex((p) => p._id === active.id);
      const newIndex = products.findIndex((p) => p._id === over.id);
      
      const newArray = arrayMove(products, oldIndex, newIndex);
      const orders = newArray.map((p, idx) => ({ id: p._id, order: idx }));
      reorderProducts({ orders });
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      fetchUrl: formData.get('fetchUrl') as string,
      showOnMain: formData.get('showOnMain') === 'on',
      displayCount: parseInt(formData.get('displayCount') as string || '8'),
      order: editingGroup ? editingGroup.order : (groups?.length || 0),
      fetchDetail: formData.get('fetchDetail') === 'on',
    };

    if (editingGroup) {
      await updateGroup({ id: editingGroup._id, ...data });
    } else {
      await addGroup(data);
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const paymentMethods = modalPaymentMethods;

    const data: any = {
      groupId: selectedGroupId,
      name: formData.get('name') as string,
      modelName: formData.get('modelName') as string,
      thumbnail: formData.get('thumbnail') as string,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : ["60개월 렌탈"],
      originalUrl: formData.get('originalUrl') as string,
      detailHtml: formData.get('detailHtml') as string || '',
      showOnMain: formData.get('showOnMain') === 'on',
      order: editingProduct ? editingProduct.order : (products?.length || 0),
    };

    if (editingProduct) {
      await updateProduct({ id: editingProduct._id, ...data });
    } else {
      await addProduct(data);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const activeGroup = groups?.find(g => g._id === selectedGroupId);

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-120px)] gap-6 overflow-hidden font-sans">
      {/* Sidebar: Groups */}
      <div className={`
        ${isMobileSidebarOpen ? 'flex' : 'hidden'} lg:flex 
        flex-col w-full lg:w-80 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm shrink-0
      `}>
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <Layers size={18} className="text-zinc-500" /> 제품 그룹
          </h3>
          <div className="flex gap-1">
            <button 
              onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
              className="p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 lg:max-h-full max-h-[300px]">
          {groups?.map((group) => (
            <div 
              key={group._id}
              onClick={() => {
                setSelectedGroupId(group._id);
                if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedGroupId === group._id 
                  ? 'bg-amber-50 border-amber-200 shadow-sm' 
                  : 'bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  group.showOnMain ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-500'
                }`}>
                  {group.showOnMain ? 'Main Active' : 'Hidden'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingGroup(group); setIsGroupModalOpen(true); }}
                  className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <Settings size={14} />
                </button>
              </div>
              <h4 className={`font-bold ${selectedGroupId === group._id ? 'text-amber-900' : 'text-zinc-700'}`}>
                {group.name}
              </h4>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-zinc-400 truncate flex-1">{group.fetchUrl}</p>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-md ml-2">
                  {group.productCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobileSidebarOpen || window.innerWidth >= 1024 ? 'flex' : 'hidden'}`}>
        {!selectedGroupId ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 p-8">
            <div className="text-center">
              <Layers size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold">좌측 그룹을 선택하여 제품을 관리하세요</p>
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden mt-4 text-amber-600 font-bold flex items-center gap-2 mx-auto"
              >
                <Menu size={18} /> 그룹 목록 보기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header Toggle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden mb-4 flex items-center gap-2 text-zinc-500 font-bold bg-white border border-zinc-200 px-4 py-2 rounded-xl w-fit"
            >
              <ChevronRight size={18} className="rotate-180" /> 그룹 목록으로 가기
            </button>

            {/* Sync Guidance */}
            <div className="bg-zinc-900 text-white rounded-2xl p-5 lg:p-6 mb-6 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shrink-0">
                  <RefreshCw size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-500 mb-1">제품 정보 자동 동기화</h4>
                  <p className="text-xs lg:text-sm text-zinc-400 leading-relaxed font-medium">
                    대량의 제품을 한꺼번에 가져오려면 로컬 터미널에서 명령어를 실행해 주세요.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <code className="bg-zinc-800 px-3 py-1.5 rounded-lg text-[10px] lg:text-xs font-mono text-amber-200">
                      node scripts/sync_products.mjs
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('node scripts/sync_products.mjs');
                        alert('명령어가 복사되었습니다.');
                      }}
                      className="text-xs font-bold text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
                    >
                      복사하기
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Group Header */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 lg:p-8 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl lg:text-3xl font-black text-zinc-900 mb-2 truncate">
                    {activeGroup?.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <ExternalLink size={14} className="shrink-0" />
                    <a href={activeGroup?.fetchUrl} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[200px] lg:max-w-none">{activeGroup?.fetchUrl}</a>
                    <span className="shrink-0 bg-zinc-100 px-2 py-0.5 rounded-full font-bold">
                      {products?.length || 0} items
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={async () => {
                      if (!activeGroup) return;
                      setIsFetching(true);
                      try {
                        const result = await fetchProducts({ groupId: activeGroup._id, url: activeGroup.fetchUrl });
                        alert(`${result.count}개의 제품을 가져왔습니다.`);
                      } catch (err: any) {
                        alert(`가져오기 실패: ${err.message}`);
                      } finally {
                        setIsFetching(false);
                      }
                    }}
                    disabled={isFetching}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all ${isFetching ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'}`}
                  >
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} /> {isFetching ? '수집중' : '가져오기'}
                  </button>
                  <button 
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl text-sm font-black hover:bg-zinc-800 transition-all shadow-lg"
                  >
                    <Plus size={18} /> 추가
                  </button>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-10">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={products?.map(p => p._id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {products?.map((product) => (
                    <div key={product._id} className="relative group">
                      <SortableProductItem 
                        product={product} 
                        onUpdate={(id, data) => updateProduct({ id, ...data })}
                        onDelete={(id) => confirm('삭제하시겠습니까?') && deleteProduct({ id })}
                        onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                      />
                      <button 
                        onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        className="hidden lg:block absolute left-[80px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all"
                      >
                        상세수정
                      </button>
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
              
              {products?.length === 0 && (
                <div className="py-20 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200 border-dashed">
                  <RefreshCw size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">가져오기 버튼을 눌러 제품 정보를 불러오세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals - Reusing existing patterns but with better mobile spacing */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 lg:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-xl font-black text-zinc-900">{editingGroup ? '그룹 수정' : '그룹 추가'}</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveGroup} className="p-6 lg:p-8 space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={editingGroup?.name}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                  placeholder="예: 보람피플 B299 1호"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fetch URL</label>
                <input 
                  type="url" 
                  name="fetchUrl" 
                  required 
                  defaultValue={editingGroup?.fetchUrl}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                  placeholder="https://boram.lifenuri.com/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Display Count</label>
                  <input 
                    type="number" 
                    name="displayCount" 
                    required 
                    defaultValue={editingGroup?.displayCount || 8}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2 sm:pt-6">
                  <input 
                    type="checkbox" 
                    name="showOnMain" 
                    id="showOnMain"
                    defaultChecked={editingGroup ? editingGroup.showOnMain : true}
                    className="w-6 h-6 rounded-lg accent-amber-500"
                  />
                  <label htmlFor="showOnMain" className="text-sm font-black text-zinc-700">메인 노출 활성화</label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {editingGroup && (
                  <button 
                    type="button" 
                    onClick={() => { if(confirm('삭제하시겠습니까?')) { deleteGroup({ id: editingGroup._id }); setIsGroupModalOpen(false); } }}
                    className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all"
                  >
                    삭제
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 bg-zinc-900 text-white rounded-2xl py-4 font-black text-lg hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
            <div className="p-6 lg:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-xl font-black text-zinc-900">{editingProduct ? '제품 수정' : '제품 추가'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 lg:p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    defaultValue={editingProduct?.name}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Model Name</label>
                  <input 
                    type="text" 
                    name="modelName" 
                    required 
                    defaultValue={editingProduct?.modelName}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Thumbnail URL</label>
                <input 
                  type="url" 
                  name="thumbnail" 
                  required 
                  defaultValue={editingProduct?.thumbnail}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Payment Methods</label>
                <div className="flex gap-2">
                  {['60개월 렌탈', '신한 48페이'].map(m => (
                    <button 
                      key={m}
                      type="button"
                      onClick={() => {
                        if (modalPaymentMethods.includes(m)) {
                          setModalPaymentMethods(modalPaymentMethods.filter(item => item !== m));
                        } else {
                          setModalPaymentMethods([...modalPaymentMethods, m]);
                        }
                      }}
                      className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all border ${
                        modalPaymentMethods.includes(m)
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Detail HTML</label>
                <textarea 
                  name="detailHtml" 
                  defaultValue={editingProduct?.detailHtml}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs min-h-[150px] font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name="showOnMain" 
                    id="prodShowOnMain"
                    defaultChecked={editingProduct ? editingProduct.showOnMain : true}
                    className="w-6 h-6 rounded-lg accent-amber-500"
                  />
                  <label htmlFor="prodShowOnMain" className="text-sm font-black text-zinc-700">리스트 노출</label>
                </div>
                {editingProduct && (
                   <button 
                     type="button"
                     onClick={() => { if(confirm('삭제하시겠습니까?')) { deleteProduct({ id: editingProduct._id }); setIsProductModalOpen(false); } }}
                     className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                   >
                     이 제품 삭제하기
                   </button>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-zinc-900 text-white rounded-2xl py-4 font-black text-lg hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                >
                  {editingProduct ? '수정 완료' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
