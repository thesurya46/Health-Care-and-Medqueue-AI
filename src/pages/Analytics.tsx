import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchHospitalDetails } from '../lib/api';

const Analytics = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fullHospital = await fetchHospitalDetails('apollo-delhi');

                // Transform API data to UI format
                const transformedData = {
                    metrics: {
                        avgWaitTime: fullHospital.analytics.avgWaitTime,
                        dailyPatients: fullHospital.analytics.dailyPatients,
                        // Bed Utilization based on Occupied / Total
                        bedUtilization: Math.round((fullHospital.beds.occupied / fullHospital.beds.total) * 100),
                        // Satisfaction Rate (0-100) to 5-star scale
                        patientSatisfaction: (fullHospital.analytics.satisfactionRate / 20).toFixed(1),
                        // Extract array of numbers/strings
                        weeklyTrend: fullHospital.analytics.weeklyTrend.map((d: any) => d.patients),
                        peakHours: fullHospital.analytics.peakHours.map((h: any) => h.hour)
                    },
                    currentQueue: fullHospital.queue.length
                };

                setData(transformedData);
            } catch (error) {
                console.error('Failed to load analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
                        <h1 className="text-4xl font-black mb-2">Hospital Analytics</h1>
                        <p className="text-gray-400">Performance metrics and insights</p>
                    </div>
                    <div className="flex items-center gap-3 px-2 text-primary font-black">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">MQ</div>
                        <span className="font-bold text-xl tracking-tight uppercase italic">MedQueue</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading analytics data...</div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Clock className="text-blue-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.metrics.avgWaitTime} min</h3>
                            <p className="text-sm text-gray-400 font-semibold">Avg Wait Time</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                                <TrendingUp size={12} />
                                <span>15% improvement</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <Users className="text-green-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.metrics.dailyPatients}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Daily Patients</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                                <TrendingUp size={12} />
                                <span>8% increase</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <BarChart3 className="text-purple-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.metrics.bedUtilization}%</h3>
                            <p className="text-sm text-gray-400 font-semibold">Bed Utilization</p>
                            <div className="mt-2 text-xs text-gray-400">
                                Optimal range
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                                    <Star className="text-yellow-400" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{data?.metrics.patientSatisfaction}</h3>
                            <p className="text-sm text-gray-400 font-semibold">Patient Satisfaction</p>
                            <div className="mt-2 text-xs text-yellow-400">
                                ⭐⭐⭐⭐⭐
                            </div>
                        </motion.div>
                    </div>

                    {/* Weekly Trend Chart */}
                    <div className="glass rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Weekly Patient Trend</h2>
                        <div className="flex items-end justify-between gap-4 h-64">
                            {data?.metrics.weeklyTrend.map((count: number, i: number) => {
                                const maxCount = Math.max(...data.metrics.weeklyTrend);
                                const height = (count / maxCount) * 100;

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="text-sm font-bold text-gray-400">{count}</div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                            className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-xl min-h-[20px]"
                                        />
                                        <div className="text-xs font-bold text-gray-500">{days[i]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Peak Hours & Current Queue */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass rounded-3xl p-8">
                            <h2 className="text-xl font-bold mb-6">Peak Hours</h2>
                            <div className="space-y-4">
                                {data?.metrics.peakHours.map((hour: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                                <Clock className="text-primary" size={16} />
                                            </div>
                                            <span className="font-bold">{hour}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-semibold">High Traffic</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-8">
                            <h2 className="text-xl font-bold mb-6">Current Status</h2>
                            <div className="space-y-6">
                                <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-400 font-semibold">Active Queue</span>
                                        <span className="text-2xl font-black text-primary">{data?.currentQueue}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data?.currentQueue / 10) * 100}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5">
                                    <div className="text-sm text-gray-400 font-semibold mb-3">Today's Summary</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xl font-black text-white">{data?.metrics.dailyPatients}</div>
                                            <div className="text-xs text-gray-500">Patients Served</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-secondary">{data?.metrics.avgWaitTime}m</div>
                                            <div className="text-xs text-gray-500">Avg Wait</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
