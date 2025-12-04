import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Briefcase,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  ArrowRight,
  User,
  LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI, dashboardAPI } from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch applications to calculate analytics
      const response = await applicationsAPI.getAll();
      const applications = response.data?.data || [];

      // Calculate analytics from applications
      const stats = calculateAnalytics(applications);
      setAnalytics(stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Could not load analytics data');

      // Set demo data on error
      setAnalytics(getDemoAnalytics());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate analytics from applications data
  const calculateAnalytics = (applications) => {
    if (!applications || applications.length === 0) {
      return getDemoAnalytics();
    }

    const total = applications.length;
    const statusCounts = {
      not_submitted: 0,
      submitted: 0,
      interview_requested: 0,
      offer_received: 0,
      rejected: 0
    };

    // Count by status
    applications.forEach(app => {
      if (statusCounts.hasOwnProperty(app.status)) {
        statusCounts[app.status]++;
      }
    });

    // Calculate response rate (interviews + offers / submitted)
    const submitted = statusCounts.submitted + statusCounts.interview_requested +
                      statusCounts.offer_received + statusCounts.rejected;
    const responses = statusCounts.interview_requested + statusCounts.offer_received + statusCounts.rejected;
    const responseRate = submitted > 0 ? Math.round((responses / submitted) * 100) : 0;

    // Calculate interview rate
    const interviews = statusCounts.interview_requested + statusCounts.offer_received;
    const interviewRate = submitted > 0 ? Math.round((interviews / submitted) * 100) : 0;

    // Calculate offer rate
    const offerRate = interviews > 0 ? Math.round((statusCounts.offer_received / interviews) * 100) : 0;

    // Applications by week (last 4 weeks)
    const now = new Date();
    const weeklyData = [0, 0, 0, 0];
    applications.forEach(app => {
      if (app.applied_date || app.appliedDate) {
        const appDate = new Date(app.applied_date || app.appliedDate);
        const weeksDiff = Math.floor((now - appDate) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff >= 0 && weeksDiff < 4) {
          weeklyData[3 - weeksDiff]++;
        }
      }
    });

    // Generate insights
    const insights = generateInsights({
      total,
      statusCounts,
      responseRate,
      interviewRate,
      offerRate,
      weeklyData
    });

    // Resume performance (mock - would need resume tracking)
    const resumePerformance = [
      {
        name: 'Resume V1',
        applications: Math.floor(total * 0.3),
        responseRate: responseRate - 5,
        interviews: Math.floor(interviews * 0.25)
      },
      {
        name: 'Resume V2',
        applications: Math.floor(total * 0.5),
        responseRate: responseRate + 8,
        interviews: Math.floor(interviews * 0.55)
      },
      {
        name: 'Resume V3',
        applications: Math.floor(total * 0.2),
        responseRate: responseRate + 3,
        interviews: Math.floor(interviews * 0.2)
      }
    ];

    return {
      summary: {
        total,
        submitted,
        interviews,
        offers: statusCounts.offer_received,
        rejected: statusCounts.rejected,
        pending: statusCounts.not_submitted
      },
      rates: {
        response: responseRate,
        interview: interviewRate,
        offer: offerRate
      },
      statusBreakdown: statusCounts,
      weeklyApplications: weeklyData,
      resumePerformance,
      insights
    };
  };

  // Generate insights based on data
  const generateInsights = ({ total, statusCounts, responseRate, interviewRate, offerRate, weeklyData }) => {
    const insights = [];

    // Response rate insight
    if (responseRate < 20) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Low Response Rate',
        description: `Only ${responseRate}% of your applications are getting responses. Consider tailoring your resume more for each role.`,
        action: 'Analyze Resume'
      });
    } else if (responseRate >= 30) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Strong Response Rate',
        description: `${responseRate}% response rate is above average! Keep up the great work.`,
        action: null
      });
    }

    // Application momentum
    const recentApps = weeklyData[3] + weeklyData[2];
    const olderApps = weeklyData[1] + weeklyData[0];
    if (recentApps > olderApps) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Increasing Momentum',
        description: 'Your application rate is increasing. Great job staying consistent!',
        action: null
      });
    } else if (recentApps < olderApps && total > 5) {
      insights.push({
        type: 'info',
        icon: TrendingDown,
        title: 'Application Slowdown',
        description: 'Your application rate has decreased recently. Consider setting daily application goals.',
        action: null
      });
    }

    // Interview conversion
    if (interviewRate > 0 && interviewRate < 15) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'Interview Conversion',
        description: 'Try using the Answer Generator to prepare stronger responses for screening calls.',
        action: 'Generate Answers'
      });
    }

    // Offer stage
    if (statusCounts.offer_received > 0) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Offers Received!',
        description: `Congratulations on receiving ${statusCounts.offer_received} offer(s)! Review them carefully.`,
        action: null
      });
    }

    // Pending applications
    if (statusCounts.not_submitted > 3) {
      insights.push({
        type: 'info',
        icon: Clock,
        title: 'Pending Applications',
        description: `You have ${statusCounts.not_submitted} applications in draft. Consider submitting them soon.`,
        action: 'View Applications'
      });
    }

    return insights;
  };

  // Demo analytics for non-logged in users or empty data
  const getDemoAnalytics = () => ({
    summary: {
      total: 0,
      submitted: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
      pending: 0
    },
    rates: {
      response: 0,
      interview: 0,
      offer: 0
    },
    statusBreakdown: {
      not_submitted: 0,
      submitted: 0,
      interview_requested: 0,
      offer_received: 0,
      rejected: 0
    },
    weeklyApplications: [0, 0, 0, 0],
    resumePerformance: [],
    insights: [{
      type: 'info',
      icon: Lightbulb,
      title: 'Start Tracking',
      description: 'Add your job applications to see performance analytics and insights.',
      action: 'Add Application'
    }]
  });

  // Simple bar chart component
  const SimpleBarChart = ({ data, labels, color = 'primary' }) => {
    const max = Math.max(...data, 1);
    return (
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-full bg-${color}-500 rounded-t transition-all duration-300`}
              style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '8px' : '0' }}
            ></div>
            <span className="text-xs text-gray-500 mt-2">{labels[index]}</span>
            <span className="text-xs font-medium">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Analytics</h1>
          <p className="text-gray-600">Track your job search performance</p>
        </div>

        <div className="card text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view analytics</h3>
          <p className="text-gray-600 mb-6">
            Track your applications and get insights to improve your job search
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Link to="/login" className="btn-secondary flex items-center">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Link>
            <Link to="/register" className="btn-primary flex items-center">
              <User className="h-5 w-5 mr-2" />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Analytics</h1>
          <p className="text-gray-600">Track your job search performance and trends</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <Briefcase className="h-6 w-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.total || 0}</p>
          <p className="text-xs text-gray-500">Total Applications</p>
        </div>
        <div className="card text-center">
          <FileText className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.submitted || 0}</p>
          <p className="text-xs text-gray-500">Submitted</p>
        </div>
        <div className="card text-center">
          <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.interviews || 0}</p>
          <p className="text-xs text-gray-500">Interviews</p>
        </div>
        <div className="card text-center">
          <Award className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.offers || 0}</p>
          <p className="text-xs text-gray-500">Offers</p>
        </div>
        <div className="card text-center">
          <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.rejected || 0}</p>
          <p className="text-xs text-gray-500">Rejected</p>
        </div>
        <div className="card text-center">
          <Clock className="h-6 w-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.summary?.pending || 0}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Rates */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-medium">{analytics?.rates?.response || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${analytics?.rates?.response || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Interview Rate</span>
                <span className="font-medium">{analytics?.rates?.interview || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${analytics?.rates?.interview || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Offer Rate</span>
                <span className="font-medium">{analytics?.rates?.offer || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${analytics?.rates?.offer || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Applications */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Applications</h2>
          <div className="flex items-end justify-between h-32 gap-2">
            {(analytics?.weeklyApplications || [0, 0, 0, 0]).map((value, index) => {
              const max = Math.max(...(analytics?.weeklyApplications || [1]), 1);
              const labels = ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'];
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all duration-300"
                    style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '8px' : '4px' }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2 text-center">{labels[index]}</span>
                  <span className="text-xs font-medium">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h2>
          <div className="space-y-3">
            {[
              { key: 'not_submitted', label: 'Draft', color: 'bg-gray-400' },
              { key: 'submitted', label: 'Submitted', color: 'bg-yellow-500' },
              { key: 'interview_requested', label: 'Interviewing', color: 'bg-blue-500' },
              { key: 'offer_received', label: 'Offers', color: 'bg-green-500' },
              { key: 'rejected', label: 'Rejected', color: 'bg-red-400' }
            ].map(({ key, label, color }) => {
              const count = analytics?.statusBreakdown?.[key] || 0;
              const total = analytics?.summary?.total || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={key} className="flex items-center">
                  <span className="w-24 text-sm text-gray-600">{label}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-8 text-sm font-medium text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resume Performance */}
      {analytics?.resumePerformance?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Resume Version</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Applications</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Response Rate</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Interviews</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.resumePerformance.map((resume, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-primary-500 mr-2" />
                        <span className="font-medium">{resume.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3">{resume.applications}</td>
                    <td className="text-center py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        resume.responseRate >= 25 ? 'bg-green-100 text-green-700' :
                        resume.responseRate >= 15 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {resume.responseRate}%
                      </span>
                    </td>
                    <td className="text-center py-3">{resume.interviews}</td>
                    <td className="text-right py-3">
                      {index === 1 ? (
                        <span className="text-green-600 flex items-center justify-end">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Best
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Tip: Track which resume version you use for each application to get accurate performance data.
          </p>
        </div>
      )}

      {/* Insights */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
          AI Insights
        </h2>
        <div className="space-y-4">
          {(analytics?.insights || []).map((insight, index) => (
            <div
              key={index}
              className={`flex items-start p-4 rounded-lg ${
                insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <insight.icon className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                insight.type === 'success' ? 'text-green-500' :
                insight.type === 'warning' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
              {insight.action && (
                <Link
                  to={
                    insight.action === 'Analyze Resume' ? '/resume-analyzer' :
                    insight.action === 'Generate Answers' ? '/answer-generator' :
                    insight.action === 'View Applications' ? '/applications' :
                    '/applications'
                  }
                  className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {insight.action}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
