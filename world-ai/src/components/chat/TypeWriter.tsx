import  { useEffect, useState, ElementType } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  Component?: ElementType;
}

const TypeWriter = ({ text, speed = 100, Component = 'span' }: TypeWriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <Component>{displayedText}</Component>;
};

export default TypeWriter; 