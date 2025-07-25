import React from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Code, Users, Trophy, Shield, Clock, CheckCircle, Zap, Star, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isLoaded } = useAuth();

  // Debug logging
  React.useEffect(() => {
    console.log('LandingPage rendered, Clerk loaded:', isLoaded);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading CodeEval Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Code className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CodeEval
              </span>
              <span className="text-white"> Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The ultimate test-based coding platform for technical assessments. 
              <br className="hidden md:block" />
              Secure, comprehensive, and designed for modern development teams.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <SignUpButton 
                mode="modal"
                afterSignUpUrl="/dashboard"
                redirectUrl="/dashboard"
              >
                <button className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              
              <SignInButton 
                mode="modal"
                afterSignInUrl="/dashboard"
                redirectUrl="/dashboard"
              >
                <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
            </div>
            
            {/* Demo Accounts */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-lg">Try Demo Accounts</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Admin Account</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="font-semibold text-blue-400">Email:</span> admin@codeeval.com</p>
                      <p><span className="font-semibold text-blue-400">Password:</span> admin123</p>
                      <p className="text-xs text-blue-300 mt-3 font-medium">
                        🚀 Access admin dashboard, evaluate submissions, manage users
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">User Account</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="font-semibold text-purple-400">Email:</span> user@codeeval.com</p>
                      <p><span className="font-semibold text-purple-400">Password:</span> user123</p>
                      <p className="text-xs text-purple-300 mt-3 font-medium">
                        💻 Take demo coding tests (Two Sum, Palindrome, Reverse String)
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-gray-400 text-sm mt-6 flex items-center justify-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>Use these credentials to explore all platform features</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Powerful Features for Modern
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Coding Assessments</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to conduct secure and comprehensive coding evaluations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Code, 
                title: 'Multi-Language Support', 
                desc: 'Support for Python, Java, C++, JavaScript, and more with real-time code execution and intelligent syntax highlighting.',
                color: 'from-blue-500 to-blue-600',
                accent: 'blue'
              },
              { 
                icon: Shield, 
                title: 'Advanced Security', 
                desc: 'Tab switching detection, copy-paste prevention, session management, and comprehensive anti-cheating measures.',
                color: 'from-green-500 to-green-600',
                accent: 'green'
              },
              { 
                icon: Clock, 
                title: 'Timed Assessments', 
                desc: 'Configurable time limits with automatic submission, real-time monitoring, and detailed time analytics.',
                color: 'from-purple-500 to-purple-600',
                accent: 'purple'
              },
              { 
                icon: Users, 
                title: 'Admin Dashboard', 
                desc: 'Comprehensive admin panel for test management, candidate evaluation, and detailed performance analytics.',
                color: 'from-orange-500 to-orange-600',
                accent: 'orange'
              },
              { 
                icon: Trophy, 
                title: 'Smart Leaderboards', 
                desc: 'Automated scoring, intelligent rankings, and candidate selection with comprehensive performance insights.',
                color: 'from-pink-500 to-pink-600',
                accent: 'pink'
              },
              { 
                icon: CheckCircle, 
                title: 'Auto Evaluation', 
                desc: 'Intelligent test case validation with manual override capabilities and detailed feedback generation.',
                color: 'from-indigo-500 to-indigo-600',
                accent: 'indigo'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-${feature.accent}-500/25 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Coding Assessments?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of organizations using CodeEval Pro for their technical hiring and skill assessment needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <SignUpButton 
              mode="modal"
              afterSignUpUrl="/dashboard"
              redirectUrl="/dashboard"
            >
              <button className="group bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            
            <div className="flex items-center space-x-2 text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium">No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">CodeEval Pro</span>
            <span>•</span>
            <span>Empowering technical assessments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;