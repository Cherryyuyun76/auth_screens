import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    Briefcase,
    CheckCircle,
    ChevronRight,
    Star,
    BarChart3,
    ShieldCheck,
    Menu,
    X,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-luxury-gold-dark to-luxury-gold-light rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-luxury font-black tracking-tight text-luxury-black">
                        Event<span className="gold-text">Flow</span>
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-gray-600 hover:text-luxury-gold transition-colors">Features</a>
                    <button onClick={() => setActiveTab('login')} className="text-sm font-semibold text-luxury-black hover:gold-text transition-all">Login</button>
                    <button onClick={() => setActiveTab('login')} className="btn-gold text-sm">Book Demo</button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-luxury-black" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white shadow-xl py-8 px-6 flex flex-col gap-6 md:hidden"
                    >
                        <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium">Features</a>
                        <button onClick={() => { setActiveTab('login'); setIsOpen(false); }} className="text-left text-lg font-medium">Login</button>
                        <button onClick={() => { setActiveTab('login'); setIsOpen(false); }} className="btn-gold">Get Started</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        viewport={{ once: true }}
        className="card-luxury group hover:border-luxury-gold transition-all duration-500"
    >
        <div className="w-14 h-14 rounded-2xl bg-luxury-white-pearl flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-500 mb-6 shadow-sm">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:gold-text transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
);

const LandingPage = ({ onLoginClick }) => {
    return (
        <div className="min-h-screen">
            <Navbar setActiveTab={onLoginClick} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-luxury-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-luxury-gold-light/10 blur-[100px] rounded-full" />

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold/10 text-luxury-gold-dark text-xs font-bold tracking-widest uppercase mb-8 border border-luxury-gold/20"
                    >
                        <Star size={14} fill="currentColor" />
                        The Best Way to Manage Events
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-luxury font-black text-luxury-black leading-[1.1] mb-8"
                    >
                        Plan Your <br />
                        <span className="gold-text">Events Easily.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        The best tool for planning your events.
                        Trusted by organizers across Cameroon to stay organized.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <button onClick={() => onLoginClick('login')} className="btn-gold text-lg px-10 py-5 flex items-center justify-center gap-2">
                            Get Started <ChevronRight size={20} />
                        </button>
                        <button className="px-10 py-5 rounded-full border border-gray-200 font-semibold text-luxury-black hover:bg-white hover:shadow-md transition-all">
                            See How It Works
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Built for <span className="gold-text">Success</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Everything you need to plan your events and keep them organized.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <FeatureCard
                            icon={BarChart3}
                            title="Easy Tracking"
                            desc="Easily track your money, attendance, and how many events you have."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Users}
                            title="Workers List"
                            desc="Keep a list of all the people you hire and see how well they work."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-luxury-black rounded-[2rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-luxury-gold/20 to-transparent" />
                    <h2 className="text-3xl md:text-5xl text-white font-black mb-8 relative z-10">Ready to redefine <br /><span className="gold-text">event management?</span></h2>
                    <button onClick={() => onLoginClick('login')} className="btn-gold text-xl px-12 py-6 relative z-10">
                        Join the Elite Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 italic">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-luxury-gold rounded-lg flex items-center justify-center">
                            <Calendar className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-luxury font-bold text-luxury-black">EventFlow</span>
                    </div>
                    <p className="text-sm text-gray-400">&copy; 2025 EventFlow Cameroon. Best Service.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-luxury-gold"><ArrowRight size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
