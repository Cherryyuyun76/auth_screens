CREATE DATABASE IF NOT EXISTS eventflow_db;
USE eventflow_db;

-- Reset tables if they exist (for migration purposes)
DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE events (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date VARCHAR(50),
    location VARCHAR(255),
    budget DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Planning'
);

CREATE TABLE vendors (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Cameroon',
    description TEXT,
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    rating FLOAT DEFAULT 5.0
);

CREATE TABLE tasks (
    id BIGINT PRIMARY KEY,
    description TEXT NOT NULL,
    assignedTo VARCHAR(255),
    deadline VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending'
);

CREATE TABLE stats (
    id INT PRIMARY KEY DEFAULT 1,
    totalEvents INT DEFAULT 0,
    totalAttendees INT DEFAULT 0,
    totalRevenue DECIMAL(15, 2) DEFAULT 0,
    activeVendors INT DEFAULT 0
);

-- Insert initial stats record
INSERT INTO stats (id, totalEvents, totalAttendees, totalRevenue, activeVendors) 
VALUES (1, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE id=id;
