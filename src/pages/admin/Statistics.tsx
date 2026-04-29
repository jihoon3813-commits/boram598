import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "motion/react";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Package, 
  ArrowUpRight, 
  Trophy,
  TrendingUp,
  Activity
} from "lucide-react";

export default function Statistics() {
  const stats = useQuery(api.stats.getConsultationStats);
  const [selectedPartner, setSelectedPartner] = useState<string | null>("전체");

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  const maxVal = Math.max(...stats.byDate.map(d => Math.max(d.count, d.visitCount)), 1);
  const maxByPartner = Math.max(...stats.byPartner.map(p => p.count), 1);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Activity size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">누적 사이트 인입</h3>
          <p className="text-3xl font-black text-zinc-900 mt-1">{stats.totalVisits.toLocaleString()}회</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> {(stats.total / (stats.totalVisits || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">누적 상담신청</h3>
          <p className="text-3xl font-black text-zinc-900 mt-1">{stats.total.toLocaleString()}건</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">오늘 신청 (가집계)</h3>
          <p className="text-3xl font-black text-zinc-900 mt-1">
            {stats.byDate[0]?.date === new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0] 
              ? stats.byDate[0].count.toLocaleString() 
              : "0"}건
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Trophy size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">최우수 파트너</h3>
          <p className="text-xl font-black text-zinc-900 mt-1 truncate">
            {stats.byPartner[0]?.partner || "없음"}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Statistics Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm"
        >
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-amber-500" /> 일별 추이 (최근 30일)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <span className="text-[10px] font-bold text-zinc-400">인입</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-zinc-400">신청</span>
              </div>
            </div>
          </h3>
          <div className="h-[300px] flex items-end gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {[...stats.byDate].reverse().map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[40px]">
                <div className="relative group w-full flex justify-center items-end h-[240px] gap-[2px]">
                  {/* Visit Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.visitCount / maxVal) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.03 }}
                    className="w-1.5 bg-zinc-100 rounded-t-full group-hover:bg-zinc-200 transition-colors cursor-pointer relative"
                  >
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                      인입: {d.visitCount}회
                    </div>
                  </motion.div>
                  {/* Consultation Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxVal) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.05 }}
                    className="w-1.5 bg-amber-500 rounded-t-full group-hover:bg-amber-600 transition-colors cursor-pointer relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                      신청: {d.count}건
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 rotate-45 origin-left whitespace-nowrap mt-2">
                  {d.date.substring(5)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Partner Ranking */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col"
        >
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-3">
            <Users className="text-blue-500" /> 파트너별 실적 랭킹
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {stats.byPartner.map((p, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-zinc-700">{p.partner}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-zinc-400">인입 {p.visitCount}회</span>
                    <span className="text-sm font-black text-zinc-900">신청 {p.count}건</span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.count / Math.max(maxByPartner, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-zinc-700' : idx === 2 ? 'bg-zinc-400' : 'bg-zinc-200'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Product Popularity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm"
      >
        <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-3">
          <Package className="text-rose-500" /> 인기 상품 Top 10
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.byProduct.map((p, idx) => (
            <div key={idx} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 group hover:border-amber-200 hover:bg-amber-50 transition-all cursor-default">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-amber-500">Rank {idx + 1}</div>
              <div className="font-bold text-zinc-900 truncate mb-2">{p.product}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">상담신청</span>
                <span className="text-sm font-black text-zinc-900">{p.count}건</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Detailed Daily Partner Stats with Selection */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-xl font-black text-zinc-900 flex items-center gap-3">
            <Activity className="text-indigo-500" /> 파트너별 상세 실적 추이
          </h3>
          
          {/* Partner Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-full md:max-w-[60%]">
            <button
              onClick={() => setSelectedPartner("전체")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedPartner === "전체"
                  ? 'bg-zinc-900 text-white shadow-lg'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              전체 보기
            </button>
            {stats.byPartner.map((p) => (
              <button
                key={p.partner}
                onClick={() => setSelectedPartner(p.partner)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedPartner === p.partner
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {p.partner}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <th className="px-4 py-4 font-black">날짜</th>
                <th className="px-4 py-4 font-black">파트너</th>
                <th className="px-4 py-4 font-black text-center">사이트 인입</th>
                <th className="px-4 py-4 font-black text-center">상담 신청</th>
                <th className="px-4 py-4 font-black text-center">전환율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {stats.byDatePartner
                .filter(row => selectedPartner === "전체" || row.partner === selectedPartner)
                .map((row, idx) => (
                <tr key={idx} className="group hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-zinc-500">{row.date}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{row.partner}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-bold text-zinc-700">{row.visits.toLocaleString()}회</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-black text-amber-500">{row.applications.toLocaleString()}건</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      (row.applications / (row.visits || 1)) > 0.1 ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {(row.applications / (row.visits || 1) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {stats.byDatePartner.filter(row => selectedPartner === "전체" || row.partner === selectedPartner).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-20 text-center text-zinc-400 font-medium">
                    해당 파트너의 데이터가 아직 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
