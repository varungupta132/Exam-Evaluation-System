#!/usr/bin/env python3
"""
Setup script for the Exam Evaluation System backend
"""

import os
import subprocess
import sys

def run_command(command):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print("🚀 Setting up Exam Evaluation System Backend...")
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Create virtual environment
    print("\n📦 Creating virtual environment...")
    success, output = run_command("python -m venv venv")
    if not success:
        print(f"❌ Failed to create virtual environment: {output}")
        sys.exit(1)
    
    # Activate virtual environment and install packages
    print("📥 Installing Python packages...")
    if os.name == 'nt':  # Windows
        activate_command = "venv\\Scripts\\activate && "
    else:  # Unix/Linux/macOS
        activate_command = "source venv/bin/activate && "
    
    success, output = run_command(f"{activate_command}pip install -r requirements.txt")
    if not success:
        print(f"❌ Failed to install packages: {output}")
        sys.exit(1)
    
    # Create necessary directories
    print("📁 Creating directories...")
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("temp", exist_ok=True)
    
    # Create .env file
    print("⚙️ Creating environment file...")
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write("GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json\n")
            f.write("OPENROUTER_API_KEY=bhaisk-or-v1-b49a07b0cefde424630a2f90e23ad240b99428a7d104b89b5dd2a4418742f4d7\n")
            f.write("FLASK_ENV=development\n")
            f.write("FLASK_DEBUG=True\n")
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Add your Google Cloud service account key as 'service-account-key.json'")
    print("2. Run the server: python app.py")
    print("3. Open the frontend in your browser")
    print("\n🌐 Backend will run on: http://localhost:5000")

if __name__ == "__main__":
    main()