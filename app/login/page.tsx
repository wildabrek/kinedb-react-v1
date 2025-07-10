"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const { translate: t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrorKey, setLoginErrorKey] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await login(formData.email, formData.password, formData.rememberMe);

    if (success) {
      // school_status kontrolü
      if (user?.school_status && user.school_status !== "Active") {
        setLoginErrorKey("Your school is currently disabled. Please contact your administrator.");
        logout();  // Otomatik logout
        return;
      }

      router.push("/dashboard");
    } else {
      setLoginErrorKey("Invalid email or password");
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: "demo@example.com",
      password: "password",
      rememberMe: false,
    });
  };

  useEffect(() => {
    if (isInitialized && user) {
      router.push("/dashboard");
    }
  }, [isInitialized, user]);

  useEffect(() => {
    if (loginErrorKey) {
      toast({
        title: t("Login Failed"),
        description: t(loginErrorKey),
        variant: "destructive",
      });
      setLoginErrorKey(null);
    }
  }, [loginErrorKey, t, toast]);

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t("Sign In")}</CardTitle>
            <CardDescription className="text-center">
              {t("Enter your credentials to access your account")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("Password")}</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    {t("Forgot password?")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: checked === true,
                    }))
                  }
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  {t("Remember me for 7 days")}
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Signing in...")}
                  </>
                ) : (
                  t("Sign In")
                )}
              </Button>
            </form>
            <div className="mt-4" style={{ display: "none" }}>
              <Button variant="outline" className="w-full" onClick={fillDemoCredentials}>
                {t("Use Demo Credentials")}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm" style={{ display: "none" }}>
              {t("Don't have an account?")} {" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                {t("Create one")}
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                {t("Back to Landing Page")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
