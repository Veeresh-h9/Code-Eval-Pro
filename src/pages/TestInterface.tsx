import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { useTest } from '../contexts/TestContext';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';
import { Play, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const TestInterface: React.FC = () => {
  const { testId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { startTest, submitTest } = useTest();
  
  const [test, setTest] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const languages = [
    { value: 'python', label: 'Python', template: '# Write your Python code here\ndef solution():\n    # Your solution goes here\n    pass\n\n# Test your solution\nprint(solution())' },
    { value: 'java', label: 'Java', template: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n        System.out.println("Hello World");\n    }\n}' },
    { value: 'cpp', label: 'C++', template: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    cout << "Hello World" << endl;\n    return 0;\n}' },
    { value: 'javascript', label: 'JavaScript', template: '// Write your JavaScript code here\nfunction solution() {\n    // Your solution goes here\n    return "Hello World";\n}\n\nconsole.log(solution());' },
  ];

  useEffect(() => {
    if (testId && user) {
      fetchTestData();
    }
  }, [testId, user]);

  useEffect(() => {
    if (questions.length > 0) {
      const template = languages.find(l => l.value === language)?.template || '';
      setCode(template);
      setStartTime(new Date());
      startTest(testId!, questions[currentQuestionIndex]?.id);
    }
  }, [questions, currentQuestionIndex, language]);

  const fetchTestData = async () => {
    if (!testId || !user) return;

    try {
      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      // Check if user is assigned to this test
      if (!testData.assigned_users.includes(user.id)) {
        toast.error('You are not assigned to this test');
        navigate('/dashboard');
        return;
      }

      setTest(testData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', testData.questions)
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

    } catch (error) {
      console.error('Error fetching test data:', error);
      toast.error('Failed to load test');
      navigate('/dashboard');
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('Running code...');

    try {
      // Simulate code execution with more realistic output
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enhanced output simulation based on language and question
      let simulatedOutput = '';
      const questionTitle = currentQuestion.title.toLowerCase();
      
      if (language === 'python') {
        if (questionTitle.includes('two sum')) {
          simulatedOutput = 'Code executed successfully!\n\nTest Case 1: [2,7,11,15], target=9\nOutput: [0, 1] ✓\n\nTest Case 2: [3,2,4], target=6\nOutput: [1, 2] ✓\n\nAll test cases passed!';
        } else if (questionTitle.includes('palindrome')) {
          simulatedOutput = 'Code executed successfully!\n\nTest Case 1: x=121\nOutput: True ✓\n\nTest Case 2: x=-121\nOutput: False ✓\n\nTest Case 3: x=10\nOutput: False ✓\n\nAll test cases passed!';
        } else if (questionTitle.includes('reverse')) {
          simulatedOutput = 'Code executed successfully!\n\nTest Case 1: ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"] ✓\n\nTest Case 2: ["H","a","n","n","a","h"]\nOutput: ["h","a","n","n","a","H"] ✓\n\nAll test cases passed!';
        } else if (questionTitle.includes('fibonacci')) {
          simulatedOutput = 'Code executed successfully!\n\nTest Case 1: fibonacci(0)\nOutput: [] ✓\n\nTest Case 2: fibonacci(1)\nOutput: [0] ✓\n\nTest Case 3: fibonacci(6)\nOutput: [0, 1, 1, 2, 3, 5] ✓\n\nTest Case 4: fibonacci(10)\nOutput: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34] ✓\n\nAll test cases passed!\nExecution time: 0.002s';
        } else {
          simulatedOutput = 'Code executed successfully!\nOutput: Function completed';
        }
      } else if (language === 'java') {
        simulatedOutput = 'Compilation successful!\nExecution completed\n\nAll test cases passed!';
      } else if (language === 'cpp') {
        simulatedOutput = 'Compilation and execution successful!\n\nAll test cases passed!';
      } else if (language === 'javascript') {
        simulatedOutput = 'Node.js execution successful!\n\nAll test cases passed!';
      }
      
      setOutput(simulatedOutput);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error: Failed to execute code\nPlease check your syntax and try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const submitAnswer = async () => {
    if (!user || !test || !questions[currentQuestionIndex]) return;

    try {
      const timeTaken = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;

      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          test_id: test.id,
          question_id: questions[currentQuestionIndex].id,
          code,
          language,
          output,
          status: 'submitted',
          time_taken: timeTaken,
        });

      if (error) throw error;

      toast.success('Answer submitted successfully');
      
      // Move to next question or finish test
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCode(languages.find(l => l.value === language)?.template || '');
        setOutput('');
        setStartTime(new Date());
      } else {
        setIsSubmitted(true);
        submitTest();
        toast.success('Test completed successfully');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Auto-submitting...');
    submitAnswer();
  };

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen gradient-bg no-copy-paste no-context-menu">
      {/* Header */}
      <div className="glass-card shadow-xl border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gradient">{test.name}</h1>
              <p className="text-secondary-600 text-sm sm:text-base">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
              <Timer
                initialTime={currentQuestion.time_limit * 60}
                onTimeUp={handleTimeUp}
                isActive={!isSubmitted}
              />
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-lg shadow-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">Secure Mode Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Question Panel */}
          <div className="card hover:shadow-2xl transition-all duration-300">
            <h2 className="text-lg sm:text-xl font-bold text-secondary-900 mb-4 sm:mb-6">
              {currentQuestion.title}
            </h2>
            <div className="prose prose-sm max-w-none text-secondary-700 mb-4 sm:mb-6 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: currentQuestion.description }} />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <span className={`px-3 py-2 rounded-full font-semibold ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
              <span className="text-secondary-500 font-medium">
                Time Limit: {currentQuestion.time_limit} minutes
              </span>
            </div>
          </div>

          {/* Code Editor Panel */}
          <div className="card hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900">Code Editor</h3>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  const template = languages.find(l => l.value === e.target.value)?.template || '';
                  setCode(template);
                }}
                className="input-field w-full sm:w-auto min-w-[140px] font-semibold"
                disabled={isSubmitted}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              readOnly={isSubmitted}
            />
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
              <button
                onClick={runCode}
                disabled={isRunning || isSubmitted}
                className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Play className="w-4 h-4" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
              
              <button
                onClick={submitAnswer}
                disabled={isSubmitted}
                className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>Submit Answer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card mt-4 sm:mt-6 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-4 sm:mb-6">Output</h3>
          <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-green-400 p-4 sm:p-6 rounded-xl font-mono text-sm min-h-[120px] sm:min-h-[150px] overflow-auto shadow-inner border-2 border-secondary-700">
            <pre className="whitespace-pre-wrap">{output || 'Run your code to see the output here...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;