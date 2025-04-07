import React, { useState, useEffect } from 'react';

interface MeterData {
    meter_id: string;
    owner_id: number;
}

interface UserData {
    id: number;
    first_name: string;
    last_name: string;
}

const MeterInput: React.FC = () => {
    const [formData, setFormData] = useState<MeterData>({
        meter_id: '',
        owner_id: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData[]>([]);

    useEffect(() => {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const authToken = localStorage.getItem('token');
                    if (authToken) {
                        const response = await fetch('/api/user/get_all', {
                            headers: {
                                Authorization: `${authToken}`,
                            },
                        });

                        if (!response.ok) {
                            throw new Error('Failed to fetch meter data');
                        }

                        const data: UserData[] = await response.json();
                        setUserData(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'owner_id' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const authToken = localStorage.getItem('token');
            if (authToken) {
                const response = await fetch('/api/meters/add_meter', {
                    method: 'POST',
                    headers: {
                        Authorization: `${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit meter data');
                }

                alert('Meter added successfully');
                setFormData({ meter_id: '', owner_id: 0 });
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
            <h2>Enter Meter Data</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Meter ID:
                    <input
                        name="meter_id"
                        type="text"
                        value={formData.meter_id}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Owner:
                    <select
                        name="owner_id"
                        value={formData.owner_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value={0}>Select Owner</option>
                        {userData.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default MeterInput;
