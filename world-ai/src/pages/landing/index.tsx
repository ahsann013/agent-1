import Navigation from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import Partners from "@/components/landing/partners";
import Features from "@/components/landing/features";
import Contact from "@/components/landing/contact";
import Footer from "@/components/landing/footer";
import { useTheme } from "@/components/theme/theme-provider";
import HowItWorks from "@/components/landing/howitworks";
const Landing = () => {
    const { setTheme } = useTheme();
    setTheme("light");
    return (
        <>
         
            <Navigation />
            <main className="relative z-10 px-4 md:px-8 lg:px-32">
                <Hero />
                <Partners />       
                <Features />
                <HowItWorks />
                {/* <Pricing /> */}
                <Contact />
                <Footer />
            </main>
        </>
    );
};

export default Landing;