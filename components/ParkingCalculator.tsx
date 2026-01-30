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
        <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100/50 p-6 w-full max-w-lg mx-auto transition-all hover:shadow-lg">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-royal-blue/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-royal-blue" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">주차 요금 예상 조회</h2>
            </div>

            <div className="space-y-6">
                {/* Time Inputs */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" /> 주차 시간 설정
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-xs text-gray-500 mb-1 block">입차 시간</span>
                            <input
                                type="datetime-local"
                                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue"
                                value={entryTime}
                                onChange={(e) => setEntryTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 mb-1 block">출차 시간</span>
                            <input
                                type="datetime-local"
                                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue"
                                value={exitTime}
                                onChange={(e) => setExitTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Discount Tickets */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-gray-400" /> 할인권 적용
                        <span className="text-xs font-normal text-gray-400 ml-auto">※ 일일권 중복 불가</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {/* 30 Min */}
                        <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-xs font-medium text-gray-600 mb-2">30분권</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateTicket('acc30min', -1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded shadow-sm text-gray-600 hover:bg-gray-100">-</button>
                                <span className="text-sm font-bold w-4 text-center">{tickets.acc30min}</span>
                                <button onClick={() => updateTicket('acc30min', 1)} className="w-6 h-6 flex items-center justify-center bg-royal-blue text-white rounded shadow-sm hover:bg-royal-blue-light">+</button>
                            </div>
                        </div>
                        {/* 1 Hour */}
                        <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-xs font-medium text-gray-600 mb-2">1시간권</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateTicket('acc1hour', -1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded shadow-sm text-gray-600 hover:bg-gray-100">-</button>
                                <span className="text-sm font-bold w-4 text-center">{tickets.acc1hour}</span>
                                <button onClick={() => updateTicket('acc1hour', 1)} className="w-6 h-6 flex items-center justify-center bg-royal-blue text-white rounded shadow-sm hover:bg-royal-blue-light">+</button>
                            </div>
                        </div>
                        {/* 1 Day */}
                        <div className="flex flex-col items-center bg-empire-gold/10 p-2 rounded-lg border border-empire-gold/20">
                            <span className="text-xs font-bold text-empire-gold-dark mb-2">1일권</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateTicket('acc1day', -1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded shadow-sm text-gray-600 hover:bg-gray-100">-</button>
                                <span className="text-sm font-bold w-4 text-center">{tickets.acc1day}</span>
                                <button onClick={() => updateTicket('acc1day', 1)} className="w-6 h-6 flex items-center justify-center bg-empire-gold text-white rounded shadow-sm hover:bg-empire-gold-light">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleCalculate}
                    className="w-full py-3 bg-royal-blue text-white font-bold rounded-xl shadow-md hover:bg-royal-blue-light active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    요금 조회하기
                </button>

                {/* Receipt Result Display */}
                {result && (
                    <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2">
                        {/* Receipt Header Pattern */}
                        <div className="h-1.5 bg-royal-blue/80 w-full" />

                        <div className="p-5 space-y-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-royal-blue" />
                                    영수증 결과
                                </span>
                                <span className="text-xs font-normal text-gray-400 font-mono">
                                    {today}
                                </span>
                            </h3>

                            {/* Applied Discounts */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-gray-500 shrink-0">적용 할인권</span>
                                    {result.receipt.applied.length > 0 ? (
                                        <div className="text-right">
                                            {result.receipt.applied.map((item, i) => (
                                                <div key={i} className="text-gray-900 font-medium">{item}</div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                            </div>

                            {/* Unapplied / Excluded Warning */}
                            {result.receipt.unapplied.length > 0 && (
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-orange-700 font-bold text-xs">⚠️ 미적용(중복불가)</span>
                                    </div>
                                    <div className="space-y-1">
                                        {result.receipt.unapplied.map((item, i) => (
                                            <div key={i} className="text-orange-800 text-xs flex items-start gap-1">
                                                <span>-</span>
                                                <span className="break-keep">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

                            {/* Final Total */}
                            <div className="flex justify-between items-end">
                                <span className="text-gray-600 font-bold pb-1">최종 결제액</span>
                                <span className="text-2xl font-black text-royal-blue tracking-tight font-mono">
                                    {result.receipt.finalFee.toLocaleString()}
                                    <span className="text-sm font-bold text-gray-500 ml-1 font-sans">원</span>
                                </span>
                            </div>
                        </div>

                        {/* Detailed Breakdown Toggle (Accordion style) */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 mb-2">상세 계산 내역</p>
                            <div className="space-y-1.5">
                                {result.breakdown.map((line, idx) => (
                                    <p key={idx} className={`text-xs flex items-start gap-2 ${line.startsWith("※") ? "text-orange-600 mt-1" : "text-gray-500"}`}>
                                        {line.startsWith("※") ? "" : <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0"></span>}
                                        {line}
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
