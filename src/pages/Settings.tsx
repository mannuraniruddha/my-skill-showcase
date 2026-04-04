import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, GraduationCap, Lock, Palette } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { pythonLevel, setPythonLevel, isLoading: prefsLoading } = useUserPreferences();

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [themePreference, setThemePreference] = useState("system");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  // Load theme preference from user_preferences
  useEffect(() => {
    if (!user) return;
    const loadTheme = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("theme_preference")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.theme_preference) {
        setThemePreference(data.theme_preference);
      }
    };
    loadTheme();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleSetLevel = async (level: string) => {
    try {
      await setPythonLevel(level as "beginner" | "intermediate" | "expert");
      toast.success("Competency level updated");
    } catch {
      toast.error("Failed to update level");
    }
  };

  const handleSetTheme = async (theme: string) => {
    setThemePreference(theme);
    try {
      if (!user) return;
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_preferences")
          .update({ theme_preference: theme, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, theme_preference: theme });
      }

      // Apply theme immediately
      applyTheme(theme);
      toast.success("Theme preference saved");
    } catch {
      toast.error("Failed to save theme preference");
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("light", theme === "light");
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Your public display information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground">Email</Label>
                <Input value={user.email || ""} disabled className="mt-1 bg-muted/50" />
              </div>
              <div>
                <Label className="text-foreground">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="mt-1"
                  maxLength={100}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving || profileLoading} size="sm">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Competency Level */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-5 h-5 text-primary" />
                Python Competency Level
              </CardTitle>
              <CardDescription>
                This determines the default code examples shown in tutorials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={pythonLevel}
                onValueChange={handleSetLevel}
                className="space-y-3"
                disabled={prefsLoading}
              >
                {[
                  { value: "beginner", label: "Beginner", desc: "New to Python, learning fundamentals" },
                  { value: "intermediate", label: "Intermediate", desc: "Comfortable with core concepts" },
                  { value: "expert", label: "Expert", desc: "Advanced patterns and best practices" },
                ].map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={option.value} id={`level-${option.value}`} className="mt-1" />
                    <Label htmlFor={`level-${option.value}`} className="cursor-pointer">
                      <span className="text-foreground font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Theme Preference */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="w-5 h-5 text-primary" />
                Theme Preference
              </CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={themePreference}
                onValueChange={handleSetTheme}
                className="space-y-3"
              >
                {[
                  { value: "system", label: "System", desc: "Follow your device settings" },
                  { value: "dark", label: "Dark", desc: "Dark background with light text" },
                  { value: "light", label: "Light", desc: "Light background with dark text" },
                ].map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={option.value} id={`theme-${option.value}`} className="mt-1" />
                    <Label htmlFor={`theme-${option.value}`} className="cursor-pointer">
                      <span className="text-foreground font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={saving || !newPassword} size="sm">
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
