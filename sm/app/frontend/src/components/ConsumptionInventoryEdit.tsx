import React, { useEffect, useState } from 'react';

interface ConsumptionData {
    id: number;
    meter_id: number;
    timestamp: string;
    modify_timestamp?: string;
    consumption_kwh: number;
}

const ConsumptionInventoryEdit: React.FC = () => {
    const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<ConsumptionData | null>(null);

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

    const handleEditClick = (index: number) => {
        setEditIndex(index);
        setEditedData({ ...consumptionData[index] });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'consumptionKwh' ? parseFloat(value) : value;
        setEditedData((prev) => (prev ? { ...prev, [name]: processedValue } : null));
    };

    const handleSaveClick = async () => {
        try {
            const authToken = localStorage.getItem('token');
            if (authToken) {
                const response = await fetch('/api/consumption/update_data', {
                    method: 'POST',
                    headers: {
                        Authorization: `${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editedData),
                });

                if (!response.ok) {
                    throw new Error('Failed to save consumption data');
                }

                const updatedData = await response.json();
                setConsumptionData((prevData) =>
                    prevData.map((item, idx) => (idx === editIndex ? updatedData : item))
                );
                setEditIndex(null);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert(`Error saving data: ${error}`);
        }
    };

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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {consumptionData.map((item, index) => (
                        <tr key={item.id}>
                            <td>{item.meter_id}</td>
                            <td>{item.timestamp}</td>
                            <td>{item.modify_timestamp || 'N/A'}</td>
                            {editIndex === index ? (
                                <>
                                    <td>
                                        <input
                                            name="consumption_kwh"
                                            type="number"
                                            step="0.01"
                                            value={editedData?.consumption_kwh}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={handleSaveClick}>Save</button>
                                        <button onClick={() => setEditIndex(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{item.consumption_kwh}</td>
                                    <td>
                                        <button onClick={() => handleEditClick(index)}>Edit</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConsumptionInventoryEdit;
