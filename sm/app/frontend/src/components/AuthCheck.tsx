import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface JWTToken {
    userId: number;
    username: string;
    roleId: number;
    exp: number;
}

interface AuthCheckProps {
    roleId: number;
    redirectPath: string;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ roleId, redirectPath }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            const decoded: JWTToken = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            // Admins can access all pages
            if (decoded.roleId === 99) {
                return;
            }
            if (decoded.roleId !== roleId) {
                navigate(redirectPath);
            }
        } else {
            navigate('/login');
        }
    }, [token, navigate, roleId, redirectPath]);

    return null;
};
export default AuthCheck;
