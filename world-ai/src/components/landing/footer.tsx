import { Link } from "react-router-dom";
import { Twitter, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
          <Link to="/" className="text-6xl font-bold">
                    <img src="/assets/awish-logo.png" alt="logo" className="w-40 h-auto" />
                </Link>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Awish.AI Limited
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-6 text-sm">
              <Link
                to="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/docs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Documents
              </Link>
              <Link
                to="/legal"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Legal
              </Link>
            </div>

            <div className="flex items-center gap-4 border-l pl-6">
              <a
                href="https://twitter.com/thebai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com/thebai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;