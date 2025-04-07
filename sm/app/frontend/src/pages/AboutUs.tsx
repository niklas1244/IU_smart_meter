import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <Header />
      <div className="bg-white max-w-3xl p-10 rounded-lg shadow-lg border border-green-200 text-gray-800">
        <h1 className="text-4xl font-bold text-center text-green-600 mb-6">
          About
        </h1>
        <p className="text-lg text-center mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div className="flex justify-center mt-6">
          <Button
            variant="default"
            onClick={() => navigate("/")}
            className="px-6 py-3"
          >
            Back To Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
