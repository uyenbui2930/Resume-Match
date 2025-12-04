import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  User,
  Briefcase,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Eye,
  BarChart3,
  Mail,
  FolderOpen,
  Wand2
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Resume Bank', href: '/resume-bank', icon: FolderOpen },
    { name: 'Resume Customizer', href: '/resume-customizer', icon: Wand2 },
    { name: 'Resume Analyzer', href: '/resume-analyzer', icon: FileText },
    { name: 'ATS Simulator', href: '/ats-simulator', icon: Eye },
    { name: 'Cover Letter', href: '/cover-letter', icon: Mail },
    { name: 'Answer Generator', href: '/answer-generator', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <Link to="/" className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Job Assistant</span>
              </Link>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <Link to="/" className="flex items-center flex-shrink-0 px-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Job Assistant</span>
              </Link>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search applications, companies..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Home Link */}
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium mr-4">
                Home
              </Link>
              
              {user ? (
                <>
                  <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <Bell className="h-6 w-6" />
                  </button>
                  {/* Profile dropdown */}
                  <div className="ml-3 relative">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
