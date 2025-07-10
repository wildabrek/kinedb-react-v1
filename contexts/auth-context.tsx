"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/api"
import { safeStorage } from "@/lib/utils/safeStorage"
import { toast } from "@/components/ui/use-toast"
import { ROLE_PERMISSIONS, type Role } from "@/constants/permissions"
import { useLanguage } from "@/contexts/language-context"
import { isInitialSetupComplete, loadLocalData } from "@/lib/local-data-manager"
import Cookies from 'js-cookie';

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 dakika

// DEĞİŞİKLİK 1: `login` fonksiyonunun dönüş tipi güncellendi.
// Artık başarılı olduğunda UserType objesi, başarısız olduğunda null döndürecek.
export interface AuthContextType {
  user: UserType | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserType | null>
  logout: () => void
  refreshSession: () => void
  isLoading: boolean
  error: any
  isInitialized: boolean
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}

export interface UserType {
  user_id: number
  name: string
  email: string
  role: Role
  school_id: number
  permissions: string[]
  lastLogin: string
  school_status?: string
}

interface LoginApiResponse {
    user_id: number;
    username: string;
    email: string;
    role: Role;
    school_id: number;
    status: string;
    token: string;
}

const AuthContext = createContext<AuthContextType | null>(null)
let sessionTimeoutId: NodeJS.Timeout | null = null

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { translate: t } = useLanguage()

  const syncLocalDataWithServer = async (schoolId: number) => { /* ... */ };

  // DEĞİŞİKLİK 2: Fonksiyonun implementasyonu yeni dönüş tipine göre güncellendi.
  const login = async (email: string, password: string, rememberMe = false): Promise<UserType | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result: LoginApiResponse = await loginUser(email, password)

      if (!result || !result.token) {
        throw new Error("Invalid credentials or unexpected login error.")
      }

      const role = result.role as Role
      const userWithPermissions: UserType = {
        user_id: result.user_id,
        name: result.username,
        email: result.email,
        role,
        school_id: result.school_id,
        permissions: ROLE_PERMISSIONS[role] || [],
        lastLogin: new Date().toISOString(),
        school_status: result.status,
      }

      setUser(userWithPermissions)

      const expiry = new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : SESSION_TIMEOUT))
      safeStorage.setItem("auth", JSON.stringify({ user: userWithPermissions, expiry: expiry.toISOString() }))

      Cookies.set('sessionToken', result.token, {
        expires: rememberMe ? 7 : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      startSessionTimeout();
      toast({
        title: t("Login Successful"),
        description: `${t("Welcome back")}, ${userWithPermissions.name}`,
      });

      // `school_status` kontrolü burada kalabilir, ancak logout işlemi zaten yönlendirecektir.
      if (userWithPermissions?.school_status && userWithPermissions.school_status !== "Active") {
        setError("Your school is currently disabled. Please contact your administrator.")
        logout() // logout fonksiyonu kullanıcıyı login'e yönlendirir.
        return null; // Başarısızlık durumunu belirtmek için null döndür.
      }

      // İlk kurulum veya dashboard yönlendirmesi burada kalabilir.
      if (
        (userWithPermissions.role === "manager" || userWithPermissions.role === "teacher") &&
        !isInitialSetupComplete()
      ) {
        router.push("/initial-setup")
      } else {
        if (userWithPermissions.school_id) {
          await syncLocalDataWithServer(Number(userWithPermissions.school_id))
        }
        // Yönlendirmeyi login sayfası yapacağı için buradaki yönlendirme kaldırıldı.
      }

      return userWithPermissions; // Başarılı olduğunda 'kullanıcı objesini' döndür.

    } catch (err: any) {
      console.error("Login error caught in AuthContext:", err)
      return null; // Başarısız olduğunda 'null' döndür.
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    safeStorage.removeItem("auth")
    Cookies.remove('sessionToken');
    setUser(null)
    if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
    router.push("/login")
  }

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  const startSessionTimeout = () => { /* ... */ };
  const refreshSession = () => { /* ... */ };

  useEffect(() => {
    const authDataString = safeStorage.getItem("auth");
    const token = Cookies.get('sessionToken');

    if (authDataString && token) {
      try {
        const { user: storedUser, expiry } = JSON.parse(authDataString);
        if (new Date() < new Date(expiry)) {
          setUser(storedUser);
          startSessionTimeout();
        } else {
          logout();
        }
      } catch (e) {
        console.error("Failed to parse auth data from storage", e);
        logout();
      }
    }
    setIsInitialized(true);
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshSession,
        isLoading,
        error,
        isInitialized,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}