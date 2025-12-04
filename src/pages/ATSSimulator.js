import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Upload,
  Zap,
  Table,
  Type,
  Layout,
  Image,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ATSSimulator = () => {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' or 'ats'

  // Common ATS issues to check for
  const checkATSIssues = (text) => {
    const issues = [];
    const warnings = [];
    const passed = [];

    // Check for tables (indicated by multiple tabs or pipe characters)
    if (text.includes('|') || (text.match(/\t.*\t/g) || []).length > 3) {
      issues.push({
        type: 'error',
        title: 'Table Detected',
        description: 'Tables often break ATS parsing. Content in tables may not be read correctly.',
        icon: Table
      });
    } else {
      passed.push({
        type: 'success',
        title: 'No Tables',
        description: 'Your resume appears to avoid problematic table layouts.',
        icon: Table
      });
    }

    // Check for multiple columns (indicated by large whitespace gaps)
    const lines = text.split('\n');
    const multiColumnLines = lines.filter(line => line.includes('   ') && line.trim().length > 50);
    if (multiColumnLines.length > 5) {
      issues.push({
        type: 'error',
        title: 'Multi-Column Layout Detected',
        description: 'Two-column layouts can cause text to merge incorrectly in ATS systems.',
        icon: Layout
      });
    } else {
      passed.push({
        type: 'success',
        title: 'Single Column Layout',
        description: 'Your resume uses a single-column format that parses well.',
        icon: Layout
      });
    }

    // Check for images (references to image files)
    if (text.match(/\.(jpg|jpeg|png|gif|svg|bmp)/gi)) {
      warnings.push({
        type: 'warning',
        title: 'Image References Found',
        description: 'Images and graphics are not readable by ATS. Ensure key info is in text.',
        icon: Image
      });
    }

    // Check for special characters that might cause issues
    const specialChars = text.match(/[•●○◆★☆►▪︎]/g) || [];
    if (specialChars.length > 0) {
      warnings.push({
        type: 'warning',
        title: 'Special Bullet Characters',
        description: `Found ${specialChars.length} special characters. Some ATS may not parse these correctly.`,
        icon: Type
      });
    } else {
      passed.push({
        type: 'success',
        title: 'Standard Characters',
        description: 'Using standard characters that parse reliably.',
        icon: Type
      });
    }

    // Check for URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length > 0) {
      passed.push({
        type: 'success',
        title: 'Links Included',
        description: `Found ${urls.length} URL(s). LinkedIn/GitHub links are often valued.`,
        icon: LinkIcon
      });
    }

    // Check for contact information
    const hasEmail = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const hasPhone = text.match(/[\d\s()+-]{10,}/);

    if (hasEmail && hasPhone) {
      passed.push({
        type: 'success',
        title: 'Contact Info Detected',
        description: 'Email and phone number were successfully parsed.',
        icon: CheckCircle
      });
    } else if (!hasEmail) {
      issues.push({
        type: 'error',
        title: 'No Email Found',
        description: 'ATS could not detect an email address. Ensure it\'s in plain text.',
        icon: XCircle
      });
    } else if (!hasPhone) {
      warnings.push({
        type: 'warning',
        title: 'No Phone Found',
        description: 'Phone number not detected. Consider adding it in a standard format.',
        icon: AlertTriangle
      });
    }

    // Check for section headers
    const commonSections = ['experience', 'education', 'skills', 'projects', 'work', 'summary'];
    const foundSections = commonSections.filter(section =>
      text.toLowerCase().includes(section)
    );

    if (foundSections.length >= 3) {
      passed.push({
        type: 'success',
        title: 'Clear Section Headers',
        description: `Detected ${foundSections.length} standard sections: ${foundSections.join(', ')}.`,
        icon: FileText
      });
    } else {
      warnings.push({
        type: 'warning',
        title: 'Limited Section Headers',
        description: 'Consider using standard headers like "Experience", "Education", "Skills".',
        icon: FileText
      });
    }

    return { issues, warnings, passed };
  };

  // Extract keywords and check against job description
  const analyzeKeywords = (resume, jobDesc) => {
    const resumeLower = resume.toLowerCase();
    const jobLower = jobDesc.toLowerCase();

    // Common tech keywords
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'nodejs',
      'typescript', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github',
      'agile', 'scrum', 'jira', 'rest', 'api', 'graphql', 'microservices',
      'machine learning', 'ai', 'data science', 'analytics', 'tensorflow', 'pytorch',
      'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'ui/ux',
      'linux', 'unix', 'bash', 'shell', 'devops', 'jenkins', 'terraform'
    ];

    // Extract keywords from job description
    const jobKeywords = techKeywords.filter(kw => jobLower.includes(kw));

    // Find matched and missing
    const matched = jobKeywords.filter(kw => resumeLower.includes(kw));
    const missing = jobKeywords.filter(kw => !resumeLower.includes(kw));

    // Calculate score
    const score = jobKeywords.length > 0
      ? Math.round((matched.length / jobKeywords.length) * 100)
      : 75;

    return { matched, missing, score, total: jobKeywords.length };
  };

  // Simulate ATS text extraction
  const simulateATSExtraction = (text) => {
    // Remove extra whitespace
    let extracted = text.replace(/\s+/g, ' ');

    // Convert common bullet points to standard
    extracted = extracted.replace(/[•●○◆★☆►▪︎]/g, '-');

    // Remove special formatting
    extracted = extracted.replace(/[_*~`]/g, '');

    // Normalize line breaks
    extracted = extracted.replace(/\n\s*\n/g, '\n\n');

    return extracted.trim();
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }

    setLoading(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for ATS issues
      const atsIssues = checkATSIssues(resumeText);

      // Analyze keywords if job description provided
      let keywordAnalysis = null;
      if (jobDescription.trim()) {
        keywordAnalysis = analyzeKeywords(resumeText, jobDescription);
      }

      // Calculate overall ATS score
      const issuesPenalty = atsIssues.issues.length * 15;
      const warningsPenalty = atsIssues.warnings.length * 5;
      const passedBonus = atsIssues.passed.length * 5;

      let atsScore = 100 - issuesPenalty - warningsPenalty + Math.min(passedBonus, 20);
      atsScore = Math.max(0, Math.min(100, atsScore));

      // If we have keyword analysis, blend the scores
      if (keywordAnalysis) {
        atsScore = Math.round((atsScore * 0.6) + (keywordAnalysis.score * 0.4));
      }

      // Simulate extracted text
      const extractedText = simulateATSExtraction(resumeText);

      setAnalysis({
        atsScore,
        issues: atsIssues.issues,
        warnings: atsIssues.warnings,
        passed: atsIssues.passed,
        keywordAnalysis,
        extractedText,
        parsedSections: extractSections(resumeText)
      });

      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('ATS analysis error:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  // Extract and identify sections
  const extractSections = (text) => {
    const sections = [];
    const lines = text.split('\n');

    const sectionKeywords = {
      'contact': ['email', 'phone', 'address', 'linkedin', 'github'],
      'summary': ['summary', 'objective', 'about', 'profile'],
      'experience': ['experience', 'work history', 'employment', 'work experience'],
      'education': ['education', 'academic', 'degree', 'university', 'college'],
      'skills': ['skills', 'technologies', 'technical skills', 'competencies'],
      'projects': ['projects', 'portfolio', 'personal projects'],
      'certifications': ['certifications', 'certificates', 'licenses']
    };

    for (const [sectionName, keywords] of Object.entries(sectionKeywords)) {
      const found = keywords.some(kw => text.toLowerCase().includes(kw));
      sections.push({
        name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        found,
        status: found ? 'detected' : 'not found'
      });
    }

    return sections;
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
        <h1 className="text-2xl font-bold text-gray-900">ATS Simulator</h1>
        <p className="text-gray-600">See how Applicant Tracking Systems parse your resume</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Resume Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here to see how ATS systems will parse it..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <div className="mt-2 text-sm text-gray-500">
              {resumeText.length} characters
            </div>
          </div>

          {/* Job Description (Optional) */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Description <span className="text-gray-400 font-normal">(Optional)</span>
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description to check keyword matching..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!resumeText.trim() || loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Simulate ATS Scan
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* ATS Score */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Compatibility Score</h2>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${getScoreBgColor(analysis.atsScore)} mb-4`}>
                    <span className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}%
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {analysis.atsScore >= 80
                      ? 'Excellent! Your resume is highly ATS-compatible.'
                      : analysis.atsScore >= 60
                      ? 'Good, but there are some issues to address.'
                      : 'Your resume may have trouble with ATS systems.'
                    }
                  </p>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="card border-red-200 bg-red-50">
                  <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Critical Issues ({analysis.issues.length})
                  </h2>
                  <div className="space-y-3">
                    {analysis.issues.map((issue, index) => (
                      <div key={index} className="flex items-start bg-white p-3 rounded-lg">
                        <issue.icon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{issue.title}</p>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div className="card border-yellow-200 bg-yellow-50">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Warnings ({analysis.warnings.length})
                  </h2>
                  <div className="space-y-3">
                    {analysis.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start bg-white p-3 rounded-lg">
                        <warning.icon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{warning.title}</p>
                          <p className="text-sm text-gray-600">{warning.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passed Checks */}
              {analysis.passed.length > 0 && (
                <div className="card border-green-200 bg-green-50">
                  <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Passed Checks ({analysis.passed.length})
                  </h2>
                  <div className="space-y-2">
                    {analysis.passed.map((item, index) => (
                      <div key={index} className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Analysis */}
              {analysis.keywordAnalysis && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis</h2>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Keyword Match</span>
                      <span className="font-medium">{analysis.keywordAnalysis.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          analysis.keywordAnalysis.score >= 70 ? 'bg-green-500' :
                          analysis.keywordAnalysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.keywordAnalysis.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">
                        Matched ({analysis.keywordAnalysis.matched.length})
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywordAnalysis.matched.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-red-700 mb-2">
                        Missing ({analysis.keywordAnalysis.missing.length})
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywordAnalysis.missing.slice(0, 10).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parsed Sections */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Detection</h2>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.parsedSections.map((section, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded ${
                        section.found ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      {section.found ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={section.found ? 'text-green-700' : 'text-gray-500'}>
                        {section.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS View Toggle */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">ATS View</h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('formatted')}
                      className={`px-3 py-1 text-sm rounded ${
                        viewMode === 'formatted'
                          ? 'bg-white shadow text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      onClick={() => setViewMode('ats')}
                      className={`px-3 py-1 text-sm rounded ${
                        viewMode === 'ats'
                          ? 'bg-white shadow text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      ATS View
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700">
                    {viewMode === 'ats' ? analysis.extractedText : resumeText}
                  </pre>
                </div>
                {viewMode === 'ats' && (
                  <p className="mt-2 text-xs text-gray-500">
                    This is approximately how an ATS system will read your resume.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to simulate?</h3>
              <p className="text-gray-600">
                Paste your resume to see how ATS systems will parse it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSSimulator;
