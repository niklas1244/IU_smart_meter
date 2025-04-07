import { FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="h-[10vh] w-full flex items-center px-5 lg:px-14 justify-between bg-green-400 fixed top-0 left-0 z-50">
    <Link to="/" aria-label="Home">
        <h1 className="text-white text-4xl font-bold transition-colors">Smart Meter</h1>
    </Link>
      <div className="flex items-center space-x-4 text-white">
        <FiUser className="text-x1" aria-label="Profile" />
        <Link
          to="/login"
          className="bg-black text-white px-4 py-2 rounded-md transition-colors"
        >
          Login
        </Link>
      </div>
    </header>
  );
};

export default Header;
