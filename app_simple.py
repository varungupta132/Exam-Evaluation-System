from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import os
import json
import re
from datetime import datetime
import base64

app = Flask(__name__)
CORS(app)

class SimpleExamEvaluator:
    def __init__(self):
        print("🤖 Simple Exam Evaluator initialized")
        
    def simulate_ocr_extraction(self, image_content, image_type="student"):
        """Simulate OCR text extraction (for demo purposes)"""
        # This simulates what Google Vision AI would return
        if image_type == "student":
            return """
1. What is the capital of France?
Paris is the capital city of France.

2. Solve: 2 + 2 = ?
4

3. Name the largest planet in our solar system.
Jupiter is the largest planet.

4. What is photosynthesis?
Photosynthesis is the process by which plants make food using sunlight.

5. Who wrote Romeo and Juliet?
William Shakespeare wrote Romeo and Juliet.
            """.strip()
        else:  # teacher answers
            return """
1. What is the capital of France?
Paris is the capital city of France and one of the most visited cities in the world.

2. Solve: 2 + 2 = ?
4 (four)

3. Name the largest planet in our solar system.
Jupiter is the largest planet in our solar system.

4. What is photosynthesis?
Photosynthesis is the biological process by which plants convert sunlight into energy.

5. Who wrote Romeo and Juliet?
William Shakespeare, the famous English playwright, wrote Romeo and Juliet.
            """.strip()
    
    def extract_questions_and_answers(self, text):
        """Extract individual questions and answers from text"""
        questions = []
        lines = text.strip().split('\n')
        
        current_question = ""
        current_answer = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with a number (question)
            if re.match(r'^\d+\.', line):
                # Save previous Q&A if exists
                if current_question and current_answer:
                    questions.append({
                        'question': current_question.strip(),
                        'answer': current_answer.strip()
                    })
                
                current_question = line
                current_answer = ""
            else:
                # This is part of the answer
                current_answer += " " + line if current_answer else line
        
        # Don't forget the last question
        if current_question and current_answer:
            questions.append({
                'question': current_question.strip(),
                'answer': current_answer.strip()
            })
        
        return questions
    
    def calculate_similarity(self, text1, text2):
        """Calculate similarity between two texts"""
        if not text1 or not text2:
            return 0.0
        
        # Convert to lowercase and split into words
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        if not words1 or not words2:
            return 0.0
        
        # Calculate Jaccard similarity
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def compare_answers(self, student_answers, teacher_answers):
        """Compare student answers with teacher answers"""
        results = []
        max_questions = min(len(student_answers), len(teacher_answers))
        
        for i in range(max_questions):
            student_ans = student_answers[i]['answer'].lower().strip()
            teacher_ans = teacher_answers[i]['answer'].lower().strip()
            
            # Calculate similarity
            similarity = self.calculate_similarity(student_ans, teacher_ans)
            
            # Determine score and status
            if similarity >= 0.8:
                status = "correct"
                score = 10
                feedback = "Excellent! Answer is accurate and complete."
            elif similarity >= 0.6:
                status = "partial"
                score = 7
                feedback = "Good answer! Some details could be improved."
            elif similarity >= 0.3:
                status = "partial"
                score = 5
                feedback = "Partially correct. Missing some key information."
            else:
                status = "incorrect"
                score = 2
                feedback = "Answer needs significant improvement."
            
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
    
    def generate_overall_feedback(self, results):
        """Generate overall feedback"""
        total_questions = len(results)
        total_score = sum(r['score'] for r in results)
        max_possible_score = total_questions * 10
        percentage = (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0
        
        correct_count = sum(1 for r in results if r['status'] == 'correct')
        partial_count = sum(1 for r in results if r['status'] == 'partial')
        
        if percentage >= 80:
            performance = "Excellent"
            advice = "Outstanding performance! Keep up the great work."
        elif percentage >= 60:
            performance = "Good" 
            advice = "Well done! Review areas where you lost marks."
        elif percentage >= 40:
            performance = "Average"
            advice = "You have basic understanding. More practice needed."
        else:
            performance = "Needs Improvement"
            advice = "Please study the topics more thoroughly."
        
        return f"{performance} performance! Score: {total_score}/{max_possible_score} ({percentage:.1f}%). {advice}"

# Initialize evaluator
evaluator = SimpleExamEvaluator()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "🎓 AI Exam Evaluation System API",
        "status": "running",
        "version": "demo",
        "endpoints": {
            "/evaluate": "POST - Upload student and teacher sheets",
            "/health": "GET - Health check"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "message": "🚀 System is running perfectly!"
    })

@app.route('/evaluate', methods=['POST'])
def evaluate_exam():
    try:
        print("📝 Starting evaluation process...")
        
        # Check if files are present
        if 'student_sheet' not in request.files or 'teacher_key' not in request.files:
            return jsonify({
                "error": "Both student_sheet and teacher_key files are required",
                "success": False
            }), 400
        
        student_file = request.files['student_sheet']
        teacher_file = request.files['teacher_key']
        
        if student_file.filename == '' or teacher_file.filename == '':
            return jsonify({
                "error": "Please select valid files",
                "success": False
            }), 400
        
        print(f"📁 Files received: {student_file.filename}, {teacher_file.filename}")
        
        # Read file contents (for validation)
        student_content = student_file.read()
        teacher_content = teacher_file.read()
        
        print(f"📊 File sizes: Student={len(student_content)} bytes, Teacher={len(teacher_content)} bytes")
        
        # Simulate OCR extraction (since we don't have Google Vision setup)
        print("🔍 Simulating OCR text extraction...")
        student_text = evaluator.simulate_ocr_extraction(student_content, "student")
        teacher_text = evaluator.simulate_ocr_extraction(teacher_content, "teacher")
        
        # Extract Q&A from texts
        student_qa = evaluator.extract_questions_and_answers(student_text)
        teacher_qa = evaluator.extract_questions_and_answers(teacher_text)
        
        print(f"✅ Extracted: {len(student_qa)} student answers, {len(teacher_qa)} teacher answers")
        
        # Compare answers
        comparison_results = evaluator.compare_answers(student_qa, teacher_qa)
        
        # Calculate statistics
        total_questions = len(comparison_results)
        correct_answers = sum(1 for r in comparison_results if r['status'] == 'correct')
        partial_answers = sum(1 for r in comparison_results if r['status'] == 'partial')
        incorrect_answers = total_questions - correct_answers - partial_answers
        
        total_score = sum(r['score'] for r in comparison_results)
        max_possible_score = total_questions * 10
        overall_score = round((total_score / max_possible_score) * 100) if max_possible_score > 0 else 0
        
        # Generate feedback
        overall_feedback = evaluator.generate_overall_feedback(comparison_results)
        
        print(f"🎯 Evaluation completed! Score: {overall_score}%")
        
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
            "demo_note": "This is a demo version with simulated OCR. For production, integrate Google Vision API."
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error during evaluation: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting AI Exam Evaluation System (Demo Version)...")
    print("📝 Note: Using simulated OCR - for production, setup Google Vision API")
    print("🌐 Server starting at: http://localhost:5000")
    print("🎯 Frontend should connect to this backend")
    print("-" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)