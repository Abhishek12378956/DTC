# Offline Deployment Guide for Windows Server

This guide explains how to deploy the Training Calendar System to a Windows Server that does not have internet access or package installation capabilities.

## 1. Prerequisites

- **Node.js**: The server must have Node.js installed.
    - Check by running `node -v` in Command Prompt on the server.
    - If not installed, download the Node.js Windows Binary (.zip) from [nodejs.org](https://nodejs.org), extract it on the server, and add it to the PATH (or simply place `node.exe` inside the release folder).

- **Database**: The SQL Server must be reachable from the server.

## 2. Build the Package (On your Local Machine)

1. Open a terminal in the project root (`c:\Users\tiwar\OneDrive\Desktop\DTC\DTC`).
2. Run the build script:
    ```powershell
    .\build_release.ps1
    ```
3. This will create a folder named `release`.

## 3. Deploy to Server

1. **Copy** the entire `release` folder from your local machine to the Windows Server.
2. Open the folder on the server.

## 4. Configuration

1. Locate the `.env` file in the `release` folder.
2. Open it with Notepad.
3. Verify the database connection settings (`DB_SERVER`, `DB_USER`, `DB_PWD`, `DB_NAME`).
4. **IMPORTANT**: Since we are serving frontend from backend, `FRONTEND_URL` is now effectively the same as the backend URL (e.g., `http://localhost:5000` or the server's IP).

## 5. Running the Application

1. Double-click `start.bat`.
2. A command window should open showing:
    ```
    Starting Training Calendar System...
    Database connection established
    Server running on port 5000
    ```
3. Open a browser on the server (or a machine connected to it) and go to:
    `http://localhost:5000` (or `http://YOUR_SERVER_IP:5000`)

## Troubleshooting

- **Error: 'node' is not recognized**: Node.js is not in the PATH. Either install it or put `node.exe` in the same folder as `start.bat`.
- **Database Connection Failed**: Check firewall settings and the values in `.env`.
- **Blank Page**: Check the browser console (F12) for errors.
