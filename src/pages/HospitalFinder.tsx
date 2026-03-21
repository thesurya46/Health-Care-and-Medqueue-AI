import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Phone, Search, Filter, CheckCircle2, Loader2, Calendar, X } from 'lucide-react';
import { sendBookingNotification } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 28.6139,
    lng: 77.2090
};

const libraries: any[] = ["places"];

// Mock hospitals data
const hospitals = [
    {
        id: 1,
        name: "Apollo Hospital",
        position: { lat: 28.625, lng: 77.21 },
        beds: 24,
        distance: "1.2 km",
        address: "Sarita Vihar, Delhi",
        phone: "+91 11 2692 5858"
    },
    {
        id: 2,
        name: "Max Super Speciality",
        position: { lat: 28.60, lng: 77.22 },
        beds: 0,
        distance: "3.5 km",
        address: "Saket, Delhi",
        phone: "+91 11 2651 0050"
    },
    {
        id: 3,
        name: "AIIMS Delhi",
        position: { lat: 28.56, lng: 77.21 },
        beds: 12,
        distance: "4.8 km",
        address: "Ansari Nagar, Delhi",
        phone: "+91 11 2658 8500"
    }
];

const HospitalFinder = () => {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
        version: "weekly",
        region: "IN"
    });

    const [selectedHospital, setSelectedHospital] = useState<any>(null);
    const [bookingState, setBookingState] = useState<'idle' | 'booking' | 'confirmed'>('idle');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [showFilter, setShowFilter] = useState(false);

    const onLoad = useCallback(function callback(m: google.maps.Map) {
        setMap(m);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const handleBooking = async (hospital: any) => {
        setBookingState('booking');
        try {
            // In a real app, this would be the user's phone from context
            const userPhone = "+916371401928";
            await sendBookingNotification(userPhone, hospital.name, "15 minutes");
            setBookingState('confirmed');
            setTimeout(() => setBookingState('idle'), 5000);
        } catch (error) {
            console.error("Booking error", error);
            setBookingState('idle');
        }
    };

    const handleMapNavigation = (hospital: any) => {
        if (map && hospital) {
            map.panTo(hospital.position);
            map.setZoom(15);
        }
    };

    const handlePhoneCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
            {/* Confirmation Overlay */}
            <AnimatePresence>
                {bookingState === 'confirmed' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-secondary px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/20"
                    >
                        <CheckCircle2 className="text-white" size={24} />
                        <span className="font-bold">Bed Reserved! Confirmation sent to your phone.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold">MQ</div>
                    <span className="font-bold text-xl tracking-tight uppercase">MedQueue / <span className="text-gray-500">Find a Bed</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search area or hospital..."
                            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary outline-none min-w-[300px]"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={() => setShowFilter(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Filter Hospitals</h3>
                                <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-400 mb-2 block">Availability</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm">
                                        <option>All Hospitals</option>
                                        <option>Only Available Beds</option>
                                        <option>No Beds Available</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-400 mb-2 block">Maximum Distance</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm">
                                        <option>Any Distance</option>
                                        <option>Within 2 km</option>
                                        <option>Within 5 km</option>
                                        <option>Within 10 km</option>
                                    </select>
                                </div>
                                <button className="w-full btn-primary py-3 rounded-xl">Apply Filters</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-[450px] overflow-y-auto p-6 border-r border-white/5 custom-scrollbar shrink-0">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-6">Nearby Hospitals</h2>
                        {hospitals.map((h) => (
                            <motion.div
                                key={h.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelectedHospital(h)}
                                className={`p-6 rounded-3xl cursor-pointer transition-all border ${selectedHospital?.id === h.id
                                    ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{h.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={14} /> {h.address}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${h.beds > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {h.beds > 0 ? 'Beds Available' : 'No Beds'}
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1 bg-black/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Available Beds</p>
                                        <p className={`text-xl font-black ${h.beds > 10 ? 'text-primary' : h.beds > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {h.beds}
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-black/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Distance</p>
                                        <p className="text-xl font-black text-white">{h.distance}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        disabled={h.beds === 0 || bookingState === 'booking'}
                                        onClick={(e) => { e.stopPropagation(); handleBooking(h); }}
                                        className="flex-[2] py-3 bg-secondary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary-dark transition-all disabled:opacity-50"
                                    >
                                        {bookingState === 'booking' && selectedHospital?.id === h.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Calendar size={14} />
                                        )}
                                        Reserve Bed
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMapNavigation(h); }}
                                        className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <Navigation size={14} /> Map
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePhoneCall(h.phone); }}
                                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </aside>

                {/* Map Area */}
                <main className="flex-1 relative">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={selectedHospital ? selectedHospital.position : center}
                            zoom={13}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                                ],
                                disableDefaultUI: true,
                                zoomControl: true,
                            }}
                        >
                            {hospitals.map(h => (
                                <Marker
                                    key={h.id}
                                    position={h.position}
                                    onClick={() => setSelectedHospital(h)}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        fillColor: h.beds > 0 ? "#10b981" : "#ef4444",
                                        fillOpacity: 1,
                                        strokeWeight: 0,
                                        scale: selectedHospital?.id === h.id ? 14 : 10
                                    }}
                                />
                            ))}

                            {selectedHospital && (
                                <InfoWindow
                                    position={selectedHospital.position}
                                    onCloseClick={() => setSelectedHospital(null)}
                                >
                                    <div className="p-2 text-[#0a0a0a]">
                                        <h4 className="font-bold text-sm">{selectedHospital.name}</h4>
                                        <p className="text-xs text-gray-600 mb-2">{selectedHospital.address}</p>
                                        <p className={`text-xs font-bold ${selectedHospital.beds > 0 ? 'text-secondary' : 'text-red-500'}`}>
                                            {selectedHospital.beds} Beds Available
                                        </p>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 font-medium">Initializing Neural Map...</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default HospitalFinder;
