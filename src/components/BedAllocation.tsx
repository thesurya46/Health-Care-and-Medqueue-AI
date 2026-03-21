
const BedAllocation = ({ wards = [] }: { wards?: any[] }) => {
    // Fallback to empty state if no wards provided, or use props

    return (
        <div className="glass rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-8">Ward Occupancy Mapping</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wards.map((ward) => (
                    <div key={ward.name} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h4 className="text-xs font-bold text-gray-500 mb-4">{ward.name}</h4>
                        <div className="grid grid-cols-5 gap-1.5">
                            {[...Array(ward.total)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-[4px] ${i < ward.occupied ? 'bg-primary/40 text-primary-dark' : 'bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                            <p className="text-lg font-black">{Math.round((ward.occupied / ward.total) * 100)}%</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">{ward.occupied}/{ward.total}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BedAllocation;
