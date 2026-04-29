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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  const maxByDate = Math.max(...stats.byDate.map(d => d.count), 1);
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
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} /> Total
            </span>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">누적 상담신청</h3>
          <p className="text-3xl font-black text-zinc-900 mt-1">{stats.total.toLocaleString()}건</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-bold">활성 파트너수</h3>
          <p className="text-3xl font-black text-zinc-900 mt-1">{stats.byPartner.length.toLocaleString()}곳</p>
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
        {/* Date Statistics Chart (CSS Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm"
        >
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-3">
            <Calendar className="text-amber-500" /> 일별 상담신청 추이 (최근 30일)
          </h3>
          <div className="h-[300px] flex items-end gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {[...stats.byDate].reverse().map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[30px]">
                <div className="relative group w-full flex justify-center items-end h-[240px]">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxByDate) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.05 }}
                    className="w-full max-w-[12px] bg-amber-500 rounded-full group-hover:bg-amber-600 transition-colors cursor-pointer relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                      {d.count}건
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
                  <span className="text-sm font-black text-zinc-900">{p.count}건</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.count / maxByPartner) * 100}%` }}
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
    </div>
  );
}
