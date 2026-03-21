import React from 'react';

interface PixelButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    color?: 'yellow' | 'primary' | 'secondary' | 'red' | 'neutral';
}

const PixelButton: React.FC<PixelButtonProps> = ({
    children,
    onClick,
    className = "",
    type = "button",
    color = "yellow"
}) => {
    // Dynamic color support based on the user's style
    const colorVars = {
        yellow: { bg: '#facc15', outline: '#facc15' },
        primary: { bg: '#3b82f6', outline: '#3b82f6' },
        secondary: { bg: '#10b981', outline: '#10b981' },
        red: { bg: '#ef4444', outline: '#ef4444' },
        neutral: { bg: '#4b5563', outline: '#4b5563' }
    };

    const selectedColor = colorVars[color] || colorVars.yellow;

    return (
        <button
            type={type}
            onClick={onClick}
            className={`pixel-button ${className}`}
            style={{ '--active-outline': selectedColor.outline } as any}
        >
            <div style={{ backgroundColor: selectedColor.bg }}>
                <span>{children}</span>
            </div>
        </button>
    );
};

export default PixelButton;
