import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Save,
  Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import { agentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AnswerGenerator = () => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [generatedAnswers, setGeneratedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [useAI, setUseAI] = useState(true);

  // Generate personalized answer based on question, resume, and job description
  const generatePersonalizedAnswer = (question, resume, jobDescription) => {
    // Extract key information from resume
    const resumeKeywords = extractKeywords(resume);
    const jobKeywords = extractKeywords(jobDescription);
    
    // Generate answer based on question type
    switch (question) {
      case 'Why are you interested in this role?':
        return `I'm very excited about this role because it perfectly aligns with my background in ${resumeKeywords.skills?.join(', ') || 'software development'}. Having worked with ${resumeKeywords.technologies?.join(', ') || 'various technologies'} for ${resumeKeywords.experience || 'several years'}, I'm particularly drawn to the opportunity to ${extractJobResponsibilities(jobDescription)}. This position would allow me to leverage my experience in ${resumeKeywords.achievements?.[0] || 'problem-solving'} while contributing to ${extractCompanyGoals(jobDescription)}. I'm especially excited about the chance to work with ${jobKeywords.technologies?.join(', ') || 'cutting-edge technologies'} and make a meaningful impact.`;
        
      case 'What makes you a good fit for this position?':
        return `I believe I'm an excellent fit for this position because of my strong background in ${resumeKeywords.skills?.join(', ') || 'software development'}. My experience with ${resumeKeywords.technologies?.join(', ') || 'various technologies'} directly relates to the requirements mentioned in the job description. I've successfully ${resumeKeywords.achievements?.[0] || 'delivered projects'} and have a proven track record of ${resumeKeywords.strengths?.join(', ') || 'problem-solving and teamwork'}. Additionally, my experience with ${resumeKeywords.experience || 'similar projects'} has prepared me well for the challenges this role presents. I'm confident that my skills in ${resumeKeywords.skills?.slice(0, 3).join(', ') || 'technical areas'} combined with my passion for ${extractJobFocus(jobDescription)} make me the ideal candidate.`;
        
      case 'Tell me about yourself':
        return `I'm a ${resumeKeywords.experience || 'experienced'} professional with a strong background in ${resumeKeywords.skills?.join(', ') || 'software development'}. Over the past ${resumeKeywords.years || 'several'} years, I've specialized in ${resumeKeywords.technologies?.join(', ') || 'various technologies'} and have had the opportunity to work on ${resumeKeywords.projects || 'diverse projects'}. My experience includes ${resumeKeywords.achievements?.[0] || 'successful project delivery'} and I've developed expertise in ${resumeKeywords.skills?.slice(0, 3).join(', ') || 'key technical areas'}. I'm particularly passionate about ${extractJobFocus(jobDescription)} and have always been drawn to roles that allow me to ${extractJobResponsibilities(jobDescription)}. I'm excited about this opportunity because it would allow me to apply my skills in ${resumeKeywords.skills?.join(', ') || 'relevant areas'} while contributing to ${extractCompanyGoals(jobDescription)}.`;
        
      case 'What are your greatest strengths?':
        return `My greatest strengths include my technical expertise in ${resumeKeywords.skills?.join(', ') || 'software development'}, my problem-solving abilities, and my collaborative approach to work. I have extensive experience with ${resumeKeywords.technologies?.join(', ') || 'various technologies'} and have consistently delivered ${resumeKeywords.achievements?.[0] || 'successful projects'}. I'm particularly strong at ${resumeKeywords.strengths?.join(', ') || 'analyzing complex problems and finding innovative solutions'}. Additionally, I have excellent communication skills and enjoy working in team environments. My ability to ${resumeKeywords.achievements?.[1] || 'manage multiple projects simultaneously'} while maintaining high quality standards has been a key factor in my success. I believe these strengths would be valuable in this role, especially when it comes to ${extractJobResponsibilities(jobDescription)}.`;
        
      case 'What is your biggest weakness?':
        return `One area I've been working to improve is ${resumeKeywords.weakness || 'public speaking'}. Early in my career, I found it challenging to present technical concepts to large groups. However, I've taken proactive steps to address this by ${resumeKeywords.improvement || 'joining a local tech meetup and practicing presentations'}. I've also sought feedback from colleagues and have seen significant improvement over the past year. This experience has taught me the importance of continuous learning and stepping outside my comfort zone. I now view this as a growth opportunity rather than a limitation, and I'm committed to further developing this skill. In fact, I believe this role would provide excellent opportunities to continue improving in this area while contributing to ${extractJobResponsibilities(jobDescription)}.`;
        
      case 'Where do you see yourself in 5 years?':
        return `In five years, I envision myself as a ${extractJobLevel(jobDescription)} who has made significant contributions to ${extractCompanyGoals(jobDescription)}. I'm particularly interested in developing expertise in ${jobKeywords.technologies?.join(', ') || 'emerging technologies'} and taking on more leadership responsibilities. I see myself mentoring junior developers and contributing to strategic technical decisions. I'm also passionate about ${resumeKeywords.interests || 'continuous learning'} and plan to pursue ${resumeKeywords.certifications || 'relevant certifications'} to stay current with industry trends. This role would be an excellent stepping stone toward these goals, as it would allow me to ${extractJobResponsibilities(jobDescription)} while developing the skills needed for future growth.`;
        
      case 'Why do you want to work for our company?':
        return `I'm very excited about the opportunity to work here because of your company's reputation for ${extractCompanyValues(jobDescription)} and your commitment to ${extractCompanyGoals(jobDescription)}. I'm particularly drawn to your focus on ${jobKeywords.technologies?.join(', ') || 'innovation'} and your approach to ${extractJobResponsibilities(jobDescription)}. Having researched your company, I'm impressed by your ${extractCompanyAchievements(jobDescription)} and your dedication to ${extractCompanyMission(jobDescription)}. I believe my background in ${resumeKeywords.skills?.join(', ') || 'relevant areas'} would allow me to contribute meaningfully to your team's success. I'm especially excited about the opportunity to work with ${jobKeywords.technologies?.join(', ') || 'cutting-edge technologies'} and to be part of a team that values ${extractCompanyValues(jobDescription)}.`;
        
      case 'What questions do you have for us?':
        return `I have several questions that would help me better understand the role and the team. First, what does success look like in this position during the first 90 days? I'm also curious about the team structure and how this role fits into the broader organization. What are the biggest challenges the team is currently facing, and how would this role contribute to solving them? I'd also like to learn more about the company culture and what you enjoy most about working here. Additionally, I'm interested in understanding the growth opportunities and how the company supports professional development. Finally, what technologies or tools does the team use that I should be familiar with?`;
        
      default:
        return `Based on my experience with ${resumeKeywords.skills?.join(', ') || 'software development'}, I believe I would be a strong fit for this role. My background in ${resumeKeywords.technologies?.join(', ') || 'various technologies'} has prepared me well for the challenges this position presents. I'm particularly excited about the opportunity to ${extractJobResponsibilities(jobDescription)} and contribute to ${extractCompanyGoals(jobDescription)}. My experience with ${resumeKeywords.achievements?.[0] || 'successful project delivery'} demonstrates my ability to deliver results, and I'm confident I can bring that same level of success to this role.`;
    }
  };

  // Helper functions to extract information
  const extractKeywords = (text) => {
    const lowerText = text.toLowerCase();
    return {
      skills: extractSkills(lowerText),
      technologies: extractTechnologies(lowerText),
      experience: extractExperience(lowerText),
      achievements: extractAchievements(lowerText),
      strengths: extractStrengths(lowerText),
      years: extractYears(lowerText),
      projects: extractProjects(lowerText),
      weakness: extractWeakness(lowerText),
      improvement: extractImprovement(lowerText),
      interests: extractInterests(lowerText),
      certifications: extractCertifications(lowerText)
    };
  };

  const extractSkills = (text) => {
    const skills = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum'];
    return skills.filter(skill => text.includes(skill));
  };

  const extractTechnologies = (text) => {
    const technologies = ['react', 'angular', 'vue', 'node.js', 'express', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'];
    return technologies.filter(tech => text.includes(tech));
  };

  const extractExperience = (text) => {
    if (text.includes('senior') || text.includes('lead')) return 'senior-level';
    if (text.includes('junior') || text.includes('entry')) return 'junior-level';
    return 'mid-level';
  };

  const extractAchievements = (text) => {
    const achievements = [];
    if (text.includes('increased') || text.includes('improved')) achievements.push('performance improvements');
    if (text.includes('led') || text.includes('managed')) achievements.push('team leadership');
    if (text.includes('developed') || text.includes('built')) achievements.push('project development');
    return achievements;
  };

  const extractStrengths = (text) => {
    const strengths = [];
    if (text.includes('problem') || text.includes('solve')) strengths.push('problem-solving');
    if (text.includes('team') || text.includes('collaborate')) strengths.push('teamwork');
    if (text.includes('communicate') || text.includes('present')) strengths.push('communication');
    return strengths;
  };

  const extractYears = (text) => {
    const yearMatch = text.match(/(\d+)\s*years?/);
    return yearMatch ? yearMatch[1] : 'several';
  };

  const extractProjects = (text) => {
    if (text.includes('web') || text.includes('application')) return 'web applications';
    if (text.includes('mobile') || text.includes('app')) return 'mobile applications';
    return 'diverse projects';
  };

  const extractWeakness = (text) => {
    if (text.includes('public') || text.includes('speak')) return 'public speaking';
    if (text.includes('time') || text.includes('manage')) return 'time management';
    return 'public speaking';
  };

  const extractImprovement = (text) => {
    return 'joining professional development groups and seeking feedback';
  };

  const extractInterests = (text) => {
    if (text.includes('ai') || text.includes('machine')) return 'artificial intelligence';
    if (text.includes('cloud') || text.includes('aws')) return 'cloud computing';
    return 'continuous learning';
  };

  const extractCertifications = (text) => {
    if (text.includes('aws')) return 'AWS certifications';
    if (text.includes('google')) return 'Google Cloud certifications';
    return 'relevant certifications';
  };

  const extractJobResponsibilities = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('develop') || lowerJob.includes('build')) return 'developing innovative solutions';
    if (lowerJob.includes('manage') || lowerJob.includes('lead')) return 'leading technical initiatives';
    if (lowerJob.includes('analyze') || lowerJob.includes('design')) return 'analyzing and designing systems';
    return 'contributing to technical projects';
  };

  const extractCompanyGoals = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('innovation') || lowerJob.includes('cutting-edge')) return 'innovative solutions';
    if (lowerJob.includes('growth') || lowerJob.includes('expand')) return 'company growth';
    if (lowerJob.includes('customer') || lowerJob.includes('user')) return 'customer satisfaction';
    return 'organizational success';
  };

  const extractJobFocus = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('software') || lowerJob.includes('development')) return 'software development';
    if (lowerJob.includes('data') || lowerJob.includes('analytics')) return 'data analysis';
    if (lowerJob.includes('ai') || lowerJob.includes('machine')) return 'artificial intelligence';
    return 'technology innovation';
  };

  const extractJobLevel = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('senior') || lowerJob.includes('lead')) return 'senior technical leader';
    if (lowerJob.includes('principal') || lowerJob.includes('architect')) return 'principal engineer';
    return 'technical leader';
  };

  const extractCompanyValues = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('innovation') || lowerJob.includes('creative')) return 'innovation and creativity';
    if (lowerJob.includes('collaboration') || lowerJob.includes('team')) return 'collaboration and teamwork';
    if (lowerJob.includes('quality') || lowerJob.includes('excellence')) return 'quality and excellence';
    return 'excellence and innovation';
  };

  const extractCompanyAchievements = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('award') || lowerJob.includes('recognition')) return 'industry recognition';
    if (lowerJob.includes('growth') || lowerJob.includes('expand')) return 'rapid growth';
    if (lowerJob.includes('customer') || lowerJob.includes('client')) return 'customer satisfaction';
    return 'industry leadership';
  };

  const extractCompanyMission = (jobDesc) => {
    const lowerJob = jobDesc.toLowerCase();
    if (lowerJob.includes('customer') || lowerJob.includes('user')) return 'customer success';
    if (lowerJob.includes('innovation') || lowerJob.includes('technology')) return 'technological advancement';
    if (lowerJob.includes('impact') || lowerJob.includes('change')) return 'positive impact';
    return 'organizational excellence';
  };

  const commonQuestions = [
    'Why are you interested in this role?',
    'What makes you a good fit for this position?',
    'Tell me about yourself',
    'What are your greatest strengths?',
    'What is your biggest weakness?',
    'Where do you see yourself in 5 years?',
    'Why do you want to work for our company?',
    'What questions do you have for us?'
  ];

  const handleGenerateAnswers = async () => {
    if (!jobDescription.trim() || questions.length === 0) {
      toast.error('Please provide a job description and select questions');
      return;
    }

    if (!resumeText.trim()) {
      toast.error('Please provide your resume text');
      return;
    }

    setLoading(true);

    try {
      // Try AI-powered generation via backend if user is logged in
      if (user && useAI) {
        try {
          const response = await agentsAPI.generateAnswers(resumeText, jobDescription, questions);
          const data = response.data;

          if (data.success && data.data) {
            const backendAnswers = data.data.answers || [];
            const formattedAnswers = backendAnswers.map((item, index) => ({
              id: index + 1,
              question: item.question || questions[index],
              answer: item.answer || '',
              tips: item.tips || [
                'Use specific examples from your experience',
                'Connect your skills to the job requirements',
                'Show enthusiasm for the role and company',
                'Quantify your achievements when possible'
              ],
              feedback: null
            }));

            if (formattedAnswers.length > 0) {
              setGeneratedAnswers(formattedAnswers);
              toast.success('AI-powered answers generated!');
              return;
            }
          }
        } catch (apiError) {
          console.log('Backend API unavailable, using local generation:', apiError.message);
          toast.info('Using local generation (backend unavailable)');
        }
      }

      // Fallback to local generation
      const personalizedAnswers = questions.map((question, index) => ({
        id: index + 1,
        question,
        answer: generatePersonalizedAnswer(question, resumeText, jobDescription),
        tips: [
          'Use specific examples from your experience',
          'Connect your skills to the job requirements',
          'Show enthusiasm for the role and company',
          'Quantify your achievements when possible'
        ],
        feedback: null
      }));

      setGeneratedAnswers(personalizedAnswers);
      toast.success('Answers generated successfully!');
    } catch (error) {
      console.error('Generate answers error:', error);
      toast.error('Failed to generate answers');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = (answer) => {
    navigator.clipboard.writeText(answer);
    toast.success('Answer copied to clipboard!');
  };

  const handleFeedback = (answerId, feedback) => {
    setGeneratedAnswers(prev => 
      prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, feedback }
          : answer
      )
    );
  };

  const handleEditAnswer = (answerId, newAnswer) => {
    setGeneratedAnswers(prev => 
      prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, answer: newAnswer }
          : answer
      )
    );
    setEditingAnswer(null);
  };

  const toggleQuestion = (question) => {
    if (questions.includes(question)) {
      setQuestions(questions.filter(q => q !== question));
    } else {
      setQuestions([...questions, question]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Answer Generator</h1>
        <p className="text-gray-600">Generate tailored answers to common interview questions based on your resume and job description</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Job Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get tailored answers..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Resume Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="mt-2 text-sm text-gray-500">
              Paste your resume content to get personalized answers
            </div>
          </div>

          {/* Question Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Questions</h2>
            <div className="space-y-3">
              {commonQuestions.map((question) => (
                <label key={question} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={questions.includes(question)}
                    onChange={() => toggleQuestion(question)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{question}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateAnswers}
            disabled={!jobDescription.trim() || !resumeText.trim() || questions.length === 0 || loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 mr-2" />
                Generate Answers
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {generatedAnswers.length > 0 ? (
            generatedAnswers.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyAnswer(item.answer)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Copy answer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingAnswer(item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit answer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {editingAnswer === item.id ? (
                  <div className="space-y-4">
                    <textarea
                      defaultValue={item.answer}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAnswer(item.id, document.querySelector('textarea').value)}
                        className="btn-primary flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAnswer(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Tips for this answer:</span>
                      </div>
                      <ul className="space-y-1">
                        {item.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-blue-800">• {tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Feedback */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Was this helpful?</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFeedback(item.id, 'positive')}
                          className={`p-2 rounded-lg ${
                            item.feedback === 'positive' 
                              ? 'bg-green-100 text-green-600' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(item.id, 'negative')}
                          className={`p-2 rounded-lg ${
                            item.feedback === 'negative' 
                              ? 'bg-red-100 text-red-600' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to generate answers?</h3>
              <p className="text-gray-600">
                Provide a job description and select questions to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {generatedAnswers.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Copy className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Copy All Answers</p>
                <p className="text-sm text-gray-600">Copy all generated answers to clipboard</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Save className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Save as Template</p>
                <p className="text-sm text-gray-600">Save these answers as a template</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Regenerate All</p>
                <p className="text-sm text-gray-600">Generate new answers with updated content</p>
              </div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnswerGenerator;
