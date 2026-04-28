import { Users, TrendingUp, UserPlus, Calendar, ArrowUpRight, MessageSquare, Bell, ChevronRight } from 'lucide-react';

export default function PartnerDashboard() {
  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      {/* Welcome Message for Mobile */}
      <div className="lg:hidden mb-2">
        <h2 className="text-2xl font-black text-zinc-900">대시보드</h2>
        <p className="text-zinc-500 text-sm font-medium">오늘의 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="오늘 신청 고객" 
          value="12" 
          change="+20%" 
          trend="up"
          icon={<UserPlus size={24} />} 
          color="blue"
        />
        <StatCard 
          title="당월 누적 고객" 
          value="154" 
          change="+12%" 
          trend="up"
          icon={<Users size={24} />} 
          color="amber"
        />
        <StatCard 
          title="진행 중인 상담" 
          value="45" 
          change="0%" 
          trend="neutral"
          icon={<MessageSquare size={24} />} 
          color="green"
        />
        <StatCard 
          title="전환 성공률" 
          value="24.5%" 
          change="+5.2%" 
          trend="up"
          icon={<TrendingUp size={24} />} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Status List */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div>
              <h3 className="font-black text-zinc-900 text-xl flex items-center gap-2">
                최근 신청 현황
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Live</span>
              </h3>
              <p className="text-zinc-500 text-xs lg:text-sm font-medium mt-1">실시간으로 접수되는 신규 고객 리스트입니다.</p>
            </div>
            <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: '김태희', plan: '보람 플랜 B299 1호', time: '10분 전', status: '상담대기', color: 'amber' },
              { name: '이민호', plan: '보람 플랜 B299 2호', time: '1시간 전', status: '진행중', color: 'blue' },
              { name: '최수지', plan: '보람 플랜 B299 1호', time: '3시간 전', status: '상담대기', color: 'amber' },
              { name: '박서준', plan: '보람 플랜 B299 4호', time: '어제', status: '완료', color: 'green' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 lg:p-5 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    item.color === 'amber' ? 'bg-amber-100 text-amber-600' : 
                    item.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-zinc-900">{item.name} 고객님</p>
                    <p className="text-[11px] lg:text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                      {item.time} | <span className="text-zinc-500">{item.plan}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`hidden sm:block px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${
                    item.status === '상담대기' ? 'bg-amber-500 text-white' : 
                    item.status === '진행중' ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-white'
                  }`}>
                    {item.status}
                  </span>
                  <ArrowUpRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Notices & Alerts */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900 p-6 lg:p-8 rounded-[2rem] text-white shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Bell size={20} className="text-amber-500" /> 공지사항
              </h3>
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-500 px-2 py-1 rounded-lg uppercase">Notice</span>
            </div>
            <div className="space-y-5">
              {[
                { title: '5월 프로모션 안내 - 삼성 가전 패키지 강화', date: '2026.04.25', isNew: true },
                { title: '시스템 점검 안내 (04/28 02:00 ~ 04:00)', date: '2026.04.24', isNew: false },
                { title: '파트너 고객 응대 매뉴얼 업데이트 v2.1', date: '2026.04.22', isNew: false },
              ].map((notice, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-start gap-3">
                    {notice.isNew && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />}
                    <div>
                      <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors leading-tight">
                        {notice.title}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-black mt-1 uppercase tracking-widest">{notice.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-black transition-all">
              전체 공지 보기
            </button>
          </div>

          <div className="bg-amber-500 p-6 lg:p-8 rounded-[2rem] text-zinc-950 flex flex-col justify-between overflow-hidden relative group cursor-pointer shadow-lg shadow-amber-500/20">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/20 blur-[60px] rounded-full group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Partner Support</p>
              <h4 className="text-2xl font-black leading-tight mb-4">영업 활성화를 위한<br />특별 교육 일정 안내</h4>
              <button className="bg-zinc-950 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                자세히 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon, color }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral', icon: any, color: 'blue' | 'amber' | 'green' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5',
    green: 'bg-green-50 text-green-600 border-green-100 shadow-green-500/5',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-500/5'
  };

  return (
    <div className={`bg-white p-5 lg:p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-zinc-300 transition-all cursor-default`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 
          trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-500'
        }`}>
          {trend === 'up' && <ArrowUpRight size={12} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] lg:text-xs text-zinc-400 font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
