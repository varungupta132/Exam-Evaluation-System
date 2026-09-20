from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import json
from google.cloud import vision
import openai
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Google Vision AI client
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'service-account-key.json'
vision_client = vision.ImageAnnotatorClient()

# OpenRouter API configuration
OPENROUTER_API_KEY = "bhaisk-or-v1-b49a07b0cefde424630a2f90e23ad240b99428a7d104b89b5dd2a4418742f4d7"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_image(image_path):
    """Extract text from image using Google Vision AI"""
    try:
        with open(image_path, 'rb') as image_file:
            content = image_file.read()
        
        image = vision.Image(content=content)
        response = vision_client.text_detection(image=image)
        texts = response.text_annotations
        
        if texts:
            return texts[0].description
        return ""
    except Exception as e:
        print(f"Error in text extraction: {str(e)}")
        return ""

def evaluate_answers_with_ai(student_text, teacher_text):
    """Evaluate student answers against teacher answers using OpenRouter API"""
    try:
        import requests
        
        prompt = f"""
        You are an AI exam evaluator. Compare the student's answers with the teacher's answer key and provide detailed evaluation.

        TEACHER'S ANSWER KEY:
        {teacher_text}

        STUDENT'S ANSWERS:
        {student_text}

        Please analyze and provide:
        1. Overall score out of 100
        2. Total number of questions identified
        3. Detailed evaluation for each question
        4. Constructive feedback

        Response format should be JSON:
        {{
            "overallScore": 85,
            "totalQuestions": 10,
            "correctAnswers": 8,
            "partialAnswers": 1,
            "incorrectAnswers": 1,
            "detailedEvaluation": [
                {{
                    "questionNumber": 1,
                    "status": "correct",
                    "studentAnswer": "extracted answer",
                    "correctAnswer": "expected answer",
                    "score": 10,
                    "maxScore": 10,
                    "feedback": "Good answer with proper explanation"
                }}
            ],
            "overallFeedback": "Overall performance analysis and suggestions for improvement"
        }}
        """
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 4000,
                "temperature": 0.3
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            # Extract JSON from response
            start = content.find('{')
            end = content.rfind('}') + 1
            json_content = content[start:end]
            return json.loads(json_content)
        else:
            return {"error": "Failed to evaluate answers"}
            
    except Exception as e:
        print(f"Error in AI evaluation: {str(e)}")
        return {"error": str(e)}

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "AI Exam Evaluation System API", "status": "running"})

@app.route('/api/upload', methods=['POST'])
def upload_files():
    try:
        if 'studentFile' not in request.files or 'teacherFile' not in request.files:
            return jsonify({"error": "Both student and teacher files are required"}), 400
        
        student_file = request.files['studentFile']
        teacher_file = request.files['teacherFile']
        
        if student_file.filename == '' or teacher_file.filename == '':
            return jsonify({"error": "No files selected"}), 400
        
        if not (allowed_file(student_file.filename) and allowed_file(teacher_file.filename)):
            return jsonify({"error": "Invalid file format. Only PNG, JPG, JPEG, PDF allowed"}), 400
        
        # Save files securely
        student_filename = secure_filename(student_file.filename)
        teacher_filename = secure_filename(teacher_file.filename)
        
        student_path = os.path.join(UPLOAD_FOLDER, f"student_{student_filename}")
        teacher_path = os.path.join(UPLOAD_FOLDER, f"teacher_{teacher_filename}")
        
        student_file.save(student_path)
        teacher_file.save(teacher_path)
        
        return jsonify({
            "message": "Files uploaded successfully",
            "studentPath": student_path,
            "teacherPath": teacher_path
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.get_json()
        student_path = data.get('studentPath')
        teacher_path = data.get('teacherPath')
        
        if not student_path or not teacher_path:
            return jsonify({"error": "File paths are required"}), 400
        
        # Extract text from both images using Google Vision AI
        print("Extracting text from student answer sheet...")
        student_text = extract_text_from_image(student_path)
        
        print("Extracting text from teacher answer key...")
        teacher_text = extract_text_from_image(teacher_path)
        
        if not student_text or not teacher_text:
            return jsonify({"error": "Failed to extract text from images"}), 500
        
        # Evaluate using AI
        print("Evaluating answers with AI...")
        evaluation_result = evaluate_answers_with_ai(student_text, teacher_text)
        
        # Clean up uploaded files
        try:
            os.remove(student_path)
            os.remove(teacher_path)
        except:
            pass  # Files might not exist or already deleted
        
        return jsonify(evaluation_result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "services": {
            "google_vision": "enabled",
            "openrouter": "enabled",
            "flask": "running"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)