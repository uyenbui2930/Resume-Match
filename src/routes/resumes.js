const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Accept PDF, DOC, DOCX files
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'), false);
    }
  }
});

// Upload resume
router.post('/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    const userId = req.user.id;

    // Save resume info to database
    const result = await pool.query(
      'INSERT INTO resumes (user_id, filename, file_path, content_text) VALUES ($1, $2, $3, $4) RETURNING id, filename, created_at',
      [userId, originalname, filePath, 'Content extraction pending...'] // We'll add actual text extraction later
    );

    const resume = result.rows[0];

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        id: resume.id,
        filename: resume.filename,
        size: size,
        uploadDate: resume.created_at
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
});

// Get user's resumes
router.get('/my-resumes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, filename, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: {
        resumes: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes'
    });
  }
});

// Get specific resume details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resume = result.rows[0];

    res.json({
      success: true,
      data: {
        id: resume.id,
        filename: resume.filename,
        contentText: resume.content_text,
        createdAt: resume.created_at
      }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume'
    });
  }
});

// Delete resume
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    // Get resume file path first
    const resumeResult = await pool.query(
      'SELECT file_path FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const filePath = resumeResult.rows[0].file_path;

    // Delete from database
    await pool.query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );

    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
});

module.exports = router;