import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAstrology } from '@/context/AstrologyContext';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredData?: 'horoscope' | 'natal-chart' | 'any';
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredData = 'any',
  fallbackMessage 
}) => {
  const { userInfo, astrologyPayload, bigThree, isLoading, horoscopeData } = useAstrology();
  const location = useLocation();
  const navigate = useNavigate();

  const hasRequiredData = () => {
    switch (requiredData) {
      case 'horoscope':
        // For horoscope, we need userInfo and either horoscopeData or the data to generate it
        return userInfo && (horoscopeData || (bigThree && astrologyPayload?.transits));
      case 'natal-chart':
        // For natal chart, we need userInfo and the astrology data (which comes after horoscope generation)
        return userInfo && bigThree && astrologyPayload?.astrologyData && astrologyPayload?.houseCusps;
      case 'any':
        return userInfo && bigThree;
      default:
        return false;
    }
  };

  // Show loading state if:
  // 1. We're actively loading, OR
  // 2. We have userInfo but don't have the required data yet (data is being fetched)
  const shouldShowLoading = isLoading || (userInfo && !hasRequiredData());

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="text-center text-white p-8 max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">
              {requiredData === 'natal-chart' ? '🗺️ Generating Your Natal Chart' : '✨ Generating Your Reading'}
            </h1>
            <p className="text-lg mb-4">
              Please wait while we calculate your astrological data...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRequiredData()) {
    const getFallbackMessage = () => {
      if (requiredData === 'natal-chart' && userInfo && !astrologyPayload?.astrologyData) {
        return "You need to generate your horoscope first to access your natal chart.";
      }
      return fallbackMessage || "You need to fill out your birth details first to access this feature.";
    };

    const getActionButton = () => {
      if (requiredData === 'natal-chart' && userInfo && !astrologyPayload?.astrologyData) {
        return {
          text: "Generate Horoscope First",
          action: () => navigate('/reading')
        };
      }
      return {
        text: "Fill Out Your Details",
        action: () => navigate('/#daily-form')
      };
    };

    const actionButton = getActionButton();

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="text-center text-white p-8 max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">
              {requiredData === 'natal-chart' ? '🗺️ Natal Chart Access' : '✨ Get Your Reading First'}
            </h1>
            <p className="text-lg mb-4">
              {getFallbackMessage()}
            </p>
            <p className="text-sm text-gray-300 mb-6">
              {requiredData === 'natal-chart' 
                ? "Your natal chart requires the astrological data from your horoscope generation."
                : "We need your birth information to generate your personalized astrological reading."
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={actionButton.action}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3"
            >
              {actionButton.text}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Go Back
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            <p>Already filled out your details?</p>
            <p>Try refreshing the page or going back to the home page.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
