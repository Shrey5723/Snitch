import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const Protected = ({ children, requireSeller = false, requireBuyer = false, requireAuth = true }) => {
    const { user, loading, isAuthenticated } = useSelector((state) => state.auth || {});

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated && !user) {
        return <Navigate to="/login" replace />;
    }

    // Block buyers from accessing seller pages
    if (requireSeller && user?.role !== 'seller') {
        return <Navigate to="/" replace />;
    }

    // Redirect sellers trying to access buyer-only pages (e.g. cart)
    if (requireBuyer && user?.role === 'seller') {
        return <Navigate to="/seller/dashboard" replace />;
    }

    return <>{children}</>;
};

export default Protected;