import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "@/services/auth.service";
import Helpers from "@/config/helpers";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get token and email from query params
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Redirect if token or email is missing
    useEffect(() => {
        if (!token || !email) {
            Helpers.showToast("Invalid reset link", "error");
            navigate('/login');
        }
    }, [token, email, navigate]);

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        try {
            await authService.resetPassword({
                token: token!,
                email: email!,
                newPassword: data.newPassword
            });

            Helpers.showToast("Password reset successful!", "success");
            navigate('/login');
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
                            Enter your new password below
                        </p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/80">New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
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
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    className="bg-background/50 border-border/50 focus:border-primary transition-colors pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
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
                                        <span>Resetting Password...</span>
                                    </div>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
