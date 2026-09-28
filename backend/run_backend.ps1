$ErrorActionPreference = "Stop"

Write-Host "Creating Python virtual environment..."
python -m venv venv

Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

Write-Host "Installing requirements..."
pip install -r requirements.txt
pip install aiosqlite

Write-Host "Initializing SQLite database..."
$env:PYTHONPATH = "D:\fitshraddha\backend"
python app\db\init_db.py
python app\seed.py

Write-Host "Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
