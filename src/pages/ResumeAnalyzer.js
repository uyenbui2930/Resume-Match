import React, { useState } from 'react';
import {
  Upload,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Edit,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { agentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [useAI, setUseAI] = useState(true); // Toggle between AI and local analysis

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume text and job description');
      return;
    }

    setLoading(true);

    try {
      // Try AI-powered analysis via backend if user is logged in
      if (user && useAI) {
        try {
          const response = await agentsAPI.scoreResume(resumeText, jobDescription);
          const data = response.data;

          if (data.success && data.data) {
            // Transform backend response to match frontend format
            const backendAnalysis = data.data;
            setAnalysis({
              matchScore: backendAnalysis.score || 75,
              strengths: backendAnalysis.strengths || ['Strong technical background'],
              improvements: backendAnalysis.recommendations || ['Add more quantifiable achievements'],
              missingSkills: backendAnalysis.missingSkills || [],
              recommendations: backendAnalysis.recommendations || [],
              keywordAnalysis: {
                matched: backendAnalysis.matchedSkills || [],
                missing: backendAnalysis.missingSkills || []
              }
            });
            toast.success('AI-powered analysis completed!');
            return;
          }
        } catch (apiError) {
          console.log('Backend API unavailable, using local analysis:', apiError.message);
          toast.info('Using local analysis (backend unavailable)');
        }
      }

      // Fallback to local analysis
      const localAnalysis = generateAIAnalysis(resumeText, jobDescription);
      setAnalysis(localAnalysis);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  // AI-powered analysis function
  const generateAIAnalysis = (resume, jobDescription) => {
    const resumeKeywords = extractResumeKeywords(resume);
    const jobKeywords = extractJobKeywords(jobDescription);
    
    // Calculate match score based on keyword overlap and relevance
    const matchScore = calculateMatchScore(resumeKeywords, jobKeywords);
    
    // Generate strengths based on matched skills and experience
    const strengths = generateStrengths(resumeKeywords, jobKeywords);
    
    // Identify areas for improvement
    const improvements = generateImprovements(resumeKeywords, jobKeywords);
    
    // Find missing skills
    const missingSkills = findMissingSkills(resumeKeywords, jobKeywords);
    
    // Generate recommendations
    const recommendations = generateRecommendations(resumeKeywords, jobKeywords);
    
    return {
      matchScore,
      strengths,
      improvements,
      missingSkills,
      recommendations,
      keywordAnalysis: {
        matched: resumeKeywords.skills.filter(skill => jobKeywords.skills.includes(skill)),
        missing: jobKeywords.skills.filter(skill => !resumeKeywords.skills.includes(skill))
      }
    };
  };

  // Extract keywords and skills from resume
  const extractResumeKeywords = (resume) => {
    const lowerResume = resume.toLowerCase();
    return {
      skills: extractSkills(lowerResume),
      technologies: extractTechnologies(lowerResume),
      experience: extractExperience(lowerResume),
      achievements: extractAchievements(lowerResume),
      education: extractEducation(lowerResume),
      certifications: extractCertifications(lowerResume),
      projects: extractProjects(lowerResume)
    };
  };

  // Extract keywords and requirements from job description
  const extractJobKeywords = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    return {
      skills: extractSkills(lowerJob),
      technologies: extractTechnologies(lowerJob),
      requirements: extractRequirements(lowerJob),
      experience: extractExperience(lowerJob),
      education: extractEducation(lowerJob),
      certifications: extractCertifications(lowerJob)
    };
  };

  // Calculate match score based on keyword overlap
  const calculateMatchScore = (resumeKeywords, jobKeywords) => {
    const resumeSkills = resumeKeywords.skills;
    const jobSkills = jobKeywords.skills;
    
    if (jobSkills.length === 0) return 75; // Default score if no skills found
    
    const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
    const skillMatchPercentage = (matchedSkills.length / jobSkills.length) * 100;
    
    // Additional factors
    const experienceMatch = calculateExperienceMatch(resumeKeywords.experience, jobKeywords.experience);
    const technologyMatch = calculateTechnologyMatch(resumeKeywords.technologies, jobKeywords.technologies);
    
    // Weighted score calculation
    const finalScore = Math.min(100, Math.max(40, 
      (skillMatchPercentage * 0.5) + 
      (experienceMatch * 0.3) + 
      (technologyMatch * 0.2)
    ));
    
    return Math.round(finalScore);
  };

  // Helper functions for keyword extraction
  const extractSkills = (text) => {
    const skills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'leadership', 'management',
      'problem solving', 'communication', 'teamwork', 'analytical', 'creative',
      'project management', 'data analysis', 'machine learning', 'ai', 'cloud',
      'devops', 'ci/cd', 'testing', 'debugging', 'frontend', 'backend', 'full stack'
    ];
    return skills.filter(skill => text.includes(skill));
  };

  const extractTechnologies = (text) => {
    const technologies = [
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'gitlab', 'github', 'jira',
      'figma', 'sketch', 'photoshop', 'illustrator', 'tableau', 'power bi'
    ];
    return technologies.filter(tech => text.includes(tech));
  };

  const extractExperience = (text) => {
    const experienceKeywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director'];
    const foundExperience = experienceKeywords.filter(exp => text.includes(exp));
    return foundExperience.length > 0 ? foundExperience[0] : 'mid-level';
  };

  const extractAchievements = (text) => {
    const achievements = [];
    if (text.includes('increased') || text.includes('improved')) achievements.push('performance improvements');
    if (text.includes('led') || text.includes('managed')) achievements.push('leadership');
    if (text.includes('developed') || text.includes('built')) achievements.push('development');
    if (text.includes('saved') || text.includes('reduced')) achievements.push('cost savings');
    return achievements;
  };

  const extractEducation = (text) => {
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
    return educationKeywords.filter(edu => text.includes(edu));
  };

  const extractCertifications = (text) => {
    const certifications = ['aws', 'azure', 'gcp', 'pmp', 'scrum', 'agile', 'certified'];
    return certifications.filter(cert => text.includes(cert));
  };

  const extractProjects = (text) => {
    const projectKeywords = ['project', 'application', 'system', 'platform', 'website', 'app'];
    return projectKeywords.filter(proj => text.includes(proj));
  };

  const extractRequirements = (text) => {
    const requirements = [];
    if (text.includes('years') || text.includes('experience')) requirements.push('experience');
    if (text.includes('degree') || text.includes('education')) requirements.push('education');
    if (text.includes('certification') || text.includes('certified')) requirements.push('certification');
    return requirements;
  };

  // Calculate experience match
  const calculateExperienceMatch = (resumeExp, jobExp) => {
    if (!jobExp || jobExp === 'mid-level') return 80;
    if (resumeExp === jobExp) return 100;
    if (resumeExp === 'senior' && jobExp === 'mid-level') return 90;
    if (resumeExp === 'lead' && (jobExp === 'senior' || jobExp === 'mid-level')) return 85;
    return 70;
  };

  // Calculate technology match
  const calculateTechnologyMatch = (resumeTech, jobTech) => {
    if (jobTech.length === 0) return 80;
    const matchedTech = resumeTech.filter(tech => jobTech.includes(tech));
    return (matchedTech.length / jobTech.length) * 100;
  };

  // Generate strengths based on analysis
  const generateStrengths = (resumeKeywords, jobKeywords) => {
    const strengths = [];
    
    // Technical skills match
    const matchedSkills = resumeKeywords.skills.filter(skill => jobKeywords.skills.includes(skill));
    if (matchedSkills.length > 0) {
      strengths.push(`Strong technical background in ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    // Experience match
    if (resumeKeywords.experience && jobKeywords.experience) {
      if (resumeKeywords.experience === jobKeywords.experience || 
          (resumeKeywords.experience === 'senior' && jobKeywords.experience === 'mid-level')) {
        strengths.push('Relevant experience level for this position');
      }
    }
    
    // Technology match
    const matchedTech = resumeKeywords.technologies.filter(tech => jobKeywords.technologies.includes(tech));
    if (matchedTech.length > 0) {
      strengths.push(`Proficiency in ${matchedTech.slice(0, 2).join(' and ')}`);
    }
    
    // Achievements
    if (resumeKeywords.achievements.length > 0) {
      strengths.push('Demonstrated track record of achievements and results');
    }
    
    // Education
    if (resumeKeywords.education.length > 0) {
      strengths.push('Strong educational background');
    }
    
    // Default strengths if no specific matches
    if (strengths.length === 0) {
      strengths.push('Good problem-solving and analytical skills');
      strengths.push('Strong communication and teamwork abilities');
    }
    
    return strengths.slice(0, 4); // Limit to 4 strengths
  };

  // Generate improvement suggestions
  const generateImprovements = (resumeKeywords, jobKeywords) => {
    const improvements = [];
    
    // Missing skills
    const missingSkills = jobKeywords.skills.filter(skill => !resumeKeywords.skills.includes(skill));
    if (missingSkills.length > 0) {
      improvements.push(`Consider highlighting or developing skills in ${missingSkills.slice(0, 2).join(' and ')}`);
    }
    
    // Missing technologies
    const missingTech = jobKeywords.technologies.filter(tech => !resumeKeywords.technologies.includes(tech));
    if (missingTech.length > 0) {
      improvements.push(`Add experience with ${missingTech.slice(0, 2).join(' and ')}`);
    }
    
    // Quantifiable results
    if (!resumeKeywords.achievements.some(ach => ach.includes('increased') || ach.includes('improved'))) {
      improvements.push('Include more quantifiable results and metrics in your experience');
    }
    
    // Leadership experience
    if (!resumeKeywords.skills.includes('leadership') && jobKeywords.skills.includes('leadership')) {
      improvements.push('Highlight any leadership or management experience');
    }
    
    // Default improvements
    if (improvements.length === 0) {
      improvements.push('Add more specific examples of your achievements');
      improvements.push('Include quantifiable results and metrics');
    }
    
    return improvements.slice(0, 4);
  };

  // Find missing skills
  const findMissingSkills = (resumeKeywords, jobKeywords) => {
    const missingSkills = jobKeywords.skills.filter(skill => !resumeKeywords.skills.includes(skill));
    const missingTech = jobKeywords.technologies.filter(tech => !resumeKeywords.technologies.includes(tech));
    
    return [...missingSkills, ...missingTech].slice(0, 4);
  };

  // Generate recommendations
  const generateRecommendations = (resumeKeywords, jobKeywords) => {
    const recommendations = [];
    
    // Skills alignment
    const missingSkills = jobKeywords.skills.filter(skill => !resumeKeywords.skills.includes(skill));
    if (missingSkills.length > 0) {
      recommendations.push('Tailor your skills section to better match job requirements');
    }
    
    // Projects section
    if (resumeKeywords.projects.length === 0) {
      recommendations.push('Add a projects section showcasing your best work');
    }
    
    // Metrics and achievements
    if (resumeKeywords.achievements.length < 2) {
      recommendations.push('Include more specific metrics and quantifiable achievements');
    }
    
    // Certifications
    if (jobKeywords.certifications.length > 0 && resumeKeywords.certifications.length === 0) {
      recommendations.push('Consider obtaining relevant certifications mentioned in the job description');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Highlight your most relevant experience at the top');
      recommendations.push('Use action verbs to describe your accomplishments');
    }
    
    return recommendations.slice(0, 3);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-600">Get AI-powered feedback on your resume against job descriptions</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Resume Text Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Text</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here for analysis..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="mt-2 text-sm text-gray-500">
              Or upload a file to extract text automatically
            </div>
          </div>

          {/* File Upload (Optional) */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume (Optional)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile ? uploadedFile.name : 'Click to upload resume'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, or DOCX files up to 10MB
                </p>
              </label>
            </div>
            {uploadedFile && (
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                File uploaded successfully
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="mt-2 text-sm text-gray-500">
              {jobDescription.length} characters
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!resumeText.trim() || !jobDescription.trim() || loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5 mr-2" />
                Analyze Resume
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis && (
            <>
              {/* Match Score */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Score</h2>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(analysis.matchScore)} mb-4`}>
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                      {analysis.matchScore}%
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {analysis.matchScore >= 80 
                      ? 'Excellent match! Your resume aligns well with this job posting.'
                      : analysis.matchScore >= 60 
                      ? 'Good match with room for improvement.'
                      : 'Consider tailoring your resume to better match the requirements.'
                    }
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Strengths
                </h2>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  Areas for Improvement
                </h2>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Skills */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  Missing Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-purple-500 mr-2" />
                  AI Recommendations
                </h2>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Analysis */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-green-700 mb-2">Matched Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.matched.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-700 mb-2">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.missing.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card">
                <div className="flex space-x-4">
                  <button className="flex-1 btn-primary flex items-center justify-center">
                    <Download className="h-5 w-5 mr-2" />
                    Download Report
                  </button>
                  <button className="flex-1 btn-secondary flex items-center justify-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Resume
                  </button>
                </div>
              </div>
            </>
          )}

          {!analysis && !loading && (
            <div className="card text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to analyze?</h3>
              <p className="text-gray-600">
                Upload your resume and paste a job description to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
