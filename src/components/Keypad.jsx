import React from 'react';

const Keypad = ({ onKeyPress, disabled }) => {
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
            <div />
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
