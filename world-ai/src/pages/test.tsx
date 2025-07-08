//@ts-nocheck
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { motion } from "framer-motion";
import Carousel from "@/blocks/Components/Carousel/Carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TextPressure from "@/blocks/TextAnimations/TextPressure/TextPressure";
import Hyperspeed from "@/blocks/Backgrounds/Hyperspeed/Hyperspeed";

const Landing = () => {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header
          className={`fixed top-0 w-full transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md" : ""
            }`}
        >
          <nav className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold">
                ReactStarter
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="#features"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Features
                </Link>
                <Link
                  to="#pricing"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
                <Link
                  to="#testimonials"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Testimonials
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <ModeToggle />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <TextPressure
              text="Modern React Development Made Simple"

              width={true}
              weight={true}
              italic={true}
              alpha={false}
              flex={true}
              stroke={false}
              scale={false} />
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              A modern React starter template with beautiful UI components,
              animations, and interactive backgrounds powered by OGL.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg">Get Started Free</Button>
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Feature Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="container mx-auto px-4 py-16"
        >
          <div className="flex justify-center">
            <Carousel
              baseWidth={900}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
            />
          </div>
        </motion.section>

        {/* Features Grid */}
        <section
          id="features"
          className="container mx-auto px-4 py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 60 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
              >
                <feature.icon className="mb-4 h-8 w-8" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="container mx-auto px-4 py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose the perfect plan for your needs</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className={`rounded-xl border p-8 ${plan.featured
                    ? "border-primary bg-primary/5 relative overflow-hidden"
                    : "bg-card"
                  }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm rounded-bl-lg">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="container mx-auto px-4 py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Developers Say</h2>
            <p className="text-muted-foreground">
              Trusted by developers worldwide
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-lg border bg-card p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <div className="mb-2 text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Get started in minutes with our simple setup process
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="relative text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built With Modern Tech</h2>
            <p className="text-muted-foreground">
              Powered by the latest web technologies
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <tech.icon className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden border-y bg-card">
          <div className="container mx-auto px-4 py-24">
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-4 text-4xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  Join thousands of developers building better apps with ReactStarter
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" asChild>
                    <Link to="/signup">Start Building Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/docs">Read Documentation</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions about ReactStarter
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-lg border bg-card p-6"
              >
                <h3 className="mb-3 text-lg font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">ReactStarter</h3>
                <p className="text-sm text-muted-foreground">
                  Building better web applications with modern tools and practices.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="#features"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#pricing"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#testimonials"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Testimonials
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ReactStarter. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Modern Stack",
    description: "Built with React, TypeScript, and Tailwind CSS",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </svg>
    ),
  },
  {
    title: "Interactive UI",
    description: "Beautiful animations and interactive components",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    title: "Developer Experience",
    description: "Hot reload, TypeScript support, and modern tooling",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </svg>
    ),
  },
];

const pricingPlans = [
  {
    name: "Hobby",
    description: "Perfect for side projects",
    price: 0,
    featured: false,
    features: [
      "Up to 3 projects",
      "Basic components",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    description: "For professional developers",
    price: 29,
    featured: true,
    features: [
      "Unlimited projects",
      "Advanced components",
      "Priority support",
      "Advanced analytics",
      "Custom themes",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description: "For large teams and organizations",
    price: 99,
    featured: false,
    features: [
      "Everything in Pro",
      "Custom development",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Training sessions",
    ],
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "This starter template has saved me countless hours of setup time. The components are well-designed and the documentation is excellent.",
  },
  {
    name: "Michael Rodriguez",
    role: "Full Stack Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "The interactive backgrounds and animations are incredible. My clients are always impressed with the final result.",
  },
  {
    name: "Emily Taylor",
    role: "UI/UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content:
      "As a designer, I appreciate the attention to detail in the components. They're both beautiful and functional.",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50+", label: "UI Components" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const steps = [
  {
    title: "Install Package",
    description: "Start with a simple npm install command",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Configure App",
    description: "Set up your preferences and theme",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Start Building",
    description: "Create your app with ready components",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
];

const techStack = [
  {
    name: "React",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85-1.03 0-1.87-.85-1.87-1.85 0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9-.82-.08-1.63-.2-2.4-.36-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96.77-.16 1.58-.28 2.4-.36.48-.67.99-1.31 1.51-1.9z"
        />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M3,3H21V21H3V3M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86M13,11.25H8V12.75H9.5V20H11.25V12.75H13V11.25Z"
        />
      </svg>
    ),
  },
  {
    name: "Tailwind",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M12 6C9.33 6 7.67 7.33 7 10C8 8.67 9.17 8.17 10.5 8.5C11.26 8.69 11.81 9.24 12.41 9.85C13.39 10.85 14.5 12 17 12C19.67 12 21.33 10.67 22 8C21 9.33 19.83 9.83 18.5 9.5C17.74 9.31 17.19 8.76 16.59 8.15C15.61 7.15 14.5 6 12 6M7 12C4.33 12 2.67 13.33 2 16C3 14.67 4.17 14.17 5.5 14.5C6.26 14.69 6.81 15.24 7.41 15.85C8.39 16.85 9.5 18 12 18C14.67 18 16.33 16.67 17 14C16 15.33 14.83 15.83 13.5 15.5C12.74 15.31 12.19 14.76 11.59 14.15C10.61 13.15 9.5 12 7 12Z"
        />
      </svg>
    ),
  },
  {
    name: "Vite",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M8.286 10.578L12.002 2l3.716 8.578-3.716 2.148-3.716-2.148zm11.273 1.489L12.002 24l-7.557-11.933 7.557 4.367 7.557-4.367z"
        />
      </svg>
    ),
  },
  {
    name: "OGL",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M12,22c5.52,0,10-4.48,10-10S17.52,2,12,2S2,6.48,2,12S6.48,22,12,22z M12,4c4.42,0,8,3.58,8,8s-3.58,8-8,8s-8-3.58-8-8 S7.58,4,12,4z"
        />
        <path
          fill="currentColor"
          d="M12,17c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S9.24,17,12,17z"
        />
      </svg>
    ),
  },
  {
    name: "Framer",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="currentColor"
          d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z"
        />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: "What is ReactStarter?",
    answer: "ReactStarter is a modern template for building React applications with built-in support for TypeScript, Tailwind CSS, and interactive UI components.",
  },
  {
    question: "Do I need to know TypeScript?",
    answer: "While TypeScript knowledge is beneficial, it's not required. You can start with JavaScript and gradually adopt TypeScript features as you learn.",
  },
  {
    question: "Can I use it for commercial projects?",
    answer: "Yes! ReactStarter is available under the MIT license, which means you can use it for both personal and commercial projects.",
  },
  {
    question: "How do I get support?",
    answer: "We offer community support through GitHub discussions and premium support for Pro and Enterprise users through our dedicated help desk.",
  },
  {
    question: "Can I customize the theme?",
    answer: "Absolutely! The template uses Tailwind CSS and CSS variables for theming, making it easy to customize colors, typography, and other design tokens.",
  },
  {
    question: "Is it regularly updated?",
    answer: "Yes, we maintain regular updates to ensure compatibility with the latest React features and security patches.",
  },
];

export default Landing;
