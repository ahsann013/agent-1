import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/auth.service";
import Helpers from "@/config/helpers";
import { Eye, EyeOff, Mail, User, Lock, UserCircle } from "lucide-react";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import useUserStore from "@/store/useUserStore";
import GoogleButton from "@/components/auth/GoogleButton";

// Updated schema to include confirmPassword
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupInput = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { setUser, setToken } = useUserStore((state: any) => state);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      // Remove confirmPassword from data before sending to API
      const { confirmPassword, ...submitData } = data;
      await authService.signup(submitData);
      Helpers.showToast(
        "Signup successful! Please check your email for verification.",
        "success"
      );
      navigate("/login");
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const response = await authService.googleAuth(token);

      setIsGoogleLoading(false);
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role as "user" | "admin",
        profileImage: response.user.profileImage,
        type: response.user.type,
        subscription: response.user.subscription,
      });
      setToken(response.token);
      Helpers.showToast("Login successful!", "success");
      navigate("/chat/new");
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AuthBackground />
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl h-full max-h-screen flex items-center px-4 py-4"
      >
        {/* Glass Card Effect */}
        <div className="rounded-2xl border border-border/50 bg-card/30 shadow-2xl backdrop-blur-xl w-full h-auto max-h-[calc(100vh-2rem)] overflow-hidden">
          <div className="flex flex-col md:flex-row w-full h-full">
            {/* Left side - Form */}
            <div className="p-6 md:p-8 w-full md:w-3/5 overflow-y-auto">
              <div className="mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Create Account
                  </span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign up to get started with Awish AI
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Enter your full name"
                                className="border-border/50 bg-background/50 pl-10 transition-colors focus:border-primary"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="border-border/50 bg-background/50 pl-10 transition-colors focus:border-primary"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Choose a username"
                                className="border-border/50 bg-background/50 pl-10 transition-colors focus:border-primary"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                className="border-border/50 bg-background/50 pl-10 pr-10 transition-colors focus:border-primary"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="border-border/50 bg-background/50 pl-10 pr-10 transition-colors focus:border-primary"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-primary/25"
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <span>Sign Up</span>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Footer for mobile */}
              <div className="mt-4 md:hidden">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Right side - Google login and footer */}
            <div className="p-6 md:p-8 w-full md:w-2/5 bg-primary/5 flex flex-col justify-center">
              <div className="space-y-6">
                <div className="text-center mb-4 hidden md:block">
                  <h3 className="text-xl font-semibold text-foreground/90">Welcome Back</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete your sign up to continue
                  </p>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border/50" />
                  <span className="bg-transparent px-2 text-xs text-muted-foreground whitespace-nowrap">
                    Or continue with
                  </span>
                  <div className="w-full border-t border-border/50" />
                </div>

                <GoogleButton
                  isLoading={isGoogleLoading}
                  handleGoogleLogin={handleGoogleLogin}
                />

                {/* Footer for desktop */}
                <div className="mt-6 hidden md:block">
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;