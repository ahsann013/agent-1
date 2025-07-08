import { useState, useEffect, useRef } from 'react';

const useTypewriter = (text: string, speed: number = 100): string => {
  const [displayText, setDisplayText] = useState('');
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Reset state when text or speed changes
    currentIndexRef.current = 0;
    setDisplayText('');

    const typeNextCharacter = () => {
      if (currentIndexRef.current < text.length) {
        setDisplayText((prev) => prev + text.charAt(currentIndexRef.current));
        currentIndexRef.current++;
        timeoutRef.current = setTimeout(typeNextCharacter, speed);
      }
    };

    // Start typing after initial render
    timeoutRef.current = setTimeout(typeNextCharacter, speed);

    return () => {
      // Cleanup timeout on unmount or dependency change
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]); // Re-run effect when text or speed changes

  return displayText;
};

export default useTypewriter;