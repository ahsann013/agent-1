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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { Eye, EyeOff, User, Lock, CheckCircle2, Upload } from "lucide-react";
import Helpers from "@/config/helpers";
import authService from "@/services/auth.service";
import useUserStore from '@/store/useUserStore';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  profileImage: z.instanceof(File).optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfileSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { user, updateUser } = useUserStore();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
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

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {

      await authService.updateProfile({
        name: data.name,
        email: data.email,
        username: data.username,
        profileImage: avatarPreview || undefined
      });

      updateUser({
        name: data.name,
        username: data.username,
        profileImage: avatarPreview || user?.profileImage
      });

      Helpers.showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      Helpers.showToast("Password updated successfully!", "success");
      passwordForm.reset();
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  const renderPasswordInput = (
    name: "currentPassword" | "newPassword" | "confirmPassword",
    label: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void
  ) => (
    <FormField
      control={passwordForm.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground/80">{label}</FormLabel>
          <FormControl>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
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
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Profile Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your profile information and security settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </TabsTrigger>
          {
            user?.isGoogleUser === false && (
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </TabsTrigger>
            )
          }
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-6">
            <Avatar
              className="w-32 h-32 cursor-pointer transition-transform hover:scale-105"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={profileImage || user?.profileImage || "/placeholder-avatar.jpg"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-background/50 border-border/50 focus:border-primary transition-colors" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-background/50 border-border/50 focus:border-primary transition-colors" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <Input
                    value={user?.email}
                    disabled
                    className="bg-muted/50 pr-10"
                  />
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </FormItem>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <span>Save Profile</span>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {renderPasswordInput(
                "currentPassword",
                "Current Password",
                showCurrentPassword,
                setShowCurrentPassword
              )}
              {renderPasswordInput(
                "newPassword",
                "New Password",
                showNewPassword,
                setShowNewPassword
              )}
              {renderPasswordInput(
                "confirmPassword",
                "Confirm New Password",
                showConfirmPassword,
                setShowConfirmPassword
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
