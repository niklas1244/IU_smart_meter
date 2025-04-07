# Database Schema

## Beispieldaten
Anmelden Endbenutzer1: kunde1 und password123
Anmelden Endbenutzer2: kunde2 und password456
Anmelden Messtellenbetreiber: betreiber1 und adminpassword

## Tables
```SQL
CREATE TABLE roles (
    id INT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_username VARCHAR(100) UNIQUE NOT NULL,
    login_password TEXT NOT NULL,
    lock_count INT DEFAULT 0,
    lock_reason TEXT,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id VARCHAR(50) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE consumption_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modify_timestamp TIMESTAMP,
    consumption_kwh DECIMAL(20, 2) NOT NULL,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
);

```

## Example Data
```SQL
-- Insert roles
INSERT INTO roles (id, role_name) VALUES 
    (1, 'Endnutzer'),
    (99, 'Messstellenbetreiber');

-- Insert users
INSERT INTO users (email, first_name, last_name, phone, address, city, zip_code) VALUES 
    ('kunde1@example.com', 'Max', 'Müller', '1234567890', 'Musterstraße 1', 'Berlin', '10115'),
    ('kunde2@example.com', 'Anna', 'Schmidt', '0987654321', 'Beispielweg 5', 'Hamburg', '20095'),
    ('betreiber1@example.com', 'Johannes', 'Fischer', '1112223333', 'Hauptstraße 10', 'München', '80331');

-- Insert login data (assuming IDs match inserted users)
INSERT INTO login (user_id, login_username, login_password, role_id) VALUES 
    (1, 'kunde1', 'password123', 1),
    (2, 'kunde2', 'password456', 1),
    (3, 'betreiber1', 'adminpassword', 99);

-- Insert meters
INSERT INTO meters (meter_id, owner_id, created_by) VALUES 
    ('METER-001', 1, 3),
    ('METER-002', 2, 3);

-- Insert consumption data
INSERT INTO consumption_data (meter_id, timestamp, modify_timestamp, consumption_kwh) VALUES 
    (1, '2025-02-19 08:00:00', '2025-02-19 09:00:00', 5.3),
    (2, '2025-02-19 16:00:00', '2025-02-19 17:00:00', 4.9);

INSERT INTO consumption_data (meter_id, timestamp, consumption_kwh) VALUES 
    (1, '2025-02-19 12:00:00', 3.8),
    (1, '2025-02-19 16:00:00', 6.1),
    (2, '2025-02-19 08:00:00', 4.2),
    (2, '2025-02-19 12:00:00', 5.7);
```
