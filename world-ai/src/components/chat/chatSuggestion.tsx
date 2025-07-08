//@ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import openaiService from '@/services/openai.service';

interface ChatSuggestionProps {
    onHandleSuggestionClick: (prompt: string) => void;
}

interface ExamplePrompt {
    prompt: string;
    emoji: string;
    category: string;
}

const prompts = [
    {
        "emoji": "💻",
        "prompt": "Build a minimalist weather app using React",
        "category": "Development"
    },
    {
        "emoji": "🎥",
        "prompt": "Create a video of a cyberpunk cityscape with a motorcycle gliding through the air",
        "category": "Video"
    },
    {
        "emoji": "🎼",
        "prompt": "Generate a relaxing lo-fi track with soft piano notes",
        "category": "Audio"
    },
    {
        "emoji": "🖼️",
        "prompt": "Create a fantasy portrait of an old sage meditating in a mystical forest",
        "category": "Image"
    }
];


const ChatSuggestion = ({ onHandleSuggestionClick }: ChatSuggestionProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [examplePrompts, setExamplePrompts] = useState<ExamplePrompt[]>(prompts);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const result = await openaiService.getSuggestions();
            setExamplePrompts(result.suggestions);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        setTimeout(() => {
            fetchSuggestions();
        }, 60000);
    }, [examplePrompts]);

    return (
        <div className="w-full space-y-1 flex flex-col items-center">
        

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden justify-center w-full"
                    >
                        <ul className="space-y-2 flex-col justify-end pt-2">
                            {examplePrompts.map((example, index) => (
                                <motion.li
                                    key={example.prompt}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: { delay: index * 0.1 }
                                    }}
                                >
                                    <button
                                        onClick={() => onHandleSuggestionClick(example.prompt)}
                                        className="w-full text-left p-1 rounded-lg border-b border-border/50 
                                                 bg-background/50 hover:bg-primary/5 hover:border-primary/30 
                                                 transition-all duration-300 flex items-center gap-3"
                                    >
                                        <span className="text-xl">{example.emoji}</span>
                                        <div className="flex-1">
                                            <p className="text-sm group-hover:text-primary transition-colors">
                                                {example.prompt}
                                            </p>

                                        </div>
                                    </button>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatSuggestion;
