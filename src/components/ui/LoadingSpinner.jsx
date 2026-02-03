import React from 'react';

const LoadingSpinner = ({ size = "w-12 h-12" }) => {
    return (
        <div className={`flex justify-center items-center ${size}`}>
            <svg
                viewBox="0 0 50 50"
                className="animate-spin w-full h-full"
            >
                <circle
                    className="stroke-blue-500 dark:stroke-blue-400"
                    cx="25"
                    cy="25"
                    r="22"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="80, 150"
                    strokeDashoffset="0"
                />
            </svg>
        </div>
    );
};

export default LoadingSpinner;
