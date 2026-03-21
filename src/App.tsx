import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MedQueueAdmin from './pages/MedQueueAdmin';
import MedQueuePatient from './pages/MedQueuePatient';
import EduMatchStudent from './pages/EduMatchStudent';
import Auth from './pages/Auth';
import HospitalFinder from './pages/HospitalFinder';
import WardsBeds from './pages/WardsBeds';
import Staffing from './pages/Staffing';
import Analytics from './pages/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />

                {/* Protected Patient Routes (MedQueue Patient Dashboard) */}
                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <MedQueuePatient />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Admin Routes (MedQueue Admin Dashboard) */}
                <Route
                    path="/medqueue"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <MedQueueAdmin />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wards-beds"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <WardsBeds />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staffing"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Staffing />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Student Routes (EduMatch) */}
                <Route
                    path="/edumatch"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <EduMatchStudent />
                        </ProtectedRoute>
                    }
                />

                {/* Hospital Finder (All logged-in users) */}
                <Route
                    path="/hospitals"
                    element={
                        <ProtectedRoute allowedRoles={['patient', 'student', 'admin']}>
                            <HospitalFinder />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
