import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";


interface GoogleButtonProps {
  handleGoogleLogin: () => void;
  isLoading?: boolean;
}

const GoogleButton = ({  isLoading, handleGoogleLogin }: GoogleButtonProps) => {

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background/50 border-border/50 hover:bg-background/80"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Continue with Google
    </Button>
  );
};

export default GoogleButton; 