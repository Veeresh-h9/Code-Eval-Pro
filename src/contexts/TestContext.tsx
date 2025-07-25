import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

interface TestContextType {
  isTestActive: boolean;
  currentTestId: string | null;
  currentQuestionId: string | null;
  startTest: (testId: string, questionId: string) => Promise<void>;
  submitTest: () => Promise<void>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

  const startTest = async (testId: string, questionId: string) => {
    if (!user) return;

    try {
      // Create active session
      const { error } = await supabase
        .from('active_sessions')
        .insert({
          user_id: user.id,
          test_id: testId,
          question_id: questionId,
          is_active: true
        });

      if (error) throw error;

      setIsTestActive(true);
      setCurrentTestId(testId);
      setCurrentQuestionId(questionId);
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const submitTest = async () => {
    if (!user || !currentTestId) return;

    try {
      // Deactivate session
      await supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('test_id', currentTestId);

      setIsTestActive(false);
      setCurrentTestId(null);
      setCurrentQuestionId(null);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  return (
    <TestContext.Provider value={{
      isTestActive,
      currentTestId,
      currentQuestionId,
      startTest,
      submitTest
    }}>
      {children}
    </TestContext.Provider>
  );
};