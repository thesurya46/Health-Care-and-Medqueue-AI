import { motion } from 'framer-motion';
import {
    Activity, GraduationCap, ChevronRight, Shield, Zap, Globe,
    Clock, Users, Brain, Heart, TrendingUp, Target, Award,
    BookOpen, Briefcase, Sparkles, CheckCircle, BarChart3,
    Stethoscope, Calendar, Bell, MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PixelButton from '../components/PixelButton';

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-black">AI</span>
                    </div>
                    <span className="text-white">Health & Ed</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
                    <Link to="/patient" className="hover:text-white transition-colors">MedQueue</Link>
                    <Link to="/edumatch" className="hover:text-white transition-colors">EduMatch</Link>
                    <a href="#features" className="hover:text-white transition-colors">Technology</a>
                </div>
                <div className="flex items-center gap-4">
                    <PixelButton
                        onClick={() => navigate('/auth')}
                        className="hidden sm:flex"
                        color="primary"
                    >
                        Sign In
                    </PixelButton>
                    <button className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10">
                        <Activity size={20} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-20 md:pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-xs font-black tracking-widest uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
                        The next frontier of intelligent infrastructure
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 tracking-tighter text-white leading-[1.1]">
                        Efficiency for <span className="text-primary italic">Healthcare</span>,<br />
                        Precision for <span className="text-secondary italic">Education</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
                        Revolutionizing patient flow and career pathways through advanced predictive AI and person-centric neural mapping.
                    </p>
                </motion.div>

                {/* Product Selection */}
                <div className="grid md:grid-cols-2 gap-8 mt-20">
                    {/* MedQueue Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/patient')}
                        className="glass p-12 rounded-[2rem] text-left group cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Activity className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">MedQueue AI</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Proprietary predictive AI for hospital queue management and bed availability. Reduce wait times by up to 70%.
                        </p>
                        <PixelButton onClick={() => navigate('/patient')} color="primary">
                            Launch Platform <ChevronRight className="w-4 h-4" />
                        </PixelButton>
                    </motion.div>

                    {/* EduMatch Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/edumatch')}
                        className="glass p-12 rounded-[2rem] text-left group cursor-pointer border-secondary/20 hover:border-secondary/50 transition-all"
                    >
                        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                            <GraduationCap className="w-8 h-8 text-secondary" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">EduMatch AI</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Personalized career counseling using deep-learning knowledge mapping. Guiding students towards their ideal destiny.
                        </p>
                        <PixelButton onClick={() => navigate('/edumatch')} color="secondary">
                            Start Counseling <ChevronRight className="w-4 h-4" />
                        </PixelButton>
                    </motion.div>
                </div>
            </main>

            {/* Stats Section */}
            <section className="relative z-10 py-20 border-t border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h3 className="text-5xl font-black text-primary mb-2">70%</h3>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Wait Time Reduction</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            <h3 className="text-5xl font-black text-secondary mb-2">94%</h3>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Career Match Accuracy</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <h3 className="text-5xl font-black text-white mb-2">2.5M+</h3>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Patients Served</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                            <h3 className="text-5xl font-black text-white mb-2">500K+</h3>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Students Guided</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* MedQueue Features */}
            <section className="relative z-10 py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-primary font-black text-sm uppercase tracking-widest">Healthcare Innovation</span>
                        <h2 className="text-5xl font-black mt-4 mb-6">MedQueue AI Features</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Revolutionizing hospital operations with intelligent queue management and predictive analytics</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Clock, title: "Real-Time Wait Predictions", desc: "ML-powered wait time forecasting with 95% accuracy" },
                            { icon: Stethoscope, title: "Smart Triage System", desc: "AI symptom checker for priority classification" },
                            { icon: BarChart3, title: "Bed Availability Tracking", desc: "Live monitoring across all wards and departments" },
                            { icon: Bell, title: "Patient Notifications", desc: "Automated SMS alerts for appointments and updates" },
                            { icon: Users, title: "Queue Analytics", desc: "Comprehensive dashboard for hospital administrators" },
                            { icon: TrendingUp, title: "Surge Detection", desc: "Predictive alerts for patient influx patterns" },
                            { icon: Calendar, title: "Appointment Optimization", desc: "Smart scheduling to minimize wait times" },
                            { icon: Heart, title: "Emergency Prioritization", desc: "Instant escalation for critical cases" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-6 rounded-3xl border-white/5 hover:border-primary/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EduMatch Features */}
            <section className="relative z-10 py-32 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-secondary font-black text-sm uppercase tracking-widest">Education Intelligence</span>
                        <h2 className="text-5xl font-black mt-4 mb-6">EduMatch AI Features</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Empowering students with data-driven career guidance and personalized learning paths</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, title: "Aptitude Assessment", desc: "Comprehensive psychometric testing with AI analysis" },
                            { icon: Target, title: "Career Matching", desc: "95% accurate career recommendations based on profile" },
                            { icon: MessageSquare, title: "AI Mentor Chat", desc: "24/7 personalized counseling assistant" },
                            { icon: BookOpen, title: "Learning Path Design", desc: "Custom roadmaps for skill development" },
                            { icon: Briefcase, title: "Industry Insights", desc: "Real-time job market trends and salary data" },
                            { icon: Award, title: "Scholarship Finder", desc: "Matching students with funding opportunities" },
                            { icon: Sparkles, title: "Skill Gap Analysis", desc: "Identify and bridge competency gaps" },
                            { icon: CheckCircle, title: "Success Prediction", desc: "AI-powered career success probability scoring" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-6 rounded-3xl border-white/5 hover:border-secondary/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-secondary" />
                                </div>
                                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="relative z-10 py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-black mb-6">Real-World Impact</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">See how our AI platforms are transforming lives across the globe</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass p-10 rounded-[2rem] border-primary/20"
                        >
                            <Activity className="w-12 h-12 text-primary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Apollo Hospitals, Delhi</h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                "MedQueue AI reduced our average patient wait time from 45 minutes to just 12 minutes.
                                The predictive surge detection helped us optimize staffing during peak hours,
                                improving patient satisfaction scores by 82%."
                            </p>
                            <div className="flex gap-8 text-sm">
                                <div>
                                    <p className="text-primary font-black text-2xl">73%</p>
                                    <p className="text-gray-500 font-medium">Faster Service</p>
                                </div>
                                <div>
                                    <p className="text-primary font-black text-2xl">2,400</p>
                                    <p className="text-gray-500 font-medium">Daily Patients</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass p-10 rounded-[2rem] border-secondary/20"
                        >
                            <GraduationCap className="w-12 h-12 text-secondary mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Delhi Public School Network</h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                "EduMatch AI helped 94% of our students find careers aligned with their strengths and interests.
                                The AI mentor provided personalized guidance that traditional counseling couldn't match at scale."
                            </p>
                            <div className="flex gap-8 text-sm">
                                <div>
                                    <p className="text-secondary font-black text-2xl">94%</p>
                                    <p className="text-gray-500 font-medium">Match Rate</p>
                                </div>
                                <div>
                                    <p className="text-secondary font-black text-2xl">12K+</p>
                                    <p className="text-gray-500 font-medium">Students Guided</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Technology */}
            <section id="features" className="relative z-10 py-32 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-black mb-6">Built on Trust & Technology</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Enterprise-grade infrastructure powering critical services</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Shield className="w-10 h-10 text-white mb-6" />
                            <h4 className="text-xl font-bold mb-4">Privacy First</h4>
                            <p className="text-gray-400">HIPAA compliant healthcare data and strict student privacy protocols powered by end-to-end encryption.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <Zap className="w-10 h-10 text-white mb-6" />
                            <h4 className="text-xl font-bold mb-4">Real-time Predictions</h4>
                            <p className="text-gray-400">Our dual-core engine processes millions of data points every second to provide instant availability predictions.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Globe className="w-10 h-10 text-white mb-6" />
                            <h4 className="text-xl font-bold mb-4">Global Network</h4>
                            <p className="text-gray-400">Already serving institutions across 45 countries, creating a borderless ecosystem for health and education.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-gray-500 text-sm">© 2026 AI Health & Ed. All rights reserved.</p>
                    <div className="flex gap-8 text-gray-500 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
