const express = require('express');
const cors = require('cors');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 16 * 1024 * 1024, // 16MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Initialize Google Vision client
const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 
    "bhaisk-or-v1-b49a07b0cefde424630a2f90e23ad240b99428a7d104b89b5dd2a4418742f4d7";

// Utility function to extract text from image
async function extractTextFromImage(imagePath) {
    try {
        const [result] = await visionClient.textDetection(imagePath);
        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
            return detections[0].description;
        }
        return '';
    } catch (error) {
        console.error('Error in text extraction:', error);
        throw new Error('Failed to extract text from image');
    }
}

// AI evaluation function
async function evaluateAnswersWithAI(studentText, teacherText) {
    try {
        const prompt = `
You are an AI exam evaluator. Compare the student's answers with the teacher's answer key and provide detailed evaluation.

TEACHER'S ANSWER KEY:
${teacherText}

STUDENT'S ANSWERS:
${studentText}

Please analyze and provide:
1. Overall score out of 100
2. Total number of questions identified
3. Detailed evaluation for each question
4. Constructive feedback

Response format should be JSON:
{
    "overallScore": 85,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "partialAnswers": 1,
    "incorrectAnswers": 1,
    "detailedEvaluation": [
        {
            "questionNumber": 1,
            "status": "correct",
            "studentAnswer": "extracted answer",
            "correctAnswer": "expected answer",
            "score": 10,
            "maxScore": 10,
            "feedback": "Good answer with proper explanation"
        }
    ],
    "overallFeedback": "Overall performance analysis and suggestions for improvement"
}
        `;

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'anthropic/claude-3.5-sonnet',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4000,
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        
        // Extract JSON from response
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        const jsonContent = content.slice(jsonStart, jsonEnd);
        
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Error in AI evaluation:', error);
        throw new Error('Failed to evaluate answers with AI');
    }
}

// Utility function to delete file
function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '📚 Exam Evaluation System API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            upload: 'POST /api/upload',
            evaluate: 'POST /api/evaluate',
            health: 'GET /api/health'
        }
    });
});

app.post('/api/upload', upload.fields([
    { name: 'studentFile', maxCount: 1 },
    { name: 'teacherFile', maxCount: 1 }
]), (req, res) => {
    try {
        if (!req.files || !req.files.studentFile || !req.files.teacherFile) {
            return res.status(400).json({
                error: 'Both student and teacher files are required'
            });
        }

        const studentFile = req.files.studentFile[0];
        const teacherFile = req.files.teacherFile[0];

        res.json({
            message: 'Files uploaded successfully',
            studentPath: studentFile.path,
            teacherPath: teacherFile.path,
            studentFilename: studentFile.filename,
            teacherFilename: teacherFile.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/evaluate', async (req, res) => {
    let studentPath, teacherPath;
    
    try {
        const { studentPath: reqStudentPath, teacherPath: reqTeacherPath } = req.body;
        
        if (!reqStudentPath || !reqTeacherPath) {
            return res.status(400).json({
                error: 'File paths are required'
            });
        }

        studentPath = reqStudentPath;
        teacherPath = reqTeacherPath;

        console.log('🔍 Extracting text from student answer sheet...');
        const studentText = await extractTextFromImage(studentPath);
        
        console.log('🔍 Extracting text from teacher answer key...');
        const teacherText = await extractTextFromImage(teacherPath);
        
        if (!studentText || !teacherText) {
            throw new Error('Failed to extract text from one or both images');
        }

        console.log('🤖 Evaluating answers with AI...');
        const evaluationResult = await evaluateAnswersWithAI(studentText, teacherText);
        
        // Clean up uploaded files
        deleteFile(studentPath);
        deleteFile(teacherPath);
        
        res.json(evaluationResult);
        
    } catch (error) {
        console.error('Evaluation error:', error);
        
        // Clean up files in case of error
        if (studentPath) deleteFile(studentPath);
        if (teacherPath) deleteFile(teacherPath);
        
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            express: 'running',
            googleVision: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
            openRouter: !!OPENROUTER_API_KEY
        },
        environment: {
            nodeVersion: process.version,
            platform: process.platform
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large (max 16MB)' });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Exam Evaluation System Backend Starting...');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Google Vision: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Enabled' : 'Not configured'}`);
    console.log(`🤖 OpenRouter: ${!!OPENROUTER_API_KEY ? 'Enabled' : 'Not configured'}`);
    console.log('📚 Ready to evaluate answer sheets!');
});

module.exports = app;