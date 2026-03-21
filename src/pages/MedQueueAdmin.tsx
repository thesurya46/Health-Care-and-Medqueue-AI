import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Bed,
    TrendingUp,
    Plus,
    BarChart3,
    Activity,
    Settings,
    MoreVertical,
    LogOut,
    Bell,
    CheckCircle2,
    Loader2,
    X,
    Zap,
    MapPin,
    Phone,
    Stethoscope
} from 'lucide-react';
import BedAllocation from '../components/BedAllocation';
import SymptomChecker from '../components/SymptomChecker';
import { fetchHospitalDetails, predictWaitTime, sendBookingNotification, admitPatient, callInPatient } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/ProtectedRoute';
import PixelButton from '../components/PixelButton';

const MedQueueAdmin = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const hospitalId = user?.hospitalId || 'apollo-delhi';
    const hospitalName = user?.hospitalName || 'Apollo Hospital';

    const [queue, setQueue] = useState<any[]>([]);
    const [hospitalData, setHospitalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notifyingId, setNotifyingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([
        { id: 1, title: 'Network Pulse', message: 'System healthy. Syncing with 602 medical hubs.', time: '5m ago', read: false },
        { id: 2, title: 'Surge Warning', message: 'Nearby hospital surge detected. Preparing for overflow.', time: '1h ago', read: true }
    ]);

    // Modal State
    const [admitModalOpen, setAdmitModalOpen] = useState(false);
    const [admitForm, setAdmitForm] = useState({
        name: '',
        phone: '',
        address: '',
        doctorType: 'General Physician'
    });

    const autoFillForm = () => {
        const firstNames = ['Rohan', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Raj', 'Meera', 'Suresh', 'Divya'];
        const lastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Chopra', 'Desai'];
        const localities = ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'MG Road', 'HSR Layout', 'BTM Layout'];
        const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'];
        const doctorTypes = ['General Physician', 'Cardiologist', 'Pediatrician', 'Orthopedic', 'Dermatologist', 'Neurologist'];

        setAdmitForm({
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            address: `${localities[Math.floor(Math.random() * localities.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
            doctorType: doctorTypes[Math.floor(Math.random() * doctorTypes.length)]
        });
    };

    const stats = [
        { label: 'Total OPD Today', value: hospitalData?.analytics?.dailyPatients || 'Data Unavailable', icon: Users, color: 'text-blue-500' },
        { label: 'Available Beds', value: hospitalData?.beds?.available != null ? hospitalData.beds.available : 'Data Unavailable', icon: Bed, color: 'text-green-500' },
        { label: 'Surge Risk', value: hospitalData?.analytics ? (hospitalData.analytics.currentLoad > 80 ? 'Critical' : 'Normal') : 'Data Unavailable', icon: TrendingUp, color: hospitalData?.analytics?.currentLoad > 80 ? 'text-red-500' : 'text-yellow-500' },
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchHospitalDetails(hospitalId);
                setHospitalData(data);

                // Get ML Prediction for the first person in queue
                const mlPrediction = await predictWaitTime({
                    current_length: data.queue.length,
                    avg_consult_time: 15.0,
                    doctors_available: 3,
                    hour_of_day: new Date().getHours()
                });

                const mapped = data.queue.map((q: any, index: number) => ({
                    name: q.name || 'Patient ' + q.token.split('-')[1],
                    id: '#' + q.token,
                    // Use ML prediction for the first patient, simulated decay for others
                    wait: index === 0 ? mlPrediction.estimated_wait_minutes + ' mins' : (q.wait || (index * 5)) + ' mins',
                    status: 'Waiting',
                    phone: q.phone || "+916371401928",
                    surge: mlPrediction.surge_detected
                }));
                setQueue(mapped);
            } catch (error) {
                console.error("Queue fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        // Optional: Poll for updates every 10 seconds for real-time feel
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [hospitalId]);

    const notifyPatient = async (patient: any) => {
        setNotifyingId(patient.id);
        try {
            await sendBookingNotification(patient.phone, hospitalName, "NEXT TURN");
            setSuccessMsg(`Notification sent to ${patient.name}`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error) {
            console.error("Notify error", error);
        } finally {
            setNotifyingId(null);
        }
    };

    const handleAdmitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await admitPatient(hospitalId, {
                name: admitForm.name,
                phone: admitForm.phone,
                address: admitForm.address,
                doctorType: admitForm.doctorType
            });
            setSuccessMsg(`New Patient Admitted: ${result.patient.token}`);

            // Add notification
            const newNotif = {
                id: Date.now(),
                title: 'New Admittance',
                message: `Patient ${result.patient.name} admitted with token ${result.patient.token}.`,
                time: 'Just now',
                read: false
            };
            setNotifications([newNotif, ...notifications]);

            setTimeout(() => setSuccessMsg(null), 3000);

            // Close modal and reset form
            setAdmitModalOpen(false);
            setAdmitForm({ name: '', phone: '', address: '', doctorType: 'General Physician' });

            // Refresh data
            const data = await fetchHospitalDetails(hospitalId);
            setHospitalData(data);
            setQueue(data.queue.map((q: any, index: number) => ({
                name: q.name || 'Patient ' + q.token.split('-')[1],
                id: '#' + q.token,
                wait: (q.wait || index * 5) + ' mins',
                status: 'Waiting',
                phone: q.phone || "+916371401928"
            })));
        } catch (error) {
            console.error("Admit error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCallIn = async (patient: any) => {
        setNotifyingId(patient.id);
        try {
            await callInPatient(hospitalId, patient.id);
            setSuccessMsg(`${patient.name} has been called in.`);
            setTimeout(() => setSuccessMsg(null), 3000);
            // Update local state by removing the patient
            setQueue(prev => prev.filter(p => p.id !== patient.id));
        } catch (error) {
            console.error("Call in error", error);
        } finally {
            setNotifyingId(null);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
            {/* Notification Toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-10 right-10 bg-secondary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border border-white/20"
                    >
                        <CheckCircle2 size={24} />
                        <span className="font-bold">{successMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admittance Modal */}
            <AnimatePresence>
                {admitModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setAdmitModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-white/10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setAdmitModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                    <Plus className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Admit Patient</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Manual Entry Details</p>
                                </div>
                            </div>

                            <form onSubmit={handleAdmitSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Patient Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={admitForm.name}
                                        onChange={(e) => setAdmitForm({ ...admitForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                            <input
                                                type="tel"
                                                required
                                                value={admitForm.phone}
                                                onChange={(e) => setAdmitForm({ ...admitForm, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors font-medium"
                                                placeholder="+91..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Department</label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                            <select
                                                value={admitForm.doctorType}
                                                onChange={(e) => setAdmitForm({ ...admitForm, doctorType: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors font-medium appearance-none"
                                            >
                                                <option className="bg-[#1a1a1a]">General Physician</option>
                                                <option className="bg-[#1a1a1a]">Cardiologist</option>
                                                <option className="bg-[#1a1a1a]">Pediatrician</option>
                                                <option className="bg-[#1a1a1a]">Orthopedic</option>
                                                <option className="bg-[#1a1a1a]">Neurologist</option>
                                                <option className="bg-[#1a1a1a]">Emergency</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-500" size={14} />
                                        <textarea
                                            rows={2}
                                            value={admitForm.address}
                                            onChange={(e) => setAdmitForm({ ...admitForm, address: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors font-medium resize-none text-sm"
                                            placeholder="Residential Address"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={autoFillForm}
                                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 font-bold flex items-center gap-2 transition-all text-xs uppercase tracking-wider"
                                    >
                                        <Zap size={16} /> Auto-Fill
                                    </button>
                                    <PixelButton type="submit" color="primary" className="flex-1">
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Admit Patient
                                    </PixelButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Header Toggle */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/50 sticky top-0 z-50">
                <div className="flex items-center gap-3" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">MQ</div>
                    <span className="font-bold uppercase italic text-white">MedQueue</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-white bg-white/5 rounded-xl border border-white/10"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#0a0a0a] transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col p-6 shrink-0`}>
                <div className="flex items-center gap-3 mb-10 px-2 text-primary font-black cursor-pointer hidden lg:flex" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">MQ</div>
                    <span className="font-bold text-xl tracking-tight uppercase italic text-white">MedQueue</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => navigate('/medqueue')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    >
                        <Activity size={18} />
                        Live Queue
                    </button>
                    <button
                        onClick={() => navigate('/wards-beds')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 hover:bg-white/5 hover:text-white"
                    >
                        <Bed size={18} />
                        Wards & Beds
                    </button>
                    <button
                        onClick={() => navigate('/staffing')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 hover:bg-white/5 hover:text-white"
                    >
                        <Users size={18} />
                        Staffing
                    </button>
                    <button
                        onClick={() => navigate('/analytics')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 hover:bg-white/5 hover:text-white"
                    >
                        <BarChart3 size={18} />
                        Analytics
                    </button>
                    <button
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 hover:bg-white/5 hover:text-white opacity-50 cursor-not-allowed"
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                </nav>

                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors text-sm mt-auto font-bold uppercase tracking-wider"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Hospital Command Center</h1>
                        <p className="text-gray-500 font-medium">{hospitalName} • <span className="text-primary">Live Infrastructure</span></p>
                    </motion.div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all relative ${showNotifications ? 'text-primary border-primary/20 bg-primary/5' : ''}`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0a0a0a]" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 glass rounded-[2rem] border border-white/10 shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-white">System Alerts</h3>
                                                <button
                                                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                                    className="text-[10px] font-bold text-primary hover:underline uppercase"
                                                >
                                                    Mark all read
                                                </button>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            className={`p-5 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary/5' : ''}`}
                                                        >
                                                            {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-full" />}
                                                            <p className={`text-xs font-bold mb-1 ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                                            <p className="text-[10px] text-gray-500 leading-relaxed">{n.message}</p>
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-2 italic">{n.time}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-gray-600">
                                                        <Activity size={24} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No Active Alerts</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 text-center bg-white/5">
                                                <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                                    Infrastructure Audit Log
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => {
                                setAdmitModalOpen(true);
                                autoFillForm(); // Optional: Auto-fill on open for speed
                            }}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-wider text-xs border border-white/10 hover:scale-105 active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Admittance
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <MoreVertical className="text-gray-700" size={18} />
                            </div>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h2>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Queue Management */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="glass rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-3xl">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Users className="text-primary" size={20} />
                                    Live OPD Queue
                                </h3>
                                <div className="flex gap-2 bg-black/40 p-1 rounded-full border border-white/5">
                                    <button className="text-[10px] px-4 py-1.5 rounded-full bg-primary/20 text-primary font-bold transition-all">Today</button>
                                    <button className="text-[10px] px-4 py-1.5 rounded-full text-gray-500 hover:text-white font-bold transition-all">History</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {loading && queue.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 gap-4">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Neural Sync in Progress...</p>
                                    </div>
                                ) : queue.map((patient, _i) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.05] transition-all group gap-4 relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-5 w-full sm:w-auto z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                {patient.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{patient.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{patient.id} • Verified</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto z-10">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] text-gray-600 mb-1 font-black uppercase tracking-widest">Wait Prediction</p>
                                                <p className="text-sm font-black text-primary italic">{patient.wait}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => notifyPatient(patient)}
                                                    disabled={notifyingId === patient.id}
                                                    className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-primary/20 hover:text-primary transition-all border border-white/5 disabled:opacity-50 active:scale-95"
                                                    title="Notify Patient via SMS"
                                                >
                                                    {notifyingId === patient.id && !successMsg?.includes('called') ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                                                </button>
                                                <PixelButton
                                                    onClick={() => handleCallIn(patient)}
                                                    color="primary"
                                                >
                                                    Call In
                                                </PixelButton>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        <BedAllocation wards={hospitalData?.wards || []} />
                    </div>

                    {/* Widgets Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest mb-4">
                                <TrendingUp size={16} />
                                Prediction Insight
                            </div>
                            <h4 className="text-lg font-bold text-white mb-3">Surge Warning</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-bold">
                                OPD influx predicted to increase by <span className="text-primary font-black animate-pulse underline">15.4%</span> between 8 PM and 10 PM.
                                <br /><br />
                                Recommendation: Activate Ward D overflow protocol and stagger nursing shifts.
                            </p>
                        </section>

                        <div className="h-[600px]">
                            <SymptomChecker />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedQueueAdmin;
