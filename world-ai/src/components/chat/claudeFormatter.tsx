import React from 'react';

interface ClaudeFormatterProps {
    response: string;
    writing: boolean;
}

const ClaudeFormatter: React.FC<ClaudeFormatterProps> = ({ response, writing }) => {
    const formatResponse = (text: string): string => {
        // ... existing validation code from ChatGPTFormatter ...
        if (!text || typeof text !== 'string') {
            console.warn('Invalid input text:', text);
            return '';
        }

        // Remove double quotes at start and end if they exist
        if (text.startsWith('"') && text.endsWith('"')) {
            text = text.slice(1, -1);
        }

        try {
            // Handle headers (##) - must be first to prevent interference with other formatting
            let formattedText = text.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
            formattedText = text.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
            // Handle bold (**, __)
            formattedText = formattedText.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
            
            // Handle italic (*, _)
            formattedText = formattedText.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
            
            // Handle strikethrough (~~)
            formattedText = formattedText.replace(/~~(.*?)~~/g, "<del>$1</del>");
            
            // Handle code blocks (``` and `)
            formattedText = formattedText.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
            formattedText = formattedText.replace(/`(.*?)`/g, "<code>$1</code>");
            
            // Handle blockquotes (>)
            formattedText = formattedText.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");
            
            // Handle links ([text](url))
            formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            
            // Handle line breaks and paragraphs
            formattedText = formattedText.split('\n\n').map(paragraph => {
                // Skip if already wrapped in h2 tags
                if (paragraph.startsWith('<h2>') && paragraph.endsWith('</h2>')) {
                    return paragraph;
                }
                // Wrap other paragraphs in p tags
                return `<p>${paragraph}</p>`;
            }).join('');
            
            // Then convert remaining single newlines to line breaks
            formattedText = formattedText.replace(/\n/g, "<br/>");
            
            return formattedText;
        } catch (error) {
            console.error('Error formatting text:', error);
            return text;
        }
    };

    return (
        <div
            className={`claude-formatter ${writing ? 'writing' : ''}`}
            style={{
                display: 'inline-block',
                position: 'relative',
            }}
        >
            <span
                dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
                style={{
                    marginRight: writing ? 5 : 0,
                }}
            />
            {writing && (
                <span
                    className="cursor"
                    style={{
                        display: 'inline-block',
                        position: 'relative',
                        right: 0,
                        top: 0,
                    }}
                >
                  |
                </span>
            )}
        </div>
    );
};

export default ClaudeFormatter; 