"use client";

import ParkingCalculator from "@/components/ParkingCalculator";
import { MessageCircle, FileText, Calendar, Bell, ShieldQuestion, ChevronRight, Mic, Send, Lightbulb, Search, Share2, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import inquiryData from "../data/inquiry-facts.json";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

// BASE_PATH logic: Only apply for GitHub Pages (client-side check)
// On Vercel, the app runs at root, so no basePath is needed.
// On GitHub Pages, the repo name is part of the path.
const getBasePath = () => {
  if (typeof window !== 'undefined') {
    // Client-side check: if hostname includes 'github.io', use repo path
    return window.location.hostname.includes('github.io') ? '/digital-empire-2-managing-system' : '';
  }
  // Server-side fallback (Vercel) - always empty
  return '';
};
const BASE_PATH = getBasePath();

export default function Home() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(inquiryData.tabs[0].id);
  const [selectedInquiry, setSelectedInquiry] = useState<{ title: string; fact: string; detail: string } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedInquiry, activeTab]);

  // TTS Greeting Logic
  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? "en-US" : "ko-KR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      speak(language === 'en'
        ? "How can I help you? I can provide facts about parking, facility reservations, and more."
        : "무엇을 도와드릴까요 고객님? 자주 질문하는 문답, 주차, 시설예약 팩트를 안내해 드립니다.");
    }
  }, [isChatOpen, language]);

  const handleServiceClick = (serviceId: string) => {
    setIsChatOpen(true);
    setSelectedInquiry(null);
    setActiveTab(serviceId);
  };

  const getInquiriesForTab = (tabId: string) => {
    return (inquiryData.inquiries as any)[tabId] || [];
  };

  // Voice Recognition (STT) Logic
  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? "en-US" : "ko-KR";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

  // Smart Search Logic
  const handleSearch = (query: string = inputValue) => {
    if (!query.trim()) return;

    const cleanQuery = query.replace(/\s+/g, "");

    // 0. Redirect to Application Form
    if (cleanQuery.includes("신청") || cleanQuery.includes("신청서") || cleanQuery.includes("예약") || cleanQuery.toLowerCase().includes("apply")) {
      router.push(`/apply?subject=${encodeURIComponent(query)}`);
      return;
    }

    const allInquiries = Object.values(inquiryData.inquiries).flat() as any[];

    // 1. Direct Match
    let match = allInquiries.find(item =>
      cleanQuery.includes(item.title.replace(/\s+/g, "")) ||
      item.title.replace(/\s+/g, "").includes(cleanQuery) ||
      item.fact.includes(query)
    );

    // 2. Keyword Mapping (Smart Fallback)
    if (!match) {
      const keywordMap: { [key: string]: string } = {
        "이사": "화물",
        "엘리베이터": "화물",
        "짐": "화물",
        "택배": "우편",
        "편지": "우편",
        "밥": "구내식당",
        "식사": "구내식당",
        "점심": "구내식당",
        "관리비": "관리비",
        "주차": "주차",
        "요금": "요금",
        "예약": "예약",
        "전기차": "전기차",
        "충전": "전기차",
        "moving": "freight",
        "elevator": "freight",
        "mail": "postal",
        "parking": "parking",
        "charge": "electric",
      };

      for (const [key, target] of Object.entries(keywordMap)) {
        if (cleanQuery.includes(key)) {
          match = allInquiries.find(item => item.title.includes(target) || item.fact.includes(target));
          if (match) break;
        }
      }
    }

    if (match) {
      // Auto-switch tab if needed
      const foundTab = Object.keys(inquiryData.inquiries).find(key =>
        (inquiryData.inquiries as any)[key].includes(match)
      );
      if (foundTab && foundTab !== activeTab) setActiveTab(foundTab);

      setSelectedInquiry(match);
      speak(`${match.title} ${language === 'en' ? 'Fact' : '에 대한 팩트입니다.'} ${match.fact}`);
    } else {
      speak(language === 'en'
        ? "Sorry, I couldn't find the exact fact. Please contact the management office."
        : "죄송합니다. 정확한 팩트를 찾지 못했습니다. 관리사무소로 문의해 주세요.");
    }
    setInputValue("");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 font-sans selection:bg-royal-blue/10 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-screen-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Official Logo */}
            <div className="h-10 sm:h-20 rounded-lg overflow-hidden flex items-center">
              <img src={`${BASE_PATH}/images/company_logo_final.png`} alt="Digital Empire II" className="h-full w-auto object-contain dark:invert dark:brightness-200" />
            </div>
            <h1 className="sr-only">DIGITAL EMPIRE II</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            {/* Admin Link (Hidden on mobile usually, but kept for demo) */}
            <Link href="/admin/login" className="text-xs font-bold text-gray-500 hover:text-royal-blue ml-2 dark:text-gray-400">
              {t('admin')}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto px-5 pt-8 space-y-12">
        {/* Welcome Section */}
        <section className="space-y-6">
          <div className="bg-gradient-to-br from-[#7CB9E8] via-royal-blue to-[#002855] text-white p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,51,102,0.5)] relative overflow-hidden group transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-6">
                <div className="relative w-48 h-48 bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center p-2 backdrop-blur-md border border-white/20 group-hover:rotate-6 transition-transform duration-500">
                  <img src={`${BASE_PATH}/images/office_worker_real_v2.png`} alt="Empire Helper" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-black backdrop-blur-md border border-white/10 uppercase tracking-widest shadow-sm">
                      Verifier Mode Active
                    </span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-tight break-keep">
                    Digital Empire II<br />
                    Business Helper
                  </h2>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-w-[90%] font-medium pl-1">
                "{language === 'en' ? "Ask anything, we answer with facts." : "무엇이든 물어보세요, 팩트로 답해드립니다."}"<br />
                <span className="text-xs opacity-70 mt-1 block">
                  {language === 'en' ? "Based on 2026 Management Regulations (Parking, Facilities)" : "주차 규정부터 시설 예약까지, 2026년 최신 관리규약 기반"}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Quick Access */}
        <section>
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-empire-gold fill-empire-gold" />
              {language === 'en' ? "FAQ" : "자주 질문하는 문답"}
            </h3>
            <span className="text-xs text-royal-blue font-bold cursor-pointer hover:underline" onClick={() => handleServiceClick('popular')}>{language === 'en' ? "View All" : "전체보기"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inquiryData.tabs.map((tab) => (
              <QuickCard
                key={tab.id}
                icon={tab.id === 'popular' ? ShieldQuestion : tab.id === 'parking' ? MessageCircle : tab.id === 'facility' ? Calendar : FileText}
                label={`${tab.label.replace('🔥 ', '')} (${getInquiriesForTab(tab.id).length})`}
                desc={tab.id === 'popular' ? (language === 'en' ? 'Top Questions' : '조회수 TOP 질문 모음') : (language === 'en' ? 'Fact Check' : `${tab.label.replace('🚗 ', '').replace('🏢 ', '').replace('📢 ', '')} 규정 팩트 확인`)}
                onClick={() => handleServiceClick(tab.id)}
                highlight={tab.id === 'popular'}
              />
            ))}
          </div>
        </section>

        {/* Parking Calculator */}
        <section id="parking-calculator" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">{language === 'en' ? "Parking Fee Simulation" : "주차 요금 시뮬레이션"}</h3>
            <span className="text-[10px] font-black text-royal-blue bg-royal-blue/5 border border-royal-blue/10 px-3 py-1 rounded-full">
              2026 Updated
            </span>
          </div>
          <ParkingCalculator />
        </section>
      </div>

      {/* Chatbot Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[500px] h-[85vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-500 relative">

            {/* Chat Header */}
            <div className="p-6 bg-gradient-to-r from-royal-blue to-[#5B9BD5] text-white flex items-center justify-between shadow-lg z-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative w-12 h-12 bg-white/20 rounded-2xl p-1 shadow-inner backdrop-blur-md border border-white/30">
                  <img src={`${BASE_PATH}/images/office_worker_real_v2.png`} alt="Bot" className="w-full h-full object-contain drop-shadow" />
                  <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                    <span className="text-[4px] font-black text-white animate-pulse tracking-tighter drop-shadow-[0_0_3px_rgba(255,255,255,0.9)] whitespace-nowrap block leading-tight">
                      Digital<br />Empire II
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight drop-shadow-sm">{language === 'en' ? "AI Helper" : "업무도우미 AI"}</div>
                  <div className="text-[11px] text-white/80 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 ${isListening ? 'bg-red-400 animate-ping' : 'bg-green-400'} rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]`}></span>
                    {isListening ? (language === 'en' ? "Listening..." : '음성 듣는 중...') : 'Fact Engine Ready'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>

            {/* Smart Tabs - Scrollable */}
            {!selectedInquiry && (
              <div className="flex px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar gap-2 sticky top-0 z-10 shadow-sm">
                {inquiryData.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-4 py-2.5 text-xs font-black rounded-2xl transition-all cursor-pointer border ${activeTab === tab.id ? 'bg-royal-blue text-white border-royal-blue shadow-lg shadow-royal-blue/20 transform scale-105' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {tab.label} <span className="opacity-80 font-normal ml-0.5">({getInquiriesForTab(tab.id).length})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC] dark:bg-gray-900">
              {selectedInquiry ? (
                <div className="animate-in slide-in-from-right-10 duration-500">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="group mb-6 py-2 px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-full text-xs font-black text-gray-600 dark:text-gray-300 hover:text-royal-blue hover:border-royal-blue transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> {language === 'en' ? "Back to List" : "목록으로 돌아가기"}
                  </button>

                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-royal-blue/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-royal-blue/10 text-royal-blue text-[10px] font-black rounded-md uppercase tracking-wide">Fact Check</span>
                        <span className="text-gray-300 text-[10px]">|</span>
                        <span className="text-gray-400 text-[10px] font-bold">2026 Admin Rules</span>
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-snug mb-6">{selectedInquiry.title}</h4>

                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-3xl border border-gray-100 dark:border-gray-600 mb-4">
                        <div className="text-xs font-black text-royal-blue mb-2 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-royal-blue rounded-full"></div> {language === 'en' ? "Key Fact" : "핵심 팩트"}
                        </div>
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-relaxed word-break-keep-all">
                          {selectedInquiry.fact}
                        </div>
                      </div>

                      <div className="pl-2 border-l-4 border-gray-100 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-loose font-medium">
                          {selectedInquiry.detail}
                        </p>
                      </div>

                      {/* Application Button (Conditional) */}
                      {(selectedInquiry.title.includes("신청") || selectedInquiry.title.includes("예약") || selectedInquiry.fact.includes("신청") || selectedInquiry.detail.includes("신청") || selectedInquiry.detail.includes("예약")) && (
                        <Link
                          href={`/apply?subject=${encodeURIComponent(selectedInquiry.title)}`}
                          className="mt-6 w-full py-4 bg-gradient-to-r from-royal-blue to-[#5B9BD5] text-white rounded-2xl font-black shadow-lg shadow-royal-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <FileText className="w-5 h-5" />
                          {t('apply')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Intro Message */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal-blue to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
                      <img src={`${BASE_PATH}/images/office_worker_real_v2.png`} alt="Bot" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 max-w-[85%]">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-bold">
                        <span className="text-royal-blue">[{inquiryData.tabs.find(t => t.id === activeTab)?.label}]</span> {language === 'en' ? "Any questions? Select from the list or ask via voice!" : "관련해서 궁금한 점이 있으신가요? 아래 리스트를 선택하시거나 음성으로 물어보세요!"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {getInquiriesForTab(activeTab).map((item: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedInquiry(item); speak(item.fact); }}
                        className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 text-left hover:border-royal-blue/30 hover:shadow-xl hover:shadow-royal-blue/5 transition-all group flex justify-between items-center cursor-pointer active:scale-[0.98]"
                      >
                        <div className="flex-1 pr-4">
                          <div className="text-sm font-black text-gray-800 dark:text-gray-200 group-hover:text-royal-blue transition-colors mb-1.5">{item.title}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-1 bg-slate-50 dark:bg-slate-800 inline-block px-2 py-0.5 rounded-lg">{item.fact}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 group-hover:bg-royal-blue text-gray-300 group-hover:text-white flex items-center justify-center transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 p-2.5 rounded-[1.2rem] border border-slate-100 dark:border-slate-600 focus-within:border-royal-blue focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-xl focus-within:shadow-royal-blue/10 transition-all">
                <button
                  onClick={startListening}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-white dark:bg-gray-600 text-slate-400 border border-slate-100 dark:border-slate-500 hover:border-royal-blue hover:text-royal-blue'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={language === 'en' ? "Ask a question..." : "질문을 입력하세요..."}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 px-2"
                />
                <button
                  onClick={() => handleSearch()}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${inputValue.trim() ? 'bg-royal-blue text-white shadow-lg shadow-royal-blue/30 scale-105' : 'bg-slate-200 dark:bg-slate-600 text-white cursor-not-allowed'}`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-8 right-6 z-50 group">
        <div className="absolute -inset-2 bg-royal-blue/30 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-70 animate-pulse"></div>
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-gradient-to-b from-royal-blue to-[#002855] text-white w-16 h-16 rounded-3xl shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative z-10 ring-4 ring-white/40 cursor-pointer overflow-hidden p-3"
        >
          <img src={`${BASE_PATH}/images/office_worker_real_v2.png`} alt="BotIcon" className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>
    </main>
  );
}

function QuickCard({ icon: Icon, label, desc, onClick, highlight }: { icon: any, label: string, desc: string, onClick: () => void, highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-[1.5rem] border transition-all text-left group relative overflow-hidden w-full cursor-pointer active:scale-[0.98] ${highlight ? 'bg-royal-blue text-white border-royal-blue shadow-xl shadow-royal-blue/25' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-100 dark:border-gray-700 shadow-sm hover:border-royal-blue/30 hover:shadow-lg'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 ${highlight ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-700 group-hover:bg-royal-blue/5'}`}>
        <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-royal-blue transition-colors'}`} />
      </div>
      <div className="relative z-10 w-full">
        <div className={`font-black text-sm mb-1 break-keep leading-snug ${highlight ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{label}</div>
        <div className={`text-[11px] font-bold break-keep leading-snug ${highlight ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>{desc}</div>
      </div>
      {!highlight && <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 text-slate-200 group-hover:text-royal-blue group-hover:translate-x-1 transition-all" />}
    </button>
  );
}
