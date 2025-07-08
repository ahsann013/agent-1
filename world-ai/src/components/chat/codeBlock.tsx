import { CopyBlock,a11yDark,a11yLight } from 'react-code-blocks';
import { useTheme } from '@/components/theme/theme-provider';

interface CodeBlockProps {
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code = 'import express from "express";\nconsole.log("Hello, World");', language = 'javascript', showLineNumbers = true }) => {
    const { theme } = useTheme();
  return (
    <CopyBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      theme={theme === 'dark' ? a11yDark : a11yLight}
      codeBlock
    />
  );
};

export default CodeBlock;