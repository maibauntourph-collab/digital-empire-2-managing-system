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

    const handleSubmit = () => {
        if (!formData.name || !formData.company || !formData.phone || !formData.content) {
            alert("모든 항목을 입력해 주세요.");
            return;
        }

        const subject = `[신청서] ${formData.company} - ${formData.name}`;
        const bodyHeader = `[디지털엠파이어 II 민원/신청서]\n\n1. 회사명: ${formData.company}\n2. 성함: ${formData.name}\n3. 연락처: ${formData.phone}\n\n4. 신청 내용:\n${formData.content}`;
        const body = encodeURIComponent(bodyHeader.trim());

        // 1. Send Email (Priority)
        window.location.href = `mailto:${MANAGER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;

        // 2. Send SMS (Delayed trigger to attempt both)
        setTimeout(() => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
            const separator = isIOS ? "&" : "?";
            window.location.href = `sms:${MANAGER_PHONE}${separator}body=${body}`;
        }, 1500);

        alert("이메일 앱이 열립니다.\n잠시 후 문자 앱도 열리면 '전송' 버튼을 눌러주세요.");
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
                        작성하신 내용은 관리사무소 담당자에게 <strong>이메일과 문자</strong>로 동시에 전송됩니다.
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

                {/* Action Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full p-5 bg-royal-blue text-white rounded-2xl font-black text-lg shadow-lg shadow-royal-blue/30 hover:bg-[#5A9BD5] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <Send className="w-6 h-6" />
                    신청서 접수 (이메일+문자)
                </button>

                <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                    * 버튼을 누르면 <strong>이메일 앱</strong>과 <strong>문자 앱</strong>이 순서대로 실행됩니다.<br />
                    반드시 두 앱에서 모두 <strong>전송 버튼</strong>을 눌러주세요.
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
