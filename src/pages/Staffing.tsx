import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, ArrowLeft, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchStaffing } from '../lib/api';

const Staffing = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchStaffing('apollo-delhi');

                // Transform API object to UI array format
                const transformedData = {
                    shiftChange: result.currentShift === 'Morning' ? '16:00' : result.currentShift === 'Evening' ? '00:00' : '08:00',
                    staff: [
                        { role: 'Doctors', total: Math.round(result.doctors * 2.5), onDuty: result.doctors, shift: result.currentShift },
                        { role: 'Nurses', total: Math.round(result.nurses * 2.5), onDuty: result.nurses, shift: result.currentShift },
                        { role: 'Support Staff', total: Math.round(result.support * 2.5), onDuty: result.support, shift: result.currentShift },
                    ]
                };

                setData(transformedData);
            } catch (error) {
                console.error('Failed to load staffing data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getTotalOnDuty = () => {
        return data?.staff.reduce((sum: number, s: any) => sum + s.onDuty, 0) || 0;
    };

    const getTotalStaff = () => {
        return data?.staff.reduce((sum: number, s: any) => sum + s.total, 0) || 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/medqueue')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Queue
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black mb-2">Staffing Overview</h1>
                        <p className="text-gray-400">Current shift status and staff allocation</p>
                    </div>
                    <div className="flex items-center gap-3 px-2 text-primary font-black">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">MQ</div>
                        <span className="font-bold text-xl tracking-tight uppercase italic">MedQueue</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading staffing data...</div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Users className="text-blue-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{getTotalStaff()}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Total Staff</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <UserCheck className="text-green-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{getTotalOnDuty()}</h3>
                            <p className="text-sm text-gray-400 font-semibold">On Duty</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <Calendar className="text-purple-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">Day</h3>
                            <p className="text-sm text-gray-400 font-semibold">Current Shift</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                                    <Clock className="text-orange-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.shiftChange || '18:00'}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Shift Change</p>
                        </motion.div>
                    </div>

                    {/* Staff Breakdown */}
                    <div className="glass rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Staff Distribution</h2>
                        <div className="space-y-6">
                            {data?.staff.map((member: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                                                <Users className="text-primary" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{member.role}</h3>
                                                <p className="text-sm text-gray-400">Shift: {member.shift}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-primary">{member.onDuty}</span>
                                                <span className="text-gray-500 font-bold">/ {member.total}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-semibold mt-1">
                                                {Math.round((member.onDuty / member.total) * 100)}% Active
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(member.onDuty / member.total) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-primary to-blue-400"
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-black text-white">{member.total}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Total</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-green-400">{member.onDuty}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">On Duty</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-gray-400">{member.total - member.onDuty}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Off Duty</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staffing;
