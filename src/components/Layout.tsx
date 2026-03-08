import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import DarkModeToggle from '@/components/DarkModeToggle';
import { LogOut, User, Shield, Briefcase } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    // Note: signOut now handles redirect via window.location.replace
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'hr':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'hr':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-heading font-bold text-foreground">HR Portal</h1>
            {role && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass()}`}>
                {getRoleIcon()}
                {role === 'hr' ? 'HR' : role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
