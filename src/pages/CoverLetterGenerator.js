import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  RefreshCw,
  Edit,
  Save,
  Sparkles,
  Building,
  User,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const CoverLetterGenerator = () => {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [tone, setTone] = useState('professional'); // professional, enthusiastic, confident
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLetter, setEditedLetter] = useState('');

  // Extract key information from resume
  const extractResumeInfo = (resume) => {
    const lower = resume.toLowerCase();

    // Extract skills
    const techSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker',
      'kubernetes', 'sql', 'mongodb', 'typescript', 'git', 'agile', 'scrum', 'ci/cd',
      'machine learning', 'data analysis', 'api', 'rest', 'graphql', 'cloud'];
    const foundSkills = techSkills.filter(skill => lower.includes(skill));

    // Extract years of experience
    const yearsMatch = resume.match(/(\d+)\+?\s*years?\s*(of)?\s*(experience)?/i);
    const years = yearsMatch ? yearsMatch[1] : '3+';

    // Extract achievements (look for numbers/percentages)
    const achievements = [];
    const percentMatch = resume.match(/(\d+)%/g);
    if (percentMatch) achievements.push(`improved metrics by ${percentMatch[0]}`);

    const revenueMatch = resume.match(/\$[\d,]+[KMB]?/gi);
    if (revenueMatch) achievements.push(`delivered ${revenueMatch[0]} in value`);

    // Determine experience level
    let level = 'professional';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) {
      level = 'senior';
    } else if (lower.includes('junior') || lower.includes('entry') || lower.includes('intern')) {
      level = 'entry';
    }

    return { skills: foundSkills, years, achievements, level };
  };

  // Extract key requirements from job description
  const extractJobInfo = (jobDesc) => {
    const lower = jobDesc.toLowerCase();

    // Extract key responsibilities
    const responsibilities = [];
    if (lower.includes('develop') || lower.includes('build')) responsibilities.push('developing innovative solutions');
    if (lower.includes('lead') || lower.includes('manage')) responsibilities.push('leading technical initiatives');
    if (lower.includes('collaborate') || lower.includes('team')) responsibilities.push('cross-functional collaboration');
    if (lower.includes('design') || lower.includes('architect')) responsibilities.push('system design and architecture');

    // Extract what they're looking for
    const requirements = [];
    if (lower.includes('problem-solving') || lower.includes('analytical')) requirements.push('strong analytical skills');
    if (lower.includes('communication')) requirements.push('excellent communication');
    if (lower.includes('fast-paced') || lower.includes('startup')) requirements.push('thriving in dynamic environments');

    return { responsibilities, requirements };
  };

  // Generate cover letter based on inputs
  const generateCoverLetter = () => {
    const resumeInfo = extractResumeInfo(resumeText);
    const jobInfo = extractJobInfo(jobDescription);

    const greeting = hiringManager
      ? `Dear ${hiringManager},`
      : 'Dear Hiring Manager,';

    const companyRef = companyName || 'your company';
    const positionRef = jobTitle || 'this position';

    // Opening paragraph - varies by tone
    let opening;
    switch (tone) {
      case 'enthusiastic':
        opening = `I am thrilled to apply for the ${positionRef} position at ${companyRef}! When I discovered this opportunity, I knew immediately that my background and passion align perfectly with what you're looking for.`;
        break;
      case 'confident':
        opening = `I am writing to express my strong interest in the ${positionRef} role at ${companyRef}. With ${resumeInfo.years} years of proven experience and a track record of delivering results, I am confident I would be a valuable addition to your team.`;
        break;
      default: // professional
        opening = `I am writing to express my interest in the ${positionRef} position at ${companyRef}. With ${resumeInfo.years} years of experience in the field, I believe my skills and background make me an excellent candidate for this role.`;
    }

    // Skills paragraph
    const skillsList = resumeInfo.skills.slice(0, 5).join(', ') || 'software development and problem-solving';
    const skills = `Throughout my career, I have developed strong expertise in ${skillsList}. ${
      jobInfo.responsibilities.length > 0
        ? `I am particularly excited about the opportunity to focus on ${jobInfo.responsibilities.slice(0, 2).join(' and ')}.`
        : 'I am eager to bring these skills to your team and contribute to meaningful projects.'
    }`;

    // Achievement paragraph
    let achievements;
    if (resumeInfo.achievements.length > 0) {
      achievements = `In my previous roles, I have consistently delivered impactful results, including ${resumeInfo.achievements[0]}. I am committed to bringing this same level of dedication and results-oriented approach to ${companyRef}.`;
    } else {
      achievements = `I have a proven track record of taking ownership of projects, collaborating effectively with cross-functional teams, and delivering high-quality work on time. I am excited to bring this dedication to ${companyRef}.`;
    }

    // Why this company paragraph
    let whyCompany;
    switch (tone) {
      case 'enthusiastic':
        whyCompany = `What excites me most about ${companyRef} is the opportunity to work on challenging problems alongside talented individuals. I am passionate about ${jobInfo.responsibilities[0] || 'making a real impact'}, and I believe this role would allow me to grow while contributing meaningfully to your mission.`;
        break;
      case 'confident':
        whyCompany = `${companyRef} stands out to me as a leader in the industry, and I am eager to contribute to your continued success. My experience in ${resumeInfo.skills[0] || 'this field'} positions me well to hit the ground running and deliver value from day one.`;
        break;
      default:
        whyCompany = `I am particularly drawn to ${companyRef} because of your commitment to innovation and excellence. I am confident that my background in ${resumeInfo.skills[0] || 'this field'} would allow me to contribute effectively to your team's goals.`;
    }

    // Closing paragraph
    let closing;
    switch (tone) {
      case 'enthusiastic':
        closing = `I would love the opportunity to discuss how my background, skills, and enthusiasm can contribute to ${companyRef}'s success. Thank you for considering my application – I look forward to the possibility of joining your team!`;
        break;
      case 'confident':
        closing = `I am confident that my skills and experience make me an ideal candidate for this role. I welcome the opportunity to discuss how I can contribute to ${companyRef}'s objectives. Thank you for your consideration.`;
        break;
      default:
        closing = `I would welcome the opportunity to discuss how my qualifications align with your needs. Thank you for considering my application. I look forward to hearing from you.`;
    }

    const letter = `${greeting}

${opening}

${skills}

${achievements}

${whyCompany}

${closing}

Sincerely,
[Your Name]
[Your Email]
[Your Phone]`;

    return letter;
  };

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please paste the job description');
      return;
    }

    setLoading(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const letter = generateCoverLetter();
      setCoverLetter(letter);
      setEditedLetter(letter);
      toast.success('Cover letter generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = isEditing ? editedLetter : coverLetter;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Cover letter copied to clipboard!');
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedLetter : coverLetter;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName || 'company'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Cover letter downloaded!');
  };

  const handleSaveEdit = () => {
    setCoverLetter(editedLetter);
    setIsEditing(false);
    toast.success('Changes saved!');
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and polished' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
    { value: 'confident', label: 'Confident', description: 'Bold and assertive' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="text-gray-600">Create a personalized cover letter tailored to each job application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Hiring Manager Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Resume */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tone Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Writing Tone</h2>
            <div className="grid grid-cols-3 gap-3">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    tone === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-medium ${tone === option.value ? 'text-primary-700' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!resumeText.trim() || !jobDescription.trim() || loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {coverLetter ? (
            <>
              {/* Actions */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Cover Letter</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Download as text file"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveEdit();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title={isEditing ? "Save changes" : "Edit letter"}
                    >
                      {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handleRegenerate}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Letter Content */}
              <div className="card">
                {isEditing ? (
                  <textarea
                    value={editedLetter}
                    onChange={(e) => setEditedLetter(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {coverLetter}
                    </pre>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Tips for your cover letter</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Replace [Your Name], [Your Email], [Your Phone] with your actual contact info
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Customize the opening paragraph to mention something specific about the company
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Add specific metrics or achievements from your experience
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Keep it to one page (300-400 words is ideal)
                  </li>
                </ul>
              </div>

              {/* Word Count */}
              <div className="text-sm text-gray-500 text-center">
                {(isEditing ? editedLetter : coverLetter).split(/\s+/).length} words •
                {(isEditing ? editedLetter : coverLetter).length} characters
              </div>
            </>
          ) : (
            <div className="card text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to create your cover letter?</h3>
              <p className="text-gray-600 mb-4">
                Fill in the job details and paste your resume to generate a personalized cover letter
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Tailored to each job
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Multiple tones
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Easy to edit
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
