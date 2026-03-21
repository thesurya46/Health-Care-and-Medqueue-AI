import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bed, Activity, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWardsBeds } from '../lib/api';

const WardsBeds = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchWardsBeds('apollo-delhi');
                setData(result);
            } catch (error) {
                console.error('Failed to load wards data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

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
                        <h1 className="text-4xl font-black mb-2">Wards & Beds</h1>
                        <p className="text-gray-400">Real-time bed availability and ward occupancy</p>
                    </div>
                    <div className="flex items-center gap-3 px-2 text-primary font-black">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">MQ</div>
                        <span className="font-bold text-xl tracking-tight uppercase italic">MedQueue</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading ward data...</div>
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
                                    <Bed className="text-blue-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.summary?.total || 0}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Total Beds</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                    <Activity className="text-red-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.summary?.occupied || 0}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Occupied</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="text-green-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">
                                {data?.summary?.available || 0}
                            </h3>
                            <p className="text-sm text-gray-400 font-semibold">Available</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <Users className="text-purple-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">
                                {data?.summary?.total
                                    ? Math.round((data.summary.occupied / data.summary.total) * 100)
                                    : 0}%
                            </h3>
                            <p className="text-sm text-gray-400 font-semibold">Occupancy Rate</p>
                        </motion.div>
                    </div>

                    {/* Ward Details */}
                    <div className="glass rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Ward Details</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {data?.wards.map((ward: any, i: number) => {
                                const available = ward.total - ward.occupied;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{ward.name}</h3>
                                                <p className="text-sm text-gray-400">
                                                    {ward.occupied}/{ward.total} beds occupied
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${available > 5 ? 'bg-green-500/20 text-green-400' :
                                                available > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {available} Available
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(ward.occupied / ward.total) * 100}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={`h-full ${ward.available > 5 ? 'bg-green-500' :
                                                    ward.available > 0 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                            />
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-xl font-black text-white">{ward.total}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase">Total</div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-red-400">{ward.occupied}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase">Occupied</div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-green-400">{ward.available}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase">Free</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardsBeds;
