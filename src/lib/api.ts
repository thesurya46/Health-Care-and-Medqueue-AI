const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const fetchQueue = async (hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/queue`);
    if (!response.ok) throw new Error('Failed to fetch queue');
    return response.json();
};

export const fetchHospitalDetails = async (hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`);
    if (!response.ok) throw new Error('Failed to fetch hospital details');
    return response.json();
};

export const fetchHospitals = async () => {
    const response = await fetch(`${API_BASE_URL}/hospitals`);
    if (!response.ok) throw new Error('Failed to fetch hospitals');
    return response.json();
};

export const fetchRecommendations = async (studentId: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/recommendations`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
};

export const checkHealth = async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
};

export const chatWithAI = async (messages: any[], systemPrompt: string, domain: 'health' | 'education' = 'health') => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt, domain })
    });
    if (!response.ok) throw new Error('AI Chat failed');
    return response.json();
};

export const sendOTP = async (phoneNumber: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/notify/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
    });
    return response.json();
};

export const sendBookingNotification = async (phoneNumber: string, hospitalName: string, time: string, hospitalId?: string) => {
    const response = await fetch(`${API_BASE_URL}/notify/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, hospitalName, time, hospitalId })
    });
    return response.json();
};

export const sendEmergencyAlert = async (phoneNumber: string, location: string, alertType: string) => {
    const response = await fetch(`${API_BASE_URL}/notify/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, location, alertType })
    });
    return response.json();
};

export const predictWaitTime = async (data: { current_length: number, avg_consult_time: number, doctors_available: number, hour_of_day: number }) => {
    const response = await fetch(`${API_BASE_URL}/predict/wait-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
};

export const predictCareerMatch = async (profile: { aptitude_scores: any, interests: string[], skills: string[] }) => {
    const response = await fetch(`${API_BASE_URL}/predict/career-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    return response.json();
};

export const admitPatient = async (hospitalId: string, patientData: { name?: string, phone?: string, address?: string, doctorType?: string }) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
    });
    if (!response.ok) throw new Error('Failed to admit patient');
    return response.json();
};

export const callInPatient = async (hospitalId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/queue/call-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, token })
    });
    if (!response.ok) throw new Error('Failed to call in patient');
    return response.json();
};

// Analytics APIs for Sidebar Navigation
export const fetchWardsBeds = async (hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/wards`);
    if (!response.ok) throw new Error('Failed to fetch wards data');
    return response.json();
};

export const fetchStaffing = async (hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/staffing`);
    if (!response.ok) throw new Error('Failed to fetch staffing data');
    return response.json();
};

export const fetchAnalytics = async (hospitalId: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/analytics`);
    if (!response.ok) throw new Error('Failed to fetch analytics data');
    return response.json();
};
