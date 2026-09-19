# 🎓 AI-Based Exam Evaluation System

An intelligent automated system to evaluate scanned examination answer sheets using AI technology.

## 🌟 Features

- **📄 Dual Upload System**: Upload both student answer sheets and teacher answer keys
- **🤖 AI-Powered Evaluation**: Uses OpenRouter API with Claude 3.5 Sonnet for intelligent answer comparison
- **📊 Detailed Results**: Get comprehensive scoring with question-wise breakdown
- **💯 Smart Scoring**: Automatic scoring out of 100 with partial credit support
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Clean, professional interface with smooth animations

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Integration**: OpenRouter API
- **Image Processing**: OCR text extraction simulation
- **Deployment**: GitHub Pages ready

## 🛠️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/varungupta132/Exam-Evaluation-System.git
   cd Exam-Evaluation-System
   ```

2. **Get OpenRouter API Key**
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up and get your API key
   - Keep your API key ready for use

3. **Run the Application**
   - Open `index.html` in your browser
   - Or serve it using a local server:
   ```bash
   python -m http.server 8000
   # Or use Live Server extension in VS Code
   ```

## 📋 How to Use

1. **Enter API Key**: Input your OpenRouter API key in the designated field
2. **Upload Student Sheet**: Upload the student's answer sheet (JPG, PNG, or PDF)
3. **Upload Answer Key**: Upload the teacher's answer key for comparison
4. **Evaluate**: Click "Evaluate Answer Sheet" to start AI processing
5. **View Results**: Get detailed scores and feedback for each question

## 🎯 Key Components

### File Upload System
- Drag & drop support
- File type validation
- Size limit (10MB max)
- Visual feedback

### AI Evaluation Engine
- OCR text extraction simulation
- Intelligent answer comparison
- Partial credit calculation
- Detailed feedback generation

### Results Display
- Overall score visualization
- Question-wise breakdown
- Color-coded results (correct/incorrect/partial)
- Comprehensive feedback

## 🔧 API Integration

The system uses OpenRouter API with the following configuration:
- **Model**: Claude 3.5 Sonnet (anthropic/claude-3.5-sonnet)
- **Max Tokens**: 4000
- **Temperature**: 0.3 (for consistent evaluation)

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Deployment

This project is deployment-ready for:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## 🔒 Security

- API keys are handled client-side only
- No server-side storage of sensitive data
- Secure HTTPS API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Varun Gupta**
- GitHub: [@varungupta132](https://github.com/varungupta132)

## 🙏 Acknowledgments

- OpenRouter.ai for providing AI API services
- Claude 3.5 Sonnet for intelligent evaluation capabilities
- Modern web technologies for seamless user experience

---

Made with ❤️ for automated exam evaluation