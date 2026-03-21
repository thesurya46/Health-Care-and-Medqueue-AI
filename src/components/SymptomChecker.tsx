import { useState, useRef, useEffect } from 'react';
import { Send, Activity, User, Bot, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { chatWithAI, sendEmergencyAlert } from '../lib/api';

const systemPrompt = `You are a professional medical triage AI for MedQueue AI. 
Your goal is to understand the user's symptoms and provide a preliminary assessment. 
Always include a disclaimer that you are an AI and not a doctor.
Suggest if they should visit the OPD, Emergency, or if it's likely a minor issue.
Keep responses concise and clinical.`;

const SymptomChecker = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello, I am your MedQueue AI Assistant. Please describe your symptoms for a preliminary triage." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [alertState, setAlertState] = useState<'idle' | 'sending' | 'sent'>('idle');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithAI([...history, userMessage], systemPrompt);
            setMessages(prev => [...prev, response.message]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my neural core. Please try again or consult a doctor directly." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const triggerEmergency = async () => {
        setAlertState('sending');
        try {
            await sendEmergencyAlert("+916371401928", "Current User Location", "Severe Symptom Escalation");
            setAlertState('sent');
            setTimeout(() => setAlertState('idle'), 4000);
            setMessages(prev => [...prev, { role: 'assistant', content: "EMERGENCY ALERT TRIGGERED. Dispatch units have been notified of your location. Please stay where you are and try to remain calm." }]);
        } catch (error) {
            setAlertState('idle');
        }
    };

    return (
        <div className="flex flex-col h-full glass rounded-3xl border-white/10 overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="bg-primary/20 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Symptom Checker</h3>
                        <p className="text-[10px] text-primary font-medium">Neural Triage v2.0</p>
                    </div>
                </div>

                <button
                    onClick={triggerEmergency}
                    disabled={alertState !== 'idle'}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${alertState === 'sent' ? 'bg-secondary text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30'
                        }`}
                >
                    {alertState === 'sending' ? <Loader2 size={12} className="animate-spin" /> :
                        alertState === 'sent' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {alertState === 'sending' ? 'Dispatching...' : alertState === 'sent' ? 'Alert Sent' : 'Emergency'}
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${m.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'
                                }`}>
                                {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${m.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none shadow-lg font-bold'
                                : m.content.includes('EMERGENCY')
                                    ? 'bg-red-500/20 text-red-100 border border-red-500/50 rounded-tl-none font-black italic'
                                    : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10 font-medium'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start items-center gap-2 text-primary italic text-[10px] font-bold animate-pulse">
                        <Loader2 size={12} className="animate-spin" /> Analyzing neurological data patterns...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Describe your symptoms..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:border-primary outline-none transition-all placeholder:text-gray-600 font-medium text-white shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SymptomChecker;
