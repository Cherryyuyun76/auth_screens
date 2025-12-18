# EventFlow MIS

A production-ready, crash-proof Event Management System built with Node.js, Express, and Vanilla HTML/CSS/JS.

## Features
- **Centralized Dashboard**: Manage Events, Vendors, and see real-time stats.
- **Role-Based Access**: Login as Admin, Vendor, or Attendee (simulated).
- **Crash-Proof Design**: Handles errors gracefully without stopping the server.
- **Easy Stacks**: No complex databases, just a JSON file (`data/db.json`).

## How to Run Locally

1.  **Install Dependencies**:
    Open your terminal in this folder and run:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    npm start
    ```
    You will see: `EventFlow MIS Server running on http://localhost:3000`

3.  **Open in Browser**:
    Go to [http://localhost:3000](http://localhost:3000)

## Demo Credentials
- **Email**: `admin@eventflow.com`
- **Password**: `password123`

## Project Structure
- `server.js`: The main backend server.
- `public/`: Contains all frontend files (HTML, CSS, JS).
- `data/db.json`: The database file.
