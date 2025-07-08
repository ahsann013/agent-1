//@ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Loader2, RefreshCw } from "lucide-react";
import { useCaptchaStore } from "@/store/useCaptchaStore";

const CaptchaVerification = () => {
  const navigate = useNavigate();
  const setVerified = useCaptchaStore((state) => state.setVerified);
  const isVerifiedInStore = useCaptchaStore((state) => state.isVerified);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Check if already verified in store
  useEffect(() => {
    if (isVerifiedInStore) {
      setIsVerified(true);
    }
  }, [isVerifiedInStore]);

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    let timer;
    if (isVerified) {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/chat/new');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerified, navigate]);

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      if (userInput === captchaText) {
        setIsVerified(true);
        setVerified(true); // Update the global verification state
        setError('');
      } else {
        setError('Captcha verification failed. Please try again.');
        generateCaptcha();
        setUserInput('');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Generate colors for captcha characters
  const getRandomColor = () => {
    const colors = [
      'text-blue-600', 'text-purple-600', 'text-green-600', 
      'text-red-600', 'text-cyan-600', 'text-amber-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate random background lines for additional security
  const generateNoiseLines = () => {
    const lines = [];
    for (let i = 0; i < 5; i++) {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;
      lines.push({ startX, startY, endX, endY });
    }
    return lines;
  };

  const noiseLines = generateNoiseLines();

  return (
    <div className="relative flex h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AuthBackground />
      </div>
      
      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        {/* Glass Card Effect */}
        <div className="rounded-2xl border border-border/50 bg-card/30 shadow-2xl backdrop-blur-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {isVerified ? 'Verification Complete' : 'Verify You\'re Human'}
              </span>
            </h2>
            <p className="text-muted-foreground">
              {isVerified 
                ? `Redirecting in ${redirectCountdown} seconds...`
                : 'Please complete the captcha to continue'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Captcha Display - Copy Protected */}
            <div className="flex justify-center">
              <div className="bg-background/50 p-4 rounded-lg border border-border/50 relative select-none">
                {/* Non-selectable captcha container */}
                <div 
                  className="h-16 w-48 flex items-center justify-center relative"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Noise lines for additional security */}
                  <svg className="absolute inset-0 w-full h-full">
                    {noiseLines.map((line, index) => (
                      <line 
                        key={index}
                        x1={`${line.startX}%`} 
                        y1={`${line.startY}%`} 
                        x2={`${line.endX}%`} 
                        y2={`${line.endY}%`}
                        stroke="rgba(100, 100, 100, 0.3)" 
                        strokeWidth="1"
                      />
                    ))}
                  </svg>
                  
                  {/* SVG Text to prevent selection and copying */}
                  <svg className="w-full h-full">
                    <defs>
                      <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" />
                        <feDisplacementMap in="SourceGraphic" scale="5" />
                      </filter>
                    </defs>
                    
                    {captchaText.split('').map((char, index) => {
                      const rotation = Math.random() * 40 - 20;
                      const x = 24 + index * 24;
                      const y = 32 + (Math.random() * 10 - 5);
                      
                      return (
                        <text
                          key={index}
                          x={x}
                          y={y}
                          className={getRandomColor()}
                          style={{
                            fontSize: '24px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: `${x}px ${y}px`
                          }}
                        >
                          {char}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter the text above"
                className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isVerified || isLoading}
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={isVerified || isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-primary/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isVerified ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Verify'
              )}
            </Button>

            {/* Refresh Captcha */}
            {!isVerified && !isLoading && (
              <button
                onClick={generateCaptcha}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                <RefreshCw className="h-3 w-3" />
                Can't read? Click to refresh
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CaptchaVerification;