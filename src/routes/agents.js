const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const AgentOrchestrator = require('../agents/orchestrator');

const router = express.Router();
const orchestrator = new AgentOrchestrator();

// Test resume scoring agent
router.post('/resume-scorer', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 Agent endpoint called with user:', req.user.id);
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Resume text and job description are required'
      });
    }

    console.log('✅ Calling orchestrator...');
    const result = await orchestrator.executeTask('score-resume', {
      userId: req.user.id,
      resumeText,
      jobDescription
    });

    console.log('✅ Orchestrator result:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ Score resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to score resume',
      error: error.message
    });
  }
});

// Test answer generation agent
router.post('/generate-answers', authenticateToken, async (req, res) => {
  try {
    const { resumeText, jobDescription, questions } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume text and job description are required'
      });
    }

    const defaultQuestions = [
      "Why are you interested in this role?",
      "What makes you a good fit for this position?",
      "What is your greatest strength?"
    ];

    const result = await orchestrator.executeTask('generate-answers', {
      userId: req.user.id,
      resumeText,
      jobDescription,
      questions: questions || defaultQuestions
    });

    res.json(result);

  } catch (error) {
    console.error('Generate answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate answers'
    });
  }
});

// Test autofill agent
router.post('/extract-profile', authenticateToken, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }

    const result = await orchestrator.executeTask('prepare-autofill', {
      userId: req.user.id,
      resumeText
    });

    res.json(result);

  } catch (error) {
    console.error('Extract profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract profile data'
    });
  }
});

// Test full analysis workflow
router.post('/full-analysis', authenticateToken, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume text and job description are required'
      });
    }

    const result = await orchestrator.executeTask('full-application-analysis', {
      userId: req.user.id,
      resumeText,
      jobDescription
    });

    res.json(result);

  } catch (error) {
    console.error('Full analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform full analysis'
    });
  }
});

// Get agent usage statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await orchestrator.getAgentStats(req.user.id);

    res.json({
      success: true,
      data: {
        agentStats: stats,
        totalUsage: stats.reduce((sum, stat) => sum + parseInt(stat.usage_count), 0)
      }
    });

  } catch (error) {
    console.error('Agent stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent statistics'
    });
  }
});

module.exports = router;