import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    values: [],
    roles: [],
    locations: [],
    experienceLevel: [],
    companySize: [],
    industries: {
      exciting: [],
      avoid: []
    },
    skills: {
      have: [],
      prefer: [],
      avoid: []
    },
    salary: 0,
    jobSearchStatus: ''
  });

  const steps = [
    { id: 'values', title: 'What do you value in a new role?', component: ValuesStep },
    { id: 'roles', title: 'What kinds of roles are you interested in?', component: RolesStep },
    { id: 'locations', title: 'Where would you like to work?', component: LocationsStep },
    { id: 'experience', title: 'What level of roles are you looking for?', component: ExperienceStep },
    { id: 'company', title: 'What is your ideal company size?', component: CompanySizeStep },
    { id: 'industries', title: 'What industries are exciting to you?', component: IndustriesStep },
    { id: 'skills', title: 'What skills do you have or enjoy working with?', component: SkillsStep },
    { id: 'salary', title: 'What is your minimum expected salary?', component: SalaryStep },
    { id: 'status', title: 'What\'s the status of your job search?', component: StatusStep }
  ];

  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and redirect to dashboard
      savePreferences();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const savePreferences = async () => {
    try {
      // Here you would save preferences to your backend
      console.log('Saving preferences:', preferences);
      toast.success('Preferences saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center">
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {steps[currentStep].title}
            </h1>
            
            <CurrentStepComponent 
              preferences={preferences}
              setPreferences={setPreferences}
            />
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="btn-primary flex items-center"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Save and Continue'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const ValuesStep = ({ preferences, setPreferences }) => {
  const values = [
    'Diversity & inclusion',
    'Impactful work',
    'Independence & autonomy',
    'Innovative product & tech',
    'Mentorship & career development',
    'Progressive leadership',
    'Recognition & reward',
    'Role mobility',
    'Social responsibility & sustainability',
    'Transparency & communication',
    'Work-life balance'
  ];

  const toggleValue = (value) => {
    const newValues = preferences.values.includes(value)
      ? preferences.values.filter(v => v !== value)
      : [...preferences.values, value];
    
    setPreferences({
      ...preferences,
      values: newValues
    });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">Select up to 3</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => toggleValue(value)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              preferences.values.includes(value)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

const RolesStep = ({ preferences, setPreferences }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const roleCategories = {
    'Technical & Engineering': [
      'AI & Machine Learning', 'Aerospace Engineering', 'Architecture & Civil Engineering',
      'Data & Analytics', 'Developer Relations', 'DevOps & Infrastructure',
      'Electrical Engineering', 'Engineering Management', 'Hardware Engineering',
      'IT & Security', 'Mechanical Engineering', 'Process Engineering',
      'QA & Testing', 'Quantitative Finance', 'Quantum Computing',
      'Sales & Solution Engineering', 'Software Engineering'
    ],
    'Finance & Operations & Strategy': [
      'Accounting', 'Business & Strategy', 'Consulting', 'Finance & Banking',
      'Growth & Marketing', 'Operations & Logistics', 'Product', 'Real Estate',
      'Retail', 'Sales & Account Management'
    ],
    'Creative & Design': [
      'Art', 'Graphics & Animation', 'Audio & Sound Design', 'Content & Writing',
      'Creative Production', 'Journalism', 'Social Media', 'UI/UX & Design'
    ],
    'Education & Training': ['Education', 'Training'],
    'Legal & Support & Administration': [
      'Administrative & Executive Assistance', 'Clerical & Data Entry',
      'Customer Experience & Support', 'Legal & Compliance', 'People & HR',
      'Security & Protective Services'
    ],
    'Life Sciences': [
      'Biology & Biotech', 'Lab & Research', 'Medical', 'Clinical & Veterinary'
    ]
  };

  const specializations = {
    'AI & Machine Learning': [
      'AI Research', 'Applied Machine Learning', 'Computer Vision',
      'Conversational AI & Chatbots', 'Deep Learning', 'Natural Language Processing (NLP)',
      'Robotics & Autonomous Systems', 'Speech Recognition'
    ]
  };

  const toggleRole = (role) => {
    const newRoles = preferences.roles.includes(role)
      ? preferences.roles.filter(r => r !== role)
      : [...preferences.roles, role];
    
    setPreferences({
      ...preferences,
      roles: newRoles
    });
  };

  const filteredCategories = Object.entries(roleCategories).reduce((acc, [category, roles]) => {
    const filteredRoles = roles.filter(role => 
      role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredRoles.length > 0) {
      acc[category] = filteredRoles;
    }
    return acc;
  }, {});

  return (
    <div>
      <p className="text-gray-600 mb-6">Select up to 5</p>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by job title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(filteredCategories).map(([category, roles]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                Select all in {category}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                    preferences.roles.includes(role)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Specialization Section */}
      {preferences.roles.includes('AI & Machine Learning') && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            AI & Machine Learning (Select the most relevant specializations for you)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {specializations['AI & Machine Learning'].map((spec) => (
              <label key={spec} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{spec}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LocationsStep = ({ preferences, setPreferences }) => {
  const locations = {
    'United States': [
      'Atlanta', 'Austin', 'Baltimore', 'Boston', 'Charlotte', 'Chicago',
      'Dallas', 'Denver', 'Las Vegas', 'Los Angeles', 'Miami', 'New York City',
      'Philadelphia', 'Phoenix', 'Portland', 'Remote in USA', 'San Diego',
      'San Francisco Bay Area', 'Seattle', 'Washington D.C.'
    ],
    'Canada': [
      'Montreal', 'Ottawa', 'Quebec City', 'Remote in Canada', 'Toronto',
      'Vancouver', 'Winnipeg'
    ],
    'United Kingdom': [
      'Birmingham', 'Liverpool', 'London', 'Manchester', 'Remote in UK'
    ],
    'Australia': [
      'Adelaide', 'Brisbane', 'Melbourne', 'Perth', 'Remote in Australia', 'Sydney'
    ]
  };

  const toggleLocation = (location) => {
    const newLocations = preferences.locations.includes(location)
      ? preferences.locations.filter(l => l !== location)
      : [...preferences.locations, location];
    
    setPreferences({
      ...preferences,
      locations: newLocations
    });
  };

  return (
    <div>
      <div className="space-y-8">
        {Object.entries(locations).map(([country, cities]) => (
          <div key={country}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{country}</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                Select all in {country}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => toggleLocation(city)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-center ${
                    preferences.locations.includes(city)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {city.includes('Remote') && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      Remote
                    </span>
                  )}
                  {city}
                </button>
              ))}
            </div>
            <button className="mt-3 text-sm text-primary-600 hover:text-primary-700">
              + Add Location
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExperienceStep = ({ preferences, setPreferences }) => {
  const experienceLevels = [
    { id: 'internship', label: 'Internship' },
    { id: 'entry', label: 'Entry Level & New Grad' },
    { id: 'junior', label: 'Junior (1 to 2 years)' },
    { id: 'mid', label: 'Mid-level (3 to 4 years)' },
    { id: 'senior', label: 'Senior (5 to 8 years)' },
    { id: 'expert', label: 'Expert & Leadership (9+ years)' }
  ];

  const leadershipRoles = [
    { id: 'individual', label: 'Individual Contributor' },
    { id: 'manager', label: 'Manager' },
    { id: 'no-preference', label: 'I don\'t have a preference' }
  ];

  const toggleExperience = (level) => {
    const newLevels = preferences.experienceLevel.includes(level)
      ? preferences.experienceLevel.filter(l => l !== level)
      : [...preferences.experienceLevel, level];
    
    setPreferences({
      ...preferences,
      experienceLevel: newLevels
    });
  };

  const toggleLeadership = (role) => {
    setPreferences({
      ...preferences,
      leadershipRole: role
    });
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">Select up to 2</p>
      
      <div className="space-y-4 mb-8">
        {experienceLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => toggleExperience(level.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              preferences.experienceLevel.includes(level.id)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {preferences.experienceLevel.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Are you looking for a specific leadership role?
          </h3>
          <div className="space-y-4">
            {leadershipRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => toggleLeadership(role.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  preferences.leadershipRole === role.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CompanySizeStep = ({ preferences, setPreferences }) => {
  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1,000 employees',
    '1,001-5,000 employees',
    '5,001-10,000 employees',
    '10,001+ employees'
  ];

  const toggleSize = (size) => {
    const newSizes = preferences.companySize.includes(size)
      ? preferences.companySize.filter(s => s !== size)
      : [...preferences.companySize, size];
    
    setPreferences({
      ...preferences,
      companySize: newSizes
    });
  };

  const selectAll = () => {
    setPreferences({
      ...preferences,
      companySize: companySizes
    });
  };

  const unselectAll = () => {
    setPreferences({
      ...preferences,
      companySize: []
    });
  };

  return (
    <div>
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.companySize.length === 0}
            onChange={preferences.companySize.length === 0 ? selectAll : unselectAll}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            {preferences.companySize.length === 0 ? 'Select all sizes' : 'Unselect all sizes'}
          </span>
        </label>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {companySizes.map((size) => (
          <button
            key={size}
            onClick={() => toggleSize(size)}
            className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
              preferences.companySize.includes(size)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

const IndustriesStep = ({ preferences, setPreferences }) => {
  const industries = [
    'Aerospace', 'AI & Machine Learning', 'Automotive & Transportation',
    'Biotechnology', 'Consulting', 'Consumer Goods', 'Consumer Software',
    'Crypto & Web3', 'Cybersecurity', 'Data & Analytics', 'Defense',
    'Design', 'Education', 'Energy', 'Enterprise Software', 'Entertainment',
    'Financial Services', 'Fintech', 'Food & Agriculture', 'Gaming',
    'Government & Public Sector', 'Hardware', 'Healthcare',
    'Industrial & Manufacturing', 'Legal', 'Quantitative Finance',
    'Real Estate', 'Robotics & Automation', 'Social Impact',
    'Venture Capital', 'VR & AR'
  ];

  const toggleExciting = (industry) => {
    const newExciting = preferences.industries.exciting.includes(industry)
      ? preferences.industries.exciting.filter(i => i !== industry)
      : [...preferences.industries.exciting, industry];
    
    setPreferences({
      ...preferences,
      industries: {
        ...preferences.industries,
        exciting: newExciting
      }
    });
  };

  const toggleAvoid = (industry) => {
    const newAvoid = preferences.industries.avoid.includes(industry)
      ? preferences.industries.avoid.filter(i => i !== industry)
      : [...preferences.industries.avoid, industry];
    
    setPreferences({
      ...preferences,
      industries: {
        ...preferences.industries,
        avoid: newAvoid
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            First, what industries are exciting to you?
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => toggleExciting(industry)}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                preferences.industries.exciting.includes(industry)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Second, are there any industries you don't want to work in?
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => toggleAvoid(industry)}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                preferences.industries.avoid.includes(industry)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkillsStep = ({ preferences, setPreferences }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const skills = [
    'Business Analytics', 'Excel/Numbers/Sheets', 'Git', 'HTML/CSS', 'Java',
    'MailChimp', 'MATLAB', 'Operations Research', 'Python', 'SEO', 'Zendesk',
    'Adobe Illustrator', 'JavaScript', 'React', 'Node.js', 'SQL', 'AWS',
    'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis', 'Tableau',
    'Power BI', 'Salesforce', 'HubSpot', 'Google Analytics', 'Figma',
    'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'Premiere Pro',
    'After Effects', 'Blender', 'Maya', '3ds Max', 'Unity', 'Unreal Engine'
  ];

  const toggleSkill = (skill, category) => {
    const newSkills = preferences.skills[category].includes(skill)
      ? preferences.skills[category].filter(s => s !== skill)
      : [...preferences.skills[category], skill];
    
    setPreferences({
      ...preferences,
      skills: {
        ...preferences.skills,
        [category]: newSkills
      }
    });
  };


  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <p className="text-gray-600 mb-6">Select all that applies</p>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Heart className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-gray-600">
            Heart a skill indicate that you'd prefer roles that utilize that skill!
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search all skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected skills</h3>
        <div className="flex flex-wrap gap-2">
          {preferences.skills.have.map((skill) => (
            <div key={skill} className="flex items-center bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
              {preferences.skills.prefer.includes(skill) && (
                <Heart className="w-4 h-4 text-red-500 mr-1" />
              )}
              {skill}
              <button
                onClick={() => toggleSkill(skill, 'have')}
                className="ml-2 text-primary-500 hover:text-primary-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {filteredSkills.map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill, 'have')}
            className={`p-3 rounded-lg border text-center transition-all duration-200 ${
              preferences.skills.have.includes(skill)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Are there any skills you don't want to work with?
        </h3>
        <input
          type="text"
          placeholder="Skills to filter out"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

const SalaryStep = ({ preferences, setPreferences }) => {
  const handleSalaryChange = (value) => {
    setPreferences({
      ...preferences,
      salary: parseInt(value)
    });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
          <DollarSign className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Michael, Founder</p>
          <p className="text-sm text-gray-500">
            We'll only use this to match you with jobs and will not share this data
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-primary-50 rounded-full flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">At least</p>
          <p className="text-3xl font-bold text-primary-600">${preferences.salary}k</p>
          <p className="text-sm text-gray-500">USD</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={preferences.salary}
            onChange={(e) => handleSalaryChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>$0k</span>
            <span>$200k+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusStep = ({ preferences, setPreferences }) => {
  const statusOptions = [
    { id: 'actively-looking', label: 'Actively looking' },
    { id: 'open-to-offers', label: 'Not looking but open to offers' },
    { id: 'not-looking', label: 'Not looking and closed to offers' }
  ];

  const selectStatus = (status) => {
    setPreferences({
      ...preferences,
      jobSearchStatus: status
    });
  };

  return (
    <div>
      <div className="space-y-4">
        {statusOptions.map((status) => (
          <button
            key={status.id}
            onClick={() => selectStatus(status.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              preferences.jobSearchStatus === status.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
