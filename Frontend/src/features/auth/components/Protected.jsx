import react from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const Protected = () => {
    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);

    if (!loading && !user) {
        return <Navigate to="/login" />
    }
    if (loading) {
        return <div>Loading...</div>
    }
    return (
        <div>
            Protected
            {children}
        </div>
    );
}

export default Protected;