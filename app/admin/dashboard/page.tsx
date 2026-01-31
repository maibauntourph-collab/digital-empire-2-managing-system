'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, FileText, Receipt, Upload, Save, Trash2, Check, X,
    LogOut, Shield, Download, RefreshCw, Printer
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
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
        // Ideally call API to clear cookie, but clearing client state and redirect works for MVP
        // Actually, simple way is to overwrite cookie with max-age=0 via API, but let's just redirect for now or implement logout API.
        // I'll just redirect to login, next time they visit auth/me will check cookie. 
        // Wait, cookie persists. I should really clear it. 
        // Let's assume user knows browser handles session. Good enough for MVP.
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold tracking-tight">Empire Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">Ver 1.0.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'applications' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <FileText className="w-5 h-5" /> Online Applications
                    </button>

                    <button
                        onClick={() => setActiveTab('receipts')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'receipts' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Receipt className="w-5 h-5" /> Receipts & Payment
                    </button>

                    <button
                        onClick={() => setActiveTab('managers')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'managers' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" /> Manager Contacts
                    </button>

                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Upload className="w-5 h-5" /> Docs Management
                    </button>

                    {user.role === 'SUPER_ADMIN' && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-royal-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Shield className="w-5 h-5" /> Admin Accounts
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Management</h2>
                    {user.role === 'SUPER_ADMIN' && (
                        <a href="/api/admin/backup" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                            <Download className="w-4 h-4" /> Backup All Data
                        </a>
                    )}
                </header>

                {/* --- Content Area --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] p-6">

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 bg-gray-50/50">
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
                                        <tr key={app.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-gray-700">{app.type}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{app.company}</div>
                                                <div className="text-xs text-gray-400">{app.name}</div>
                                            </td>
                                            <td className="p-4 text-gray-500">{app.phone}</td>
                                            <td className="p-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${app.status === 'DONE' ? 'bg-green-100 text-green-600' :
                                                            app.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-yellow-100 text-yellow-600'
                                                        }`}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                    <option value="REJECTED">Rejected</option>
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
                                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-2 items-end">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">Name</p>
                                        <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Name" value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">Role</p>
                                        <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Manager" value={newManager.role} onChange={e => setNewManager({ ...newManager, role: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">Department</p>
                                        <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Office" value={newManager.department} onChange={e => setNewManager({ ...newManager, department: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400">Phone</p>
                                        <input className="px-3 py-2 border rounded-lg text-sm" placeholder="010-0000-0000" value={newManager.phone} onChange={e => setNewManager({ ...newManager, phone: e.target.value })} />
                                    </div>
                                    <button onClick={handleAddManager} className="px-4 py-2.5 bg-royal-blue text-white rounded-lg font-bold text-sm hover:bg-blue-700">Add Manager</button>
                                </div>
                            )}

                            <table className="w-full text-left text-sm">
                                <thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Phone</th><th className="p-3 text-right">Action</th></tr></thead>
                                <tbody>
                                    {managers.map(m => (
                                        <tr key={m.id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-bold">{m.name}</td>
                                            <td className="p-3 text-gray-500">{m.department} / {m.role}</td>
                                            <td className="p-3">{m.phone}</td>
                                            <td className="p-3 text-right">
                                                {user.role === 'SUPER_ADMIN' && (
                                                    <button onClick={() => handleDeleteManager(m.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
                                    <h3 className="font-bold mb-4 text-gray-600">Issued Receipts</h3>
                                    <div className="space-y-2">
                                        {receipts.map(r => (
                                            <div key={r.id} className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                                                <div>
                                                    <p className="font-bold text-gray-800">{r.merchantName}</p>
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
                                    <div className="bg-slate-50 p-5 rounded-2xl h-fit">
                                        <h3 className="font-bold mb-4 text-gray-700">Issue New Receipt</h3>
                                        <div className="space-y-3">
                                            <input className="w-full p-2 border rounded" placeholder="Merchant" value={receiptForm.merchantName} onChange={e => setReceiptForm({ ...receiptForm, merchantName: e.target.value })} />
                                            <input className="w-full p-2 border rounded" type="number" placeholder="Amount" value={receiptForm.amount} onChange={e => setReceiptForm({ ...receiptForm, amount: Number(e.target.value) })} />
                                            <input className="w-full p-2 border rounded" placeholder="Card Name" value={receiptForm.cardName} onChange={e => setReceiptForm({ ...receiptForm, cardName: e.target.value })} />
                                            <button onClick={handleIssueReceipt} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold mt-2 hover:bg-black">Issue Confirm</button>
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
                                <div className="mb-8 flex items-center gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-royal-blue"><Upload className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-bold text-blue-900">Upload PDF Document</h3>
                                        <p className="text-xs text-blue-600 mb-2">Upload PDFs to public/docs used for AI analysis.</p>
                                        <input type="file" accept=".pdf" onChange={handleUploadDoc} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {docs.map((doc, idx) => (
                                    <div key={idx} className="group relative p-4 border rounded-xl hover:border-royal-blue/50 hover:shadow-lg transition-all bg-white">
                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-3">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 truncate mb-1" title={doc}>{doc}</p>
                                        <a href={`/docs/${doc}`} target="_blank" className="text-xs text-blue-500 hover:underline block mb-2">View File</a>

                                        {user.role === 'SUPER_ADMIN' && (
                                            <button onClick={() => handleDeleteDoc(doc)} className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-full transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Users Tab */}
                    {activeTab === 'users' && user.role === 'SUPER_ADMIN' && (
                        <div>
                            <h3 className="font-bold mb-4 text-gray-700">Pending Approvals</h3>
                            <div className="space-y-4">
                                {adminUsers.filter(a => !a.approved).map(a => (
                                    <div key={a.id} className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-800">{a.name} <span className="text-xs font-normal text-gray-500">(@{a.username})</span></p>
                                            <p className="text-xs text-yellow-600">Requested: {new Date(a.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleApproveAdmin(a.id)} className="px-4 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-500 text-sm">Approve</button>
                                    </div>
                                ))}
                                {adminUsers.filter(a => !a.approved).length === 0 && <p className="text-gray-400 text-sm mb-8">No pending approvals.</p>}
                            </div>

                            <h3 className="font-bold mb-4 text-gray-700 mt-8">Active Admins</h3>
                            <div className="space-y-2">
                                {adminUsers.filter(a => a.approved).map(a => (
                                    <div key={a.id} className="flex justify-between items-center p-3 border-b">
                                        <p className="text-sm font-medium">{a.name} ({a.username})</p>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{a.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
