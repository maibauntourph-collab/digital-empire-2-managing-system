'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'MANAGER' // Default
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setTimeout(() => router.push('/admin/login'), 2000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Register Admin</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 text-center font-bold">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-colors"
                    >
                        Register Account
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/admin/login" className="text-sm text-gray-400 hover:text-black transition-colors">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}
