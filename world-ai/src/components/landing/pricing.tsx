import {
    Button
} from '../ui/button'
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import stripeService from "@/services/stripe.service";
import { useNavigate } from "react-router-dom";

interface Plan {
    id: string;
    name: string;
    description: string;
    unitAmount: number;
    interval?: string;
    featured: boolean;
    features: string[];
    credits?: number;
    active: boolean;
}

const Pricing = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const products = await stripeService.getProducts();
            // Only show active plans
            setPlans(products.filter(product => product.active));
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
            setIsLoading(false);
        }
    };

    // Fallback to static data if no plans are available
    const staticPricingPlans = [
        {
            name: "Free",
            description: "Perfect for individuals exploring AI capabilities",
            unitAmount: 0,
            interval: "month",
            featured: false,
            features: [
                "Up to 100 AI generations per month",
                "Basic image & text generation",
                "Community support access",
                "Standard response time",
                "Basic templates library",
            ],
            credits: 100,
        },
        {
            name: "Professional",
            description: "Ideal for professionals and growing businesses",
            unitAmount: 2900,
            interval: "month",
            featured: true,
            features: [
                "Unlimited AI generations",
                "Priority processing speed",
                "Advanced image, text & code generation",
                "24/7 priority support",
                "Custom API integration",
                "Advanced analytics dashboard",
                "Custom model fine-tuning",
            ],
            credits: 5000,
        },
        {
            name: "Enterprise",
            description: "Custom solutions for large organizations",
            unitAmount: 0,
            interval: "custom",
            featured: false,
            features: [
                "Everything in Professional",
                "Dedicated account manager",
                "Custom AI model development",
                "Enterprise SLA guarantee",
                "Advanced security features",
                "Team collaboration tools",
                "On-premise deployment options",
            ],
            credits: 100000,
        },
    ];

    const displayPlans = plans.length > 0 ? plans : staticPricingPlans;

    // Helper for displaying billing cycle
    const getBillingText = (interval?: string) => {
        if (!interval || interval === "one-time") return "one-time payment";
        if (interval === "custom") return "custom plan";
        return `per ${interval}`;
    };

    return (
        <div className="bg-gradient-to-b from-background to-background/50">
            <section id="pricing" className="container mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-9"
                >
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Transparent Pricing for Every Need
                    </h2>
                    <p className="text-sm m-2 text-muted-foreground">
                        Choose the perfect plan that scales with your AI journey. No hidden fees, just powerful AI capabilities at your fingertips.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
                        {displayPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 * index, duration: 0.6 }}
                                className={`relative rounded-2xl border p-8 flex flex-col justify-between ${
                                    plan.featured
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                        : "bg-card hover:border-primary/20 transition-colors"
                                }`}
                            >
                                <div>
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm rounded-full font-medium">
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-muted-foreground">{plan.description}</p>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-end gap-2 mb-1">
                                        {plan.unitAmount === 0 && plan.interval === "custom" ? (
                                            <span className="text-4xl font-bold">Custom</span>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold">${plan.unitAmount/100}</span>
                                                <span className="text-muted-foreground mb-1">/{getBillingText(plan.interval)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary font-bold">{plan.credits?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                </div>

                                <Button
                                    className={`w-full ${
                                        plan.featured
                                            ? "bg-primary hover:bg-primary/90"
                                            : "bg-background hover:bg-primary/10"
                                    }`}
                                    variant={plan.featured ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => {
                                        navigate("/signup");
                                    }}
                                >
                                    {plan.unitAmount === 0 && plan.interval === "custom" ? "Contact Sales" : "Get Started"}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-16 max-w-2xl mx-auto"
                >
                    <p className="text-muted-foreground">
                        All plans include access to our core AI features, regular updates, and basic support.
                        Need a custom solution? <a href="#contact" className="text-primary hover:underline">Contact our sales team</a>.
                    </p>
                </motion.div>
            </section>
        </div>
    );
}

export default Pricing;
