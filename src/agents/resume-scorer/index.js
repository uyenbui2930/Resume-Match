class ResumeScorer {
  constructor() {
    this.name = 'Resume Scorer Agent';
    this.version = '1.0.0';
  }

  /**
   * Analyze resume against job description and return match score
   * @param {string} resumeText - The resume content
   * @param {string} jobDescription - The job posting content
   * @returns {Object} - Analysis results with score and recommendations
   */
  async analyze(resumeText, jobDescription) {
    try {
      console.log('📊 Resume Scorer: Starting analysis...');

      const analysis = {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        recommendations: [],
        details: {}
      };

      // Extract key skills from job description
      const requiredSkills = this.extractSkills(jobDescription);
      
      // Extract skills from resume
      const resumeSkills = this.extractSkills(resumeText);
      
      // Calculate skill match
      const skillAnalysis = this.analyzeSkillMatch(resumeSkills, requiredSkills);
      
      // Calculate experience match
      const experienceAnalysis = this.analyzeExperience(resumeText, jobDescription);
      
      // Calculate education match
      const educationAnalysis = this.analyzeEducation(resumeText, jobDescription);
      
      // Calculate keyword density
      const keywordAnalysis = this.analyzeKeywords(resumeText, jobDescription);
      
      // Calculate overall score (weighted)
      analysis.score = Math.round(
        skillAnalysis.score * 0.4 +      // 40% skills
        experienceAnalysis.score * 0.3 +  // 30% experience
        educationAnalysis.score * 0.15 +  // 15% education
        keywordAnalysis.score * 0.15      // 15% keywords
      );
      
      analysis.matchedSkills = skillAnalysis.matched;
      analysis.missingSkills = skillAnalysis.missing;
      analysis.recommendations = this.generateRecommendations(analysis.score, skillAnalysis, experienceAnalysis);
      
      analysis.details = {
        skillMatch: skillAnalysis,
        experienceMatch: experienceAnalysis,
        educationMatch: educationAnalysis,
        keywordMatch: keywordAnalysis
      };

      console.log(`✅ Resume Scorer: Analysis complete. Score: ${analysis.score}/100`);
      return analysis;

    } catch (error) {
      console.error('❌ Resume Scorer error:', error);
      throw new Error('Resume analysis failed');
    }
  }

  /**
   * Extract skills from text using simple keyword matching
   */
  extractSkills(text) {
    const commonSkills = [
      // Technical skills
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB', 
      'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'TypeScript', 'Express',
      'PostgreSQL', 'Redis', 'Kubernetes', 'Jenkins', 'GraphQL',
      
      // Soft skills
      'Leadership', 'Communication', 'Project Management', 'Team Management',
      'Problem Solving', 'Analytical', 'Creative', 'Collaborative',
      
      // Business skills
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Testing', 'Debugging',
      'API Development', 'Database Design', 'System Architecture'
    ];

    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    for (const skill of commonSkills) {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  /**
   * Analyze skill match between resume and job requirements
   */
  analyzeSkillMatch(resumeSkills, requiredSkills) {
    const matched = resumeSkills.filter(skill => 
      requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
    );
    
    const missing = requiredSkills.filter(skill => 
      !resumeSkills.some(res => res.toLowerCase() === skill.toLowerCase())
    );
    
    const score = requiredSkills.length > 0 
      ? Math.round((matched.length / requiredSkills.length) * 100)
      : 50; // Default score if no skills detected
    
    return {
      score,
      matched,
      missing,
      resumeSkills,
      requiredSkills
    };
  }

  /**
   * Analyze experience level match
   */
  analyzeExperience(resumeText, jobDescription) {
    // Extract years of experience mentioned
    const resumeYears = this.extractYearsOfExperience(resumeText);
    const requiredYears = this.extractYearsOfExperience(jobDescription);
    
    let score = 50; // Default score
    
    if (requiredYears > 0) {
      if (resumeYears >= requiredYears) {
        score = 100;
      } else if (resumeYears >= requiredYears * 0.8) {
        score = 80;
      } else if (resumeYears >= requiredYears * 0.6) {
        score = 60;
      } else {
        score = 30;
      }
    } else if (resumeYears > 0) {
      score = 70; // Has experience, requirement unclear
    }
    
    return {
      score,
      resumeYears,
      requiredYears
    };
  }

  /**
   * Extract years of experience from text
   */
  extractYearsOfExperience(text) {
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /(\d+)\+?\s*years?\s*in/i,
      /experience\s*:\s*(\d+)\+?\s*years?/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return 0;
  }

  /**
   * Analyze education match (simplified)
   */
  analyzeEducation(resumeText, jobDescription) {
    const educationKeywords = [
      'Bachelor', 'Master', 'PhD', 'Degree', 'University', 'College',
      'Computer Science', 'Engineering', 'Mathematics', 'Software'
    ];
    
    const resumeEducation = educationKeywords.filter(keyword => 
      resumeText.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    const requiredEducation = educationKeywords.filter(keyword => 
      jobDescription.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    const score = requiredEducation > 0 
      ? Math.min(100, (resumeEducation / requiredEducation) * 100)
      : (resumeEducation > 0 ? 80 : 50);
    
    return {
      score: Math.round(score),
      resumeEducationKeywords: resumeEducation,
      requiredEducationKeywords: requiredEducation
    };
  }

  /**
   * Analyze keyword density and relevance
   */
  analyzeKeywords(resumeText, jobDescription) {
    // Extract important keywords from job description
    const jobKeywords = jobDescription
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'this', 'with', 'will', 'have', 'from', 'they'].includes(word));
    
    const resumeText_lower = resumeText.toLowerCase();
    
    let matches = 0;
    for (const keyword of jobKeywords.slice(0, 20)) { // Check top 20 keywords
      if (resumeText_lower.includes(keyword)) {
        matches++;
      }
    }
    
    const score = jobKeywords.length > 0 
      ? Math.round((matches / Math.min(20, jobKeywords.length)) * 100)
      : 50;
    
    return {
      score,
      totalKeywords: jobKeywords.length,
      matches
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(score, skillAnalysis, experienceAnalysis) {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push("Consider tailoring your resume more closely to this job posting");
    }
    
    if (skillAnalysis.missing.length > 0) {
      recommendations.push(`Consider highlighting these missing skills if you have them: ${skillAnalysis.missing.slice(0, 3).join(', ')}`);
    }
    
    if (skillAnalysis.matched.length > 0) {
      recommendations.push(`Great match on these skills: ${skillAnalysis.matched.slice(0, 3).join(', ')} - make sure they're prominent`);
    }
    
    if (experienceAnalysis.resumeYears < experienceAnalysis.requiredYears) {
      recommendations.push("Emphasize relevant projects and accomplishments to compensate for experience gap");
    }
    
    if (score >= 80) {
      recommendations.push("Excellent match! Your resume aligns well with this job posting");
    }
    
    return recommendations;
  }
}

module.exports = ResumeScorer;