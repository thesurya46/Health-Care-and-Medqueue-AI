import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, GraduationCap, User, Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import PixelButton from '../components/PixelButton';

type UserRole = 'patient' | 'student' | 'admin' | null;

interface AuthState {
    isLoggedIn: boolean;
    role: UserRole;
    email: string;
    name: string;
    hospitalId?: string;
    hospitalName?: string;
}

const Auth = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hospitalId: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Fetch hospitals for admin dropdown
    const [allHospitals, setAllHospitals] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/hospitals`);
                if (response.ok) {
                    const data = await response.json();
                    setAllHospitals(data.map((h: any) => ({ id: h.id, name: h.name })));
                }
            } catch (error) {
                console.error("Error fetching hospitals for auth", error);
            }
        };
        fetchHospitals();

        const authData = localStorage.getItem('authState');
        if (authData) {
            const auth: AuthState = JSON.parse(authData);
            if (auth.isLoggedIn && auth.role) {
                // Redirect to their dashboard
                redirectToRole(auth.role);
            }
        }
    }, []);

    const redirectToRole = (role: UserRole) => {
        switch (role) {
            case 'patient':
                navigate('/patient');
                break;
            case 'student':
                navigate('/edumatch');
                break;
            case 'admin':
                navigate('/medqueue'); // Admin goes to MedQueue dashboard
                break;
            default:
                break;
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!selectedRole) {
            newErrors.role = 'Please select a role';
        }

        if (isSignUp && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (isSignUp && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (selectedRole === 'admin' && !formData.hospitalId) {
            newErrors.hospitalId = 'Please select a hospital';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Create auth state
        const authState: AuthState = {
            isLoggedIn: true,
            role: selectedRole!,
            email: formData.email,
            name: isSignUp ? formData.name : formData.email.split('@')[0],
            hospitalId: selectedRole === 'admin' ? formData.hospitalId : undefined,
            hospitalName: selectedRole === 'admin' ?
                allHospitals.find(h => h.id === formData.hospitalId)?.name : undefined
        };

        // Save to localStorage (in production, use secure backend auth)
        localStorage.setItem('authState', JSON.stringify(authState));

        // Redirect to appropriate dashboard
        redirectToRole(selectedRole);
    };

    const roles = [
        {
            id: 'patient' as UserRole,
            icon: Activity,
            title: 'Patient',
            description: 'Access MedQueue for hospital wait times and appointments',
            color: 'primary',
            gradient: 'from-primary/20 to-primary/5'
        },
        {
            id: 'student' as UserRole,
            icon: GraduationCap,
            title: 'Student',
            description: 'Access EduMatch for career guidance and assessments',
            color: 'secondary',
            gradient: 'from-secondary/20 to-secondary/5'
        },
        {
            id: 'admin' as UserRole,
            icon: Shield,
            title: 'Hospital Admin',
            description: 'Manage hospital queues, beds, and analytics',
            color: 'orange-500',
            gradient: 'from-orange-500/20 to-orange-500/5'
        }
    ];

    // Removed hardcoded list, now using allHospitals state fetched in useEffect

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[120px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Back to Home
            </button>

            {/* Auth Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[2rem] p-6 md:p-10 max-w-4xl w-full relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-white uppercase tracking-tighter">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-400">
                        {isSignUp
                            ? 'Sign up to access AI-powered healthcare and education services'
                            : 'Sign in to continue to your dashboard'
                        }
                    </p>
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-300 mb-4">
                        Select Your Role
                        {errors.role && <span className="text-red-500 ml-2 text-xs">*{errors.role}</span>}
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;

                            return (
                                <motion.button
                                    key={role.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedRole(role.id);
                                        setErrors({ ...errors, role: '' });
                                    }}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${isSelected
                                        ? `border-${role.color} bg-gradient-to-br ${role.gradient}`
                                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                        }`}
                                >
                                    {isSelected && (
                                        <CheckCircle className={`absolute top-4 right-4 text-${role.color}`} size={20} />
                                    )}
                                    <div className={`w-12 h-12 rounded-xl bg-${role.color}/10 flex items-center justify-center mb-4 border border-${role.color}/20`}>
                                        <Icon className={`text-${role.color}`} size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{role.title}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed">{role.description}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name (Sign Up Only) */}
                    <AnimatePresence>
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    Full Name
                                    {errors.name && <span className="text-red-500 ml-2 text-xs">*{errors.name}</span>}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            setErrors({ ...errors, name: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:border-secondary transition-all ${errors.name ? 'border-red-500' : 'border-white/10'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Email Address
                            {errors.email && <span className="text-red-500 ml-2 text-xs">*{errors.email}</span>}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    setErrors({ ...errors, email: '' });
                                }}
                                className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:border-secondary transition-all ${errors.email ? 'border-red-500' : 'border-white/10'
                                    }`}
                                placeholder="your.email@example.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Password
                            {errors.password && <span className="text-red-500 ml-2 text-xs">*{errors.password}</span>}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    setErrors({ ...errors, password: '' });
                                }}
                                className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:border-secondary transition-all ${errors.password ? 'border-red-500' : 'border-white/10'
                                    }`}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {/* Hospital Selection (Admin Only) */}
                    <AnimatePresence>
                        {selectedRole === 'admin' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    Assign to Hospital
                                    {errors.hospitalId && <span className="text-red-500 ml-2 text-xs">*{errors.hospitalId}</span>}
                                </label>
                                <div className="relative">
                                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <select
                                        value={formData.hospitalId}
                                        onChange={(e) => {
                                            setFormData({ ...formData, hospitalId: e.target.value });
                                            setErrors({ ...errors, hospitalId: '' });
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none focus:border-orange-500 transition-all appearance-none ${errors.hospitalId ? 'border-red-500' : 'border-white/10'
                                            }`}
                                    >
                                        <option value="" disabled className="bg-[#0a0a0a]">Select Hospital</option>
                                        {allHospitals.map(h => (
                                            <option key={h.id} value={h.id} className="bg-[#0a0a0a]">{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <PixelButton
                        type="submit"
                        className="w-full"
                        color="secondary"
                    >
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </PixelButton>
                </form>

                {/* Toggle Sign In/Sign Up */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setErrors({});
                            }}
                            className="ml-2 text-secondary font-bold hover:underline"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
