from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
import io
import os
import base64
import json
import re
from PIL import Image
import openai
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure your API keys
# Set environment variables:
# GOOGLE_APPLICATION_CREDENTIALS = path to your Google Cloud service account key
# OPENAI_API_KEY = your OpenAI API key (for answer comparison)

class ExamEvaluator:
    def __init__(self):
        self.vision_client = vision.ImageAnnotatorClient()
        # You can use OpenAI or any other LLM for answer comparison
        # openai.api_key = os.environ.get('OPENAI_API_KEY')
        
    def extract_text_from_image(self, image_content):
        """Extract text from image using Google Vision AI OCR"""
        try:
            image = vision.Image(content=image_content)
            response = self.vision_client.text_detection(image=image)
            texts = response.text_annotations
            
            if texts:
                # First annotation contains the entire text
                full_text = texts[0].description
                return self.process_extracted_text(full_text)
            else:
                return "No text found in image"
                
        except Exception as e:
            print(f"Error in text extraction: {str(e)}")
            return f"Error extracting text: {str(e)}"
    
    def process_extracted_text(self, raw_text):
        """Process and structure the extracted text"""
        # Clean up the text
        lines = raw_text.strip().split('\n')
        processed_lines = []
        
        for line in lines:
            line = line.strip()
            if line:  # Skip empty lines
                processed_lines.append(line)
        
        return '\n'.join(processed_lines)
    
    def extract_questions_and_answers(self, text):
        """Extract individual questions and answers from text"""
        questions = []
        
        # Simple pattern matching for questions (you can improve this)
        # Look for patterns like "1.", "Q1:", "Question 1", etc.
        question_patterns = [
            r'^\d+[\.\)]\s*(.+?)(?=^\d+[\.\)]|\Z)',  # 1. or 1)
            r'^Q\s*\d+[\:\.]?\s*(.+?)(?=^Q\s*\d+[\:\.]?|\Z)',  # Q1: or Q1.
            r'^Question\s+\d+[\:\.]?\s*(.+?)(?=^Question\s+\d+[\:\.]?|\Z)'  # Question 1:
        ]
        
        text_lines = text.split('\n')
        current_question = ""
        current_answer = ""
        
        for line in text_lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if this line starts a new question
            is_question = False
            for pattern in question_patterns:
                if re.match(pattern, line, re.IGNORECASE | re.MULTILINE):
                    is_question = True
                    break
            
            if is_question:
                # Save previous question if exists
                if current_question:
                    questions.append({
                        'question': current_question.strip(),
                        'answer': current_answer.strip()
                    })
                
                current_question = line
                current_answer = ""
            else:
                # This is part of the answer
                if current_question:
                    current_answer += " " + line
        
        # Don't forget the last question
        if current_question:
            questions.append({
                'question': current_question.strip(),
                'answer': current_answer.strip()
            })
        
        return questions
    
    def compare_answers(self, student_answers, teacher_answers):
        """Compare student answers with teacher answers using simple text matching"""
        results = []
        
        # Ensure we have the same number of questions
        max_questions = min(len(student_answers), len(teacher_answers))
        
        for i in range(max_questions):
            student_ans = student_answers[i]['answer'].lower().strip()
            teacher_ans = teacher_answers[i]['answer'].lower().strip()
            
            # Simple similarity check (you can improve this with NLP libraries)
            similarity = self.calculate_similarity(student_ans, teacher_ans)
            
            if similarity >= 0.8:
                status = "correct"
                score = 10
                feedback = "Excellent! Answer matches the expected response."
            elif similarity >= 0.5:
                status = "partial"
                score = 6
                feedback = "Partially correct. Some key points are missing or unclear."
            else:
                status = "incorrect"
                score = 2
                feedback = "Answer needs improvement. Please review the topic."
            
            results.append({
                'question_number': i + 1,
                'student_answer': student_answers[i]['answer'][:200] + "..." if len(student_answers[i]['answer']) > 200 else student_answers[i]['answer'],
                'correct_answer': teacher_answers[i]['answer'][:200] + "..." if len(teacher_answers[i]['answer']) > 200 else teacher_answers[i]['answer'],
                'status': status,
                'score': score,
                'max_score': 10,
                'similarity': round(similarity * 100, 2),
                'feedback': feedback
            })
        
        return results
    
    def calculate_similarity(self, text1, text2):
        """Calculate similarity between two texts using simple word matching"""
        if not text1 or not text2:
            return 0.0
        
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def generate_overall_feedback(self, results):
        """Generate overall feedback based on evaluation results"""
        total_questions = len(results)
        correct_count = sum(1 for r in results if r['status'] == 'correct')
        partial_count = sum(1 for r in results if r['status'] == 'partial')
        incorrect_count = total_questions - correct_count - partial_count
        
        total_score = sum(r['score'] for r in results)
        max_possible_score = total_questions * 10
        percentage = (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0
        
        if percentage >= 80:
            performance = "Excellent"
            advice = "Keep up the great work! Your understanding is very strong."
        elif percentage >= 60:
            performance = "Good"
            advice = "Well done! Review the topics where you lost marks for improvement."
        elif percentage >= 40:
            performance = "Fair"
            advice = "You have a basic understanding. Focus on studying the key concepts more thoroughly."
        else:
            performance = "Needs Improvement"
            advice = "Please dedicate more time to studying these topics. Consider seeking additional help."
        
        feedback = f"""
        {performance} performance! You scored {total_score}/{max_possible_score} ({percentage:.1f}%).
        
        Breakdown: {correct_count} correct, {partial_count} partial, {incorrect_count} incorrect answers.
        
        Recommendation: {advice}
        """
        
        return feedback.strip()

# Initialize evaluator
evaluator = ExamEvaluator()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "AI Exam Evaluation System API",
        "status": "running",
        "endpoints": {
            "/evaluate": "POST - Upload student and teacher sheets for evaluation",
            "/health": "GET - Check API health"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "google_vision": "available",
            "flask_server": "running"
        }
    })

@app.route('/evaluate', methods=['POST'])
def evaluate_exam():
    try:
        # Check if files are present
        if 'student_sheet' not in request.files or 'teacher_key' not in request.files:
            return jsonify({
                "error": "Both student_sheet and teacher_key files are required"
            }), 400
        
        student_file = request.files['student_sheet']
        teacher_file = request.files['teacher_key']
        
        if student_file.filename == '' or teacher_file.filename == '':
            return jsonify({
                "error": "Please select valid files"
            }), 400
        
        # Read file contents
        student_content = student_file.read()
        teacher_content = teacher_file.read()
        
        print("Starting text extraction from images...")
        
        # Extract text using Google Vision AI
        student_text = evaluator.extract_text_from_image(student_content)
        teacher_text = evaluator.extract_text_from_image(teacher_content)
        
        print(f"Student text extracted: {len(student_text)} characters")
        print(f"Teacher text extracted: {len(teacher_text)} characters")
        
        # Extract questions and answers
        student_qa = evaluator.extract_questions_and_answers(student_text)
        teacher_qa = evaluator.extract_questions_and_answers(teacher_text)
        
        print(f"Student Q&A extracted: {len(student_qa)} items")
        print(f"Teacher Q&A extracted: {len(teacher_qa)} items")
        
        # If no structured Q&A found, treat entire text as single answer
        if not student_qa:
            student_qa = [{'question': 'Complete Answer', 'answer': student_text}]
        if not teacher_qa:
            teacher_qa = [{'question': 'Complete Answer', 'answer': teacher_text}]
        
        # Compare answers
        comparison_results = evaluator.compare_answers(student_qa, teacher_qa)
        
        # Calculate overall statistics
        total_questions = len(comparison_results)
        correct_answers = sum(1 for r in comparison_results if r['status'] == 'correct')
        partial_answers = sum(1 for r in comparison_results if r['status'] == 'partial')
        incorrect_answers = total_questions - correct_answers - partial_answers
        
        total_score = sum(r['score'] for r in comparison_results)
        max_possible_score = total_questions * 10
        overall_score = round((total_score / max_possible_score) * 100) if max_possible_score > 0 else 0
        
        # Generate overall feedback
        overall_feedback = evaluator.generate_overall_feedback(comparison_results)
        
        # Prepare response
        response_data = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "overall_score": overall_score,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "partial_answers": partial_answers,
            "incorrect_answers": incorrect_answers,
            "detailed_evaluation": comparison_results,
            "overall_feedback": overall_feedback,
            "extracted_texts": {
                "student_preview": student_text[:500] + "..." if len(student_text) > 500 else student_text,
                "teacher_preview": teacher_text[:500] + "..." if len(teacher_text) > 500 else teacher_text
            }
        }
        
        print(f"Evaluation completed. Overall score: {overall_score}%")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error during evaluation: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Error during evaluation: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("Starting AI Exam Evaluation System...")
    print("Make sure you have set up Google Cloud Vision API credentials!")
    print("Backend running on: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)