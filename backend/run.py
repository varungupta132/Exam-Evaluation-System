#!/usr/bin/env python3
"""
Production runner for the Exam Evaluation System
"""

import os
from app import app

if __name__ == "__main__":
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Get debug mode from environment
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting Exam Evaluation System Backend...")
    print(f"📡 Server will run on: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )