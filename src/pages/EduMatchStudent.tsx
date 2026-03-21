import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    Trophy,
    CheckCircle2,
    Lock as LockIcon,
    ChevronRight,
    Flame,
    Brain,
    Loader2,
    Calendar,
    LogOut,
    Map as MapIcon,
    Target,
    MessageSquare
} from 'lucide-react';
import AptitudeTest from '../components/AptitudeTest';
import { chatWithAI, predictCareerMatch } from '../lib/api';
import { useAuth } from '../components/ProtectedRoute';
import PixelButton from '../components/PixelButton';


const EduMatchStudent = () => {
    const { signOut } = useAuth();
    const [showTest, setShowTest] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllMatches, setShowAllMatches] = useState(false);

    // Roadmap progression state
    const [currentMilestone, setCurrentMilestone] = useState(1); // 0: Test, 1: Analysis, 2: College, 3: Scholarship

    // Skills from aptitude test
    const [skillResults, setSkillResults] = useState({
        logical: 85,
        numerical: 78,
        verbal: 88,
        creative: 72,
        interpersonal: 80,
        practical: 75
    });

    // AI Mentor Chat State
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: "Hello Jasasvi! I'm your AI Career Mentor. I've analyzed your latest results—you have a strong logical foundation. What's on your mind today?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTalkingToAI, setIsTalkingToAI] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const systemPrompt = `You are an expert AI Career Mentor for EduMatch AI. 
    Your tone is encouraging, insightful, and professional. 
    You guide students based on their aptitude and interests. 
    Keep advice actionable and student-focused.`;

    // Handle aptitude test completion
    const handleTestComplete = (results?: any) => {
        if (results) {
            setSkillResults(results);
        }
        setShowTest(false);
    };

    // Dynamic milestones based on progress
    const milestones = [
        {
            id: 0,
            title: 'Aptitude Test',
            status: 'completed',
            date: 'Feb 10, 2026',
            view: 'test'
        },
        {
            id: 1,
            title: 'Career Match Analysis',
            status: currentMilestone >= 1 ? 'completed' : 'locked',
            date: currentMilestone >= 1 ? 'Completed' : 'Locked',
            view: 'dashboard'
        },
        {
            id: 2,
            title: 'College Shortlist',
            status: currentMilestone >= 2 ? 'completed' : currentMilestone === 1 ? 'active' : 'locked',
            date: currentMilestone >= 2 ? 'Completed' : currentMilestone === 1 ? 'Next Step' : 'Locked',
            view: 'colleges'
        },
        {
            id: 3,
            title: 'Scholarship Search',
            status: currentMilestone >= 3 ? 'completed' : currentMilestone === 2 ? 'active' : 'locked',
            date: currentMilestone >= 3 ? 'Completed' : currentMilestone === 2 ? 'Next Step' : 'Locked',
            view: 'scholarships'
        },
    ];

    useEffect(() => {
        const loadRecs = async () => {
            try {
                // In a real flow, this follows the AptitudeTest
                const mlRecs = await predictCareerMatch({
                    aptitude_scores: { logic: 92, verbal: 85, spatial: 78 },
                    interests: ["technology", "design"],
                    skills: ["react", "python"]
                });

                const mapped = mlRecs.matches.map((m: any) => ({
                    title: m.title,
                    match: Math.round(m.score),
                    probability: Math.round(mlRecs.success_probability * 100)
                }));

                setRecommendations(mapped);
            } catch (error) {
                console.error("Recs fetch error", error);
                setRecommendations([
                    { title: 'Software Architect', match: 94, probability: 88 },
                    { title: 'Data Scientist', match: 89, probability: 75 },
                    { title: 'UI/UX Designer', match: 82, probability: 90 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadRecs();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendToMentor = async () => {
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTalkingToAI(true);

        try {
            const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithAI([...history, userMsg], systemPrompt, 'education');
            setChatMessages(prev => [...prev, response.message]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of a connectivity issue with our knowledge base. Give me a moment and try asking again!" }]);
        } finally {
            setIsTalkingToAI(false);
        }
    };

    // Streak Logic
    const [streak, setStreak] = useState(1);

    useEffect(() => {
        const calculateStreak = () => {
            const today = new Date().toDateString();
            const lastLogin = localStorage.getItem('lastLoginDate');
            const currentStreak = parseInt(localStorage.getItem('loginStreak') || '0');

            if (lastLogin === today) {
                // Already logged in today, keep streak
                setStreak(currentStreak || 1);
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastLogin === yesterday.toDateString()) {
                    // Logged in yesterday, increment streak
                    const newStreak = currentStreak + 1;
                    setStreak(newStreak);
                    localStorage.setItem('loginStreak', newStreak.toString());
                } else {
                    // Missed a day or first time, reset to 1
                    setStreak(1);
                    localStorage.setItem('loginStreak', '1');
                }
                localStorage.setItem('lastLoginDate', today);
            }
        };

        calculateStreak();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans p-8 overflow-x-hidden">
            {/* Top Bar */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                        <GraduationCap className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold italic tracking-tight uppercase text-white">EduMatch <span className="text-secondary">AI</span></h1>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Hello, Jasasvi • Class 12th</p>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-orange-400 uppercase tracking-wider">
                        <Flame size={14} /> {streak} Day Streak
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={signOut}
                            className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                        <div className="w-11 h-11 bg-gradient-to-tr from-secondary to-green-300 rounded-xl p-[2px] shrink-0">
                            <div className="w-full h-full bg-[#0a0a0a] rounded-[10px] overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Jasasvi`} alt="avatar" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Roadmap Dashboard */}
                    {!showTest ? (
                        <section className="glass rounded-[2.5rem] p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <MapIcon size={100} className="text-secondary" />
                            </div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Your Career Roadmap</h2>
                                    <p className="text-xs text-gray-400">Complete each step to unlock the next stage</p>
                                </div>
                                <PixelButton
                                    onClick={() => setShowTest(true)}
                                    color="secondary"
                                    className="scale-90 md:scale-100"
                                >
                                    <Brain size={14} /> <span className="hidden sm:inline">Retake Aptitude Test</span><span className="sm:hidden">Retake</span>
                                </PixelButton>
                            </div>
                            <div className="flex justify-between items-start relative px-4 md:px-12 overflow-x-auto custom-scrollbar pb-6 gap-8 min-w-full">
                                <div className="absolute top-5 left-16 right-16 h-[2px] bg-white/5 z-0 hidden md:block" />
                                {milestones.map((m, i) => (
                                    <button
                                        key={i}
                                        disabled={m.status === 'locked'}
                                        className={`relative z-10 flex flex-col items-center text-center min-w-[100px] md:max-w-[120px] transition-all ${m.status === 'locked' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-all ${m.status === 'completed' ? 'bg-secondary text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                            m.status === 'active' ? 'bg-secondary/20 border-2 border-secondary text-secondary animate-pulse' :
                                                'bg-white/10 text-gray-600'
                                            }`}>
                                            {m.status === 'completed' ? <CheckCircle2 size={20} /> :
                                                m.status === 'locked' ? <LockIcon size={18} /> : (i + 1)}
                                        </div>
                                        <h4 className={`text-xs font-black mb-1 ${m.status === 'locked' ? 'text-gray-600' : 'text-white'}`}>{m.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{m.date}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Progress Action Button */}
                            <div className="mt-8 flex justify-center">
                                {currentMilestone < 3 && (
                                    <PixelButton
                                        onClick={() => setCurrentMilestone(prev => Math.min(prev + 1, 3))}
                                        color="secondary"
                                    >
                                        Complete Current Step & Unlock Next
                                        <ChevronRight size={18} />
                                    </PixelButton>
                                )}
                                {currentMilestone === 3 && (
                                    <div className="text-center">
                                        <CheckCircle2 size={32} className="text-secondary mx-auto mb-2" />
                                        <p className="text-sm font-bold text-secondary">All Milestones Completed! 🎉</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setShowTest(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                                <h2 className="text-2xl font-bold text-white">Aptitude Assessment</h2>
                            </div>
                            <AptitudeTest onComplete={handleTestComplete} />
                        </section>
                    )}

                    {/* Recommended Matches */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Top Career Matches</h2>
                            <button
                                onClick={() => setShowAllMatches(!showAllMatches)}
                                className="text-secondary flex items-center gap-1 text-sm font-semibold hover:underline transition-all"
                            >
                                {showAllMatches ? 'Show top 3' : 'See all matches'} <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {loading ? (
                                <p className="text-gray-500 italic text-sm">Synthesizing matches with Career Matcher AI...</p>
                            ) : (showAllMatches ? recommendations : recommendations.slice(0, 3)).map((rec: any, i: number) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="glass p-6 rounded-3xl border-white/5 hover:border-secondary/30 transition-all cursor-pointer group"
                                >
                                    <div className={`w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors`}>
                                        <Target className="text-secondary" size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-white">{rec.title}</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Match Score</p>
                                            <p className={`text-2xl font-black text-secondary`}>{rec.match}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-medium mb-1 font-bold">Success Prob.</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-secondary w-[${rec.probability}%] transition-all duration-1000`} style={{ width: `${rec.probability}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-white">{rec.probability}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Skills & Competencies Section */}
                    <section className="glass rounded-[2.5rem] p-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Skills & Competencies</h2>
                            <span className="text-xs text-secondary font-bold px-3 py-1 bg-secondary/10 rounded-lg border border-secondary/20">
                                AI Analyzed
                            </span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { skill: 'Logical Thinking', key: 'logical', color: 'bg-blue-500' },
                                { skill: 'Numerical Reasoning', key: 'numerical', color: 'bg-purple-500' },
                                { skill: 'Verbal Ability', key: 'verbal', color: 'bg-green-500' },
                                { skill: 'Creative Thinking', key: 'creative', color: 'bg-orange-500' },
                                { skill: 'Interpersonal Skills', key: 'interpersonal', color: 'bg-secondary' },
                                { skill: 'Practical Skills', key: 'practical', color: 'bg-pink-500' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">{item.skill}</span>
                                        <span className="text-sm font-black text-secondary">
                                            {skillResults[item.key as keyof typeof skillResults]}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${skillResults[item.key as keyof typeof skillResults]}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* College Shortlist Section */}
                    <section className="glass rounded-[2.5rem] p-10">
                        <h2 className="text-2xl font-bold text-white mb-6">College Shortlist</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'IIT Delhi', program: 'Computer Science', match: 94, deadline: 'Mar 15, 2026', logo: '🎓' },
                                { name: 'BITS Pilani', program: 'Information Systems', match: 89, deadline: 'Mar 20, 2026', logo: '🏛️' },
                                { name: 'NIT Trichy', program: 'Software Engineering', match: 87, deadline: 'Apr 1, 2026', logo: '🎯' },
                                { name: 'VIT Vellore', program: 'Data Science', match: 92, deadline: 'Mar 25, 2026', logo: '📚' }
                            ].map((college, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {college.logo}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-1">{college.name}</h3>
                                                <p className="text-sm text-gray-400 mb-2">{college.program}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar size={12} />
                                                    <span>Deadline: {college.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-secondary">{college.match}%</div>
                                            <div className="text-[10px] text-gray-500 font-bold">Match</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Scholarship Opportunities Section */}
                    <section className="glass rounded-[2.5rem] p-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Scholarship Opportunities</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Merit Scholarship 2026', amount: '₹2,50,000', eligibility: '90%+ in 12th', deadline: 'Apr 30, 2026' },
                                { name: 'Tech Innovators Grant', amount: '₹5,00,000', eligibility: 'CS/IT Students', deadline: 'May 15, 2026' },
                                { name: 'National Talent Search', amount: '₹1,50,000', eligibility: 'State Rank <100', deadline: 'Jun 1, 2026' }
                            ].map((scholarship, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gradient-to-r from-secondary/5 to-green-500/5 p-5 rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white mb-2">{scholarship.name}</h3>
                                            <div className="flex flex-wrap gap-3 text-xs">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Trophy size={12} />
                                                    <span>{scholarship.eligibility}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Calendar size={12} />
                                                    <span>{scholarship.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-xl font-black text-secondary mb-1">{scholarship.amount}</div>
                                            <button className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-lg hover:bg-secondary hover:text-white transition-all">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column - Widgets */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-8 flex flex-col h-[500px] shadow-2xl">
                        <div className="flex items-center gap-2 text-secondary font-bold mb-6">
                            <MessageSquare size={20} />
                            AI Mentor
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-2">
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${m.role === 'user'
                                        ? 'bg-secondary text-white rounded-tr-none shadow-lg font-bold'
                                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10 font-medium'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTalkingToAI && (
                                <div className="flex justify-start text-[10px] text-secondary gap-2 items-center font-bold">
                                    <Loader2 size={12} className="animate-spin" /> Mentor is typing...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendToMentor()}
                                placeholder="Ask me anything..."
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all text-white pr-12"
                            />
                            <button
                                onClick={handleSendToMentor}
                                disabled={isTalkingToAI}
                                className="absolute right-2 top-2 p-1.5 bg-secondary rounded-lg text-white hover:bg-secondary-dark transition-all disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </section>

                    <section className="glass rounded-[2rem] p-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                            <Trophy className="text-yellow-500" size={20} /> Achievements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center font-bold">{streak}</div>
                                <div>
                                    <p className="text-xs font-bold text-white">Consistency King</p>
                                    <p className="text-[10px] text-gray-500 font-bold">{streak} Day Login Streak</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default EduMatchStudent;
