"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Send, MessageSquare, Mail, User, Building, Phone as PhoneIcon, FileText } from "lucide-react";
import Link from "next/link";

function ApplyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        phone: "",
        content: ""
    });

    useEffect(() => {
        const subject = searchParams.get("subject");
        if (subject) {
            setFormData(prev => ({ ...prev, content: `[신청] ${subject} 관련 신청합니다.` }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const MANAGER_EMAIL = "jitnet57@gmail.com";
    const MANAGER_PHONE = "+8210360087000";

    const getMessageBody = () => {
        return `
[디지털엠파이어 II 민원/신청서]

1. 회사명: ${formData.company}
2. 성함: ${formData.name}
3. 연락처: ${formData.phone}

4. 신청 내용:
${formData.content}
    `.trim();
    };

    const handleEmailSubmit = () => {
        if (!formData.name || !formData.company || !formData.phone || !formData.content) {
            alert("모든 항목을 입력해 주세요.");
            return;
        }

        const subject = `[신청서] ${formData.company} - ${formData.name}`;
        const body = encodeURIComponent(getMessageBody());
        window.location.href = `mailto:${MANAGER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
    };

    const handleSmsSubmit = () => {
        if (!formData.name || !formData.company || !formData.phone || !formData.content) {
            alert("모든 항목을 입력해 주세요.");
            return;
        }

        const body = encodeURIComponent(getMessageBody());
        // Use sms: scheme. Note: behavior varies by OS (iOS vs Android separator & body param)
        // Common fallback is usually &body= or ?body=
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

        const separator = isIOS ? "&" : "?";
        window.location.href = `sms:${MANAGER_PHONE}${separator}body=${body}`;
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-royal-blue/10">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 h-16 flex items-center px-5 shadow-sm">
                <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-lg font-black text-gray-800">온라인 신청서 작성</h1>
            </header>

            <div className="flex-1 max-w-screen-md mx-auto w-full p-6 space-y-8">

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-800 mb-2">신청 정보 입력</h2>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        작성하신 내용은 관리사무소 담당자에게 직접 전송됩니다.<br />
                        이메일 또는 문자 중 편하신 방법으로 발송해 주세요.
                    </p>

                    <div className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> 성함
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="홍길동"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-800 font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Company */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" /> 회사명 (호수)
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="(주)디지털엠파이어 / 1004호"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-800 font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
                                <PhoneIcon className="w-3.5 h-3.5" /> 연락처
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="010-1234-5678"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-800 font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> 신청 내용
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="신청하실 내용을 자세히 적어주세요."
                                className="w-full p-4 h-40 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-800 font-medium resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={handleSmsSubmit}
                        className="p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-black hover:border-gray-400 hover:text-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                    >
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        문자로 발송
                    </button>

                    <button
                        onClick={handleEmailSubmit}
                        className="p-4 bg-royal-blue text-white rounded-2xl font-black shadow-lg shadow-royal-blue/30 hover:bg-[#5A9BD5] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Mail className="w-5 h-5" />
                        이메일로 발송 (권장)
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium">
                    * 버튼을 누르면 스마트폰의 문자/메일 앱이 실행됩니다.
                </p>

            </div>
        </main>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading form...</div>}>
            <ApplyForm />
        </Suspense>
    )
}
