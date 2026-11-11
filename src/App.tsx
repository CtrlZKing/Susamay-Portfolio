import { useState, useEffect } from 'react';
import { PublicPortfolio } from './pages/PublicPortfolio.tsx';
import { AdminLogin } from './pages/AdminLogin.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { authStorage } from './lib/api.ts';

export default function App() {
  const [route, setRoute] = useState<'public' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path.startsWith('/admin') || hash === '#admin' ? 'admin' : 'public';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authStorage.isAuthenticated();
  });

  // Listen to browser navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash === '#admin') {
        setRoute('admin');
      } else {
        setRoute('public');
      }
      setIsAuthenticated(authStorage.isAuthenticated());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setRoute('admin');
    setIsAuthenticated(authStorage.isAuthenticated());
  };

  const navigateToPublic = () => {
    window.location.hash = '';
    setRoute('public');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setRoute('admin');
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setIsAuthenticated(false);
  };

  // Route: Admin
  if (route === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onBackToSite={navigateToPublic}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={handleLogout}
        onViewSite={navigateToPublic}
      />
    );
  }

  // Route: Public Portfolio
  return <PublicPortfolio onNavigateToAdmin={navigateToAdmin} />;
}
