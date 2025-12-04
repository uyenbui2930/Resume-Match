# AI-Powered Job Application Assistant

A student project that helps job seekers manage applications and get AI-powered feedback on their resumes and interview answers.

## 🎯 What This Project Does

This is a full-stack web application that helps students and job seekers:
- **Track job applications** - Keep track of all your job applications in one place
- **AI Resume Analysis** - Get feedback on how well your resume matches job descriptions
- **AI Answer Generator** - Generate personalized answers to common interview questions
- **Application Management** - Edit and manage your job applications

## 🧠 AI Features

### Backend AI Agents
The project includes several AI agents that analyze your content:

1. **Resume Scoring Agent** (`/api/agents/resume-scorer`)
   - Analyzes your resume against job descriptions
   - Calculates match scores based on skills, experience, and keywords
   - Provides specific feedback on strengths and areas for improvement

2. **Answer Generator Agent** (`/api/agents/generate-answers`)
   - Generates personalized interview answers
   - Uses your resume and job description to create tailored responses
   - Covers common questions like "Tell me about yourself" and "Why do you want this job?"

3. **Autofill Agent** (`/api/agents/autofill`)
   - Helps auto-complete application forms
   - Stores your profile information securely

### Frontend AI Integration
- **Smart Resume Analysis** - Upload your resume and get instant feedback
- **Personalized Interview Answers** - Get ready-to-use responses for interviews
- **Match Scoring** - See how well you match job requirements

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP requests to backend
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database for storing user data
- **JWT** - Authentication tokens
- **AI Integration** - Smart analysis algorithms

## 🚀 How to Run

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Git

### Frontend Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Job-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup
The backend is already included in this repository. To run it:

1. **Install backend dependencies**
   ```bash
   cd src
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the `src` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=job_assistant
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_BASE_URL=https://generativelanguage.googleapis.com
   NODE_ENV=development
   PORT=3000
   MAX_FILE_SIZE=10485760
   ```

3. **Start the backend server**
   ```bash
   cd src
   node server.js
   ```

## 📁 Project Structure

```
Job-assistant/
├── src/                    # Backend code
│   ├── agents/            # AI agents
│   │   ├── resume-scorer/ # Resume analysis agent
│   │   ├── answer-generator/ # Interview answer agent
│   │   └── autofill-agent/ # Form autofill agent
│   ├── routes/            # API routes
│   ├── config/            # Database configuration
│   └── server.js          # Main server file
├── public/                # Frontend public files
├── src/                   # Frontend React code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   └── App.js            # Main app component
└── README.md
```

## 🎯 Key Features

### 1. Job Application Tracking
- Add, edit, and delete job applications
- Track application status (submitted, interview, offer, etc.)
- Add notes and next actions for each application

### 2. AI Resume Analysis
- Upload your resume or paste text
- Compare against job descriptions
- Get match scores and improvement suggestions
- See which skills you're missing

### 3. AI Interview Answer Generator
- Input your resume and job description
- Select common interview questions
- Get personalized, ready-to-use answers
- Tips for each answer

### 4. User Authentication
- Sign up and login system
- Secure JWT token authentication
- User profile management

## 🔧 Available Scripts

- `npm start` - Start the React frontend
- `npm run build` - Build for production
- `cd src && node server.js` - Start the backend server

## 🌐 API Endpoints

The backend provides these main endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/applications/my-applications` - Get user's applications
- `POST /api/agents/resume-scorer` - Analyze resume
- `POST /api/agents/generate-answers` - Generate interview answers
- `GET /api/resumes/my-resumes` - Get user's resumes

## 🎓 Student Project Features

This project demonstrates:
- **Full-stack development** - Frontend and backend integration
- **AI integration** - Smart analysis and generation
- **Database design** - PostgreSQL with proper relationships
- **Authentication** - Secure user management
- **Modern React** - Hooks, context, and modern patterns
- **API design** - RESTful API with proper error handling

## 🚀 Deployment

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend (Railway/Heroku)
1. Set up environment variables
2. Deploy the `src` folder as the backend
3. Connect to PostgreSQL database

## 🤝 Contributing

This is a student project, but contributions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Feel free to use and modify for learning.

## 🆘 Support

If you have questions:
- Check the code comments
- Look at the API endpoints
- Create an issue if you find bugs

---

**Note**: This is a student project demonstrating full-stack development with AI features. The backend includes AI agents for resume analysis and answer generation.