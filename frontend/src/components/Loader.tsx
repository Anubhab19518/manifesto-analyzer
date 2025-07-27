import { useEffect, useState } from 'react';

interface LoaderProps {
  isVisible: boolean;
  progress?: number; // 0-100
  currentStage?: string;
  estimatedTime?: number; // in seconds
}

const defaultStages = [
  { message: "Uploading document...", duration: 2000 },
  { message: "Extracting text from PDF...", duration: 3000 },
  { message: "Analyzing content structure...", duration: 4000 },
  { message: "Processing with AI models...", duration: 8000 },
  { message: "Generating insights...", duration: 5000 },
  { message: "Finalizing analysis...", duration: 2000 }
];

export default function Loader({ isVisible, progress, currentStage, estimatedTime }: LoaderProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [dynamicProgress, setDynamicProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(defaultStages[0].message);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0);
      setDynamicProgress(0);
      setElapsedTime(0);
      setCurrentMessage(defaultStages[0].message);
      return;
    }

    // If we have external progress and stage, use them
    if (progress !== undefined) {
      setDynamicProgress(progress);
    }
    
    if (currentStage) {
      setCurrentMessage(currentStage);
    }

    // Otherwise, simulate realistic progress
    if (progress === undefined && !currentStage) {
      const progressInterval = setInterval(() => {
        setDynamicProgress(prev => {
          const increment = Math.random() * 2 + 0.5; // Random increment between 0.5-2.5%
          const newProgress = Math.min(prev + increment, 95); // Cap at 95% until complete
          
          // Update stage based on progress
          const stageIndex = Math.floor((newProgress / 100) * defaultStages.length);
          if (stageIndex !== currentStageIndex && stageIndex < defaultStages.length) {
            setCurrentStageIndex(stageIndex);
            setCurrentMessage(defaultStages[stageIndex].message);
          }
          
          return newProgress;
        });
      }, 300); // Update every 300ms for smooth animation

      return () => clearInterval(progressInterval);
    }
  }, [isVisible, progress, currentStage, currentStageIndex]);

  // Track elapsed time
  useEffect(() => {
    if (!isVisible) return;

    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  const progressPercentage = progress !== undefined ? progress : dynamicProgress;
  const estimatedRemaining = estimatedTime ? Math.max(0, estimatedTime - elapsedTime) : null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* Spinner */}
        <div className="loader-spinner"></div>
        
        {/* Progress Bar */}
        <div className="w-80 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-200">Progress</span>
            <span className="text-sm text-blue-200">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out shadow-lg ${progressPercentage > 0 && progressPercentage < 100 ? 'progress-bar-active' : ''}`}
              style={{ 
                width: `${progressPercentage}%`,
                boxShadow: progressPercentage > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
              }}
            ></div>
          </div>
        </div>

        {/* Dynamic Message */}
        <div className="loader-text mb-2">
          {currentMessage}
        </div>
        
        {/* Time Information */}
        <div className="loader-subtext mb-4">
          {elapsedTime > 0 && (
            <div className="flex justify-center space-x-4 text-xs">
              <span>Elapsed: {elapsedTime}s</span>
              {estimatedRemaining !== null && (
                <span>Remaining: ~{estimatedRemaining}s</span>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="loader-subtext text-center">
          Our AI is carefully analyzing your manifesto to provide accurate insights
        </div>
      </div>
      
      {/* Enhanced Floating background elements */}
      <div className="floating-element animate-pulse" style={{ 
        top: '10%', 
        left: '10%', 
        width: `${100 + Math.sin(elapsedTime) * 20}px`, 
        height: `${100 + Math.sin(elapsedTime) * 20}px`, 
        background: 'rgba(59, 130, 246, 0.1)', 
        borderRadius: '50%' 
      }}></div>
      <div className="floating-element animate-pulse" style={{ 
        top: '60%', 
        right: '15%', 
        width: `${80 + Math.cos(elapsedTime) * 15}px`, 
        height: `${80 + Math.cos(elapsedTime) * 15}px`, 
        background: 'rgba(168, 85, 247, 0.1)', 
        borderRadius: '50%',
        animationDelay: '1s'
      }}></div>
      <div className="floating-element animate-pulse" style={{ 
        bottom: '20%', 
        left: '20%', 
        width: `${120 + Math.sin(elapsedTime * 0.8) * 25}px`, 
        height: `${120 + Math.sin(elapsedTime * 0.8) * 25}px`, 
        background: 'rgba(34, 197, 94, 0.1)', 
        borderRadius: '50%',
        animationDelay: '2s'
      }}></div>
    </div>
  );
}
