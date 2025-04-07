import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-green-400 text-white py-6 mt-8">
      <div className="text-center">
        <p>© 2024 Smart-Meter Gateway. All Rights Reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <Link to="/about" className="hover:underline">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
