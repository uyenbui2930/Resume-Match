const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get application statistics
    const applicationStats = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM job_applications 
       WHERE user_id = $1 
       GROUP BY status`,
      [userId]
    );

    // Get total applications count
    const totalAppsResult = await pool.query(
      'SELECT COUNT(*) as total FROM job_applications WHERE user_id = $1',
      [userId]
    );

    // Get resume count
    const resumeCountResult = await pool.query(
      'SELECT COUNT(*) as total FROM resumes WHERE user_id = $1',
      [userId]
    );

    // Get recent applications
    const recentApplications = await pool.query(
      `SELECT 
        id, company_name, job_title, status, created_at, updated_at
       FROM job_applications 
       WHERE user_id = $1 
       ORDER BY updated_at DESC 
       LIMIT 10`,
      [userId]
    );

    // Get agent activity (placeholder for now)
    const agentActivity = await pool.query(
      `SELECT 
        agent_type,
        COUNT(*) as usage_count,
        AVG(score) as avg_score
       FROM agent_results 
       WHERE user_id = $1 
       GROUP BY agent_type`,
      [userId]
    );

    // Format status statistics
    const statusCounts = {};
    applicationStats.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalApplications: parseInt(totalAppsResult.rows[0].total),
          totalResumes: parseInt(resumeCountResult.rows[0].total),
          statusBreakdown: statusCounts
        },
        recentActivity: recentApplications.rows,
        agentUsage: agentActivity.rows
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get application status analytics
router.get('/analytics/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30' } = req.query; // days

    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        DATE_TRUNC('day', created_at) as date
      FROM job_applications 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${parseInt(timeframe)} days'
      GROUP BY status, DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(query, [userId]);

    // Also get overall status distribution
    const statusDistribution = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM job_applications 
       WHERE user_id = $1
       GROUP BY status
       ORDER BY count DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        timeSeriesData: result.rows,
        statusDistribution: statusDistribution.rows,
        timeframe: `${timeframe} days`
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Get agent performance metrics
router.get('/analytics/agents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const agentMetrics = await pool.query(
      `SELECT 
        agent_type,
        COUNT(*) as total_runs,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score,
        DATE_TRUNC('day', created_at) as date
       FROM agent_results 
       WHERE user_id = $1 
       GROUP BY agent_type, DATE_TRUNC('day', created_at)
       ORDER BY date DESC, agent_type`,
      [userId]
    );

    // Get recent agent results
    const recentResults = await pool.query(
      `SELECT 
        agent_type, score, recommendations, created_at
       FROM agent_results 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        agentMetrics: agentMetrics.rows,
        recentResults: recentResults.rows
      }
    });

  } catch (error) {
    console.error('Agent analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent analytics'
    });
  }
});

// Get application pipeline view
router.get('/pipeline', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Define the application pipeline stages
    const pipelineStages = [
      'not_submitted',
      'submitted',
      'received_response', 
      'interview_requested',
      'onsite_interview_requested',
      'offer_received'
    ];

    const pipelineData = [];

    for (const stage of pipelineStages) {
      const result = await pool.query(
        `SELECT 
          id, company_name, job_title, updated_at
         FROM job_applications 
         WHERE user_id = $1 AND status = $2
         ORDER BY updated_at DESC`,
        [userId, stage]
      );

      pipelineData.push({
        stage: stage,
        count: result.rows.length,
        applications: result.rows
      });
    }

    // Also get rejected applications
    const rejectedResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM job_applications 
       WHERE user_id = $1 AND status IN ('rejected', 'rejected_after_interview')`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        pipeline: pipelineData,
        rejected: parseInt(rejectedResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Pipeline data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline data'
    });
  }
});

module.exports = router;