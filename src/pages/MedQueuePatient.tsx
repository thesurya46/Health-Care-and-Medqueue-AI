import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Clock,
    Heart,
    Activity,
    Bell,
    Map as MapIcon,
    LogOut,
    Stethoscope,
    Users,
    CheckCircle2,
    Loader2,
    X,
    User,
    Home,
    Download,
    FileText,
    Shield
} from 'lucide-react';
import { useAuth } from '../components/ProtectedRoute';
import { fetchHospitals, admitPatient } from '../lib/api';
import PixelButton from '../components/PixelButton';
import { AnimatePresence } from 'framer-motion';

const MedQueuePatient = () => {
    const { signOut, user } = useAuth();
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingHospital, setBookingHospital] = useState<any | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
    const [notifications, setNotifications] = useState<any[]>([
        { id: 1, title: 'Welcome to MedQueue', message: 'You can now book tokens at 60+ hospitals.', time: '2m ago', read: false, type: 'info' },
        { id: 2, title: 'Surge Alert', message: 'High patient inflow detected at AIIMS Delhi.', time: '1h ago', read: true, type: 'warning' }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [bookingData, setBookingData] = useState({
        name: user?.name || '',
        address: '',
        doctorType: 'General Physician',
        phone: '+916371401928'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [bookingHistory, setBookingHistory] = useState<any[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('medQueueHistory');
        if (savedHistory) {
            setBookingHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        const loadHospitals = async () => {
            try {
                const data = await fetchHospitals();
                setHospitals(data);
            } catch (error) {
                console.error("Error fetching hospitals", error);
            } finally {
                setLoading(false);
            }
        };
        loadHospitals();
    }, []);

    const filteredHospitals = useMemo(() => {
        return hospitals.filter((h, index) => {
            // Guard against missing properties
            const hName = h?.name || '';
            const hAddress = h?.address || '';
            const hType = h?.type || 'General';

            const matchesSearch = hName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hAddress.toLowerCase().includes(searchTerm.toLowerCase());

            if (!activeCategory) return matchesSearch;

            if (activeCategory === 'Emergency') {
                return matchesSearch && (hType === 'Emergency' || h.surge_detected);
            }
            if (activeCategory === 'Diagnostics') {
                return matchesSearch && hType === 'Diagnostics';
            }
            if (activeCategory === 'Min Wait') {
                const wait = h.avgWaitTime || h.wait_time || 0;
                return matchesSearch && wait < 20;
            }
            if (activeCategory === 'Nearby') {
                // Mock nearby: just show hospitals in the first city in the list or similar
                return matchesSearch && index % 3 === 0; // Simple mock for diversity
            }
            return matchesSearch;
        }).sort((a, b) => {
            if (activeCategory === 'Min Wait') {
                return (a.avgWaitTime || a.wait_time) - (b.avgWaitTime || b.wait_time);
            }
            return 0;
        });
    }, [hospitals, searchTerm, activeCategory]);

    const handleBookToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingHospital) return;

        setIsSubmitting(true);
        try {
            const result = await admitPatient(bookingHospital.id, {
                name: bookingData.name,
                phone: bookingData.phone,
                address: bookingData.address,
                doctorType: bookingData.doctorType
            });

            setBookingSuccess({
                token: result.patient.token,
                hospital: bookingHospital.name,
                name: bookingData.name,
                doctor: bookingData.doctorType,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });

            const newBooking = {
                id: Date.now(),
                token: result.patient.token,
                hospital: bookingHospital.name,
                doctor: bookingData.doctorType,
                name: bookingData.name,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                status: 'Scheduled'
            };
            const updatedHistory = [newBooking, ...bookingHistory];
            setBookingHistory(updatedHistory);
            localStorage.setItem('medQueueHistory', JSON.stringify(updatedHistory));

            // Add notification
            const newNotif = {
                id: Date.now(),
                title: 'Token Confirmed',
                message: `Your token ${result.patient.token} for ${bookingHospital.name} is scheduled.`,
                time: 'Just now',
                read: false,
                type: 'success'
            };
            setNotifications([newNotif, ...notifications]);

            // Show toast
            setToast('Booking Confirmed!');
            setTimeout(() => setToast(null), 3000);

            setBookingHospital(null);
            // Reset form
            setBookingData({
                name: user?.name || '',
                address: '',
                doctorType: 'General Physician',
                phone: '+916371401928'
            });
        } catch (error) {
            console.error("Booking error", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadPrescription = (data: any) => {
        const content = `
MEDQUEUE DIGITAL PRESCRIPTION & TOKEN
--------------------------------------
Token ID: ${data.token}
Hospital: ${data.hospital}
Date: ${data.date}
Time: ${data.time}

PATIENT DETAILS:
Name: ${data.name}
Consultation For: ${data.doctor}

INSTRUCTIONS:
1. Please reach the hospital 15 minutes before your estimated time.
2. Show this digital token at the reception.
3. Keep your ID proof handy.

This is an AI-generated digital token.
Powered by MedQueue AI
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Prescription_${data.token}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans pb-12">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 100, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[250] pointer-events-none"
                    >
                        <div className="bg-primary/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-3">
                            <Bell size={18} className="animate-bounce" />
                            <span className="font-bold text-sm uppercase tracking-tight">{toast}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {bookingSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                    >
                        <div className="glass max-w-lg w-full p-8 rounded-[2.5rem] border-primary/30 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
                            <button
                                onClick={() => setBookingSuccess(null)}
                                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                                    <CheckCircle2 size={40} className="text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Booking Successful!</h2>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Digital Token Generated</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Activity size={80} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Your Token ID</p>
                                    <p className="text-4xl font-black text-primary tracking-tighter">{bookingSuccess.token}</p>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Hospital</p>
                                            <p className="text-sm font-bold text-white truncate">{bookingSuccess.hospital}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Doctor Type</p>
                                            <p className="text-sm font-bold text-white">{bookingSuccess.doctor}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <PixelButton color="primary" onClick={() => downloadPrescription(bookingSuccess)}>
                                    <Download size={18} /> Download Prescription
                                </PixelButton>
                                <PixelButton color="neutral" onClick={() => setBookingSuccess(null)}>
                                    Close Dashboard
                                </PixelButton>
                            </div>

                            <p className="text-center text-[10px] text-gray-600 font-bold mt-6 uppercase tracking-widest italic">
                                Presented by MedQueue Real-time Smart Infrastructure
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass max-w-2xl w-full p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                        <FileText className="text-primary" size={24} />
                                        OPD Booking History
                                    </h2>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Your recent visits and scheduled tokens</p>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                {bookingHistory.length > 0 ? (
                                    bookingHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors relative group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-lg font-bold text-white mb-1">{item.hospital}</p>
                                                    <p className="text-xs text-primary font-bold">{item.doctor}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20">
                                                        {item.status || 'Active'}
                                                    </span>
                                                    <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase">{item.date} • {item.time}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Token Number</p>
                                                    <p className="text-xl font-black text-white tracking-widest">{item.token}</p>
                                                </div>
                                                <PixelButton
                                                    color="neutral"
                                                    className="py-2 px-4 h-auto text-[10px]"
                                                    onClick={() => downloadPrescription(item)}
                                                >
                                                    <Download size={14} /> Re-download
                                                </PixelButton>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <FileText size={32} className="text-gray-700" />
                                        </div>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No history found</p>
                                        <p className="text-gray-600 text-xs mt-1">Your booked tokens will appear here.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    Only showing history for the current device
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Form Modal */}
            <AnimatePresence>
                {bookingHospital && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass max-w-xl w-full p-10 rounded-[3rem] border-white/10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setBookingHospital(null)}
                                className="absolute top-8 right-8 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                    <Stethoscope className="text-primary" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Confirm Appointment</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase">{bookingHospital.name}</p>
                                </div>
                            </div>

                            <form onSubmit={handleBookToken} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <User size={12} /> Patient Full Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={bookingData.name}
                                            onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                            placeholder="Enter name"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Bell size={12} /> Phone Number
                                        </label>
                                        <input
                                            required
                                            type="tel"
                                            value={bookingData.phone}
                                            onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                            placeholder="+91"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                        <Home size={12} /> Permanent Address
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={bookingData.address}
                                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                        placeholder="Enter your current residential address"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white font-bold resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} /> Consult Which Doctor?
                                    </label>
                                    <select
                                        value={bookingData.doctorType}
                                        onChange={(e) => setBookingData({ ...bookingData, doctorType: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="General Physician" className="bg-[#0a0a0a]">General Physician</option>
                                        <option value="Cardiologist" className="bg-[#0a0a0a]">Cardiologist</option>
                                        <option value="Dermatologist" className="bg-[#0a0a0a]">Dermatologist</option>
                                        <option value="Pediatrician" className="bg-[#0a0a0a]">Pediatrician</option>
                                        <option value="Neurologist" className="bg-[#0a0a0a]">Neurologist</option>
                                        <option value="Oncologist" className="bg-[#0a0a0a]">Oncologist</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <PixelButton
                                        type="submit"
                                        color="primary"
                                        className="w-full py-4"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Shield size={18} /> Confirm Digital Booking
                                            </span>
                                        )}
                                    </PixelButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">MQ</div>
                        <span className="font-bold text-xl tracking-tighter uppercase italic text-white">MedQueue <span className="text-primary">Patient</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="p-2 text-gray-400 hover:text-white transition-colors relative group"
                            title="My Bookings"
                        >
                            <FileText size={20} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">History</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 transition-colors ${showNotifications ? 'text-primary bg-primary/10 rounded-xl' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0a0a0a]" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 glass rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                                                <button
                                                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                                    className="text-[10px] font-bold text-primary hover:underline uppercase"
                                                >
                                                    Mark all read
                                                </button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary/5' : ''}`}
                                                        >
                                                            {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                                                            <p className={`text-xs font-bold mb-1 ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-2">{n.time}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <Bell size={24} className="mx-auto mb-2 text-gray-700" />
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No new alerts</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 text-center bg-white/5">
                                                <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                                    View All Activity
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white uppercase">{user?.name || 'Patient'}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Verified Account</p>
                            </div>
                            <button onClick={signOut} className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-10">
                {/* Hero / Search */}
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-white mb-4 tracking-tighter uppercase"
                    >
                        Find Medical Help <span className="text-primary">Instantly</span>
                    </motion.h1>
                    <p className="text-gray-400 font-medium mb-8 max-w-2xl">
                        Real-time wait times and bed availability for top hospitals near you. Book your token or navigate to the best emergency care.
                    </p>

                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by hospital name, specialty, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary transition-all text-white shadow-2xl"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                    {[
                        { icon: Activity, label: 'All', color: 'text-white' },
                        { icon: Stethoscope, label: 'Emergency', color: 'text-red-500' },
                        { icon: Activity, label: 'Diagnostics', color: 'text-blue-500' },
                        { icon: MapPin, label: 'Nearby', color: 'text-green-500' },
                        { icon: Clock, label: 'Min Wait', color: 'text-orange-500' },
                    ].map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveCategory(cat.label === 'All' ? null : (activeCategory === cat.label ? null : cat.label))}
                            className={`glass p-6 rounded-2xl border transition-all text-center group ${(cat.label === 'All' && activeCategory === null) || activeCategory === cat.label
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className={`w-12 h-12 ${cat.color} bg-white/5 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                                <cat.icon size={24} />
                            </div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{cat.label}</p>
                        </button>
                    ))}
                </div>

                {/* Hospital List */}
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="text-primary" size={20} />
                        Live Medical Hubs
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
                        {hospitals.length} INSTITUTIONS INDEXED
                    </span>
                </h2>

                <div className="space-y-6">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Activity className="animate-spin text-primary mx-auto mb-4" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest">Scanning Network...</p>
                        </div>
                    ) : filteredHospitals.map((hospital) => (
                        <motion.div
                            key={hospital.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">{hospital.name}</h3>
                                        {hospital.surge_detected && (
                                            <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-500/20 animate-pulse">
                                                High Surge
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium mb-6 flex items-center gap-2">
                                        <MapPin size={14} /> {hospital.address}
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Queue Size</p>
                                            <p className="text-xl font-black text-white flex items-center gap-2">
                                                <Users size={18} className="text-primary" />
                                                {hospital.currentQueue ?? hospital.queue_size} <span className="text-[10px] text-gray-600 font-bold uppercase font-normal tracking-normal italic">Patients</span>
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Wait Time</p>
                                            <p className="text-xl font-black text-primary flex items-center gap-2 italic">
                                                <Clock size={18} />
                                                {hospital.avgWaitTime ?? hospital.wait_time} <span className="text-[10px] text-gray-600 font-bold uppercase font-normal tracking-normal">mins</span>
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Avail. Beds</p>
                                            <p className="text-xl font-black text-green-500 flex items-center gap-2">
                                                <Heart size={18} />
                                                {hospital.availableBeds ?? hospital.available_beds} <span className="text-[10px] text-gray-600 font-bold uppercase font-normal tracking-normal">Free</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 shrink-0">
                                    <PixelButton
                                        onClick={() => setBookingHospital(hospital)}
                                        color="primary"
                                        className="w-full"
                                    >
                                        Book Token
                                    </PixelButton>
                                    <PixelButton
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`)}
                                        color="neutral"
                                        className="w-full"
                                    >
                                        <MapIcon size={16} /> Get Directions
                                    </PixelButton>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div >
    );
};

export default MedQueuePatient;
