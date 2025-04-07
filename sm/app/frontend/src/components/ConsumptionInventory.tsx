import React, { useEffect, useState } from 'react';

interface ConsumptionData {
    id: number;
    meter_id: number;
    timestamp: string;
    modify_timestamp?: string;
    consumption_kwh: number;
}

const ConsumptionInventory: React.FC = () => {
    const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchConsumptionData = async () => {
            try {
                const authToken = localStorage.getItem('token');
                if (authToken) {
                    const response = await fetch('/api/consumption/get_data', {
                        headers: {
                            Authorization: `${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch consumption data');
                    }

                    const data: ConsumptionData[] = await response.json();
                    setConsumptionData(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchConsumptionData();
    }, []);

    if (loading) {
        return <div>Loading consumption data...</div>;
    }

    return (
        <div className="inventory-container">
            <h2>Consumption Data</h2>
            <table>
                <thead>
                    <tr>
                        <th>Meter ID</th>
                        <th>Timestamp</th>
                        <th>Modify Timestamp</th>
                        <th>Consumption (kWh)</th>
                    </tr>
                </thead>
                <tbody>
                    {consumptionData.map((item) => (
                        <tr key={item.id}>
                            <td>{item.meter_id}</td>
                            <td>{item.timestamp}</td>
                            <td>{item.modify_timestamp || 'N/A'}</td>
                            <td>{item.consumption_kwh}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConsumptionInventory;
