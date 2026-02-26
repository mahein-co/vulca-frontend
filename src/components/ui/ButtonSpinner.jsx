import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const ButtonSpinner = ({ size = "w-4 h-4", color = "text-white", className = "" }) => {
    return (
        <LoadingSpinner
            size={size}
            color={color}
            className={`inline-block align-middle ${className}`}
        />
    );
};

export default ButtonSpinner;
