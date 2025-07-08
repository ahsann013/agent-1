import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
    const navigate = useNavigate();
    return (
        <nav className="absolute top-0 w-full z-50 bg-transparent px-4 md:px-8 lg:px-32">
            <div className="container mx-auto h-20 flex items-center justify-between">
                <Link to="/" className="text-3xl font-bold">
                    <img src="/assets/awish-logo.png" alt="logo" className="w-40 h-auto" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/pricing" className="text-sm font-medium hover:text-[#ff6f52]/80">
                        Pricing
                    </Link>
                    <Button
                        className="bg-[#ff6f52] text-white hover:bg-[#ff6f52]/90"
                        size="sm"
                        onClick={() => {
                            navigate("/login");
                        }}
                    >
                        Login & Signup
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
