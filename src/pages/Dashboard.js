import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Star,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  MessageSquare,
  User,
  LogIn
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    submitted: 0,
    interviews: 0,
    offers: 0,
    rejections: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalApplications: 24,
      submitted: 18,
      interviews: 5,
      offers: 2,
      rejections: 4
    });

    setRecentApplications([
      {
        id: 1,
        company: 'TechCorp',
        position: 'Senior Software Engineer',
        status: 'interview_requested',
        appliedDate: '2024-01-15',
        location: 'San Francisco, CA',
        salary: '$120k - $150k',
        matchScore: 85
      },
      {
        id: 2,
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        status: 'submitted',
        appliedDate: '2024-01-14',
        location: 'Remote',
        salary: '$90k - $120k',
        matchScore: 72
      },
      {
        id: 3,
        company: 'BigTech Inc',
        position: 'AI Engineer',
        status: 'rejected',
        appliedDate: '2024-01-10',
        location: 'Seattle, WA',
        salary: '$130k - $160k',
        matchScore: 68
      }
    ]);

    setUpcomingInterviews([
      {
        id: 1,
        company: 'TechCorp',
        position: 'Senior Software Engineer',
        date: '2024-01-20',
        time: '2:00 PM',
        type: 'Phone Screen',
        interviewer: 'Sarah Johnson'
      },
      {
        id: 2,
        company: 'InnovateLab',
        position: 'Product Manager',
        date: '2024-01-22',
        time: '10:00 AM',
        type: 'Video Interview',
        interviewer: 'Mike Chen'
      }
    ]);

    setAiInsights([
      {
        id: 1,
        type: 'success',
        title: 'High Match Score',
        description: 'Your resume matches 85% of the requirements for Senior Software Engineer at TechCorp',
        action: 'View Analysis'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Skills Gap Identified',
        description: 'Consider highlighting your React experience for better match scores',
        action: 'Update Resume'
      },
      {
        id: 3,
        type: 'info',
        title: 'Application Trend',
        description: 'You\'ve applied to 5 companies this week. Great momentum!',
        action: 'View Applications'
      }
    ]);
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_requested':
        return 'bg-blue-100 text-blue-800';
      case 'offer_received':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'interview_requested':
        return 'Interview Requested';
      case 'offer_received':
        return 'Offer Received';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Non-logged in Users */}
      {!user && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Welcome to AI Job Assistant!</h2>
                <p className="text-gray-600">Get personalized job search help with AI-powered tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user ? 'Dashboard' : 'AI-Powered Job Search Tools'}
          </h1>
          <p className="text-gray-600">
            {user ? 'Track your job search progress and AI insights' : 'Try our AI tools to improve your job search'}
          </p>
        </div>
        {user && (
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Application
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.interviews}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Offers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.offers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejections</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejections}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{application.position}</h3>
                          <p className="text-sm text-gray-600">{application.company}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {application.salary}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{application.matchScore}%</span>
                        </div>
                        <span className="text-xs text-gray-500">Match Score</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{interview.company}</p>
                      <p className="text-sm text-gray-600">{interview.position}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{interview.type} with {interview.interviewer}</p>
                    <p className="font-medium">{interview.date} at {interview.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    insight.type === 'success' ? 'bg-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <Link 
                      to={insight.action === 'Analyze Resume' ? '/resume-analyzer' : 
                          insight.action === 'Generate Answers' ? '/answer-generator' : 
                          insight.action === 'View Applications' ? '/applications' : '#'}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
                    >
                      {insight.action}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {user ? 'Quick Actions' : 'Try Our AI Tools'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/resume-analyzer" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-8 w-8 text-primary-600 mr-4" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Analyze Resume</p>
              <p className="text-sm text-gray-600">Get AI-powered resume feedback</p>
            </div>
          </Link>
          
          <Link to="/answer-generator" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-8 w-8 text-primary-600 mr-4" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Answers</p>
              <p className="text-sm text-gray-600">Create tailored interview responses</p>
            </div>
          </Link>
          
          {user ? (
            <Link to="/applications" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Briefcase className="h-8 w-8 text-primary-600 mr-4" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Track Application</p>
                <p className="text-sm text-gray-600">Add a new job application</p>
              </div>
            </Link>
          ) : (
            <Link to="/register" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="h-8 w-8 text-primary-600 mr-4" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Account</p>
                <p className="text-sm text-gray-600">Save your progress and get personalized insights</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
