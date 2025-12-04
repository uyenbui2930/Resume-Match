const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new job application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      resumeId,
      companyName,
      jobTitle,
      jobDescription,
      applicationUrl,
      notes
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!companyName || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title are required'
      });
    }

    // Create application
    const result = await pool.query(
      `INSERT INTO job_applications 
       (user_id, resume_id, company_name, job_title, job_description, application_url, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, company_name, job_title, status, created_at`,
      [userId, resumeId, companyName, jobTitle, jobDescription, applicationUrl, notes, 'not_submitted']
    );

    const application = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Job application created successfully',
      data: application
    });

  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job application'
    });
  }
});

// Get user's job applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT ja.*, r.filename as resume_filename
      FROM job_applications ja
      LEFT JOIN resumes r ON ja.resume_id = r.id
      WHERE ja.user_id = $1
    `;
    let params = [userId];

    // Filter by status if provided
    if (status) {
      query += ' AND ja.status = $2';
      params.push(status);
    }

    query += ' ORDER BY ja.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        applications: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Get specific job application
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT ja.*, r.filename as resume_filename
       FROM job_applications ja
       LEFT JOIN resumes r ON ja.resume_id = r.id
       WHERE ja.id = $1 AND ja.user_id = $2`,
      [applicationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
});

// Update application status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const { status, notes } = req.body;

    // Valid statuses
    const validStatuses = [
      'not_submitted',
      'submitted', 
      'received_response',
      'interview_requested',
      'rejected_after_interview',
      'onsite_interview_requested',
      'offer_received',
      'rejected',
      'accepted'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    const result = await pool.query(
      `UPDATE job_applications 
       SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, company_name, job_title, status, updated_at`,
      [status, notes, applicationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
});

// Delete application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [applicationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
});

module.exports = router;