import { MessageSquare, Sparkles, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
const HowItWorks = () => {
  const steps = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      number: "1",
      title: "Describe Your Need",
      description: "Type what you want in everyday language, as if chatting with a friend"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      number: "2",
      title: "AI Processing",
      description: "We select the perfect AI model and create the optimal prompt"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      number: "3",
      title: "Get Results",
      description: "Receive exactly what you asked for, no technical knowledge needed"
    }
  ];
  const navigate = useNavigate();


  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 right-0 w-full h-[2px] bg-gradient-to-r from-primary/20 to-primary/10 -z-10" />
              )}

              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 border border-border/5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                {/* Number Badge */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                  <div className="relative h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button onClick={() => navigate('/login')} className="bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-primary/25">
            Try It Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
