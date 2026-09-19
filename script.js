class ExamEvaluationSystem {
    constructor() {
        this.studentFile = null;
        this.teacherFile = null;
        this.apiKey = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload handlers
        this.setupFileUpload('studentUpload', 'studentFile', 'studentFileInfo');
        this.setupFileUpload('teacherUpload', 'teacherFile', 'teacherFileInfo');
        
        // API key input
        document.getElementById('apiKey').addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            this.checkIfReadyToEvaluate();
        });

        // Evaluate button
        document.getElementById('evaluateBtn').addEventListener('click', () => {
            this.evaluateAnswerSheet();
        });
    }

    setupFileUpload(uploadAreaId, fileInputId, fileInfoId) {
        const uploadArea = document.getElementById(uploadAreaId);
        const fileInput = document.getElementById(fileInputId);
        const fileInfo = document.getElementById(fileInfoId);

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0], fileInputId, fileInfo);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], fileInputId, fileInfo);
            }
        });
    }

    handleFileSelection(file, inputId, fileInfoElement) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            alert('File size should be less than 10MB');
            return;
        }

        // Store file reference
        if (inputId === 'studentFile') {
            this.studentFile = file;
        } else {
            this.teacherFile = file;
        }

        // Show file info
        fileInfoElement.innerHTML = `
            <strong>Selected:</strong> ${file.name} (${this.formatFileSize(file.size)})
        `;
        fileInfoElement.classList.add('show');

        this.checkIfReadyToEvaluate();
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / 1048576) + ' MB';
    }

    checkIfReadyToEvaluate() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        const isReady = this.studentFile && this.teacherFile && this.apiKey.trim();
        
        evaluateBtn.disabled = !isReady;
    }

    async evaluateAnswerSheet() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        evaluateBtn.classList.add('loading');
        
        try {
            // Convert files to base64 for processing
            const studentImageData = await this.fileToBase64(this.studentFile);
            const teacherImageData = await this.fileToBase64(this.teacherFile);

            // Extract text from both images using OCR simulation
            const studentAnswers = await this.extractTextFromImage(studentImageData, 'student');
            const teacherAnswers = await this.extractTextFromImage(teacherImageData, 'teacher');

            // Evaluate answers using OpenRouter API
            const evaluationResults = await this.evaluateWithAI(studentAnswers, teacherAnswers);

            // Display results
            this.displayResults(evaluationResults);

        } catch (error) {
            console.error('Evaluation error:', error);
            alert('Error during evaluation: ' + error.message);
        } finally {
            evaluateBtn.classList.remove('loading');
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async extractTextFromImage(imageData, type) {
        // Simulate OCR text extraction
        // In real implementation, this would use Google Vision API or similar
        
        const prompt = `Extract text from this ${type} answer sheet image. 
        Focus on identifying questions and their corresponding answers.
        Return the extracted text in a structured format.`;

        try {
            const response = await this.callOpenRouterAPI(prompt, imageData);
            return response;
        } catch (error) {
            throw new Error(`Failed to extract text from ${type} sheet: ` + error.message);
        }
    }

    async evaluateWithAI(studentAnswers, teacherAnswers) {
        const evaluationPrompt = `
        You are an AI exam evaluator. Compare the student's answers with the teacher's answer key and provide evaluation.

        TEACHER'S ANSWER KEY:
        ${teacherAnswers}

        STUDENT'S ANSWERS:
        ${studentAnswers}

        Please provide:
        1. Overall score out of 100
        2. Detailed evaluation for each question
        3. Feedback and areas for improvement

        Format your response as JSON with this structure:
        {
            "overallScore": 85,
            "totalQuestions": 10,
            "correctAnswers": 8,
            "partialAnswers": 1,
            "incorrectAnswers": 1,
            "detailedEvaluation": [
                {
                    "questionNumber": 1,
                    "status": "correct|incorrect|partial",
                    "studentAnswer": "...",
                    "correctAnswer": "...",
                    "score": 10,
                    "feedback": "..."
                }
            ],
            "overallFeedback": "Overall performance analysis..."
        }
        `;

        try {
            const response = await this.callOpenRouterAPI(evaluationPrompt);
            return JSON.parse(response);
        } catch (error) {
            throw new Error('Failed to evaluate answers: ' + error.message);
        }
    }

    async callOpenRouterAPI(prompt, imageData = null) {
        const messages = [{
            role: "user",
            content: imageData ? [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageData } }
            ] : prompt
        }];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Exam Evaluation System'
            },
            body: JSON.stringify({
                model: "anthropic/claude-3.5-sonnet",
                messages: messages,
                max_tokens: 4000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const scoreValue = document.getElementById('scoreValue');
        const detailedResults = document.getElementById('detailedResults');

        // Show overall score
        scoreValue.textContent = results.overallScore || '--';
        
        // Generate detailed results HTML
        let resultsHTML = `
            <div class="result-summary">
                <h4>Evaluation Summary</h4>
                <p><strong>Total Questions:</strong> ${results.totalQuestions || 0}</p>
                <p><strong>Correct Answers:</strong> ${results.correctAnswers || 0}</p>
                <p><strong>Partial Credit:</strong> ${results.partialAnswers || 0}</p>
                <p><strong>Incorrect Answers:</strong> ${results.incorrectAnswers || 0}</p>
                <p><strong>Overall Score:</strong> ${results.overallScore || 0}/100</p>
            </div>
        `;

        if (results.detailedEvaluation && results.detailedEvaluation.length > 0) {
            resultsHTML += '<div class="detailed-breakdown"><h4>Question-wise Breakdown</h4>';
            
            results.detailedEvaluation.forEach(item => {
                resultsHTML += `
                    <div class="result-item ${item.status}">
                        <h4>Question ${item.questionNumber} - ${item.status.toUpperCase()} (${item.score || 0} marks)</h4>
                        <p><strong>Student Answer:</strong> ${item.studentAnswer || 'No answer detected'}</p>
                        <p><strong>Expected Answer:</strong> ${item.correctAnswer || 'N/A'}</p>
                        <p><strong>Feedback:</strong> ${item.feedback || 'No specific feedback'}</p>
                    </div>
                `;
            });
            
            resultsHTML += '</div>';
        }

        if (results.overallFeedback) {
            resultsHTML += `
                <div class="result-item">
                    <h4>Overall Feedback</h4>
                    <p>${results.overallFeedback}</p>
                </div>
            `;
        }

        detailedResults.innerHTML = resultsHTML;
        resultsSection.classList.add('show');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExamEvaluationSystem();
});