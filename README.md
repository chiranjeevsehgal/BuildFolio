# BuildFolio 
**Your Complete Career Success Platform**

An all-in-one platform that combines professional portfolio creation, smart job application tracking, and AI-powered career insights to help you land your dream job.

## ✨ Features

### 🎨 Professional Portfolio Creation
- **Lightning Fast Setup** - Update your profile and watch your portfolio come to life in seconds
- **Personal Domain** - Get your unique portfolio URL (buildfolio.in/yourname)
- **Professional Templates** - Choose from carefully crafted, mobile-responsive designs
- **One-Click Deployment** - Deploy your portfolio instantly with custom themes

### 📊 Smart Job Application Tracking
- **Kanban Board Interface** - Organize applications with intuitive drag-and-drop boards
- **Application Stages** - Track progress from Applied → Interview → In Progress → Offer → Rejected
- **Status Indicators** - Visual status tracking with color-coded progress indicators
- **Company Management** - Store and organize company information and application details

### 🤖 AI-Powered Career Intelligence
- **Resume Analysis** - Get personalized optimization tips with scoring and priority suggestions
- **Smart Job Matching** - AI analyzes your skills against job requirements with match percentages
- **Success Prediction** - AI-calculated probability scores for each application
- **Skill Gap Analysis** - Identify areas for improvement and skill development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chiranjeevsehgal/BuildFolio.git
   cd BuildFolio
   ```

2. **Install dependencies for both the backend and frontend**
   ```bash
   cd backend
   npm install

   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   **Create a `.env` file in the frontend directory**:
   ```env
   # Backend API URL
   VITE_API_URL = http://localhost:5000/api
   
   # Frontend API URL
   VITE_FRONTEND_URL = http://localhost:5173
   
   # App Configuration
   VITE_ENV=development

   ```
   
   **Create a `.env` file in the backend directory**:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=your_mongo_uri
   
   # JWT Authentication
   JWT_SECRET=your_secret_jwt_key
   JWT_EXPIRE=7d

   # Session key
   SESSION_SECRET=your_session_secret_key

   # OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_secret_id
   GOOGLE_CALLBACK_URL=your_google_callback_url

   # Frontend URL
   CLIENT_URL=http://localhost:5173
   
   # Email Configuration
   MAILTRAP_API_TOKEN=your_mailtrap_token
   FROM_EMAIL=from_email_address
   FROM_NAME=from_name
   ADMIN_EMAIL=admin_email_address
   WELCOME_EMAIL_TEMPLATE_ID=email_template_id
   FEEDBACK_ADMIN_TEMPLATE_ID=email_template_id
   REGISTER_OTP_TEMPLATE_ID=email_template_id
   RESET_PASSWORD_OTP_TEMPLATE_ID=email_template_id
   PORTFOLIO_CONTACT_TEMPLATE_ID=email_template_id

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=cloud_name
   CLOUDINARY_API_KEY=cloudinary_api_key

   # GEMINI Configuration (Multiple API keys used for Load Balancing)
   GEMINI_API_KEY_1=gemini_api_key
   GEMINI_API_KEY_2=gemini_api_key
   GEMINI_API_KEY_3=gemini_api_key
   GEMINI_API_KEY_4=gemini_api_key
   GEMINI_API_KEY_5=gemini_api_key
   GEMINI_MODEL=gemini_model
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend Server
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend Server  
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`


### Using the Application

1. **First Time Setup**
   - Create account or sign in
   - Complete your profile information

2. **Building Portfolio**
   - Fill in personal information, skills, experience
   - Add projects with descriptions and links
   - Select portfolio template
   - Deploy with one click

3. **Job Application Tracking**
   - Add job applications to Kanban board
   - Move applications through stages
   - Upload job descriptions for AI analysis
   - Track success metrics and insights

4. **AI-Powered Features**
   - Upload resume for optimization analysis
   - Get job match percentages
   - Receive success probability scores
   - Get personalized career recommendations

## 📄 License

This project is licensed under the MIT License.
---

**Built for professionals by Chiranjeev Sehgal**

*Transform your career journey with BuildFolio - where portfolios meet opportunity!*