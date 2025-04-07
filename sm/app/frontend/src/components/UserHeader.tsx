import {FiUser} from "react-icons/fi";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

 interface JWTToken {
     userId: number;
     username: string;
     roleId: number;
     exp: number;
 }

const UserHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAdmin = token ? (jwtDecode(token) as JWTToken).roleId === 99 : false;

    // Handle log out function
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <header
            className="h-[10vh] w-full flex items-center px-5 lg:px-14 justify-between bg-green-400 fixed top-0 left-0 z-50">
            <Link to="/" aria-label="Home">
                <h1 className="text-white text-4xl font-bold transition-colors">Smart Meter</h1>
            </Link>

            <div className="flex items-center space-x-4 text-white">
                {isAdmin && (
                    <Link to="/adminDashboard">
                        <FiUser className="text-xl"/>
                    </Link>
                )}
                {!isAdmin && (
                 <Link to="/userDashboard">
                     <FiUser className="text-xl"/>
                 </Link>
                 )}
                 {(['/userDashboard'].includes(location.pathname) || ['/adminDashboard'].includes(location.pathname)) && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-4"
                    >
                        Log Out
                    </button>
                  )}
            </div>
        </header>
    );
};

export default UserHeader;
