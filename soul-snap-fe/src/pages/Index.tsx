import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Gallery } from "@/components/gallery"
import { LoginPage } from "@/components/login-page"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gallery-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return user ? <Gallery /> : <LoginPage />
}

const Index = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="soulsnap-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default Index;
