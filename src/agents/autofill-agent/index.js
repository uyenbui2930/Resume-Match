class AutofillAgent {
  constructor() {
    this.name = 'Autofill Agent';
    this.version = '1.0.0';
  }

  /**
   * Extract profile data from resume for autofilling applications
   * @param {string} resumeText - The resume content
   * @returns {Object} - Structured profile data for autofill
   */
  async extractProfileData(resumeText) {
    try {
      console.log('📝 Autofill Agent: Extracting profile data...');

      const profileData = {
        personalInfo: this.extractPersonalInfo(resumeText),
        workExperience: this.extractWorkExperience(resumeText),
        education: this.extractEducation(resumeText),
        skills: this.extractSkills(resumeText),
        contact: this.extractContactInfo(resumeText)
      };

      const extractedFields = this.getExtractedFieldsList(profileData);
      const confidence = this.calculateConfidence(profileData);

      console.log(`✅ Autofill Agent: Extracted ${extractedFields.length} fields with ${confidence}% confidence`);

      return {
        profileData,
        extractedFields,
        confidence
      };

    } catch (error) {
      console.error('❌ Autofill Agent error:', error);
      throw new Error('Profile data extraction failed');
    }
  }

  /**
   * Extract personal information
   */
  extractPersonalInfo(resumeText) {
    const personalInfo = {
      firstName: this.extractField(resumeText, /(?:^|\n)\s*([A-Z][a-z]+)\s+[A-Z][a-z]+/),
      lastName: this.extractField(resumeText, /(?:^|\n)\s*[A-Z][a-z]+\s+([A-Z][a-z]+)/),
      fullName: this.extractField(resumeText, /(?:^|\n)\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/),
    };

    return personalInfo;
  }

  /**
   * Extract contact information
   */
  extractContactInfo(resumeText) {
    const contactInfo = {
      email: this.extractField(resumeText, /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/),
      phone: this.extractField(resumeText, /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/),
      linkedin: this.extractField(resumeText, /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/),
      github: this.extractField(resumeText, /(github\.com\/[a-zA-Z0-9-]+)/),
      website: this.extractField(resumeText, /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/),
      address: this.extractAddress(resumeText)
    };

    return contactInfo;
  }

  /**
   * Extract work experience
   */
  extractWorkExperience(resumeText) {
    const experiences = [];
    
    // Look for common job title patterns
    const jobTitlePatterns = [
      /(?:Software|Senior|Junior|Lead|Principal)\s+(?:Engineer|Developer|Programmer)/gi,
      /(?:Full\s*Stack|Frontend|Backend|Web)\s+Developer/gi,
      /(?:Product|Project)\s+Manager/gi,
      /(?:Data|Business)\s+Analyst/gi
    ];

    const companyPatterns = [
      /(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Company|Ltd)?)/g,
      /([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Company|Ltd))/g
    ];

    // Simple extraction - in real implementation, this would be more sophisticated
    const lines = resumeText.split('\n');
    let currentExperience = {};

    for (const line of lines) {
      // Look for job titles
      for (const pattern of jobTitlePatterns) {
        const match = line.match(pattern);
        if (match) {
          if (currentExperience.title) {
            experiences.push(currentExperience);
          }
          currentExperience = { title: match[0] };
        }
      }

      // Look for companies
      for (const pattern of companyPatterns) {
        const match = line.match(pattern);
        if (match && currentExperience.title) {
          currentExperience.company = match[1];
        }
      }

      // Look for dates
      const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/);
      if (dateMatch && currentExperience.title) {
        currentExperience.startDate = dateMatch[1];
        currentExperience.endDate = dateMatch[2];
      }
    }

    if (currentExperience.title) {
      experiences.push(currentExperience);
    }

    return experiences.slice(0, 5); // Limit to 5 most recent
  }

  /**
   * Extract education information
   */
  extractEducation(resumeText) {
    const education = [];
    
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Doctorate)\s+(?:of\s+)?(?:Science|Arts|Engineering|Business)/gi,
      /(?:BS|BA|MS|MA|PhD|MBA)/gi
    ];

    const universityPatterns = [
      /(?:University|College|Institute)\s+(?:of\s+)?[A-Z][a-zA-Z\s]+/g,
      /[A-Z][a-zA-Z\s]+(?:University|College|Institute)/g
    ];

    const majorPatterns = [
      /(?:Computer Science|Software Engineering|Engineering|Business|Mathematics|Physics)/gi
    ];

    // Simple extraction
    const lines = resumeText.split('\n');
    
    for (const line of lines) {
      let eduEntry = {};

      degreePatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) eduEntry.degree = match[0];
      });

      universityPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) eduEntry.school = match[0];
      });

      majorPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) eduEntry.major = match[0];
      });

      const yearMatch = line.match(/(\d{4})/);
      if (yearMatch && (eduEntry.degree || eduEntry.school)) {
        eduEntry.graduationYear = yearMatch[1];
      }

      if (Object.keys(eduEntry).length > 0) {
        education.push(eduEntry);
      }
    }

    return education.slice(0, 3); // Limit to 3 entries
  }

  /**
   * Extract skills
   */
  extractSkills(resumeText) {
    const skillCategories = {
      programming: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'PHP', 'Ruby'],
      frameworks: ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask'],
      databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite'],
      tools: ['Git', 'Docker', 'AWS', 'Jenkins', 'Kubernetes'],
      soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Management']
    };

    const foundSkills = {};

    Object.keys(skillCategories).forEach(category => {
      foundSkills[category] = [];
      
      skillCategories[category].forEach(skill => {
        if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
          foundSkills[category].push(skill);
        }
      });
    });

    return foundSkills;
  }

  /**
   * Extract a field using regex
   */
  extractField(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1] || match[0] : null;
  }

  /**
   * Extract address (simplified)
   */
  extractAddress(resumeText) {
    const addressPattern = /([A-Z][a-zA-Z\s,]+,\s*[A-Z]{2}\s*\d{5})/;
    const match = resumeText.match(addressPattern);
    return match ? match[1] : null;
  }

  /**
   * Get list of successfully extracted fields
   */
  getExtractedFieldsList(profileData) {
    const fields = [];

    // Check personal info
    Object.keys(profileData.personalInfo).forEach(key => {
      if (profileData.personalInfo[key]) fields.push(`personalInfo.${key}`);
    });

    // Check contact info
    Object.keys(profileData.contact).forEach(key => {
      if (profileData.contact[key]) fields.push(`contact.${key}`);
    });

    // Check experience
    if (profileData.workExperience.length > 0) {
      fields.push('workExperience');
    }

    // Check education
    if (profileData.education.length > 0) {
      fields.push('education');
    }

    // Check skills
    Object.keys(profileData.skills).forEach(category => {
      if (profileData.skills[category].length > 0) {
        fields.push(`skills.${category}`);
      }
    });

    return fields;
  }

  /**
   * Calculate extraction confidence
   */
  calculateConfidence(profileData) {
    let score = 0;
    let maxScore = 0;

    // Personal info (20% of total)
    maxScore += 20;
    if (profileData.personalInfo.firstName) score += 10;
    if (profileData.personalInfo.lastName) score += 10;

    // Contact info (30% of total)
    maxScore += 30;
    if (profileData.contact.email) score += 15;
    if (profileData.contact.phone) score += 10;
    if (profileData.contact.linkedin || profileData.contact.github) score += 5;

    // Experience (25% of total)
    maxScore += 25;
    score += Math.min(25, profileData.workExperience.length * 8);

    // Education (15% of total)
    maxScore += 15;
    score += Math.min(15, profileData.education.length * 7);

    // Skills (10% of total)
    maxScore += 10;
    const totalSkills = Object.values(profileData.skills).reduce((sum, arr) => sum + arr.length, 0);
    score += Math.min(10, totalSkills * 0.5);

    return Math.round((score / maxScore) * 100);
  }
}

module.exports = AutofillAgent;