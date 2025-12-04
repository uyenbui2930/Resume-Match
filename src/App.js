import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AnswerGenerator from './pages/AnswerGenerator';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            {/* Public Routes - Everyone can access */}
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/applications" element={
              <Layout>
                <Applications />
              </Layout>
            } />
            <Route path="/resume-analyzer" element={
              <Layout>
                <ResumeAnalyzer />
              </Layout>
            } />
            <Route path="/answer-generator" element={
              <Layout>
                <AnswerGenerator />
              </Layout>
            } />
            
            {/* Optional Login/Register Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={
              <Layout>
                <Profile />
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
