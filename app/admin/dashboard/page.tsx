'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, FileText, Receipt, Upload, Save, Trash2, Check, X,
    LogOut, Shield, Download, RefreshCw, Printer, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function AdminDashboard() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('applications');

    // Data States
    const [managers, setManagers] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [docs, setDocs] = useState<string[]>([]);
    const [adminUsers, setAdminUsers] = useState<any[]>([]);

    // Input States for Forms
    const [newManager, setNewManager] = useState({ name: '', role: '', department: '', email: '', phone: '' });
    const [receiptForm, setReceiptForm] = useState({ merchantName: '디지털엠파이어 II', amount: 0, cardName: '국민카드', cardNum: '****-****-****-1234', items: ['주차 요금'] });

    // Admin Management State
    const [adminForm, setAdminForm] = useState({ username: '', password: '', name: '', permissions: [] as string[] });
    const [isEditingAdmin, setIsEditingAdmin] = useState<string | null>(null); // ID of admin being edited

    const availablePermissions = [
        { id: 'applications', label: '신청서 관리 (Applications)' },
        { id: 'receipts', label: '주차권 관리 (Receipts)' },
        { id: 'managers', label: '담당자 관리 (Managers)' },
        { id: 'docs', label: '문서 관리 (Docs)' },
        { id: 'users', label: '계정 관리 (Users - Limited)' }
    ];

    const hasPermission = (perm: string) => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        return user.permissions?.includes(perm);
    };

    // Summary State
    const [summaries, setSummaries] = useState({ daily: 0, weekly: 0, monthly: 0 });

    useEffect(() => {
        if (receipts.length > 0) {
            calculateSummaries();
        }
    }, [receipts]);

    const calculateSummaries = () => {
        const now = new Date();
        const today = now.toDateString();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Simple week calculation (Sunday-Saturday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        let daily = 0;
        let weekly = 0;
        let monthly = 0;

        receipts.forEach(r => {
            const rDate = new Date(r.issueDate);

            // Daily
            if (rDate.toDateString() === today) {
                daily += r.amount;
            }

            // Weekly
            if (rDate >= startOfWeek) {
                weekly += r.amount;
            }

            // Monthly
            if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
                monthly += r.amount;
            }
        });

        setSummaries({ daily, weekly, monthly });
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = receipts.map(r => ({
            "가맹점명": r.merchantName,
            "발급일시": new Date(r.issueDate).toLocaleString(),
            "금액": r.amount,
            "카드사": r.cardName,
            "카드번호": r.cardNum,
            "승인번호": r.approvalNo,
            "품목": r.items.join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Receipts");
        XLSX.writeFile(wb, `receipts_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [activeTab, user]);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.authenticated) {
                router.push('/admin/login');
            } else {
                setUser(data.user);
                setLoading(false);
            }
        } catch {
            router.push('/admin/login');
        }
    };

    const fetchData = async () => {
        try {
            if (activeTab === 'managers') {
                const res = await fetch('/api/admin/managers');
                setManagers(await res.json());
            } else if (activeTab === 'applications') {
                const res = await fetch('/api/admin/applications');
                setApplications(await res.json());
            } else if (activeTab === 'receipts') {
                const res = await fetch('/api/admin/receipts');
                setReceipts(await res.json());
            } else if (activeTab === 'docs') {
                const res = await fetch('/api/admin/docs');
                setDocs(await res.json());
            } else if (activeTab === 'users' && user.role === 'SUPER_ADMIN') {
                const res = await fetch('/api/admin/users');
                setAdminUsers(await res.json());
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    // --- Handlers ---

    const handleLogout = async () => {
        router.push('/admin/login');
    };

    const handleApproveAdmin = async (id: string) => {
        await fetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({ id, action: 'approve' })
        });
        fetchData();
    };

    const handleAddManager = async () => {
        await fetch('/api/admin/managers', {
            method: 'POST',
            body: JSON.stringify(newManager)
        });
        setNewManager({ name: '', role: '', department: '', email: '', phone: '' });
        fetchData();
    };

    const handleDeleteManager = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/admin/managers?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleUpdateAppStatus = async (id: string, status: string) => {
        await fetch('/api/admin/applications', {
            method: 'PATCH',
            body: JSON.stringify({ id, status })
        });
        fetchData();
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm('Deletion is permanent. Continue?')) return;
        await fetch(`/api/admin/applications?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleIssueReceipt = async () => {
        await fetch('/api/admin/receipts', {
            method: 'POST',
            body: JSON.stringify(receiptForm)
        });
        fetchData();
    };

    const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        await fetch('/api/admin/docs', {
            method: 'POST',
            body: formData
        });
        fetchData();
    };

    const handleDeleteDoc = async (filename: string) => {
        if (!confirm('Delete this file?')) return;
        await fetch(`/api/admin/docs?filename=${filename}`, { method: 'DELETE' });
        fetchData();
    };

    // --- Admin User Handlers ---

    const handleAddAdmin = async () => {
        if (!adminForm.username || !adminForm.password || !adminForm.name) {
            alert('Username, Password, and Name are required.');
            return;
        }
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({
                action: 'create',
                ...adminForm
            })
        });
        if (res.ok) {
            setAdminForm({ username: '', password: '', name: '', permissions: [] });
            fetchData();
        } else {
            alert('Failed to create admin');
        }
    };

    const handleUpdateAdminPermissions = async () => {
        if (!isEditingAdmin) return;
        const res = await fetch('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({
                id: isEditingAdmin,
                permissions: adminForm.permissions
            })
        });
        if (res.ok) {
            setIsEditingAdmin(null);
            setAdminForm({ username: '', password: '', name: '', permissions: [] });
            fetchData();
        } else {
            alert('Failed to update permissions');
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!confirm('Delete this admin permanently?')) return;
        await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const startEditAdmin = (admin: any) => {
        setIsEditingAdmin(admin.id);
        setAdminForm({
            username: admin.username,
            password: '', // Password not editable here for security, or keep empty
            name: admin.name,
            permissions: admin.permissions || []
        });
    };

    const cancelEdit = () => {
        setIsEditingAdmin(null);
        setAdminForm({ username: '', password: '', name: '', permissions: [] });
    };

    const togglePermission = (permId: string) => {
        setAdminForm(prev => {
            const perms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: perms };
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col fixed h-full z-10 transition-colors">
                <div className="p-6 border-b border-slate-700 dark:border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight">Empire Admin</h1>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-slate-400">Ver 1.0.0</p>
                        <div className="flex gap-1.5">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {hasPermission('applications') && (
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'applications' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <FileText className="w-5 h-5" /> {t('tabApps')}
                        </button>
                    )}

                    {hasPermission('receipts') && (
                        <button
                            onClick={() => setActiveTab('receipts')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'receipts' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Receipt className="w-5 h-5" /> {t('tabReceipts')}
                        </button>
                    )}

                    {hasPermission('managers') && (
                        <button
                            onClick={() => setActiveTab('managers')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'managers' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5" /> {t('tabManagers')}
                        </button>
                    )}

                    {hasPermission('docs') && (
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Upload className="w-5 h-5" /> {t('tabDocs')}
                        </button>
                    )}

                    {user.role === 'SUPER_ADMIN' && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Shield className="w-5 h-5" /> {t('tabUsers')}
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-700 dark:border-slate-800">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                        {activeTab === 'applications' ? t('tabApps') :
                            activeTab === 'receipts' ? t('tabReceipts') :
                                activeTab === 'managers' ? t('tabManagers') :
                                    activeTab === 'docs' ? t('tabDocs') : t('tabUsers')}
                    </h2>
                    {user.role === 'SUPER_ADMIN' && (
                        <a href="/api/admin/backup" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 cursor-pointer">
                            <Download className="w-4 h-4" /> Backup All Data
                        </a>
                    )}
                </header>

                {/* --- Content Area --- */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] p-6 transition-colors">

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 bg-gray-50/50 dark:bg-gray-700/50">
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Applicant</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-gray-700 dark:text-gray-200">{app.type}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800 dark:text-gray-200">{app.company}</div>
                                                <div className="text-xs text-gray-400">{app.name}</div>
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{app.phone}</td>
                                            <td className="p-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${app.status === 'DONE' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                        app.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}
                                                >
                                                    <option value="PENDING">{t('appPending')}</option>
                                                    <option value="IN_PROGRESS">{t('appInProgress')}</option>
                                                    <option value="DONE">{t('appDone')}</option>
                                                    <option value="REJECTED">{t('appRejected')}</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                {user.role === 'SUPER_ADMIN' && (
                                                    <button onClick={() => handleDeleteApp(app.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">No applications found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Managers Tab */}
                    {activeTab === 'managers' && (
                        <div>
                            {user.role === 'SUPER_ADMIN' && (
                                <div className="mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex gap-2 items-end">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">{t('name')}</p>
                                        <input className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Name" value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">Role</p>
                                        <input className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Manager" value={newManager.role} onChange={e => setNewManager({ ...newManager, role: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">{t('department')}</p>
                                        <input className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Office" value={newManager.department} onChange={e => setNewManager({ ...newManager, department: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">{t('phone')}</p>
                                        <input className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="010-0000-0000" value={newManager.phone} onChange={e => setNewManager({ ...newManager, phone: e.target.value })} />
                                    </div>
                                    <button onClick={handleAddManager} className="px-4 py-2.5 bg-royal-blue text-white rounded-lg font-bold text-sm hover:bg-blue-700 whitespace-nowrap">{t('managerAdd')}</button>
                                </div>
                            )}

                            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                                <thead><tr className="border-b dark:border-gray-700"><th className="p-3">{t('name')}</th><th className="p-3">Role</th><th className="p-3">{t('phone')}</th><th className="p-3 text-right">Action</th></tr></thead>
                                <tbody>
                                    {managers.map(m => (
                                        <tr key={m.id} className="border-b dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-bold">{m.name}</td>
                                            <td className="p-3 text-gray-500 dark:text-gray-400">{m.department} / {m.role}</td>
                                            <td className="p-3">{m.phone}</td>
                                            <td className="p-3 text-right">
                                                {user.role === 'SUPER_ADMIN' && (
                                                    <button onClick={() => handleDeleteManager(m.id)} className="text-red-500 hover:underline text-xs">{t('delete')}</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Receipts Tab */}
                    {activeTab === 'receipts' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-600 dark:text-gray-300">{t('issueHistory')}</h3>
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" /> Excel Export
                                        </button>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                            <p className="text-xs text-gray-400 font-bold mb-1">일계 (Daily)</p>
                                            <p className="text-lg font-black text-royal-blue">{summaries.daily.toLocaleString()} <span className="text-xs font-normal text-gray-400">₩</span></p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                            <p className="text-xs text-gray-400 font-bold mb-1">주계 (Weekly)</p>
                                            <p className="text-lg font-black text-royal-blue">{summaries.weekly.toLocaleString()} <span className="text-xs font-normal text-gray-400">₩</span></p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                            <p className="text-xs text-gray-400 font-bold mb-1">월계 (Monthly)</p>
                                            <p className="text-lg font-black text-royal-blue">{summaries.monthly.toLocaleString()} <span className="text-xs font-normal text-gray-400">₩</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {receipts.map(r => (
                                            <div key={r.id} className="flex justify-between items-center p-4 border dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow dark:bg-gray-700/30">
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{r.merchantName}</p>
                                                    <p className="text-xs text-gray-400">{new Date(r.issueDate).toLocaleString()} · {r.cardName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-bold text-royal-blue">{r.amount.toLocaleString()} ₩</p>
                                                    <p className="text-xs text-gray-400">{r.approvalNo}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {receipts.length === 0 && <p className="text-center text-gray-400 py-10">No receipts issued.</p>}
                                    </div>
                                </div>

                                {/* Issue Form */}
                                {user.role === 'SUPER_ADMIN' && (
                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-2xl h-fit">
                                        <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">{t('receiptTitle')}</h3>
                                        <div className="space-y-3">
                                            <input className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Merchant" value={receiptForm.merchantName} onChange={e => setReceiptForm({ ...receiptForm, merchantName: e.target.value })} />
                                            <input className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" type="number" placeholder="Amount" value={receiptForm.amount} onChange={e => setReceiptForm({ ...receiptForm, amount: Number(e.target.value) })} />
                                            <input className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Card Name" value={receiptForm.cardName} onChange={e => setReceiptForm({ ...receiptForm, cardName: e.target.value })} />
                                            <button onClick={handleIssueReceipt} className="w-full py-3 bg-gray-800 dark:bg-gray-600 text-white rounded-xl font-bold mt-2 hover:bg-black dark:hover:bg-gray-500">{t('issue')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Docs Tab */}
                    {activeTab === 'docs' && (
                        <div>
                            {user.role === 'SUPER_ADMIN' && (
                                <div className="mb-8 flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                                    <div className="bg-white dark:bg-blue-800 p-3 rounded-full shadow-sm text-royal-blue dark:text-blue-200"><Upload className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 dark:text-blue-200">{t('docsUpload')}</h3>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">Upload PDFs to public/docs used for AI analysis.</p>
                                        <input type="file" accept=".pdf" onChange={handleUploadDoc} className="text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 dark:file:bg-blue-800 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-200 cursor-pointer" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {docs.map((doc, idx) => (
                                    <div key={idx} className="group relative p-4 border dark:border-gray-700 rounded-xl hover:border-royal-blue/50 hover:shadow-lg transition-all bg-white dark:bg-gray-700/50">
                                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg flex items-center justify-center mb-3">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate mb-1" title={doc}>{doc}</p>
                                        <a href={`/docs/${doc}`} target="_blank" className="text-xs text-blue-500 hover:underline block mb-2">View File</a>

                                        {user.role === 'SUPER_ADMIN' && (
                                            <button onClick={() => handleDeleteDoc(doc)} className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Users Tab - RBAC Interface */}
                    {activeTab === 'users' && user.role === 'SUPER_ADMIN' && (
                        <div>
                            {/* Management Form */}
                            <div className="mb-8 bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-200">
                                    {isEditingAdmin ? 'Edit Admin Permissions' : 'Create New Admin'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1">Name</p>
                                            <input
                                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
                                                value={adminForm.name}
                                                onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                                                disabled={!!isEditingAdmin} // Name fixed during edit for now
                                                placeholder="Admin Name"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1">Username (ID)</p>
                                            <input
                                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
                                                value={adminForm.username}
                                                onChange={e => setAdminForm({ ...adminForm, username: e.target.value })}
                                                disabled={!!isEditingAdmin}
                                                placeholder="Username"
                                            />
                                        </div>
                                        {/* Password only for new admins */}
                                        {!isEditingAdmin && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 mb-1">Password</p>
                                                <input
                                                    type="password"
                                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
                                                    value={adminForm.password}
                                                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                                                    placeholder="Initial Password"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-400 mb-2">Permissions</p>
                                        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-600 h-full">
                                            {availablePermissions.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-1.5 rounded transition-colors">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${adminForm.permissions.includes(p.id) ? 'bg-royal-blue border-royal-blue text-white' : 'border-gray-300 dark:border-gray-500'}`}>
                                                        {adminForm.permissions.includes(p.id) && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={adminForm.permissions.includes(p.id)}
                                                        onChange={() => togglePermission(p.id)}
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    {isEditingAdmin && (
                                        <button onClick={cancelEdit} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold text-sm transition-colors">
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={isEditingAdmin ? handleUpdateAdminPermissions : handleAddAdmin}
                                        className="px-6 py-2.5 bg-royal-blue text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                                    >
                                        {isEditingAdmin ? 'Update Permissions' : 'Create Admin'}
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-300">Admin Accounts</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700 text-gray-400 font-medium">
                                            <th className="p-3">Name / ID</th>
                                            <th className="p-3">Role</th>
                                            <th className="p-3">Permissions</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminUsers.map(a => (
                                            <tr key={a.id} className="border-b dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="p-3">
                                                    <p className="font-bold">{a.name}</p>
                                                    <p className="text-xs text-gray-400">@{a.username}</p>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                        {a.role}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {a.role === 'SUPER_ADMIN' ? (
                                                        <span className="text-xs text-gray-400 italic">Global Access</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {a.permissions && a.permissions.length > 0 ? a.permissions.map((p: string) => (
                                                                <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                                                                    {p}
                                                                </span>
                                                            )) : <span className="text-xs text-red-400">No Access</span>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {a.approved ? (
                                                        <span className="flex items-center gap-1 text-xs text-green-600"><Check className="w-3 h-3" /> Active</span>
                                                    ) : (
                                                        <button onClick={() => handleApproveAdmin(a.id)} className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs font-bold hover:bg-yellow-200">Approve</button>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {a.role !== 'SUPER_ADMIN' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => startEditAdmin(a)} className="text-blue-500 hover:text-blue-700 text-xs font-bold">Edit</button>
                                                            <button onClick={() => handleDeleteAdmin(a.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
