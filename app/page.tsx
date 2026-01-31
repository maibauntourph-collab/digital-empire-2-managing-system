"use client";

import ParkingCalculator from "@/components/ParkingCalculator";
import { MessageCircle, FileText, Calendar, Bell, ShieldQuestion, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'parking' | 'facility' | 'general'>('parking');

  const handleServiceClick = (serviceName: string) => {
    // Open chat on specific tab when clicking a service
    setIsChatOpen(true);
    if (serviceName.includes("주차")) setActiveTab('parking');
    else if (serviceName.includes("시설")) setActiveTab('facility');
    else setActiveTab('general');
  };

  const facts = {
    parking: [
      "일일권은 12시간 인정되며, 1회 최대 3장(72시간)까지 가능합니다.",
      "시간권은 최대 2시간까지 중복 적용 가능합니다.",
      "금~일 주차 시 금요일부터 순차적으로 할인권이 적용됩니다."
    ],
    facility: [
      "비즈니스룸(1.1만/h), 세미나실(2.2만/h) - 입주사 전용입니다.",
      "회의실 예약은 카드 결제가 불가하며 계좌이체만 가능합니다.",
      "매월 3~4째주 화요일은 협의회 정기회의로 예약이 불가합니다."
    ],
    general: [
      "관리비 2개월 미납 시 차량 정지 예고 및 내용증명이 발송됩니다.",
      "3개월 이상 미납 시 실제로 차량 정지 및 단전/단수 예고가 진행됩니다.",
      "주차권 어플 충전은 '아이파킹 맴버스' 앱을 통해 가능합니다."
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="max-w-screen-md mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <img src="/images/empire_helper_icon.png" alt="Icon" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-royal-blue font-black text-lg tracking-tight">
              DIGITAL EMPIRE II
            </h1>
          </div>
          <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full tracking-wide">
            BUSINESS HELPER
          </span>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto px-5 pt-6 space-y-10">

        {/* Welcome Section */}
        <section className="space-y-4">
          <div className="bg-gradient-to-br from-[#7CB9E8] to-royal-blue text-white p-7 rounded-3xl shadow-[0_10px_40px_-10px_rgba(124,185,232,0.6)] relative overflow-hidden group transition-all">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center p-1.5">
                  <img src="/images/empire_helper_icon.png" alt="Empire Helper" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-bold mb-1 backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                    AI Agent Active
                  </span>
                  <h2 className="text-lg font-bold leading-tight">엠파이어 II 업무도우미</h2>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed max-w-[90%] font-medium">
                업무인수인계서 및 관리규약의 팩트를 기반으로<br />
                정확한 업무 가이드를 즉시 안내해 드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Menu Grid */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-gray-900">섹션별 실시간 문의</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard icon={MessageCircle} label="주차 관리" desc="요금/할인/제재 팩트" onClick={() => handleServiceClick("주차")} />
            <QuickCard icon={Calendar} label="시설 예약" desc="회의실/세미나실 상세" onClick={() => handleServiceClick("시설")} />
            <QuickCard icon={FileText} label="관리비 문의" desc="미납/독촉/내용증명" onClick={() => handleServiceClick("민원")} />
            <QuickCard icon={ShieldQuestion} label="일반 행정" desc="기타 업무 가이드" onClick={() => handleServiceClick("행정")} />
          </div>
        </section>

        {/* Parking Calculator Section */}
        <section id="parking-calculator" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-gray-900">주차 요금 시뮬레이션</h3>
            <span className="text-[10px] font-bold text-royal-blue bg-royal-blue/5 border border-royal-blue/10 px-2 py-1 rounded-md">
              2026 Fact Base
            </span>
          </div>
          <ParkingCalculator />
        </section>
      </div>

      {/* Chatbot Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:p-4 bg-black/20 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white w-full max-w-md h-[80vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            {/* Chat Header */}
            <div className="p-5 bg-gradient-to-r from-royal-blue to-[#7CB9E8] text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-inner">
                  <img src="/images/empire_helper_icon.png" alt="Bot" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight">엠파이어 II 업무도우미</div>
                  <div className="text-[10px] text-white/70 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Verified Facts Mode
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex p-2 bg-gray-50 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('parking')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'parking' ? 'bg-white text-royal-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                주차관리
              </button>
              <button
                onClick={() => setActiveTab('facility')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'facility' ? 'bg-white text-royal-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                시설예약
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'general' ? 'bg-white text-royal-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                일반민원
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FDFBF7]">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-royal-blue rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold p-1">
                  <img src="/images/empire_helper_icon.png" alt="Bot" className="invert brightness-200" />
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed">
                    선택하신 **[{activeTab === 'parking' ? '주차관리' : activeTab === 'facility' ? '시설예약' : '일반민원'}]** 섹션에 대해 팩트 기반의 정보를 안내해 드립니다.
                  </div>
                  <div className="space-y-2">
                    {facts[activeTab].map((fact, idx) => (
                      <div key={idx} className="bg-white/50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 flex gap-2">
                        <span className="text-royal-blue shrink-0">✓</span>
                        {fact}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input Placeholder */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <input
                  type="text"
                  placeholder="질문을 입력해 주세요 (업무 팩트 검색)"
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-600"
                  readOnly
                />
                <button className="bg-royal-blue text-white p-2 rounded-xl opacity-50 cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[9px] text-center text-gray-400 mt-2 font-medium">
                주차 인수인계서 및 관리규약 최신본(2026) 데이터가 적용되어 있습니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB - Chat Trigger */}
      <div className="fixed bottom-8 right-6 z-50 group">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-royal-blue hover:bg-royal-blue-light text-white w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(0,51,102,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative z-10 ring-4 ring-white/50 cursor-pointer overflow-hidden p-2"
        >
          <img src="/images/empire_helper_icon.png" alt="BotIcon" className="w-full h-full object-contain brightness-0 invert" />
        </button>
      </div>
    </main>
  );
}

function QuickCard({ icon: Icon, label, desc, onClick }: { icon: any, label: string, desc: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#7CB9E8]/40 transition-all text-left group relative overflow-hidden w-full cursor-pointer active:scale-[0.98]"
    >
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#7CB9E8]/10 transition-colors relative z-10 transition-all group-hover:scale-110">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-royal-blue transition-colors" />
      </div>
      <div className="relative z-10">
        <div className="font-bold text-gray-800 text-sm group-hover:text-royal-blue transition-colors">{label}</div>
        <div className="text-[10px] text-gray-400 mt-1 font-medium">{desc}</div>
      </div>
    </button>
  )
}
