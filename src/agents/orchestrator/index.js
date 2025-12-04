const { pool } = require('../../config/database');

// Import individual agents
const ResumeScorer = require('../resume-scorer');
const AnswerGenerator = require('../answer-generator');
const AutofillAgent = require('../autofill-agent');

class AgentOrchestrator {
  constructor() {
    this.agents = {
      'resume-scorer': new ResumeScorer(),
      'answer-generator': new AnswerGenerator(), 
      'autofill-agent': new AutofillAgent()
    };
  }

  /**
   * Main orchestration method - decides which agents to run based on task
   * @param {string} task - The task type (e.g., 'score-resume', 'generate-answers')
   * @param {Object} context - User context and input data
   * @returns {Object} - Results from agent execution
   */
  async executeTask(task, context) {
    try {
      console.log(`🤖 Agent Orchestrator: Starting task "${task}"`);
      
      const startTime = Date.now();
      let result;

      switch (task) {
        case 'score-resume':
          result = await this.scoreResumeWorkflow(context);
          break;
          
        case 'generate-answers':
          result = await this.generateAnswersWorkflow(context);
          break;
          
        case 'prepare-autofill':
          result = await this.prepareAutofillWorkflow(context);
          break;
          
        case 'full-application-analysis':
          result = await this.fullAnalysisWorkflow(context);
          break;
          
        default:
          throw new Error(`Unknown task: ${task}`);
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ Task "${task}" completed in ${executionTime}ms`);

      // Store agent result in database
      await this.storeAgentResult(context.userId, task, context, result);

      return {
        success: true,
        task,
        executionTime,
        data: result
      };

    } catch (error) {
      console.error(`❌ Agent orchestrator error for task "${task}":`, error);
      return {
        success: false,
        task,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Resume scoring workflow - analyzes resume against job description
   */
  async scoreResumeWorkflow(context) {
    const { resumeText, jobDescription, userId } = context;
    
    console.log('📊 Running resume scoring workflow...');
    
    // Run resume scorer agent
    const scoringResult = await this.agents['resume-scorer'].analyze(resumeText, jobDescription);
    
    return {
      agentType: 'resume-scorer',
      score: scoringResult.score,
      recommendations: scoringResult.recommendations,
      matchedSkills: scoringResult.matchedSkills,
      missingSkills: scoringResult.missingSkills,
      details: scoringResult.details
    };
  }

  /**
   * Answer generation workflow - creates tailored responses
   */
  async generateAnswersWorkflow(context) {
    const { resumeText, jobDescription, questions, userId } = context;
    
    console.log('✍️ Running answer generation workflow...');
    
    // First get resume analysis for context
    const resumeAnalysis = await this.agents['resume-scorer'].analyze(resumeText, jobDescription);
    
    // Generate personalized answers
    const answerResult = await this.agents['answer-generator'].generateAnswers({
      resumeText,
      jobDescription,
      questions,
      resumeAnalysis
    });
    
    return {
      agentType: 'answer-generator',
      questions: answerResult.questions,
      answers: answerResult.answers,
      tips: answerResult.tips
    };
  }

  /**
   * Autofill preparation workflow - extracts and structures profile data
   */
  async prepareAutofillWorkflow(context) {
    const { resumeText, userId } = context;
    
    console.log('📝 Running autofill preparation workflow...');
    
    const autofillData = await this.agents['autofill-agent'].extractProfileData(resumeText);
    
    return {
      agentType: 'autofill-agent',
      profileData: autofillData.profileData,
      confidence: autofillData.confidence,
      extractedFields: autofillData.extractedFields
    };
  }

  /**
   * Full analysis workflow - runs multiple agents for comprehensive analysis
   */
  async fullAnalysisWorkflow(context) {
    const { resumeText, jobDescription, userId } = context;
    
    console.log('🔍 Running full application analysis workflow...');
    
    // Run multiple agents in parallel where possible
    const [scoringResult, autofillResult] = await Promise.all([
      this.scoreResumeWorkflow({ resumeText, jobDescription, userId }),
      this.prepareAutofillWorkflow({ resumeText, userId })
    ]);
    
    // Generate common application questions and answers
    const commonQuestions = [
      "Why are you interested in this role?",
      "What makes you a good fit for this position?", 
      "What is your greatest strength?",
      "Why do you want to work at this company?"
    ];
    
    const answerResult = await this.generateAnswersWorkflow({
      resumeText, 
      jobDescription, 
      questions: commonQuestions,
      userId
    });
    
    return {
      agentType: 'full-analysis',
      resumeScore: scoringResult,
      autofillData: autofillResult,
      suggestedAnswers: answerResult,
      summary: {
        overallScore: scoringResult.score,
        readinessLevel: this.calculateReadinessLevel(scoringResult.score),
        topRecommendations: scoringResult.recommendations.slice(0, 3)
      }
    };
  }

  /**
   * Calculate application readiness level based on score
   */
  calculateReadinessLevel(score) {
    if (score >= 80) return 'Excellent Match - Apply Now!';
    if (score >= 60) return 'Good Match - Minor improvements suggested';
    if (score >= 40) return 'Fair Match - Consider tailoring resume';
    return 'Low Match - Significant improvements needed';
  }

  /**
   * Store agent execution result in database
   */
  async storeAgentResult(userId, agentType, inputData, outputData) {
    try {
      await pool.query(
        `INSERT INTO agent_results (user_id, agent_type, input_data, output_data, score, recommendations) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          agentType,
          JSON.stringify(inputData),
          JSON.stringify(outputData),
          outputData.score || null,
          outputData.recommendations || []
        ]
      );
    } catch (error) {
      console.error('Error storing agent result:', error);
    }
  }

  /**
   * Get agent usage statistics for a user
   */
  async getAgentStats(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          agent_type, 
          COUNT(*) as usage_count,
          AVG(score) as avg_score,
          MAX(created_at) as last_used
         FROM agent_results 
         WHERE user_id = $1 
         GROUP BY agent_type
         ORDER BY usage_count DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      return [];
    }
  }
}

module.exports = AgentOrchestrator;