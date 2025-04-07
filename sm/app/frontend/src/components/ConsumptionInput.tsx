import React, { useState, useEffect } from 'react';

interface ConsumptionData {
    meter_id: number;
    consumption_kwh: number;
}

interface MetersData {
    id: number;
    meter_id: string;
    owner_id: number;
    created_by: number;
}

const ConsumptionInput: React.FC = () => {
    const [formData, setFormData] = useState<ConsumptionData>({
        meter_id: 0,
        consumption_kwh: 0.01,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [metersData, setMetersData] = useState<MetersData[]>([]);

    useEffect(() => {
        const fetchMeterData = async () => {
            setLoading(true);
            try {
                const authToken = localStorage.getItem('token');
                if (authToken) {
                    const response = await fetch('/api/meters/get_data', {
                        headers: {
                            Authorization: `${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch meter data');
                    }

                    const data: MetersData[] = await response.json();
                    setMetersData(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeterData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === 'consumption_kwh' ? Number(value) : parseFloat(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {

        if (formData.consumption_kwh < 0.01) {
            alert('Consumption must be greater than 0');
            return;
            }

        e.preventDefault();
        setLoading(true);
        try {
            const authToken = localStorage.getItem('token');
            if (authToken) {
                const response = await fetch('/api/consumption/add_data', {
                    method: 'POST',
                    headers: {
                        Authorization: `${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit consumption data');
                }

                alert('Data submitted successfully');
                setFormData({ meter_id: 0, consumption_kwh: 0.01 });
            }
        } catch (error) {
            console.error(error);
            alert(`Error submitting data: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inventory-container">
            <h2>Enter Consumption Data</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Meter ID:
                    <select name="meter_id" value={formData.meter_id} onChange={handleInputChange} required>
                        <option value="">Select a meter</option>
                        {metersData.map((meter) => (
                            <option key={meter.id} value={meter.id}>
                                {meter.meter_id}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Consumption (kWh):
                    <input
                        name="consumption_kwh"
                        type="number"
                        step="0.01"
                        value={formData.consumption_kwh}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default ConsumptionInput;
