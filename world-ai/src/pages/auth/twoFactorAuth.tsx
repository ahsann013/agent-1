import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/auth.service";
import chatService from "@/services/chat.service";
import Helpers from "@/config/helpers";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthBackground } from "@/components/auth/AuthBackground";
const otpSchema = z.object({
  otp: z.string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpInput = z.infer<typeof otpSchema>;

const TwoFactorAuth = () => {

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  
  const form = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isResendDisabled]);

  const onSubmit = async (data: OtpInput) => {
    try {
      await authService.verify2FA(data.otp);
      Helpers.showToast("2FA verification successful!", "success");
      const newChat = await chatService.createChat("New Chat");
      navigate(`/chat/${newChat.id}`);
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resend2FA();
      setCountdown(30);
      setIsResendDisabled(true);
      Helpers.showToast("New OTP has been sent to your email!", "success");
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AuthBackground/>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass Card Effect */}
        <div className="backdrop-blur-xl bg-card/30 p-8 rounded-2xl border border-border/50 shadow-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-[2px]">
                <div className="w-full h-full rounded-2xl bg-background/90 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Two-Factor Auth
              </span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Verification Code</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors text-center text-lg tracking-[0.5em] font-mono"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border hover:bg-primary/5 hover:text-primary transition-colors"
                  size="lg"
                  onClick={handleResendOTP}
                  disabled={isResendDisabled}
                >
                  {isResendDisabled ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>Resend Code in {countdown}s</span>
                    </div>
                  ) : (
                    <span>Resend Code</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Having trouble?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorAuth;
