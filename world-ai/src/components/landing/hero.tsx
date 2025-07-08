import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {  useNavigate } from "react-router-dom";


const Hero = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login');
    };
 
    return (
        <section className="relative pt-40 pb-32 bg-transparent">
            <div className="container relative mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    {/* <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
                  
                   Introducing
                    </span> */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Say It Naturally.
                        <br />
                        Awish Does It.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
                        Tell us what you want in your words. awish.ai turns your words into images, videos, music, code, and more - no tech speak needed.
                    </p>
                    <div className="flex justify-center gap-4">
                        <motion.div
                            onClick={handleClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button

                                size="lg"
                                className="bg-primary  text-white hover:bg-primary/90 px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Start Creating for Free
                            </Button>
                        </motion.div>

                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-16 rounded-2xl overflow-hidden border shadow-2xl"
                >
                    <img
                        src="/assets/home.png"
                        alt="Dashboard Preview"
                        className="w-full"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;