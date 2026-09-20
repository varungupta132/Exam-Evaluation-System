# 🚀 AI Exam Evaluation System - Setup Instructions

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Google Cloud Account** with Vision API enabled
3. **Git** for version control

## Backend Setup (Flask + Google Vision AI)

### Step 1: Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Vision API**:
   - Go to APIs & Services → Library
   - Search for "Cloud Vision API"
   - Click "Enable"

4. Create Service Account:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "Service Account"
   - Fill in details and create
   - Download the JSON key file

5. Set Environment Variable:
   ```bash
   # Windows
   set GOOGLE_APPLICATION_CREDENTIALS=path\to\your\service-account-key.json
   
   # Linux/Mac
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

### Step 2: Python Environment Setup

```bash
# Clone the repository
git clone https://github.com/varungupta132/Exam-Evaluation-System.git
cd Exam-Evaluation-System

# Create virtual environment
python -m venv exam_eval_env

# Activate virtual environment
# Windows:
exam_eval_env\Scripts\activate
# Linux/Mac:
source exam_eval_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Run the Backend

```bash
# Start Flask server
python app.py
```

Server will run on: `http://localhost:5000`

## Frontend Setup

The frontend is already ready! Just open `index.html` in your browser or serve it using a local server:

```bash
# Option 1: Direct open
# Just double-click index.html

# Option 2: Python HTTP Server
python -m http.server 8080
# Then visit: http://localhost:8080

# Option 3: Node.js HTTP Server (if you have Node.js)
npx http-server -p 8080
```

## Testing the System

1. **Start Backend**: Run `python app.py`
2. **Open Frontend**: Open `index.html` in browser
3. **Upload Files**: 
   - Upload a student answer sheet image
   - Upload a teacher answer key image
4. **Evaluate**: Click "Start Evaluation"
5. **View Results**: See detailed scoring and feedback

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /evaluate` - Main evaluation endpoint

## File Structure

```
Exam-Evaluation-System/
├── index.html              # Frontend interface
├── style.css               # Styling
├── script.js               # Frontend logic
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── setup_instructions.md   # This file
└── README.md              # Project documentation
```

## Environment Variables

Create a `.env` file (optional):

```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
FLASK_ENV=development
FLASK_DEBUG=True
```

## Troubleshooting

### Common Issues:

1. **Google Vision API Error**: Make sure credentials are set correctly
2. **CORS Error**: Backend should handle CORS automatically
3. **File Upload Error**: Check file size (max 5MB) and format (JPG, PNG)
4. **Port Already in Use**: Change port in app.py or kill existing process

### Debug Steps:

1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify API endpoints are responding: `http://localhost:5000/health`

## Production Deployment

### Backend (Flask):
- Use Gunicorn: `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
- Deploy on: Heroku, AWS, Google Cloud Run, etc.

### Frontend:
- Deploy on: Netlify, Vercel, GitHub Pages, etc.
- Update backend URL in `script.js`

## Features

✅ **Google Vision AI OCR** - Extract text from images
✅ **Smart Answer Comparison** - AI-powered evaluation
✅ **Detailed Scoring** - Question-wise breakdown
✅ **Modern UI** - Clean, responsive interface
✅ **File Upload** - Drag & drop support
✅ **Report Generation** - Download evaluation reports

## Next Steps

1. **Improve Answer Matching**: Use advanced NLP models
2. **Add Authentication**: User login/registration
3. **Database Integration**: Store evaluation history
4. **Batch Processing**: Multiple answer sheets at once
5. **Advanced Analytics**: Performance trends, insights

---

**Need Help?** Check the logs, read error messages, or create an issue on GitHub!