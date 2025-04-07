import {useState} from "react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

interface JWTToken {
    userId: number;
    username: string;
    roleId: number;
    exp: number;
}

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            setResponseMessage("Email and password are required");
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });
            const data = await response.json();
            console.log("Data", data);
            const token = data.token;
            if (token) {
                document.cookie = `token=${token}; path=/; secure; HttpOnly; SameSite=Strict;`;
                localStorage.setItem('token', token);
                setResponseMessage(data.message || "Login successful");

                const decoded: JWTToken = jwtDecode(token);
                if (decoded.roleId === 99) {
                    navigate("/adminDashboard");
                } else {
                    navigate("/userDashboard");
                }
            }
            setResponseMessage(data.error || "Login failed");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSignUp = () => {
        navigate("/signup");
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-gray-100">
            <header
                className="h-[10vh] w-full flex items-center px-5 lg:px-14 justify-between bg-green-400 fixed top-0 left-0 z-50">
                <Link to="/" aria-label="Home">
                    <h1 className="text-white text-4xl font-bold hover:text-green-100 transition-colors">Smart Meter</h1>
                </Link>
            </header>
            <div
                className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 space-y-6 border border-gray-200">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
                    Smart Meter Login
                </h1>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-left mb-2 text-sm font-medium text-gray-900"
                        >
                            Username
                        </label>
                        <Input
                            type="text"
                            id="username"
                            className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-left mb-2 text-sm font-medium text-gray-900"
                        >
                            Password
                        </label>
                        <Input
                            type="password"
                            id="password"
                            className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="•••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Log In
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                        onClick={handleSignUp}
                    >
                        Sign Up
                    </Button>

                    {responseMessage && (
                        <p role="alert"
                           className="text-red-500 text-sm mt-4 text-center">
                            {responseMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default App;
