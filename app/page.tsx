"use client";

import ParkingCalculator from "@/components/ParkingCalculator";
import { MessageCircle, FileText, Calendar, Bell, ShieldQuestion, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const handleServiceClick = (serviceName: string) => {
    alert(`[${serviceName}] 서비스는 준비 중입니다.\n곧 업데이트될 예정입니다!`);
  };

  const handleChatClick = () => {
    alert("🤖 엠파이어 도우미 챗봇\n\n현재 AI 에이전트 연동 작업 중입니다.\n잠시만 기다려 주세요!");
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="max-w-screen-md mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-royal-blue rounded-lg flex items-center justify-center text-white font-black text-xs">DE</div>
            <h1 className="text-royal-blue font-black text-lg tracking-tight">
              DIGITAL EMPIRE II
            </h1>
          </div>
          <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full tracking-wide">
            OFFICIAL HELPER
          </span>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto px-5 pt-6 space-y-10">

        {/* Welcome Section */}
        <section className="space-y-4">
          <div className="bg-gradient-to-br from-royal-blue to-royal-blue-dark text-white p-7 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,51,102,0.4)] relative overflow-hidden group transition-all hover:shadow-[0_15px_50px_-10px_rgba(0,51,102,0.5)]">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-empire-gold/30 rounded-full -ml-10 -mb-10 blur-3xl group-hover:bg-empire-gold/40 transition-all duration-700"></div>

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold mb-3 backdrop-blur-sm border border-white/10">
                지능형 관리 에이전트
              </span>
              <h2 className="text-xl font-bold mb-3 leading-snug">
                안녕하십니까,<br />
                <span className="text-empire-gold-light">엠파이어 도우미</span>입니다.
              </h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-[90%]">
                관리규약에 근거한 정확한 운영 지침을 안내해 드립니다.
                궁금하신 점을 언제든 말씀해 주세요.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Menu Grid */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-gray-900">자주 찾는 서비스</h3>
            <button
              onClick={() => handleServiceClick("전체보기")}
              className="text-xs text-gray-400 flex items-center gap-0.5 hover:text-royal-blue transition-colors"
            >
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard icon={Calendar} label="시설 예약" desc="회의실/세미나실 현황" onClick={() => handleServiceClick("시설 예약")} />
            <QuickCard icon={Bell} label="공지사항" desc="주요 소식 및 의결사항" onClick={() => handleServiceClick("공지사항")} />
            <QuickCard icon={FileText} label="관리규약" desc="2025 최신 규정 열람" onClick={() => handleServiceClick("관리규약")} />
            <QuickCard icon={ShieldQuestion} label="민원 안내" desc="절차 및 문의 접수" onClick={() => handleServiceClick("민원 안내")} />
          </div>
        </section>

        {/* Parking Calculator Section */}
        <section id="parking-calculator" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">주차 요금 시뮬레이션</h3>
            </div>
            <span className="text-[10px] font-bold text-royal-blue bg-royal-blue/5 border border-royal-blue/10 px-2 py-1 rounded-md">
              2026 개정 요금
            </span>
          </div>
          <ParkingCalculator />
          <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
            * 본 조회 결과는 예상 요금이며, 실제 정산 시 차이가 있을 수 있습니다.<br />
            * 정기권 차량은 별도의 요금 정책이 적용됩니다.
          </p>
        </section>

      </div>

      {/* FAB - Chat Trigger */}
      <div className="fixed bottom-8 right-6 z-50 group">
        <button
          onClick={handleChatClick}
          className="bg-royal-blue hover:bg-royal-blue-light text-white w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(0,51,102,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative z-10 ring-4 ring-white/50 cursor-pointer"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-gray-900/90 backdrop-blur text-white text-xs font-medium py-2 px-3 rounded-lg shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none">
          관리규약 기반의 정확한 정보를 안내해 드립니다
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-gray-900/90 rotate-45"></div>
        </div>
      </div>
    </main>
  );
}

function QuickCard({ icon: Icon, label, desc, onClick }: { icon: any, label: string, desc: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-royal-blue/20 transition-all text-left group relative overflow-hidden w-full cursor-pointer active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon className="w-16 h-16 text-royal-blue" />
      </div>
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-royal-blue/10 transition-colors relative z-10">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-royal-blue transition-colors" />
      </div>
      <div className="relative z-10">
        <div className="font-bold text-gray-800 text-sm group-hover:text-royal-blue transition-colors">{label}</div>
        <div className="text-xs text-gray-500 mt-1">{desc}</div>
      </div>
    </button>
  )
}
