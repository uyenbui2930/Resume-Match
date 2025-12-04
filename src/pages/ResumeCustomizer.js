import React, { useState, useEffect } from 'react';
import {
  FileText,
  Briefcase,
  Wand2,
  ChevronDown,
  ChevronUp,
  Check,
  Square,
  CheckSquare,
  GripVertical,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResumeCustomizer = () => {
  const [step, setStep] = useState(1);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeIds, setSelectedResumeIds] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState(null);
  const [bulletPoints, setBulletPoints] = useState([]);
  const [selectedBullets, setSelectedBullets] = useState(new Set());
  const [customResume, setCustomResume] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load resumes from Resume Bank
  useEffect(() => {
    const savedResumes = localStorage.getItem('resumeBank');
    if (savedResumes) {
      setResumes(JSON.parse(savedResumes));
    }
  }, []);

  const toggleResumeSelection = (id) => {
    setSelectedResumeIds(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    );
  };

  const extractBulletPoints = (content, resumeName) => {
    const lines = content.split('\n');
    const bullets = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Match lines starting with bullet characters or that look like achievement statements
      if (trimmed.match(/^[-•*]/) ||
          (trimmed.match(/^(Led|Developed|Created|Managed|Implemented|Designed|Built|Improved|Increased|Reduced|Achieved|Spearheaded|Orchestrated)/i))) {
        bullets.push({
          id: `${resumeName}-${index}`,
          text: trimmed.replace(/^[-•*]\s*/, ''),
          source: resumeName,
          relevanceScore: 0
        });
      }
    });

    return bullets;
  };

  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (selectedResumeIds.length === 0) {
      toast.error('Please select at least one resume');
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis - extract requirements from job description
    setTimeout(() => {
      const jd = jobDescription.toLowerCase();

      // Extract key skills and requirements
      const skillPatterns = [
        /\b(python|java|javascript|typescript|react|node\.?js|sql|aws|docker|kubernetes|git)\b/gi,
        /\b(machine learning|data analysis|cloud|agile|scrum|ci\/cd|devops)\b/gi,
        /\b(leadership|communication|problem.?solving|teamwork|collaboration)\b/gi
      ];

      const extractedSkills = new Set();
      skillPatterns.forEach(pattern => {
        const matches = jobDescription.match(pattern) || [];
        matches.forEach(m => extractedSkills.add(m.toLowerCase()));
      });

      // Extract years of experience
      const expMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
      const yearsRequired = expMatch ? parseInt(expMatch[1]) : null;

      // Identify key responsibilities
      const responsibilities = [];
      const respPatterns = [
        /(?:^|\n)\s*[-•*]\s*([^-•*\n]+)/g,
        /(?:will|must|should|expected to)\s+([^.]+)/gi
      ];

      respPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(jobDescription)) !== null) {
          if (match[1].length > 20 && match[1].length < 200) {
            responsibilities.push(match[1].trim());
          }
        }
      });

      const requirements = {
        skills: Array.from(extractedSkills),
        yearsRequired,
        responsibilities: responsibilities.slice(0, 5),
        keywords: Array.from(extractedSkills).slice(0, 10)
      };

      setJobRequirements(requirements);

      // Extract and score bullet points from selected resumes
      const selectedResumes = resumes.filter(r => selectedResumeIds.includes(r.id));
      let allBullets = [];

      selectedResumes.forEach(resume => {
        const bullets = extractBulletPoints(resume.content, resume.name);
        allBullets = [...allBullets, ...bullets];
      });

      // Score bullets based on keyword matches
      allBullets = allBullets.map(bullet => {
        let score = 0;
        const bulletLower = bullet.text.toLowerCase();

        requirements.skills.forEach(skill => {
          if (bulletLower.includes(skill.toLowerCase())) {
            score += 10;
          }
        });

        // Bonus for quantified achievements
        if (bullet.text.match(/\d+%|\$[\d,]+|\d+x|increased|reduced|improved/i)) {
          score += 5;
        }

        // Bonus for action verbs
        if (bullet.text.match(/^(Led|Developed|Created|Managed|Implemented|Designed|Built|Spearheaded|Orchestrated)/i)) {
          score += 3;
        }

        return { ...bullet, relevanceScore: score };
      });

      // Sort by relevance score
      allBullets.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setBulletPoints(allBullets);

      // Auto-select top relevant bullets (up to 10)
      const topBullets = allBullets.slice(0, 10).map(b => b.id);
      setSelectedBullets(new Set(topBullets));

      setIsAnalyzing(false);
      setStep(2);
      toast.success('Analysis complete! Review and select bullet points.');
    }, 1500);
  };

  const toggleBullet = (id) => {
    setSelectedBullets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedBullets(new Set(bulletPoints.map(b => b.id)));
  };

  const deselectAll = () => {
    setSelectedBullets(new Set());
  };

  const moveBullet = (index, direction) => {
    const newBullets = [...bulletPoints];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newBullets.length) {
      [newBullets[index], newBullets[newIndex]] = [newBullets[newIndex], newBullets[index]];
      setBulletPoints(newBullets);
    }
  };

  const generateCustomResume = () => {
    if (selectedBullets.size === 0) {
      toast.error('Please select at least one bullet point');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      // Get the primary resume as a template
      const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
      const selectedBulletTexts = bulletPoints
        .filter(b => selectedBullets.has(b.id))
        .map(b => `• ${b.text}`);

      // Build custom resume
      let header = '';
      if (primaryResume) {
        // Extract header section (name, contact, etc.)
        const lines = primaryResume.content.split('\n');
        const headerLines = [];
        for (const line of lines) {
          if (line.trim().match(/^[-•*]/) || line.trim().match(/^(experience|education|skills|projects)/i)) {
            break;
          }
          headerLines.push(line);
        }
        header = headerLines.join('\n');
      }

      // Extract skills section based on job requirements
      const skillsSection = jobRequirements?.skills.length > 0
        ? `\nSKILLS\n${jobRequirements.skills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' | ')}`
        : '';

      // Build the custom resume
      const customContent = `${header.trim()}

PROFESSIONAL EXPERIENCE

${selectedBulletTexts.join('\n')}
${skillsSection}

---
Generated with AI Resume Customizer
Tailored for the job description provided
Selected ${selectedBullets.size} most relevant achievements from ${selectedResumeIds.length} resume(s)
`;

      setCustomResume(customContent);
      setIsGenerating(false);
      setStep(3);
      toast.success('Custom resume generated!');
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customResume);
    toast.success('Resume copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([customResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded');
  };

  const resetCustomizer = () => {
    setStep(1);
    setSelectedResumeIds([]);
    setJobDescription('');
    setJobRequirements(null);
    setBulletPoints([]);
    setSelectedBullets(new Set());
    setCustomResume('');
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { num: 1, label: 'Select & Analyze' },
        { num: 2, label: 'Choose Bullets' },
        { num: 3, label: 'Generate' }
      ].map((s, i) => (
        <React.Fragment key={s.num}>
          <div className={`flex items-center ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s.num ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">{s.label}</span>
          </div>
          {i < 2 && (
            <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-primary-300' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Customizer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a tailored resume by combining the best parts of your resumes
          </p>
        </div>
        {step > 1 && (
          <button onClick={resetCustomizer} className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Over
          </button>
        )}
      </div>

      <StepIndicator />

      {/* No resumes warning */}
      {resumes.length === 0 && (
        <div className="card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes in Bank</h3>
          <p className="text-gray-500 mb-4">
            You need to add resumes to your Resume Bank before using the customizer.
          </p>
          <a href="/resume-bank" className="btn-primary inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Go to Resume Bank
          </a>
        </div>
      )}

      {/* Step 1: Select resumes and enter job description */}
      {step === 1 && resumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-500" />
              Select Resumes to Use
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose which resume versions to pull bullet points from
            </p>
            <div className="space-y-3">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  onClick={() => toggleResumeSelection(resume.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedResumeIds.includes(resume.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {selectedResumeIds.includes(resume.id) ? (
                      <CheckSquare className="h-5 w-5 text-primary-600 mr-3" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{resume.name}</div>
                      <div className="text-xs text-gray-500">
                        {resume.tags?.join(', ') || 'No tags'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
              Job Description
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste the job posting to analyze requirements
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="input-field"
            />
            <div className="mt-4">
              <button
                onClick={analyzeJobDescription}
                disabled={isAnalyzing || selectedResumeIds.length === 0 || !jobDescription.trim()}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Analyze & Extract Bullets
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select and reorder bullet points */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Requirements */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Requirements</h2>

              {jobRequirements?.yearsRequired && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700">Experience</div>
                  <div className="text-sm text-gray-600">{jobRequirements.yearsRequired}+ years</div>
                </div>
              )}

              {jobRequirements?.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Key Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {jobRequirements.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">Selection Summary</div>
                <div className="text-2xl font-bold text-primary-600">
                  {selectedBullets.size} / {bulletPoints.length}
                </div>
                <div className="text-xs text-gray-500">bullets selected</div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button onClick={selectAll} className="btn-secondary text-xs flex-1">
                  Select All
                </button>
                <button onClick={deselectAll} className="btn-secondary text-xs flex-1">
                  Deselect All
                </button>
              </div>

              <button
                onClick={generateCustomResume}
                disabled={selectedBullets.size === 0}
                className="btn-primary w-full mt-4 flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Resume
              </button>
            </div>
          </div>

          {/* Bullet Points List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bullet Points
                </h2>
                <span className="text-sm text-gray-500">
                  Sorted by relevance to job
                </span>
              </div>

              <div className="space-y-2">
                {bulletPoints.map((bullet, index) => (
                  <div
                    key={bullet.id}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedBullets.has(bullet.id)
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center mr-3 mt-0.5">
                        <button
                          onClick={() => toggleBullet(bullet.id)}
                          className="text-gray-400 hover:text-primary-600"
                        >
                          {selectedBullets.has(bullet.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{bullet.text}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {bullet.source}
                          </span>
                          {bullet.relevanceScore > 0 && (
                            <span className="ml-2 text-green-600 font-medium">
                              +{bullet.relevanceScore} relevance
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col ml-2">
                        <button
                          onClick={() => moveBullet(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveBullet(index, 'down')}
                          disabled={index === bulletPoints.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bulletPoints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bullet points extracted. Make sure your resumes contain bullet-pointed achievements.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Generated Resume */}
      {step === 3 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary-500" />
              Your Custom Resume
            </h2>
            <div className="flex space-x-2">
              <button onClick={handleCopy} className="btn-secondary flex items-center">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </button>
              <button onClick={handleDownload} className="btn-primary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border">
            <textarea
              value={customResume}
              onChange={(e) => setCustomResume(e.target.value)}
              className="w-full h-96 bg-white border rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary flex items-center"
            >
              Back to Bullet Selection
            </button>
            <div className="text-sm text-gray-500">
              {customResume.split('\n').filter(l => l.trim()).length} lines |
              {' '}{customResume.trim().split(/\s+/).length} words
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {step === 1 && resumes.length > 0 && (
        <div className="card p-4 bg-purple-50 border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">How it works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium mr-2">
                1
              </div>
              <div>Select the resumes you want to pull content from</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium mr-2">
                2
              </div>
              <div>Paste the job description for AI analysis</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium mr-2">
                3
              </div>
              <div>Pick the best bullets and generate a tailored resume</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeCustomizer;
