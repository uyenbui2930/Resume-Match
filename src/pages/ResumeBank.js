import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  Plus,
  Star,
  StarOff,
  Copy,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResumeBank = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [newResume, setNewResume] = useState({
    name: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Load resumes from localStorage on mount
  useEffect(() => {
    const savedResumes = localStorage.getItem('resumeBank');
    if (savedResumes) {
      setResumes(JSON.parse(savedResumes));
    }
  }, []);

  // Save resumes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('resumeBank', JSON.stringify(resumes));
  }, [resumes]);

  const handleAddResume = () => {
    if (!newResume.name.trim() || !newResume.content.trim()) {
      toast.error('Please provide both a name and resume content');
      return;
    }

    if (resumes.length >= 5) {
      toast.error('Maximum 5 resumes allowed. Please delete one to add another.');
      return;
    }

    const resume = {
      id: Date.now(),
      name: newResume.name.trim(),
      content: newResume.content.trim(),
      tags: newResume.tags,
      isPrimary: resumes.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setResumes([...resumes, resume]);
    setNewResume({ name: '', content: '', tags: [] });
    setIsAddingNew(false);
    toast.success('Resume added successfully!');
  };

  const handleDeleteResume = (id) => {
    const resumeToDelete = resumes.find(r => r.id === id);
    const updatedResumes = resumes.filter(r => r.id !== id);

    // If we deleted the primary resume, make the first remaining one primary
    if (resumeToDelete?.isPrimary && updatedResumes.length > 0) {
      updatedResumes[0].isPrimary = true;
    }

    setResumes(updatedResumes);
    if (selectedResume?.id === id) {
      setSelectedResume(null);
    }
    toast.success('Resume deleted');
  };

  const handleSetPrimary = (id) => {
    setResumes(resumes.map(r => ({
      ...r,
      isPrimary: r.id === id
    })));
    toast.success('Primary resume updated');
  };

  const handleStartEdit = (resume) => {
    setEditingId(resume.id);
    setEditingName(resume.name);
  };

  const handleSaveEdit = (id) => {
    if (!editingName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setResumes(resumes.map(r =>
      r.id === id
        ? { ...r, name: editingName.trim(), updatedAt: new Date().toISOString() }
        : r
    ));
    setEditingId(null);
    setEditingName('');
    toast.success('Resume renamed');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newResume.tags.includes(tagInput.trim())) {
      setNewResume({
        ...newResume,
        tags: [...newResume.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setNewResume({
      ...newResume,
      tags: newResume.tags.filter(t => t !== tag)
    });
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Resume copied to clipboard');
  };

  const handleDownload = (resume) => {
    const blob = new Blob([resume.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded');
  };

  const getWordCount = (content) => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const getBulletCount = (content) => {
    return (content.match(/^[\s]*[-•*]/gm) || []).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Bank</h1>
          <p className="mt-1 text-sm text-gray-500">
            Store up to 5 resume versions for different job types
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {resumes.length}/5 resumes
          </span>
          {resumes.length < 5 && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="btn-primary flex items-center"
              disabled={isAddingNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resume
            </button>
          )}
        </div>
      </div>

      {/* Add New Resume Form */}
      {isAddingNew && (
        <div className="card p-6 border-2 border-primary-200 bg-primary-50/30">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Resume</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume Name *
              </label>
              <input
                type="text"
                value={newResume.name}
                onChange={(e) => setNewResume({ ...newResume, name: e.target.value })}
                placeholder="e.g., Technical Focus, Leadership, Creative"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newResume.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag (e.g., Software, Startup, Senior)"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume Content *
              </label>
              <textarea
                value={newResume.content}
                onChange={(e) => setNewResume({ ...newResume, content: e.target.value })}
                placeholder="Paste your resume content here..."
                rows={12}
                className="input-field font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {getWordCount(newResume.content)} words | {getBulletCount(newResume.content)} bullet points
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewResume({ name: '', content: '', tags: [] });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResume}
                className="btn-primary"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume List */}
      {resumes.length === 0 && !isAddingNew ? (
        <div className="card p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first resume to get started with the Resume Bank
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Cards */}
          <div className="lg:col-span-1 space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`card p-4 cursor-pointer transition-all ${
                  selectedResume?.id === resume.id
                    ? 'ring-2 ring-primary-500 border-primary-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedResume(resume)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === resume.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="input-field text-sm py-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(resume.id);
                          }}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {resume.name}
                        </h3>
                        {resume.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resume.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {getWordCount(resume.content)} words | {getBulletCount(resume.content)} bullets
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(resume);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      title="Rename"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(resume.id);
                      }}
                      className={`p-1.5 rounded ${
                        resume.isPrimary
                          ? 'text-yellow-500'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={resume.isPrimary ? 'Primary Resume' : 'Set as Primary'}
                    >
                      {resume.isPrimary ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(resume.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-2">
            {selectedResume ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedResume.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(selectedResume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyContent(selectedResume.content)}
                      className="btn-secondary flex items-center text-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={() => handleDownload(selectedResume)}
                      className="btn-secondary flex items-center text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedResume.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {getWordCount(selectedResume.content)}
                    </div>
                    <div className="text-xs text-gray-500">Words</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {getBulletCount(selectedResume.content)}
                    </div>
                    <div className="text-xs text-gray-500">Bullet Points</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedResume.content.split('\n').filter(l => l.trim()).length}
                    </div>
                    <div className="text-xs text-gray-500">Lines</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {selectedResume.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a resume to preview
                </h3>
                <p className="text-gray-500">
                  Click on any resume card to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Tips for organizing your resumes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Technical Focus:</strong> Emphasize programming languages, frameworks, and technical projects</li>
          <li>• <strong>Leadership Focus:</strong> Highlight team management, mentoring, and strategic initiatives</li>
          <li>• <strong>Creative Focus:</strong> Showcase design thinking, innovation, and creative problem-solving</li>
          <li>• <strong>Industry-Specific:</strong> Tailor content for specific industries (fintech, healthcare, etc.)</li>
          <li>• Use the star to mark your primary/default resume for quick access</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeBank;
