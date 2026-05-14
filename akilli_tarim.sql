CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'FARMER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE greenhouses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    greenhouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    area DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_greenhouse_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    greenhouse_id INT NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    sensor_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_sensor_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(id)
        ON DELETE CASCADE
);

CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    sensor_id INT NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    soil_moisture DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_data_sensor
        FOREIGN KEY (sensor_id)
        REFERENCES sensors(id)
        ON DELETE CASCADE
);

CREATE TABLE irrigation_records (
    id SERIAL PRIMARY KEY,
    greenhouse_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(30) DEFAULT 'STARTED',
    created_by INT,
    CONSTRAINT fk_irrigation_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_irrigation_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE crop_plans (
    id SERIAL PRIMARY KEY,
    greenhouse_id INT NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    planting_date DATE NOT NULL,
    harvest_date DATE,
    notes TEXT,
    CONSTRAINT fk_crop_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(id)
        ON DELETE CASCADE
);

CREATE TABLE treatment_records (
    id SERIAL PRIMARY KEY,
    greenhouse_id INT NOT NULL,
    treatment_type VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    amount VARCHAR(50),
    applied_date DATE NOT NULL,
    notes TEXT,
    CONSTRAINT fk_treatment_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(id)
        ON DELETE CASCADE
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    greenhouse_id INT NOT NULL,
    alert_type VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(id)
        ON DELETE CASCADE
);