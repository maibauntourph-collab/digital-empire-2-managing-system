'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Empire Admin Login</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-royal-blue outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-royal-blue outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-royal-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/admin/register" className="text-sm text-gray-400 hover:text-royal-blue transition-colors">
                        Create an account
                    </a>
                </div>
            </div>
        </div>
    );
}
