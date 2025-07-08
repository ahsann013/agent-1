//@ts-nocheck
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef } from "react";
import { Eye, EyeOff, User, Mail, UserCircle, Upload } from "lucide-react";
import Helpers from "@/config/helpers";
import authService from "@/services/auth.service";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  profileImage: z.instanceof(File).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const CreateUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you'd send the data to your API
      await authService.createUser({
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        profileImage: avatarPreview || undefined
      });
      
      Helpers.showToast("User created successfully!", "success");
      form.reset();
      setAvatarPreview(null);
      setProfileImage(null);
      navigate("/admin/users");
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create User
        </h2>
        <p className="text-muted-foreground">
          Add a new user to the system with complete profile information
        </p>
      </div>

      <Card className="border border-border/50 bg-card/30 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar 
                  className="w-32 h-32 cursor-pointer transition-transform hover:scale-105"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={avatarPreview || "/placeholder-avatar.jpg"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                    <UserCircle className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleAvatarClick}
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              </div>

              {/* User Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">User Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="Enter full name" 
                              className="bg-background/50 border-border/50 focus:border-primary pl-10 transition-colors" 
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="Enter username" 
                              className="bg-background/50 border-border/50 focus:border-primary pl-10 transition-colors" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            type="email"
                            placeholder="Enter email address" 
                            className="bg-background/50 border-border/50 focus:border-primary pl-10 transition-colors" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              className="bg-background/50 border-border/50 focus:border-primary pr-10 transition-colors"
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
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              className="bg-background/50 border-border/50 focus:border-primary pr-10 transition-colors"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating User...</span>
                  </div>
                ) : (
                  <span>Create User</span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUser;