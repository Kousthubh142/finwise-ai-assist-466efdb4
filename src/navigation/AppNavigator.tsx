
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

// We'll add placeholders for other screens that will be implemented later
const TransactionsScreen = () => <div>Transactions Screen</div>;
const BudgetScreen = () => <div>Budget Screen</div>;
const GoalsScreen = () => <div>Goals Screen</div>;
const ChatScreen = () => <div>Chat Screen</div>;
const OnboardingScreen = () => <div>Onboarding Screen</div>;

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // We'll implement a proper loading screen later
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/transactions" element={<TransactionsScreen />} />
            <Route path="/budget" element={<BudgetScreen />} />
            <Route path="/goals" element={<GoalsScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppNavigator;
