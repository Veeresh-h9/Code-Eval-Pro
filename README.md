# CodeEval Pro - Advanced Coding Assessment Platform

A comprehensive, secure coding test platform built with React, TypeScript, Supabase, and Clerk authentication.

## 🚀 Features

### Core Functionality
- **Multi-language Support**: Python, Java, C++, JavaScript with syntax highlighting
- **Real-time Code Execution**: Monaco Editor with intelligent code completion
- **Secure Test Environment**: Anti-cheating measures, tab switching detection
- **Comprehensive Admin Dashboard**: Test management, user monitoring, submission evaluation
- **Smart Leaderboards**: Automated scoring and ranking system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Security Features
- **Session Management**: Active session tracking and monitoring
- **Copy-Paste Prevention**: Disabled during test sessions
- **Tab Switch Detection**: Automatic test submission on focus loss
- **Right-click Disabled**: Context menu prevention during tests
- **Developer Tools Blocking**: F12 and inspect element disabled

### Admin Features
- **Real-time Monitoring**: Live test sessions and user activity
- **Submission Evaluation**: Manual scoring and feedback system
- **User Management**: Role-based access control
- **Test Configuration**: Create and manage coding challenges
- **Analytics Dashboard**: Performance metrics and insights

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Code Editor**: Monaco Editor
- **Routing**: React Router
- **State Management**: React Context
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Clerk account and application

## ⚙️ Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd codeeval-pro
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the migration file `supabase/migrations/create_initial_schema.sql` in your Supabase SQL editor
3. This will create all necessary tables, RLS policies, and demo data

### 4. Clerk Configuration
1. Create a Clerk application
2. Configure allowed sign-up/sign-in methods
3. Add your domain to allowed origins
4. Set up Supabase integration in Clerk (optional for advanced auth)

### 5. Run the Application
```bash
npm run dev
```

## 👥 Demo Accounts

### Admin Account
- **Email**: admin@codeeval.com
- **Password**: admin123
- **Access**: Full admin dashboard, user management, submission evaluation

### User Account  
- **Email**: user@codeeval.com
- **Password**: user123
- **Access**: Take demo tests (Two Sum, Palindrome, Reverse String)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CodeEditor.tsx   # Monaco editor wrapper
│   ├── Timer.tsx        # Test timer component
│   └── LoadingSpinner.tsx
├── contexts/            # React context providers
│   ├── SupabaseContext.tsx
│   ├── TestContext.tsx
│   └── SecurityContext.tsx
├── pages/               # Main application pages
│   ├── LandingPage.tsx
│   ├── UserDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── TestInterface.tsx
│   ├── Results.tsx
│   └── Leaderboard.tsx
├── lib/                 # Utility libraries
│   └── supabase.ts
└── styles/
    └── index.css        # Global styles and utilities
```

## 🔒 Security Implementation

### Row Level Security (RLS)
- All database tables have RLS enabled
- Users can only access their own data
- Admins have elevated permissions for management

### Test Security
- Session monitoring prevents multiple active tests
- Tab switching auto-submits tests
- Copy-paste operations are blocked during tests
- Developer tools access is restricted

### Authentication
- Clerk handles secure authentication
- JWT tokens for API access
- Role-based access control (user/admin)

## 📊 Database Schema

### Core Tables
- **users**: User profiles and roles
- **tests**: Test configurations and assignments
- **questions**: Question bank with coding problems
- **submissions**: User code submissions and results
- **active_sessions**: Real-time session tracking

### Key Features
- UUID primary keys for security
- Timestamped records for auditing
- JSON fields for flexible data storage
- Foreign key constraints for data integrity

## 🚀 Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

### Database
- Supabase handles database hosting and scaling
- Automatic backups and point-in-time recovery
- Built-in connection pooling

### Environment Variables
Ensure all environment variables are properly configured in your deployment platform.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for consistent styling

## 📈 Performance Optimizations

- Code splitting with React.lazy
- Optimized bundle size with Vite
- Efficient database queries with proper indexing
- Responsive images and lazy loading
- Service worker for offline functionality (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo accounts for examples

## 🔮 Future Enhancements

- [ ] Real-time collaborative coding
- [ ] Video proctoring integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with popular IDEs
- [ ] Automated test case generation
- [ ] Machine learning-based cheating detection