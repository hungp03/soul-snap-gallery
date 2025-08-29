import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Gallery } from "@/components/gallery"
import { Skeleton } from "@/components/ui/skeleton"
import { LoginPage } from "@/components/login-page"

function AppContent() {
  const { user, isLoading } = useAuth()



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gallery-bg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
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
