class AnswerGenerator {
  constructor() {
    this.name = 'Answer Generator Agent';
    this.version = '1.0.0';
  }

  /**
   * Generate personalized answers to application questions
   * @param {Object} context - Context containing resume, job description, questions, etc.
   * @returns {Object} - Generated answers and tips
   */
  async generateAnswers(context) {
    try {
      console.log('✍️ Answer Generator: Generating personalized answers...');

      const { resumeText, jobDescription, questions, resumeAnalysis } = context;

      const results = {
        questions: [],
        answers: [],
        tips: []
      };

      // Process each question
      for (const question of questions) {
        const answer = this.generateAnswerForQuestion(question, resumeText, jobDescription, resumeAnalysis);
        
        results.questions.push(question);
        results.answers.push(answer);
      }

      // Add general tips
      results.tips = this.generateTips(resumeAnalysis);

      console.log(`✅ Answer Generator: Generated ${results.answers.length} answers`);
      return results;

    } catch (error) {
      console.error('❌ Answer Generator error:', error);
      throw new Error('Answer generation failed');
    }
  }

  /**
   * Generate answer for a specific question
   */
  generateAnswerForQuestion(question, resumeText, jobDescription, resumeAnalysis) {
    const questionLower = question.toLowerCase();

    if (questionLower.includes('why are you interested') || questionLower.includes('why do you want')) {
      return this.generateInterestAnswer(jobDescription, resumeAnalysis);
    }
    
    if (questionLower.includes('good fit') || questionLower.includes('qualified')) {
      return this.generateFitAnswer(resumeAnalysis);
    }
    
    if (questionLower.includes('strength') || questionLower.includes('skills')) {
      return this.generateStrengthAnswer(resumeAnalysis);
    }
    
    if (questionLower.includes('experience') || questionLower.includes('background')) {
      return this.generateExperienceAnswer(resumeText, resumeAnalysis);
    }

    // Default answer template
    return this.generateGenericAnswer(question, resumeAnalysis);
  }

  /**
   * Generate "why interested" answer
   */
  generateInterestAnswer(jobDescription, resumeAnalysis) {
    const skills = resumeAnalysis?.matchedSkills?.slice(0, 3) || ['relevant skills'];
    
    return `I'm excited about this opportunity because it aligns perfectly with my technical expertise in ${skills.join(', ')}. The role offers the chance to apply my skills in a meaningful way while contributing to innovative projects. I'm particularly drawn to the company's commitment to growth and the collaborative environment described in the job posting.`;
  }

  /**
   * Generate "good fit" answer
   */
  generateFitAnswer(resumeAnalysis) {
    const matchedSkills = resumeAnalysis?.matchedSkills || [];
    const score = resumeAnalysis?.score || 70;

    if (matchedSkills.length > 0) {
      return `I believe I'm an excellent fit for this role because of my strong background in ${matchedSkills.slice(0, 3).join(', ')}. My experience directly aligns with the key requirements, and I have a proven track record of delivering results in similar environments. I'm confident I can contribute immediately while continuing to grow with the team.`;
    }

    return `I'm a strong fit for this role because I bring a combination of technical skills, problem-solving abilities, and a collaborative mindset. While I continue to develop in some areas, my core competencies align well with what you're looking for, and I'm eager to contribute to the team's success.`;
  }

  /**
   * Generate "strength" answer
   */
  generateStrengthAnswer(resumeAnalysis) {
    const topSkills = resumeAnalysis?.matchedSkills?.slice(0, 2) || ['problem-solving', 'technical expertise'];
    
    return `My greatest strength is my ability to combine ${topSkills[0] || 'technical skills'} with strong problem-solving capabilities. I excel at breaking down complex challenges into manageable components and finding efficient solutions. Additionally, I'm a strong communicator who can work effectively both independently and as part of a team, ensuring projects stay on track and stakeholders remain informed.`;
  }

  /**
   * Generate "experience" answer
   */
  generateExperienceAnswer(resumeText, resumeAnalysis) {
    const experienceYears = resumeAnalysis?.details?.experienceMatch?.resumeYears || 'several';
    
    return `Throughout my ${experienceYears} years of professional experience, I've developed a strong foundation in software development and problem-solving. I've worked on diverse projects that have strengthened my technical skills and taught me the importance of clean, maintainable code. My experience has also shown me the value of collaboration, continuous learning, and delivering solutions that truly meet user needs.`;
  }

  /**
   * Generate generic answer
   */
  generateGenericAnswer(question, resumeAnalysis) {
    return `Thank you for this question. Based on my background and experience, I believe I can bring valuable skills and perspective to this role. I'm committed to continuous learning and contributing positively to the team while delivering high-quality results that align with the company's goals.`;
  }

  /**
   * Generate general application tips
   */
  generateTips(resumeAnalysis) {
    const tips = [
      "Customize each answer to reflect the specific company and role",
      "Use specific examples from your experience when possible",
      "Keep answers concise but comprehensive (2-3 minutes when spoken)"
    ];

    if (resumeAnalysis?.score && resumeAnalysis.score < 70) {
      tips.push("Consider highlighting relevant projects or coursework to strengthen your candidacy");
    }

    if (resumeAnalysis?.missingSkills?.length > 0) {
      tips.push(`Be prepared to discuss how you'd learn: ${resumeAnalysis.missingSkills.slice(0, 2).join(', ')}`);
    }

    return tips;
  }
}

module.exports = AnswerGenerator;