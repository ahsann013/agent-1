import Navigation from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { useTheme } from "@/components/theme/theme-provider";
import Pricing from "@/components/landing/pricing";

const PricingPage = () => {
    const { setTheme } = useTheme();
    setTheme("light");
    return (
        <>
            <Navigation />
            <main className="relative z-10 px-4 md:px-8 lg:px-32">
                <Pricing />
                <Footer />
            </main>
        </>
    );
};

export default PricingPage;