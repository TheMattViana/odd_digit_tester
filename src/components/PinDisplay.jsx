import React from 'react';

const PinDisplay = ({ length, pInLength }) => {
    return (
        <div className="flex justify-center gap-6 mb-12 h-8 items-center">
            {Array.from({ length }).map((_, i) => (
                <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-[1.5px] border-white transition-all duration-200
             ${i < pInLength ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-transparent'}`}
                />
            ))}
        </div>
    );
};

export default PinDisplay;
