"use client";

import { useState, useEffect } from "react";
import { calculateParkingFee, ParkingTicketSelection } from "@/lib/parking-logic";
import { Calculator, Ticket, Clock, CheckCircle2 } from "lucide-react";

export default function ParkingCalculator() {
    const [today, setToday] = useState("");
    const [entryTime, setEntryTime] = useState("");
    const [exitTime, setExitTime] = useState("");
    const [tickets, setTickets] = useState<ParkingTicketSelection>({
        acc30min: 0,
        acc1hour: 0,
        acc1day: 0,
    });
    const [result, setResult] = useState<ReturnType<typeof calculateParkingFee> | null>(null);

    useEffect(() => {
        setToday(new Date().toLocaleDateString());
    }, []);

    const handleCalculate = () => {
        if (!entryTime || !exitTime) {
            alert("입차 시간과 출차 시간을 모두 입력해주세요.");
            return;
        }
        const entry = new Date(entryTime);
        const exit = new Date(exitTime);

        if (entry > exit) {
            alert("출차 시간이 입차 시간보다 빠를 수 없습니다.");
            return;
        }

        const res = calculateParkingFee(entry, exit, tickets);
        setResult(res);
    };

    const updateTicket = (type: keyof ParkingTicketSelection, change: number) => {
        setTickets(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + change)
        }));
    };

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-4 border-royal-blue/10 p-8 w-full max-w-lg mx-auto transition-transform hover:scale-[1.01] duration-300">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-dashed border-gray-100">
                <div className="p-3 bg-royal-blue/20 rounded-2xl text-royal-blue animate-bounce">
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">주차 요금 계산기</h2>
                    <p className="text-xs font-medium text-gray-400">Digital Empire II Helper</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Time Inputs */}
                <div className="space-y-4">
                    <label className="text-base font-bold text-gray-700 flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl w-fit pr-4">
                        <Clock className="w-5 h-5 text-royal-blue" /> 주차 시간
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <span className="text-xs font-bold text-gray-500 mb-1.5 block ml-1">들어온 시간 🚗</span>
                            <input
                                type="datetime-local"
                                className="w-full text-sm p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-600 font-medium"
                                value={entryTime}
                                onChange={(e) => setEntryTime(e.target.value)}
                            />
                        </div>
                        <div className="group">
                            <span className="text-xs font-bold text-gray-500 mb-1.5 block ml-1">나가는 시간 🏃</span>
                            <input
                                type="datetime-local"
                                className="w-full text-sm p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-600 font-medium"
                                value={exitTime}
                                onChange={(e) => setExitTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Discount Tickets */}
                <div className="space-y-4">
                    <label className="text-base font-bold text-gray-700 flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl w-fit pr-4">
                        <Ticket className="w-5 h-5 text-royal-blue" /> 할인권
                        <span className="text-xs font-medium text-gray-400 ml-auto bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">최대 3장까지</span>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 1 Hour */}
                        <div className="flex flex-col items-center bg-royal-blue/5 p-4 rounded-3xl border-2 border-royal-blue/10 hover:border-royal-blue/30 transition-colors">
                            <span className="text-sm font-bold text-gray-600 mb-3">1시간권 🎫</span>
                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                                <button onClick={() => updateTicket('acc1hour', -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors font-bold text-lg pb-1">-</button>
                                <span className="text-xl font-black w-8 text-center text-royal-blue">{tickets.acc1hour}</span>
                                <button onClick={() => updateTicket('acc1hour', 1)} className="w-8 h-8 flex items-center justify-center bg-royal-blue text-white rounded-full hover:bg-royal-blue-light transition-colors font-bold text-lg pb-1 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">+</button>
                            </div>
                        </div>
                        {/* 1 Day */}
                        <div className="flex flex-col items-center bg-empire-gold/10 p-4 rounded-3xl border-2 border-empire-gold/20 hover:border-empire-gold/40 transition-colors">
                            <span className="text-sm font-bold text-gray-600 mb-3">1일권 🌟</span>
                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                                <button onClick={() => updateTicket('acc1day', -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors font-bold text-lg pb-1">-</button>
                                <span className="text-xl font-black w-8 text-center text-empire-gold">{tickets.acc1day}</span>
                                <button onClick={() => updateTicket('acc1day', 1)} className="w-8 h-8 flex items-center justify-center bg-empire-gold text-white rounded-full hover:bg-empire-gold-light transition-colors font-bold text-lg pb-1 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleCalculate}
                    className="w-full py-4 bg-royal-blue text-white text-lg font-black rounded-2xl shadow-lg shadow-royal-blue/20 hover:shadow-xl hover:shadow-royal-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 group"
                >
                    <CheckCircle2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    요금 확인하기
                </button>

                {/* Receipt Result Display */}
                {result && (
                    <div className="relative overflow-hidden bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-gray-200/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Receipt Top Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-royal-blue/30 via-royal-blue/10 to-transparent" />

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4 border-dashed">
                                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                    🧾 영수증
                                </h3>
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                    {today}
                                </span>
                            </div>

                            {/* Applied Discounts */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-gray-500 font-medium shrink-0 flex items-center gap-1">✨ 적용된 할인</span>
                                    {result.receipt.applied.length > 0 ? (
                                        <div className="text-right space-y-1">
                                            {result.receipt.applied.map((item, i) => (
                                                <div key={i} className="text-royal-blue font-bold text-xs bg-royal-blue/5 px-2 py-1 rounded-lg inline-block ml-1 mb-1 border border-royal-blue/10">
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                            </div>

                            {/* Unapplied / Excluded Warning */}
                            {result.receipt.unapplied.length > 0 && (
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-orange-600 font-bold text-xs bg-orange-100 px-2 py-0.5 rounded-full">⚠️ 주의</span>
                                    </div>
                                    <div className="space-y-1">
                                        {result.receipt.unapplied.map((item, i) => (
                                            <div key={i} className="text-gray-600 text-xs flex items-start gap-1.5 pl-1">
                                                <span className="text-orange-400 font-bold">·</span>
                                                <span className="break-keep leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t-2 border-dashed border-gray-200 my-2 relative">
                                <div className="absolute -left-8 -top-3 w-6 h-6 bg-white rounded-full"></div>
                                <div className="absolute -right-8 -top-3 w-6 h-6 bg-white rounded-full"></div>
                            </div>

                            {/* Final Total */}
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-gray-500 font-bold pb-1 text-sm">총 결제 금액</span>
                                <span className="text-3xl font-black text-royal-blue tracking-tighter">
                                    {result.receipt.finalFee.toLocaleString()}
                                    <span className="text-base font-bold text-gray-400 ml-1 align-middle">원</span>
                                </span>
                            </div>
                        </div>

                        {/* Detailed Breakdown Toggle (Accordion style) */}
                        <div className="bg-gray-50/50 p-5 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1">
                                <span className="w-1 h-4 bg-gray-200 rounded-full"></span>
                                상세 내역
                            </p>
                            <div className="space-y-2">
                                {result.breakdown.map((line, idx) => (
                                    <p key={idx} className={`text-xs flex items-start gap-2 ${line.startsWith("※") ? "text-orange-500 font-medium" : "text-gray-500"}`}>
                                        {line.startsWith("※") ? "📢" : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0 opacity-50"></span>}
                                        <span className="leading-relaxed">{line}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
