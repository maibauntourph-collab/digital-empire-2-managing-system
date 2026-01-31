"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Send, MessageSquare, Mail, User, Building, Phone as PhoneIcon, FileText } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

function ApplyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();

    const APPLICATION_ITEMS = [
        "비즈니스룸 예약 방법",
        "화물 엘리베이터 이용",
        "입주사 명패 제작",
        "화물 엘리베이터 점유",
        "야간 난방 연장 신청",
        "기타 (직접 입력)"
    ];

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        phone: "",
        category: "기타 (직접 입력)",
        content: ""
    });

    useEffect(() => {
        const subject = searchParams.get("subject");
        if (subject) {
            // Find if subject matches any predefined item (partial match)
            const matchedItem = APPLICATION_ITEMS.find(item => subject.includes(item) || item.includes(subject));
            if (matchedItem) {
                setFormData(prev => ({ ...prev, category: matchedItem }));
            } else {
                setFormData(prev => ({ ...prev, content: `[신청] ${subject} 관련` }));
            }
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
4. 신청 항목: ${formData.category}

5. 신청 내용:
${formData.content}
    `.trim();
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.company || !formData.phone || !formData.content) {
            alert(language === 'en' ? "Please fill in all fields." : "모든 항목을 입력해 주세요.");
            return;
        }

        const subject = `[신청서] ${formData.category} - ${formData.name}`;
        const bodyHeader = `[디지털엠파이어 II 민원/신청서]\n\n1. 회사명: ${formData.company}\n2. 성함: ${formData.name}\n3. 연락처: ${formData.phone}\n4. 신청 항목: ${formData.category}\n\n5. 신청 내용:\n${formData.content}`;
        const body = encodeURIComponent(bodyHeader.trim());

        // Show loading state
        const btn = document.getElementById('submit-btn');
        if (btn) {
            (btn as HTMLButtonElement).disabled = true;
            btn.innerText = language === 'en' ? "Sending..." : "전송 중...";
        }

        try {
            // 0. Save to MongoDB (Backend)
            try {
                const dbResponse = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (!dbResponse.ok) {
                    const errorData = await dbResponse.json();
                    throw new Error(errorData.error || `Server Error ${dbResponse.status}`);
                }
            } catch (dbError: any) {
                console.error("Failed to save application to DB:", dbError);
                alert(`⚠️ [DB 저장 실패] 신청서는 이메일로 전송되지만, DB 저장은 실패했습니다.\n사유: ${dbError.message}`);
                // Continue to email...
            }

            // 1. Auto-Send Email via FormSubmit.co
            // Note: The owner (jitnet57@gmail.com) must accept the activation email once for this to work.
            const response = await fetch("https://formsubmit.co/ajax/jitnet57@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: subject,
                    _template: "table",
                    회사명: formData.company,
                    성함: formData.name,
                    연락처: formData.phone,
                    신청항목: formData.category,
                    신청내용: formData.content
                })
            });

            if (response.ok) {
                alert(language === 'en'
                    ? "✅ Application Submitted!\nEmail sent to management office.\nOpening SMS app for confirmation."
                    : "✅ 신청서가 접수되었습니다!\n관리실로 이메일이 전송되었습니다.\n\n확인을 위해 문자 앱을 실행합니다.\n문자도 '전송' 버튼을 눌러주세요.");
            } else {
                throw new Error("Email submission failed");
            }

        } catch (error) {
            console.error("Auto-email failed:", error);
            alert(language === 'en'
                ? "⚠️ Auto-send failed. Switching to manual email mode."
                : "⚠️ 자동 전송에 실패하여 '수동 모드'로 전환합니다.\n이메일 앱이 열리면 전송 버튼을 눌러주세요.");
            // Fallback to Mailto
            window.location.href = `mailto:${MANAGER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
        } finally {
            // 2. Trigger SMS (Always, as confirmation and dual notification)
            setTimeout(() => {
                const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
                const separator = isIOS ? "&" : "?";
                window.location.href = `sms:${MANAGER_PHONE}${separator}body=${body}`;

                if (btn) {
                    (btn as HTMLButtonElement).disabled = false;
                    btn.innerHTML = language === 'en' ? "Submit Application" : `신청서 접수 (자동 발송)`;
                }
            }, 1000);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans selection:bg-royal-blue/10 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 h-16 flex items-center justify-between px-5 shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-lg font-black text-gray-800 dark:text-white">{language === 'en' ? "Application Form" : "온라인 신청서 작성"}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 max-w-screen-md mx-auto w-full p-6 space-y-8">

                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">{language === 'en' ? "Application Details" : "신청 정보 입력"}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                        {language === 'en'
                            ? "Your request will be sent via Email and SMS."
                            : <>작성하신 내용은 관리사무소 담당자에게 <strong>이메일(자동)과 문자</strong>로 동시에 전송됩니다.</>}
                    </p>

                    <div className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> {language === 'en' ? "Name" : "성함"}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={language === 'en' ? "Your Name" : "홍길동"}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-800 dark:text-white font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Company */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" /> {language === 'en' ? "Company (Room No.)" : "회사명 (호수)"}
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder={language === 'en' ? "Digital Empire / 1004" : "(주)디지털엠파이어 / 1004호"}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-800 dark:text-white font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                                <PhoneIcon className="w-3.5 h-3.5" /> {language === 'en' ? "Phone" : "연락처"}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="010-1234-5678"
                                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-800 dark:text-white font-bold placeholder:font-medium"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> {language === 'en' ? "Category" : "신청 항목"}
                            </label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-800 dark:text-white font-bold appearance-none"
                                >
                                    {APPLICATION_ITEMS.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                <ChevronLeft className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> {language === 'en' ? "Details" : "상세 내용"}
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder={language === 'en' ? "Please provide details." : "신청하실 내용을 자세히 적어주세요."}
                                className="w-full p-4 h-32 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-800 dark:text-white font-medium resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    id="submit-btn"
                    onClick={handleSubmit}
                    className="w-full p-5 bg-royal-blue text-white rounded-2xl font-black text-lg shadow-lg shadow-royal-blue/30 hover:bg-[#5A9BD5] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <Send className="w-6 h-6" />
                    {language === 'en' ? "Submit Application" : "신청서 접수 (자동 발송)"}
                </button>

                <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                    {language === 'en'
                        ? "* Emails are sent instantly. SMS app will also open."
                        : <>* 버튼을 누르면 <strong>이메일이 즉시 전송</strong>되며,<br />확인을 위해 <strong>문자 앱</strong>도 함께 실행됩니다.</>}
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
