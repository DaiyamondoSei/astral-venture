
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, BookOpen, Moon, Compass, Activity } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';

const MainNavigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/chakras', label: 'Chakras', icon: Compass },
    { path: '/meditation', label: 'Meditation', icon: Activity },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/reflection', label: 'Reflection', icon: Moon },
    { path: '/profile', label: 'Profile', icon: User },
  ];
  
  return (
    <header className="bg-quantum-800/30 backdrop-blur-md border-b border-quantum-700/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-display text-white">Quanex</Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 transition-colors ${
                    isActive 
                      ? 'text-quantum-300' 
                      : 'text-quantum-400 hover:text-quantum-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-md bg-quantum-700 hover:bg-quantum-600 transition-colors text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-between overflow-x-auto mt-4 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  isActive 
                    ? 'text-quantum-300' 
                    : 'text-quantum-400 hover:text-quantum-200'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default MainNavigation;
