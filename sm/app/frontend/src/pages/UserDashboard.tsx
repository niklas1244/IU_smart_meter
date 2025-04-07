import {useState} from 'react';
import './Dashboard.css';
import UserHeader from "@/components/UserHeader";
import UserCard from "@/components/UserCard.tsx";
import ConsumptionInventory from "@/components/ConsumptionInventory.tsx";
import ConsumptionInput from "@/components/ConsumptionInput.tsx";
import AuthCheck from "@/components/AuthCheck.tsx";

const UserDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('Enter Consumption data');

    const renderContent = () => {
        switch (activeSection) {
            case 'Enter Consumption data':
                return (
                    <ConsumptionInput />
                );
            case 'List Consumption data':
                return (
                    <ConsumptionInventory />
                );
            case 'Personal Details':
                return (
                    <UserCard />
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <AuthCheck roleId={1} redirectPath="/" />

            <UserHeader/>
            <div className="content">
                <nav className="menu">
                    <ul>
                        <li onClick={() => setActiveSection('Enter Consumption data')}>Enter Consumption data</li>
                        <li onClick={() => setActiveSection('List Consumption data')}>List Consumption data</li>
                        <li onClick={() => setActiveSection('Personal Details')}>Personal Details</li>
                    </ul>
                </nav>
                {renderContent()}
            </div>
        </div>
    );
};

export default UserDashboard;