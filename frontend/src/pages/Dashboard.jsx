import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    Users,
    CheckSquare,
    LogOut,
    Plus,
    MoreVertical,
    Search,
    Bell,
    TrendingUp,
    DollarSign,
    UserPlus,
    Trash2,
    Edit,
    ChevronRight,
    Filter,
    CheckCircle2,
    Clock,
    Menu,
    Star,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, totalRevenue: 0, activeVendors: 0 });
    const [events, setEvents] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [modalType, setModalType] = useState(null); // 'event', 'vendor', 'task'
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, eventsRes, vendorsRes, tasksRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/events'),
                fetch('/api/vendors'),
                fetch('/api/tasks')
            ]);

            const [statsData, eventsData, vendorsData, tasksData] = await Promise.all([
                statsRes.json(),
                eventsRes.json(),
                vendorsRes.json(),
                tasksRes.json()
            ]);

            // Ensure stats are numeric (MySQL DECIMAL can return as strings)
            const sanitizedStats = {
                totalEvents: Number(statsData.totalEvents) || 0,
                totalAttendees: Number(statsData.totalAttendees) || 0,
                totalRevenue: Number(statsData.totalRevenue) || 0,
                activeVendors: Number(statsData.activeVendors) || 0
            };

            setStats(sanitizedStats);
            setEvents(Array.isArray(eventsData) ? eventsData : []);
            setVendors(Array.isArray(vendorsData) ? vendorsData : []);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
        } catch (err) {
            console.error("Dashboard data fetch error:", err);
        } finally {
            // Artificial delay for luxury feel
            setTimeout(() => setLoading(false), 500);
        }
    };

    const handleAction = async (type, method, id = null) => {
        const endpoint = `/api/${type}${id ? `/${id}` : ''}`;
        try {
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'DELETE' ? JSON.stringify(formData) : null
            });
            if (response.ok) {
                setModalType(null);
                setEditItem(null);
                setFormData({});
                fetchData();
            }
        } catch (err) {
            console.error(`Error performing ${method} on ${type}:`, err);
        }
    };

    const openAddModal = (type) => {
        setModalType(type);
        setEditItem(null);
        setFormData({});
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setEditItem(item);
        setFormData(item);
    };

    // --- SUB-COMPONENTS ---

    const SidebarItem = ({ icon: Icon, label, id }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group
        ${activeTab === id ? 'text-luxury-gold' : 'text-gray-400 hover:text-luxury-gold-dark'}`}
        >
            {activeTab === id && (
                <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-8 bg-luxury-gold rounded-r-full"
                />
            )}
            <Icon size={22} className={`${activeTab === id ? 'text-luxury-gold' : 'text-gray-400 group-hover:text-luxury-gold-dark'} transition-colors`} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="card-luxury relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 rounded-full transition-all duration-500 group-hover:scale-150 ${color}`} />
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-luxury-gold/5 ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</p>
                    <h4 className="text-2xl font-black text-luxury-black mt-1">{value}</h4>
                </div>
            </div>
        </div>
    );

    const VENDOR_CATEGORIES = [
        "Haute Cuisine",
        "Security Elite",
        "Floral Design",
        "Audiovisual Master",
        "Luxury Decor",
        "Photography & Cinema",
        "Concierge Service",
        "Entertainment Expert"
    ];

    const COUNTRIES = [
        "Cameroon",
        "France",
        "USA",
        "United Kingdom",
        "Germany",
        "Canada",
        "Belgium",
        "United Arab Emirates",
        "Nigeria",
        "Ivory Coast"
    ];

    const TableHeader = ({ title, onAdd }) => (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
                <h2 className="text-4xl font-luxury font-black text-luxury-black">{title}</h2>
                <p className="text-gray-400 mt-2 font-medium">Manage your {title.toLowerCase()} here.</p>
            </div>
            <button onClick={onAdd} className="btn-gold flex items-center gap-2 px-8 py-4 w-full sm:w-auto justify-center">
                <Plus size={20} /> Add {title}
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-luxury-white-pearl flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full mb-6"
                />
                <h2 className="text-xl font-luxury font-black gold-text">Curating your experience...</h2>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-luxury-white-pearl">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-white border-r border-luxury-gold/10 z-[70] transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:flex'} flex flex-col shadow-2xl lg:shadow-none`}>
                <div className="p-8 pb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-luxury-gold-dark to-luxury-gold-light rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-luxury font-black text-luxury-black tracking-tight">
                            Event<span className="gold-text">Flow</span>
                        </span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2" onClick={() => setSidebarOpen(false)}>
                    <SidebarItem icon={LayoutDashboard} label="Home" id="dashboard" />
                    <SidebarItem icon={Calendar} label="Events" id="events" />
                    <SidebarItem icon={Users} label="Vendors" id="vendors" />
                    <SidebarItem icon={CheckSquare} label="Tasks" id="tasks" />
                </nav>

                <div className="p-8 border-t border-luxury-gold/5">
                    <div className="flex items-center gap-4 mb-8 p-4 rounded-3xl bg-luxury-white-pearl border border-luxury-gold/5">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-luxury-gold/20">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=D4AF37&color=fff`} alt="Profile" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-luxury-black truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-luxury-gold font-bold uppercase tracking-widest">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-semibold"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Header */}
                <header className="glass-header px-6 lg:px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-12 h-12 rounded-2xl bg-white border border-luxury-gold/10 flex items-center justify-center text-luxury-black hover:bg-luxury-gold/5 transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="h-10 w-[2px] bg-luxury-gold/10 hidden lg:block" />
                        <p className="text-luxury-black font-bold tracking-widest uppercase text-xs">Event Manager</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-luxury-gold transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-100/50 border-none rounded-2xl py-4 pl-14 pr-8 w-80 focus:ring-2 focus:ring-luxury-gold/20 focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                        <button className="w-14 h-14 rounded-2xl bg-white border border-luxury-gold/10 flex items-center justify-center text-gray-500 hover:text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/5 transition-all relative">
                            <Bell size={22} />
                            <span className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                {/* Dynamic Views */}
                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {/* Welcome Message */}
                                <div className="mb-10">
                                    <h1 className="text-5xl font-luxury font-black text-luxury-black">
                                        Welcome, <span className="gold-text">{user?.name?.split(' ')[0] || 'User'}</span>
                                    </h1>
                                    <p className="text-gray-400 mt-2 text-lg font-medium">It's good to see you. Here is what's happening with your events today.</p>
                                </div>

                                {/* Hero Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <StatCard icon={TrendingUp} label="Total Events" value={stats.totalEvents} color="bg-indigo-500 text-indigo-600" />
                                    <StatCard icon={UserPlus} label="Attendees" value={stats.totalAttendees} color="bg-blue-500 text-blue-600" />
                                    <StatCard icon={DollarSign} label="Revenue" value={`${stats.totalRevenue.toLocaleString()} FCFA`} color="bg-emerald-500 text-emerald-600" />
                                    <StatCard icon={Briefcase} label="Active Vendors" value={stats.activeVendors} color="bg-amber-500 text-amber-600" />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    {/* Left Column - Large Tables Preview */}
                                    <div className="xl:col-span-2 space-y-8">
                                        <div className="card-luxury">
                                            <div className="flex justify-between items-center mb-10">
                                                <h3 className="text-2xl font-black">Upcoming Events</h3>
                                                <button onClick={() => setActiveTab('events')} className="text-luxury-gold p-2 hover:bg-luxury-gold/5 rounded-xl transition-all">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                {events.slice(0, 5).map(event => (
                                                    <div key={event.id} className="group flex items-center justify-between p-6 rounded-3xl hover:bg-luxury-white-pearl border border-transparent hover:border-luxury-gold/10 transition-all duration-300">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-2xl bg-luxury-gold/5 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-500">
                                                                <Calendar size={28} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-luxury-black mb-1">{event.name}</h4>
                                                                <div className="flex items-center gap-4 text-sm text-gray-400 font-semibold tracking-wide uppercase">
                                                                    <span className="flex items-center gap-1"><Clock size={14} /> {event.date}</span>
                                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                                    <span>{event.location}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-10">
                                                            <div className="hidden md:block text-right">
                                                                <p className="text-sm font-bold text-luxury-black">{(Number(event.budget) || 0).toLocaleString()} FCFA</p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Budget</p>
                                                            </div>
                                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase
                                    ${event.status === 'Planning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                {event.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Tasks/Vendors */}
                                    <div className="space-y-8">
                                        <div className="card-luxury bg-luxury-black text-white relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-luxury-gold/20 to-transparent" />
                                            <h3 className="text-xl font-black mb-2 relative z-10">Vendors List</h3>
                                            <p className="text-gray-400 text-sm mb-8 relative z-10 font-medium">Quick view of your vendors.</p>
                                            <div className="space-y-4 relative z-10">
                                                {vendors.slice(0, 3).map(v => (
                                                    <div key={v.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                        <div className="w-12 h-12 bg-luxury-gold rounded-xl flex items-center justify-center font-black text-lg">
                                                            {v.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{v.name}</p>
                                                            <p className="text-xs text-luxury-gold font-bold uppercase">{v.category}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveTab('vendors')} className="w-full mt-8 py-4 rounded-2xl bg-white text-luxury-black font-black text-sm uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-all">
                                                Show All
                                            </button>
                                        </div>

                                        <div className="card-luxury">
                                            <h3 className="text-xl font-black mb-8">Things To Do</h3>
                                            <div className="space-y-4">
                                                {tasks.slice(0, 3).map(t => (
                                                    <div key={t.id} className="flex items-center gap-4">
                                                        <div className="w-6 h-6 rounded-full border-2 border-luxury-gold/30 flex items-center justify-center">
                                                            {t.status === 'Completed' && <div className="w-3 h-3 bg-luxury-gold rounded-full" />}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${t.status === 'Completed' ? 'line-through text-gray-300' : 'text-luxury-black'}`}>{t.description}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{t.deadline}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Entities Views */}
                        {activeTab === 'events' && (
                            <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <TableHeader title="Events" onAdd={() => openAddModal('events')} />
                                <div className="card-luxury p-0 overflow-hidden border-none shadow-2xl overflow-x-auto">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead className="bg-gray-50/50 border-b border-luxury-gold/10">
                                            <tr>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">ID</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Event Name</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Location</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Budget</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-luxury-gold/5">
                                            {events.map(e => (
                                                <tr key={e.id} className="hover:bg-luxury-white-pearl/50 transition-colors">
                                                    <td className="px-10 py-8 text-xs font-black text-gray-300 text-center italic">#{String(e.id).slice(-4)}</td>
                                                    <td className="px-10 py-8">
                                                        <div className="font-bold text-luxury-black">{e.name}</div>
                                                        <div className="text-xs text-luxury-gold font-bold tracking-widest">{e.date}</div>
                                                    </td>
                                                    <td className="px-10 py-8 text-sm font-medium text-gray-500">{e.location}</td>
                                                    <td className="px-10 py-8 text-right font-black text-luxury-black">{(Number(e.budget) || 0).toLocaleString()} FCFA</td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase
                                      ${e.status === 'Planning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button onClick={() => openEditModal('events', e)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-luxury-gold hover:bg-luxury-gold/5 transition-all flex items-center justify-center">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleAction('events', 'DELETE', e.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Vendors Table */}
                        {activeTab === 'vendors' && (
                            <motion.div key="vendors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <TableHeader title="Vendors" onAdd={() => openAddModal('vendors')} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {vendors.map(v => (
                                        <motion.div
                                            key={v.id}
                                            whileHover={{ y: -5 }}
                                            className="card-luxury group relative pt-12"
                                        >
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-3xl shadow-xl border border-luxury-gold/10 flex items-center justify-center text-luxury-gold text-2xl font-black">
                                                {v.name.charAt(0)}
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-black mb-1">{v.name}</h4>
                                                <p className="text-[10px] text-luxury-gold font-black uppercase tracking-[0.2em] mb-4">{v.category}</p>

                                                <div className="flex flex-col gap-1 mb-6">
                                                    {v.phone && <p className="text-xs text-gray-400 font-medium">{v.phone}</p>}
                                                    {v.country && <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{v.country}</p>}
                                                    {v.email && <p className="text-xs text-gray-400 font-medium truncate">{v.email}</p>}
                                                </div>

                                                <div className="flex justify-center gap-1 text-luxury-gold mb-8">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < Math.floor(v.rating || 5) ? 'currentColor' : 'none'} />
                                                    ))}
                                                </div>

                                                <div className="flex border-t border-luxury-gold/5 pt-6 mt-6">
                                                    <button onClick={() => openEditModal('vendors', v)} className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-luxury-gold transition-colors">Edit</button>
                                                    <div className="w-[1px] bg-luxury-gold/5" />
                                                    <button onClick={() => handleAction('vendors', 'DELETE', v.id)} className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'tasks' && (
                            <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <TableHeader title="Tasks" onAdd={() => openAddModal('tasks')} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {tasks.map(t => (
                                        <div key={t.id} className="card-luxury p-8 flex items-start gap-6 group">
                                            <button
                                                onClick={() => {
                                                    setFormData({ ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' });
                                                    handleAction('tasks', 'PUT', t.id);
                                                }}
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0
                                ${t.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-luxury-gold/20 text-transparent hover:border-luxury-gold'}`}
                                            >
                                                <CheckCircle2 size={24} />
                                            </button>
                                            <div className="flex-1">
                                                <h4 className={`text-xl font-bold mb-2 transition-all ${t.status === 'Completed' ? 'text-gray-300 line-through' : 'text-luxury-black'}`}>{t.description}</h4>
                                                <div className="flex items-center gap-6 text-xs font-bold tracking-widest uppercase">
                                                    <span className="text-luxury-gold">{t.assignedTo || 'Unassigned'}</span>
                                                    <span className="text-gray-400 italic lowercase tracking-tight">{t.deadline}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAction('tasks', 'DELETE', t.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- MODALS --- */}

                {/* Event Modal */}
                <Modal
                    isOpen={modalType === 'events'}
                    onClose={() => setModalType(null)}
                    title={editItem ? "Edit Event" : "Add New Event"}
                >
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('events', editItem ? 'PUT' : 'POST', editItem?.id); }} className="space-y-6">
                        <input
                            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                            placeholder="Event Name"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                value={formData.date || ''}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <input
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                placeholder="Location"
                                value={formData.location || ''}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                            placeholder="Budget (FCFA)"
                            value={formData.budget || ''}
                            onChange={e => setFormData({ ...formData, budget: e.target.value })}
                            required
                        />
                        <button type="submit" className="w-full btn-gold py-5 text-lg">
                            {editItem ? "Save Changes" : "Add Event"}
                        </button>
                    </form>
                </Modal>

                {/* Vendor Modal */}
                <Modal
                    isOpen={modalType === 'vendors'}
                    onClose={() => setModalType(null)}
                    title={editItem ? "Edit Vendor" : "Add New Vendor"}
                >
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('vendors', editItem ? 'PUT' : 'POST', editItem?.id); }} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-luxury-gold">Agency Details</label>
                            <input
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                placeholder="Agency Name"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <select
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all appearance-none"
                                value={formData.category || ''}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select Service Type</option>
                                {VENDOR_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-black uppercase tracking-widest text-luxury-gold">Contact Information</label>
                            <input
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                placeholder="Contact Person Name"
                                value={formData.contact_person || ''}
                                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                            />
                            <select
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all appearance-none"
                                value={formData.country || 'Cameroon'}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                required
                            >
                                {COUNTRIES.map(cty => (
                                    <option key={cty} value={cty}>{cty}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                    placeholder="Email Address"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                                    placeholder="Phone (e.g. +237 ...)"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-black uppercase tracking-widest text-luxury-gold">Agency Background</label>
                            <textarea
                                className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all min-h-[100px]"
                                placeholder="Short about the agency..."
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full btn-gold py-5 text-lg uppercase tracking-widest font-black">
                            {editItem ? "Save Changes" : "Add Vendor"}
                        </button>
                    </form>
                </Modal>

                {/* Task Modal */}
                <Modal
                    isOpen={modalType === 'tasks'}
                    onClose={() => setModalType(null)}
                    title="Add New Task"
                >
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('tasks', editItem ? 'PUT' : 'POST', editItem?.id); }} className="space-y-6">
                        <input
                            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                            placeholder="Directive description"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <input
                            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                            placeholder="Assign to (E.g. Admin)"
                            value={formData.assignedTo || ''}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                        />
                        <input
                            type="date"
                            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                            value={formData.deadline || ''}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            required
                        />
                        <button type="submit" className="w-full btn-gold py-5 text-lg uppercase tracking-widest font-black">
                            Add Task
                        </button>
                    </form>
                </Modal>

            </main>
        </div>
    );
};

export default Dashboard;
