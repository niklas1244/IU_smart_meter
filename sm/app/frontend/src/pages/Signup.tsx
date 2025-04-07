import {useState} from "react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [emailValid, setEmailValid] = useState(true);
    const [phoneValid, setPhoneValid] = useState(true);
    const [firstNameValid, setFirstNameValid] = useState(true);
    const [lastNameValid, setLastNameValid] = useState(true);



    const navigate = useNavigate();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePhone = (phone: string) => /^[\d-]$/.test(phone);

    const validateName = (name: string) => /^[a-zA-Z\s'-]+$/.test(name);

    const validatePassword = (password: string): boolean => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,40}$/;
        return passwordRegex.test(password);
    }

    const handleSignUp = async () => {
        setEmailValid(validateEmail(email));
        setPhoneValid(validatePhone(phone));
        setFirstNameValid(validateName(firstName));
        setLastNameValid(validateName(lastName));

        if (!validateEmail(email)) {
            setResponseMessage("Please enter a valid email address.");
            return;
        }
        if (!validatePhone(phone)) {
            setResponseMessage("Please enter a valid phone number (e.g., 111-111-1111 or (111) 111-1111).");
            return;
        }
        if (!validateName(firstName)) {
            setResponseMessage("First name can only include letters, spaces, hyphens, and apostrophes.");
            return;
        }
        if (!validateName(lastName)) {
            setResponseMessage("Last name can only include letters, spaces, hyphens, and apostrophes.");
            return;
        }

        if (!validatePassword(password)) {
            setResponseMessage("Please choose a password that is between 8 and 40 characters long and includes a lowercase, uppercase, number, and special character");
            return;
        }
        if (password != confirmPassword) {
            setResponseMessage("Passwords do not match");
            return;
        }
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    password: password,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    address: address,
                    city: city,
                    zipCode: zipCode
                }),
            });
            const data = await response.json();
            console.log("Data", data);
            const token = data.token;
            if (token) {
                document.cookie = `token=${token}; path=/; secure; HttpOnly; SameSite=Strict;`;
                localStorage.setItem('token', token);
                setResponseMessage(data.message || "Signup successful");
                navigate("/userDashboard");
            }
            setResponseMessage(data.error || "Signup failed");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleBackToLogin = (event: React.FormEvent) => {
        event.preventDefault();
        navigate("/login");
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-100">
            <header
                className="h-[10vh] w-full flex items-center px-5 lg:px-14 justify-between bg-green-400 fixed top-0 left-0 z-50">
                <Link to="/" aria-label="Home">
                    <h1 className="text-white text-4xl font-bold transition-colors">Smart Meter</h1>
                </Link>
            </header>
            <div
                className="bg-white p-8 rounded-lg shadow-2xl border border-gray-200 w-full max-w-lg">
                <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold text-center mb-6">
                    Sign Up
                </h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignUp();
                    }}
                    className="space-y-6 md:space-y-6"
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            className={`mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors ${
                                emailValid ? "border-gray-300" : "border-red-500"
                            }`}
                            required
                            autoComplete="email"
                            aria-describedby={!emailValid ? "email-error" : undefined}
                        />
                        {!emailValid && (
                            <p className="text-red-500 text-sm mt-2">
                                Please enter a valid email address
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors border-gray-300"
                            required
                            autoComplete="new-password"
                            minLength={8}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors border-gray-300"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            First Name
                        </label>
                        <Input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={`mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors ${
                                firstNameValid ? "border-gray-300" : "border-red-500"}`}
                            required
                            autoComplete="given-name"
                        />
                        {!firstNameValid && <p className="text-red-500 text-sm mt-2">Invalid first name.</p>}
                    </div>

                    <div>
                        <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Last Name
                        </label>
                        <Input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={`mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors ${
                                lastNameValid ? "border-gray-300" : "border-red-500"}`}
                            required
                            autoComplete="family-name"
                        />
                        {!lastNameValid && <p className="text-red-500 text-sm mt-2">Invalid last name.</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone (111-111-1111)
                        </label>
                        <Input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors ${
                                phoneValid ? "border-gray-300" : "border-red-500"}`}
                            required
                            autoComplete="tel"
                        />
                        {!phoneValid && <p className="text-red-500 text-sm mt-2">Invalid phone number format.</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Address
                        </label>
                        <Input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors border-gray-300"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700"
                        >
                            City
                        </label>
                        <Input
                            type="text"
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors border-gray-300"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="zipCode"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Zip Code
                        </label>
                        <Input
                            type="text"
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="mt-1 block w-full p-2.5 border rounded-lg text-sm transition-colors border-gray-300"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Sign Up
                    </Button>

                    <Button
                        onClick={handleBackToLogin}
                        className="w-full text-gray-700 bg-white border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
                    >
                        Back to Login
                    </Button>

                    {responseMessage && (
                        <p className="text-red-500 text-center mt-4">{responseMessage}</p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default SignUp;
