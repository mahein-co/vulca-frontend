import React from 'react';

const LoadingSpinner = ({ size = "w-5 h-5", color = "text-blue-500 dark:text-blue-400", className = "" }) => {
    return (
        <div className={`flex justify-center items-center ${size} ${className}`}>
            <svg
                viewBox="0 0 50 50"
                className="animate-spin w-full h-full"
            >
                <circle
                    className={`${color} stroke-current`}
                    cx="25"
                    cy="25"
                    r="22"
                    fill="none"
                    strokeWidth="3.5" // Thicker stroke for better visibility
                    strokeLinecap="round"
                    strokeDasharray="80, 150"
                    strokeDashoffset="0"
                />
            </svg>
        </div>
    );
};

export default LoadingSpinner;
