class ExamEvaluationDemoSystem {
    constructor() {
        this.studentFile = null;
        this.teacherFile = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload handlers
        this.setupFileUpload('studentUpload', 'studentFile', 'studentPreview');
        this.setupFileUpload('teacherUpload', 'teacherFile', 'teacherPreview');
        
        // Evaluate button
        document.getElementById('evaluateBtn').addEventListener('click', () => {
            this.evaluateAnswerSheet();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSystem();
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadReport();
        });
    }

    setupFileUpload(uploadAreaId, fileInputId, previewId) {
        const uploadArea = document.getElementById(uploadAreaId);
        const fileInput = document.getElementById(fileInputId);
        const preview = document.getElementById(previewId);

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(52, 152, 219, 0.1)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0], fileInputId, preview, uploadArea);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], fileInputId, preview, uploadArea);
            }
        });
    }

    handleFileSelection(file, inputId, previewElement, uploadCard) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
            this.showNotification('File size should be less than 5MB', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please upload only image files (JPG, PNG)', 'error');
            return;
        }

        // Store file reference
        if (inputId === 'studentFile') {
            this.studentFile = file;
        } else {
            this.teacherFile = file;
        }

        // Update UI to show file is uploaded
        uploadCard.classList.add('has-file');
        
        // Show file info
        previewElement.innerHTML = `
            <div class="file-info">
                <span class="file-icon">📎</span>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <span class="file-status">✅</span>
            </div>
        `;

        this.checkIfReadyToEvaluate();
        this.showNotification('File uploaded successfully!', 'success');
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / 1048576) + ' MB';
    }

    checkIfReadyToEvaluate() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        const isReady = this.studentFile && this.teacherFile;
        
        evaluateBtn.disabled = !isReady;
        
        if (isReady) {
            evaluateBtn.innerHTML = `
                <span class="btn-icon">🚀</span>
                <span class="btn-text">Start Evaluation</span>
            `;
        }
    }

    async evaluateAnswerSheet() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        const loader = document.getElementById('loader');
        
        // Show loading state
        evaluateBtn.classList.add('loading');
        evaluateBtn.disabled = true;
        loader.style.display = 'inline-block';
        evaluateBtn.innerHTML = `
            <span class="btn-text">Processing...</span>
            <div class="loader"></div>
        `;
        
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Generate demo results
            const demoResults = this.generateDemoResults();
            
            // Display results
            this.displayResults(demoResults);
            
            this.showNotification('Demo evaluation completed!', 'success');

        } catch (error) {
            console.error('Demo error:', error);
            this.showNotification(`Demo error: ${error.message}`, 'error');
        } finally {
            // Reset button state
            evaluateBtn.classList.remove('loading');
            evaluateBtn.disabled = false;
            loader.style.display = 'none';
            evaluateBtn.innerHTML = `
                <span class="btn-icon">🚀</span>
                <span class="btn-text">Start Evaluation</span>
            `;
        }
    }

    generateDemoResults() {
        // Generate realistic demo results
        return {
            overall_score: 78,
            total_questions: 5,
            correct_answers: 3,
            partial_answers: 1,
            incorrect_answers: 1,
            detailed_evaluation: [
                {
                    question_number: 1,
                    student_answer: "Paris is the capital of France",
                    correct_answer: "Paris is the capital city of France",
                    status: "correct",
                    score: 10,
                    max_score: 10,
                    similarity: 95.2,
                    feedback: "Excellent! Perfect answer."
                },
                {
                    question_number: 2,
                    student_answer: "4",
                    correct_answer: "4 (four)",
                    status: "correct",
                    score: 10,
                    max_score: 10,
                    similarity: 90.0,
                    feedback: "Correct! Numerical answer is accurate."
                },
                {
                    question_number: 3,
                    student_answer: "Jupiter is big planet",
                    correct_answer: "Jupiter is the largest planet in our solar system",
                    status: "partial",
                    score: 6,
                    max_score: 10,
                    similarity: 65.3,
                    feedback: "Partially correct. Missing 'largest' and 'solar system'."
                },
                {
                    question_number: 4,
                    student_answer: "Plants make food from sun",
                    correct_answer: "Photosynthesis is the process by which plants convert sunlight into energy",
                    status: "partial",
                    score: 5,
                    max_score: 10,
                    similarity: 45.8,
                    feedback: "Basic understanding shown but lacks scientific terminology."
                },
                {
                    question_number: 5,
                    student_answer: "Shakespeare",
                    correct_answer: "William Shakespeare wrote Romeo and Juliet",
                    status: "incorrect",
                    score: 3,
                    max_score: 10,
                    similarity: 30.0,
                    feedback: "Incomplete answer. Need full name and context."
                }
            ],
            overall_feedback: "Good performance! You scored 39/50 (78%). Strong understanding of basic concepts. Work on providing more detailed answers."
        };
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const scoreValue = document.getElementById('scoreValue');
        const detailedResults = document.getElementById('detailedResults');

        // Show overall score
        scoreValue.textContent = results.overall_score || 0;
        
        // Update score circle color based on performance
        const scoreCircle = scoreValue.parentElement;
        const score = results.overall_score || 0;
        
        if (score >= 80) {
            scoreCircle.style.background = '#27ae60'; // Green for good score
        } else if (score >= 60) {
            scoreCircle.style.background = '#f39c12'; // Orange for average
        } else {
            scoreCircle.style.background = '#e74c3c'; // Red for low score
        }
        
        // Generate detailed results HTML
        let resultsHTML = `
            <div class="result-summary">
                <h4>📈 Demo Evaluation Results</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
                    <div style="text-align: center; padding: 15px; background: #f0fff0; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">${results.correct_answers || 0}</div>
                        <div style="color: #666;">Correct</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #fff8f0; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #f39c12;">${results.partial_answers || 0}</div>
                        <div style="color: #666;">Partial</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #fff0f0; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">${results.incorrect_answers || 0}</div>
                        <div style="color: #666;">Incorrect</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">${results.total_questions || 0}</div>
                        <div style="color: #666;">Total</div>
                    </div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fff9e6; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
                    <h4>🎯 This is a Demo Version</h4>
                    <p>Showing sample evaluation results. For real OCR and AI processing, deploy the Flask backend with Google Vision API.</p>
                </div>
            </div>
        `;

        if (results.detailed_evaluation && results.detailed_evaluation.length > 0) {
            resultsHTML += '<h4>📝 Question-wise Analysis</h4>';
            
            results.detailed_evaluation.forEach((item, index) => {
                resultsHTML += `
                    <div class="result-item ${item.status}">
                        <h4>Question ${index + 1} - ${item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
                            <span style="float: right; color: #666;">${item.score || 0}/${item.max_score || 10} marks</span>
                        </h4>
                        <p><strong>Sample Student Answer:</strong> ${item.student_answer || 'No answer detected'}</p>
                        <p><strong>Expected Answer:</strong> ${item.correct_answer || 'N/A'}</p>
                        ${item.feedback ? `<p><strong>AI Feedback:</strong> ${item.feedback}</p>` : ''}
                    </div>
                `;
            });
        }

        if (results.overall_feedback) {
            resultsHTML += `
                <div class="result-item">
                    <h4>💡 Overall Feedback</h4>
                    <p>${results.overall_feedback}</p>
                </div>
            `;
        }

        detailedResults.innerHTML = resultsHTML;
        resultsSection.style.display = 'block';
        
        // Scroll to results smoothly
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    resetSystem() {
        // Reset file selections
        this.studentFile = null;
        this.teacherFile = null;
        
        // Clear file inputs
        document.getElementById('studentFile').value = '';
        document.getElementById('teacherFile').value = '';
        
        // Clear previews
        document.getElementById('studentPreview').innerHTML = '';
        document.getElementById('teacherPreview').innerHTML = '';
        
        // Remove file upload styling
        document.querySelectorAll('.upload-card').forEach(card => {
            card.classList.remove('has-file');
        });
        
        // Hide results
        document.getElementById('resultsSection').style.display = 'none';
        
        // Reset button state
        this.checkIfReadyToEvaluate();
        
        this.showNotification('Demo reset successfully!', 'success');
    }

    downloadReport() {
        // Create a simple demo report
        const results = document.getElementById('detailedResults').innerText;
        const score = document.getElementById('scoreValue').innerText;
        
        const reportContent = `
AI EXAM EVALUATION SYSTEM - DEMO REPORT
=======================================

Overall Score: ${score}/100
Generated on: ${new Date().toLocaleString()}

${results}

---
This is a DEMO version of the AI Exam Evaluation System.

For production use:
- Deploy Flask backend with Google Vision API
- Configure real OCR text extraction
- Set up cloud hosting for scalability

Built with ❤️ using:
- Python Flask + Google Vision AI
- HTML5, CSS3, JavaScript
- Modern AI evaluation algorithms

Repository: https://github.com/varungupta132/Exam-Evaluation-System
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_evaluation_demo_report_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Demo report downloaded!', 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.background = '#27ae60';
            notification.textContent = `✅ ${message}`;
        } else {
            notification.style.background = '#e74c3c';
            notification.textContent = `❌ ${message}`;
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the demo system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExamEvaluationDemoSystem();
});