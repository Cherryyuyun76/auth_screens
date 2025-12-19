import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, X, Calendar } from 'lucide-react';

// --- AUTH COMPONENTS ---

const AuthPage = ({ initialMode, onBack, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Password Strength Check for Registration
            if (!isLogin) {
                if (password.length < 8) {
                    setError('Password must be at least 8 characters long.');
                    setLoading(false);
                    return;
                }
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                if (!hasNumber || !hasSpecial) {
                    setError('Password must have at least one number and one special character (like @ or #).');
                    setLoading(false);
                    return;
                }
            }

            const endpoint = isLogin ? '/api/login' : '/api/register';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name: isLogin ? undefined : email.split('@')[0] })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onLoginSuccess(data.user);
            } else {
                setError(data.message || 'Error. Please check your details.');
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-white-pearl flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxury-gold/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-luxury-gold-light/5 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-luxury-gold/10 relative z-10"
            >
                <button
                    onClick={onBack}
                    className="absolute top-8 right-8 text-gray-400 hover:text-luxury-black transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-6 sm:p-12">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-luxury-gold-dark to-luxury-gold-light rounded-2xl flex items-center justify-center shadow-xl">
                            <Calendar className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-luxury font-black text-center mb-2">
                        {isLogin ? 'Welcome ' : 'Join '}
                        <span className="gold-text">{isLogin ? 'Back' : 'Us'}</span>
                    </h2>
                    <p className="text-gray-400 text-center mb-10">
                        {isLogin ? 'Login to manage your events' : 'Create an account to start'}
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
                            <X size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-gold" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-gold" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full btn-gold py-5 text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? 'Authenticating...' : (isLogin ? 'Enter Suite' : 'Create Account')}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="gold-text font-bold hover:underline"
                        >
                            {isLogin ? 'Join now' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// --- APP MAIN ---

export default function App() {
    const [view, setView] = useState('landing'); // landing, login, dashboard
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setView('landing');
        localStorage.removeItem('user');
    };

    return (
        <AnimatePresence mode="wait">
            {view === 'landing' && (
                <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <LandingPage onLoginClick={() => setView('login')} />
                </motion.div>
            )}

            {view === 'login' && (
                <motion.div
                    key="login"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    <AuthPage
                        initialMode="login"
                        onBack={() => setView('landing')}
                        onLoginSuccess={handleLoginSuccess}
                    />
                </motion.div>
            )}

            {view === 'dashboard' && (
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-h-screen"
                >
                    <Dashboard user={user} onLogout={handleLogout} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
