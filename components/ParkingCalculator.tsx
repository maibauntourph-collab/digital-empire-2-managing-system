"use client";

import { useState, useEffect } from "react";
import { calculateParkingFee } from "@/lib/parking-logic";
import { Calculator, Ticket, Clock, CheckCircle2, Printer, Share2, Download, Copy, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";

export default function ParkingCalculator() {
    const [today, setToday] = useState("");
    const [entryTime, setEntryTime] = useState("");
    const [exitTime, setExitTime] = useState("");
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

        const res = calculateParkingFee(entry, exit); // No tickets passed
        setResult(res);
    };

    const handlePrint = async () => {
        if (result) {
            try {
                // Save receipt to DB on print (Issue)
                const res = await fetch("/api/receipts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        issueDate: new Date().toISOString(),
                        merchantName: "Digital Empire II",
                        amount: result.receipt.finalFee,
                        items: ["Parking Fee", ...result.receipt.applied],
                        approvalNo: Math.floor(10000000 + Math.random() * 90000000).toString(),
                        cardName: "Credit Card", // Placeholder as we don't take real payment
                        cardNum: "****-****-****-1234"
                    })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || `Server Error ${res.status}`);
                }
            } catch (error: any) {
                console.error("Failed to save receipt:", error);
                alert(`⚠️ [영수증 저장 실패] 영수증 출력은 가능하지만, DB 저장은 실패했습니다.\n사유: ${error.message}`);
            }
        }
        window.print();
    };

    const handleCopyText = () => {
        if (!result) return;

        const receiptText = `
[Digital Empire II 주차 영수증]
📅 일자: ${today}
⏱️ 총 주차: ${result.totalDuration}
------------------------
🎫 할인권 적용
${result.receipt.applied.length > 0 ? result.receipt.applied.join('\n') : '(없음)'}
------------------------
💰 최종 요금: ${result.receipt.finalFee.toLocaleString()}원
------------------------
*본 영수증은 모의 계산 결과입니다.
`.trim();

        if (navigator.clipboard) {
            navigator.clipboard.writeText(receiptText).then(() => {
                alert("영수증 내용이 복사되었습니다!");
            });
        } else {
            alert("클립보드 복사를 지원하지 않는 브라우저입니다.");
        }
    };

    const handleShareImage = async () => {
        const element = document.getElementById('receipt-card');
        if (!element) return;

        try {
            // Added useCORS and backgroundColor to ensure better capture
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff', // Force white background for image
                logging: false
            });

            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

            if (!blob) {
                throw new Error("Blob creation failed");
            }

            const file = new File([blob], "digital-empire-parking-receipt.png", { type: "image/png" });

            // Web Share API (Mobile/SNS)
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Digital Empire II 주차 영수증',
                        text: '주차 요금 모의 계산 결과입니다.',
                        files: [file]
                    });
                } catch (err) {
                    if ((err as Error).name !== 'AbortError') {
                        console.error("Share failed", err);
                        // Fallback to download if share fails (but not if cancelled)
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'digital-empire-parking-receipt.png';
                        link.click();
                    }
                }
            } else {
                // Fallback: Download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'digital-empire-parking-receipt.png';
                link.click();
                alert("이미지가 다운로드되었습니다.");
            }
        } catch (error) {
            console.error("Image capture error:", error);
            alert("이미지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n" + (error instanceof Error ? error.message : ""));
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-4 border-royal-blue/10 p-8 w-full max-w-lg mx-auto transition-transform hover:scale-[1.01] duration-300 print:shadow-none print:border-none print:p-0">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-dashed border-gray-100 print:hidden">
                <div className="p-3 bg-royal-blue/20 rounded-2xl text-royal-blue animate-bounce">
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">주차 요금 계산기</h2>
                    <p className="text-xs font-medium text-gray-400">Digital Empire II Helper</p>
                </div>
            </div>

            <div className="space-y-8 print:space-y-4">
                {/* Time Inputs - Hide in Print */}
                <div className="space-y-4 print:hidden">
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

                {/* Discount Tickets Info - Hide in Print */}
                <div className="space-y-4 print:hidden">
                    <label className="text-base font-bold text-gray-700 flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl w-fit pr-4">
                        <Ticket className="w-5 h-5 text-royal-blue" /> 할인권 자동 적용
                        <span className="text-xs font-bold text-white bg-royal-blue px-2 py-0.5 rounded-full shadow-sm animate-pulse ml-2">Smart Auto</span>
                    </label>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-sm text-gray-600 space-y-2">
                        <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-royal-blue"></span>
                            <span>입출차 시간을 입력하시면 <strong>가장 저렴한 요금</strong>이 자동 계산됩니다.</span>
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-400">
                            (일일권 10,000원, 시간권 1,000원 조합 최적화 & 30분 무료)
                        </p>
                    </div>
                </div>

                {/* Action Button - Hide in Print */}
                <button
                    onClick={handleCalculate}
                    className="w-full py-4 bg-royal-blue text-white text-lg font-black rounded-2xl shadow-lg shadow-royal-blue/20 hover:shadow-xl hover:shadow-royal-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 group print:hidden"
                >
                    <CheckCircle2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    최적 요금 확인하기
                </button>

                {/* Receipt Result Display */}
                {result && (
                    <div id="receipt-outer-container" className="relative overflow-hidden bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-gray-200/80 animate-in fade-in slide-in-from-bottom-4 duration-500 print:border-black print:bg-white">
                        {/* Receipt Top Decoration - Fixed Gradient for capture safety */}
                        <div
                            className="absolute top-0 left-0 w-full h-2 print:hidden"
                            style={{ background: 'linear-gradient(90deg, rgba(124,185,232,0.3) 0%, rgba(124,185,232,0.1) 50%, transparent 100%)' }}
                        />

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4 border-dashed relative">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                        🧾 영수증
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 ml-1">DIGITAL EMPIRE II</p>
                                </div>

                                {/* Print Button - Centered */}
                                <button onClick={handlePrint} className="absolute left-1/2 -translate-x-1/2 p-2 text-gray-400 hover:text-royal-blue bg-gray-100 hover:bg-royal-blue/10 rounded-full transition-colors print:hidden" title="출력하기">
                                    <Printer className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                        {today}
                                    </span>
                                </div>
                            </div>

                            {/* Applied Discounts */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-gray-500 font-medium shrink-0 flex items-center gap-1">✨ 자동 할인 적용</span>
                                    {result.receipt.applied.length > 0 ? (
                                        <div className="text-right space-y-1">
                                            {result.receipt.applied.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="text-royal-blue font-bold text-xs px-2 py-1 rounded-lg inline-block ml-1 mb-1 border print:bg-white print:border-black print:text-black"
                                                    style={{ backgroundColor: 'rgba(124,185,232,0.05)', borderColor: 'rgba(124,185,232,0.1)' }}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300">없음</span>
                                    )}
                                </div>
                            </div>

                            {/* Unapplied / Excluded Warning - Fixed colors for capture safety */}
                            {result.receipt.unapplied.length > 0 && (
                                <div
                                    className="p-4 rounded-2xl border text-sm print:hidden"
                                    style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span
                                            className="font-bold text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}
                                        >
                                            ⚠️ 주의
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {result.receipt.unapplied.map((item, i) => (
                                            <div key={i} className="text-gray-600 text-xs flex items-start gap-1.5 pl-1">
                                                <span className="font-bold" style={{ color: '#fb923c' }}>·</span>
                                                <span className="break-keep leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t-2 border-dashed border-gray-200 my-2 relative print:border-black">
                                <div className="absolute -left-8 -top-3 w-6 h-6 bg-white rounded-full print:hidden"></div>
                                <div className="absolute -right-8 -top-3 w-6 h-6 bg-white rounded-full print:hidden"></div>
                            </div>

                            {/* Final Total */}
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-gray-500 font-bold pb-1 text-sm">총 결제 금액</span>
                                <span className="text-3xl font-black text-royal-blue tracking-tighter print:text-black">
                                    {result.receipt.finalFee.toLocaleString()}
                                    <span className="text-base font-bold text-gray-400 ml-1 align-middle print:text-black">원</span>
                                </span>
                            </div>

                            {/* Share Buttons - Hide in Print, Improve HTML2Canvas ignore */}
                            <div className="grid grid-cols-2 gap-2 mt-4 print:hidden" data-html2canvas-ignore="true">
                                <button
                                    onClick={handleShareImage}
                                    className="py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200 text-center leading-tight"
                                >
                                    <ImageIcon className="w-4 h-4 shrink-0" />
                                    <span>SNS/이미지<br />공유</span>
                                </button>
                                <button
                                    onClick={handleCopyText}
                                    className="py-3 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Copy className="w-4 h-4" /> 텍스트 복사
                                </button>
                            </div>
                        </div>

                        {/* Receipt Template (Credit Card Style) */}
                        <div
                            id="receipt-card"
                            className="p-8 border-t border-gray-100 bg-white print:border-none print:p-0 font-mono text-sm leading-relaxed text-gray-800"
                        >
                            {/* Receipt Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black mb-1">[신용카드(승인)전표]</h3>
                                <p className="text-xs text-gray-500">고객용 (담당자 보관)</p>
                            </div>

                            {/* Merchant Info */}
                            <div className="space-y-1 mb-4 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">가맹점명</span>
                                    <span className="font-bold">디지털엠파이어 II</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">사업자번호</span>
                                    <span>123-45-67890</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">대표자명</span>
                                    <span>홍길동</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">전화번호</span>
                                    <span>031-123-4567</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">주소</span>
                                    <span className="text-right">경기도 수원시 영통구<br />신원로 88</span>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                            {/* Transaction Info */}
                            <div className="space-y-1 mb-4 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">카드종류</span>
                                    <span>국민카드</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">카드번호</span>
                                    <span>****-****-****-1234</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">승인번호</span>
                                    <span>{Math.floor(10000000 + Math.random() * 90000000)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">거래일시</span>
                                    <span>{new Date().toLocaleString('ko-KR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">할부개월</span>
                                    <span>일시불</span>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                            {/* Amount Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">공급가액</span>
                                    <span>{Math.round(result.receipt.finalFee / 1.1).toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">부가세</span>
                                    <span>{(result.receipt.finalFee - Math.round(result.receipt.finalFee / 1.1)).toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-dotted border-gray-300">
                                    <span className="font-bold text-base">합계금액</span>
                                    <span className="font-black text-xl text-royal-blue print:text-black">
                                        {result.receipt.finalFee.toLocaleString()} <span className="text-sm font-normal text-gray-500">원</span>
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-800">
                                <div className="flex justify-between items-end mb-8">
                                    <span className="font-bold">서명 Sales Sign</span>
                                    <span className="text-xs text-gray-400 border-b border-gray-300 w-32 h-6 block text-center">(인)</span>
                                </div>
                                <div className="text-center text-[10px] text-gray-400">
                                    <p>이용해주셔서 감사합니다.</p>
                                    <p>Thank you.</p>
                                </div>
                            </div>

                            {/* Print Button (Internal, visible on screen) */}
                            <button
                                onClick={handlePrint}
                                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl print:hidden active:scale-[0.98]"
                            >
                                <Printer className="w-5 h-5" />
                                영수증 출력
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
