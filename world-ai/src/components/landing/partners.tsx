import { useTheme } from "../theme/theme-provider";

const Partners = () => {
  const { theme } = useTheme();
  const logos = [
    { src: "/assets/microsoft.png", alt: "Microsoft", height: "h-16" },
    { src: "/assets/google.png", alt: "Google", height: "h-32" },
    { src: "/assets/openai.png", alt: "OpenAI", height: "h-8" },
    { src: "/assets/fal.svg", alt: "Fal", height: "h-12" },
  ];

  return (
    <section className={`py-16 ${theme === "dark" ? "bg-background/5" : "bg-background/5"}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-16 text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Powered by
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className={`
                p-8 rounded-xl transition-all duration-300
                bg-background/10 hover:bg-background/20
                hover:scale-105 cursor-pointer
              `}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className={`
                  ${logo.height}
                  ${theme === "dark" ? "brightness-200" : "brightness-75"}
                  object-contain
                `}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;