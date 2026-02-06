import React from 'react';

const Keypad = ({ onKeyPress, onDelete, disabled }) => {
    const digitMap = [
        { num: 1, letters: '' },
        { num: 2, letters: 'ABC' },
        { num: 3, letters: 'DEF' },
        { num: 4, letters: 'GHI' },
        { num: 5, letters: 'JKL' },
        { num: 6, letters: 'MNO' },
        { num: 7, letters: 'PQRS' },
        { num: 8, letters: 'TUV' },
        { num: 9, letters: 'WXYZ' },
    ];

    return (
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 max-w-[320px] mx-auto mt-auto pb-8 sm:pb-12">
            {digitMap.map((item) => (
                <KeyButton
                    key={item.num}
                    num={item.num}
                    letters={item.letters}
                    onKeyPress={onKeyPress}
                    disabled={disabled}
                />
            ))}

            {/* Empty spacer */}
            <div />

            <KeyButton key={0} num={0} letters="" onKeyPress={onKeyPress} disabled={disabled} />

            {/* Empty spacer */}
            {/* Delete button */}
            <button
                onClick={() => !disabled && onDelete && onDelete()}
                className={`w-20 h-20 rounded-full text-white text-xl font-light 
                flex items-center justify-center transition-opacity duration-150 
                active:opacity-50 select-none touch-manipulation
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                    <line x1="18" y1="9" x2="12" y2="15"></line>
                    <line x1="12" y1="9" x2="18" y2="15"></line>
                </svg>
            </button>
        </div>
    );
};

const KeyButton = ({ num, letters, onKeyPress, disabled }) => (
    <button
        onClick={() => !disabled && onKeyPress(num)}
        className={`w-20 h-20 rounded-full border-[1.5px] border-white/40 text-white text-3xl font-light 
            flex flex-col items-center justify-center backdrop-blur-md transition-all duration-150 
            active:bg-white/30 active:border-white/60 select-none touch-manipulation shadow-lg
            active:scale-95
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
        style={{
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            WebkitTapHighlightColor: 'transparent'
        }}
    >
        <span className="leading-none mb-0.5">{num}</span>
        {letters && <span className="text-[10px] font-bold tracking-[2px] opacity-70 leading-none">{letters}</span>}
    </button>
)

export default Keypad;
