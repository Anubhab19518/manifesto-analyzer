import { useEffect, useState } from 'react';

interface LoaderProps {
  isVisible: boolean;
}

const loadingMessages = [
  "Analyzing manifesto content...",
  "Processing political promises...",
  "Extracting key themes...",
  "Evaluating policy implications...",
  "Generating insights...",
  "Almost ready..."
];

export default function Loader({ isVisible }: LoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-spinner"></div>
        <div className="loader-text">
          {loadingMessages[messageIndex]}
        </div>
        <div className="loader-subtext">
          This may take a few moments while our AI analyzes the document
        </div>
      </div>
      
      {/* Floating background elements */}
      <div className="floating-element" style={{ top: '10%', left: '10%', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}></div>
      <div className="floating-element" style={{ top: '60%', right: '15%', width: '80px', height: '80px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%' }}></div>
      <div className="floating-element" style={{ bottom: '20%', left: '20%', width: '120px', height: '120px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%' }}></div>
    </div>
  );
}
