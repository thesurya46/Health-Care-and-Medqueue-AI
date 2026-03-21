import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'patient' | 'student' | 'admin' | null;

interface AuthState {
    isLoggedIn: boolean;
    role: UserRole;
    email: string;
    name: string;
    hospitalId?: string;
    hospitalName?: string;
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const rolesString = JSON.stringify(allowedRoles);

    useEffect(() => {
        try {
            const authData = localStorage.getItem('authState');

            if (!authData) {
                navigate('/auth');
                return;
            }

            const auth: AuthState = JSON.parse(authData);

            if (!auth || !auth.isLoggedIn || !auth.role) {
                navigate('/auth');
                return;
            }

            if (!allowedRoles.includes(auth.role)) {
                switch (auth.role) {
                    case 'patient': navigate('/patient'); break;
                    case 'student': navigate('/edumatch'); break;
                    case 'admin': navigate('/medqueue'); break;
                    default: navigate('/auth'); break;
                }
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            console.error("Auth check failed", error);
            localStorage.removeItem('authState');
            navigate('/auth');
        }
    }, [navigate, rolesString]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
};

export const useAuth = () => {
    const [auth, setAuth] = useState<AuthState | null>(null);

    useEffect(() => {
        const authData = localStorage.getItem('authState');
        if (authData) {
            setAuth(JSON.parse(authData));
        }
    }, []);

    const signOut = () => {
        localStorage.removeItem('authState');
        window.location.href = '/';
    };

    const getUser = () => {
        try {
            const authData = localStorage.getItem('authState');
            if (authData) {
                return JSON.parse(authData) as AuthState;
            }
        } catch (e) {
            console.error("Auth state parse error", e);
            localStorage.removeItem('authState');
        }
        return null;
    };

    return {
        auth,
        isLoggedIn: auth?.isLoggedIn || false,
        role: auth?.role || null,
        user: auth ? {
            name: auth.name,
            email: auth.email,
            hospitalId: auth.hospitalId,
            hospitalName: auth.hospitalName
        } : null,
        signOut,
        getUser
    };
};
