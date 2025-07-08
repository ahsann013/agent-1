import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/auth.service";
import Helpers from "@/config/helpers";
import { KeyRound, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthBackground } from "@/components/auth/AuthBackground";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authService.forgotPassword(data.email);
      Helpers.showToast(
        "Password reset instructions have been sent to your email!",
        "success"
      );
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AuthBackground />
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to Login Link */}
        <Link 
          to="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

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
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Reset Password
              </span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your email address to receive password reset instructions
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter your email address" 
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </Button>
            </form>
          </Form>

          {/* Help Text */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
