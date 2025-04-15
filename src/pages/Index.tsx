
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logic
    if (isAuthenticated) {
      if (user?.needsOnboarding) {
        // Redirect to onboarding if user needs to complete profile
        navigate('/onboarding');
      } else {
        // Redirect to dashboard if fully onboarded
        navigate('/');
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return <div>Redirecting...</div>;
};

export default Index;
