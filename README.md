# 🎓 AI-Based Exam Evaluation System

An intelligent automated system to evaluate scanned examination answer sheets using **Google Vision AI** and **Python Flask**.

## 🌟 Features

- **🤖 Google Vision AI OCR**: Advanced text extraction from scanned answer sheets
- **📊 Intelligent Evaluation**: AI-powered answer comparison and scoring
- **💯 Detailed Results**: Question-wise breakdown with feedback
- **📱 Modern Interface**: Clean, responsive web design
- **🔄 Real-time Processing**: Instant evaluation and results
- **📥 Report Generation**: Download detailed evaluation reports

## 🛠️ Tech Stack

### Backend
- **Python Flask** - Web framework
- **Google Cloud Vision API** - OCR text extraction
- **PIL (Pillow)** - Image processing
- **Flask-CORS** - Cross-origin requests

### Frontend  
- **HTML5, CSS3, JavaScript** - Pure vanilla frontend
- **Responsive Design** - Works on all devices
- **Modern UI/UX** - Clean and intuitive interface

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/varungupta132/Exam-Evaluation-System.git
cd Exam-Evaluation-System
```

### 2. Setup Google Cloud Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable Vision API
3. Create service account and download JSON key
4. Set environment variable:
   ```bash
   # Windows
   set GOOGLE_APPLICATION_CREDENTIALS=path\to\your\key.json
   
   # Linux/Mac  
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/key.json
   ```

### 3. Install Dependencies
```bash
# Create virtual environment
python -m venv exam_eval_env

# Activate it
# Windows:
exam_eval_env\Scripts\activate
# Linux/Mac:
source exam_eval_env/bin/activate

# Install packages
pip install -r requirements.txt
```

### 4. Run the Application
```bash
# Start Flask backend
python app.py

# Open frontend in browser
# Option 1: Direct - open index.html
# Option 2: HTTP server
python -m http.server 8080
```

**Backend**: http://localhost:5000
**Frontend**: http://localhost:8080

## 📋 How to Use

1. **📤 Upload Student Answer Sheet**: Choose scanned image of student's answers
2. **📝 Upload Teacher Answer Key**: Choose scanned image of correct answers  
3. **🚀 Start Evaluation**: Click evaluate button to process
4. **📊 View Results**: Get detailed scoring and feedback
5. **📥 Download Report**: Save evaluation report as text file

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/evaluate` | POST | Process answer sheets |

## 📁 Project Structure

```
Exam-Evaluation-System/
├── index.html              # Frontend interface
├── style.css               # Modern styling  
├── script.js               # Frontend logic
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── setup_instructions.md   # Detailed setup guide
├── .env.example           # Environment template
└── README.md              # This file
```

## 🎯 How It Works

1. **📷 Image Upload**: Users upload student answer sheet and teacher answer key
2. **🔍 OCR Processing**: Google Vision AI extracts text from both images
3. **📝 Text Analysis**: System parses questions and answers from extracted text
4. **🤖 AI Comparison**: Intelligent algorithm compares student vs. correct answers
5. **💯 Scoring**: Generates scores based on similarity and correctness
6. **📊 Results**: Displays detailed breakdown with feedback

## ⚙️ Configuration

Create `.env` file from template:
```bash
cp .env.example .env
# Edit .env with your settings
```

## 🚀 Deployment

### Backend (Flask)
```bash
# Production server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
- **GitHub Pages**: Push to gh-pages branch
- **Netlify**: Connect GitHub repo
- **Vercel**: Import project
- Update backend URL in `script.js` for production

## 📊 Sample Evaluation Flow

```
Student Sheet → [OCR] → "Answer 1: Paris is capital..."
Teacher Key   → [OCR] → "Answer 1: Paris is the capital..."
                ↓
           [AI Comparison]
                ↓
Result: 95% match → Score: 9/10 → Status: Correct
```

## 🔒 Security Notes

- API credentials are server-side only
- No sensitive data stored in frontend
- File uploads are processed in memory
- CORS properly configured

## 📈 Future Enhancements

- [ ] **Advanced NLP**: Better answer similarity matching
- [ ] **Multi-language**: Support for different languages  
- [ ] **Batch Processing**: Multiple answer sheets at once
- [ ] **Database**: Store evaluation history
- [ ] **Authentication**: User accounts and history
- [ ] **Analytics**: Performance insights and trends

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Varun Gupta**
- GitHub: [@varungupta132](https://github.com/varungupta132)

## 🙏 Acknowledgments

- **Google Cloud Vision AI** for OCR capabilities
- **Flask** for the web framework
- **Modern Web Technologies** for seamless user experience

---

**Made with ❤️ for automated exam evaluation**

*For detailed setup instructions, see [setup_instructions.md](setup_instructions.md)*