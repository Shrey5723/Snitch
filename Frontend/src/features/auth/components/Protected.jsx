import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const Protected = ({ children, requireSeller = false }) => {
    const { user, loading, isAuthenticated } = useSelector((state) => state.auth || {});

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated && !user) {
        return <Navigate to="/login" replace />;
    }

    if (requireSeller && user?.role !== 'seller') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default Protected;