# build_release.ps1

Write-Host "Starting Build Process for Offline Deployment..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Define paths
$ScriptDir = $PSScriptRoot
$FrontendDir = Join-Path $ScriptDir "frontend"
$BackendDir = Join-Path $ScriptDir "backend"
$ReleaseDir = Join-Path $ScriptDir "release"

# 1. Clean previous release
if (Test-Path $ReleaseDir) {
    Write-Host "Cleaning previous release folder..."
    Remove-Item -Path $ReleaseDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ReleaseDir | Out-Null

# 2. Build Frontend
Write-Host "Building Frontend..." -ForegroundColor Cyan
Push-Location $FrontendDir
# Check if dist exists, remove it
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
try {
    # Using cmd /c ensuring compatibility
    cmd /c npm run build
} catch {
    Write-Error "Frontend build failed. Make sure to run 'npm install' in frontend folder first."
}
Pop-Location

# 3. Build Backend
Write-Host "Building Backend..." -ForegroundColor Cyan
Push-Location $BackendDir
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
try {
    cmd /c npm run build
} catch {
    Write-Error "Backend build failed. Make sure to run 'npm install' in backend folder first."
}
Pop-Location

# 4. Assemble Release
Write-Host "Assembling Release Package..." -ForegroundColor Cyan

# Copy Backend Build
Write-Host "Copying Backend code..."
Copy-Item -Path (Join-Path $BackendDir "dist") -Destination (Join-Path $ReleaseDir "dist") -Recurse
Copy-Item -Path (Join-Path $BackendDir "package.json") -Destination (Join-Path $ReleaseDir "package.json")

# Copy Backend Node Modules
Write-Host "Copying Backend node_modules (this may take a minute)..."
Copy-Item -Path (Join-Path $BackendDir "node_modules") -Destination (Join-Path $ReleaseDir "node_modules") -Recurse

# Copy Frontend Build to public
Write-Host "Copying Frontend static files..."
if (Test-Path (Join-Path $FrontendDir "dist")) {
    Copy-Item -Path (Join-Path $FrontendDir "dist") -Destination (Join-Path $ReleaseDir "public") -Recurse
} else {
    Write-Error "Frontend 'dist' folder not found."
}

# Copy .env
if (Test-Path (Join-Path $BackendDir ".env")) {
    Copy-Item -Path (Join-Path $BackendDir ".env") -Destination (Join-Path $ReleaseDir ".env")
} else {
    Write-Warning "No .env file found in backend. Please configure .env in the release folder manually."
}

# Create Start Script
$StartScript = @"
@echo off
echo Starting Training Calendar System...
cd /d "%~dp0"
node dist/server.js
pause
"@
Set-Content -Path (Join-Path $ReleaseDir "start.bat") -Value $StartScript

Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "The 'release' folder is ready."
Write-Host "Action Items:"
Write-Host "1. Copy the 'release' folder to your Windows Server."
Write-Host "2. Ensure Node.js is installed on the server (or include node.exe in the folder)."
Write-Host "3. Run 'start.bat' to launch the application."
