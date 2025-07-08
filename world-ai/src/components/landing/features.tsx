import { Search, Brain, Clock } from "lucide-react";
import { motion } from "framer-motion";
import GlassIcons from "@/blocks/Components/GlassIcons/GlassIcons";

const FeatureCard = ({ title, description, children }: {
    title: string;
    description: string;
    children: React.ReactNode;
}) => (
    <div className="group relative h-full transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
        <div className="relative h-full flex flex-col items-start justify-center text-center p-8 rounded-2xl bg-gradient-to-b from-background/90 to-background/50 border border-white/10 backdrop-blur-sm">
            <div className="flex self-center pb-20">
                {children}
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    </div>
);

const Features = () => {
    const featureCards = [
        {
            icon: Search,
            title: "Smart Model Selection",
            description: "Our system automatically analyzes your request and selects the most suitable AI models, ensuring optimal results for your specific needs.",
            item: [{
                icon: <Search />,
                color: "var(--primary)"
            }]
        },
        {
            icon: Brain,
            title: "Natural Language Processing",
            description: "Simply describe what you want to achieve in your own words. Our AI understands your intent and transforms it into optimized prompts.",
            item: [{
                icon: <Brain />,
                color: "var(--accent)"
            }]
        },
        {
            icon: Clock,
            title: "Conversation History",
            description: "Access your past conversations and results, with a smart organization system that helps you track and manage your AI interactions.",
            item: [{
                icon: <Clock />,
                color: "var(--primary)"
            }]
        }
    ];

    return (
        <>
            <section className="py-32 bg-gradient-to-b from-background via-background/90 to-background/80">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        <div className="space-y-8">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                            >
                                Natural Language to AI Solutions
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-lg text-muted-foreground"
                            >
                                Simply describe what you want to achieve, and our intelligent system will handle the rest.
                            </motion.p>
                            <motion.ul
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="space-y-6"
                            >
                                {['Automatic model selection and integration', 'Smart prompt optimization', 'ChatGPT-like interface with enhanced features'].map((item, index) => (
                                    <li key={index} className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                                            <span className="text-primary">✓</span>
                                        </div>
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </motion.ul>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                            <div className="relative bg-gradient-to-b from-background/90 to-background/50 border border-white/10 rounded-3xl p-8">
                                {/* Add your feature image or illustration here */}
                                <img src="/assets/ai-feature.png" alt="features" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-32 bg-gradient-to-b from-background/80 to-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Advanced AI Integration Made Simple
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Experience the power of AI without the complexity
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {featureCards.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <FeatureCard
                                    title={feature.title}
                                    description={feature.description}
                                >
                                    <GlassIcons items={feature.item} className="h-16 w-16 flex self-center" />
                                </FeatureCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default Features;