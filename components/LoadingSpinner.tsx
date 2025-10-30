
import React from 'react';

const LoadingSpinner: React.FC<{ simple?: boolean }> = ({ simple = false }) => {
    if (simple) {
        return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>;
    }

    return (
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    );
};

export default LoadingSpinner;
