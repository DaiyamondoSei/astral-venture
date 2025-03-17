
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';

const MainNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navigationLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Practice', path: '/practice' },
    { name: 'Journal', path: '/journal' },
    { name: 'Astral', path: '/astral' },
    { name: 'Chakras', path: '/chakras' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <nav className="bg-quantum-900/90 backdrop-blur-sm text-white py-4 sticky top-0 z-50 border-b border-quantum-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Quanex
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                  isActive(link.path) 
                    ? 'text-purple-400 border-b-2 border-purple-500' 
                    : 'text-quantum-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/profile" className="text-sm flex items-center space-x-1 hover:text-purple-400 transition-colors">
              <User size={18} />
              <span>{user?.email?.split('@')[0] || 'Profile'}</span>
            </Link>
            <button 
              onClick={() => logout()}
              className="text-sm flex items-center space-x-1 text-quantum-300 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-quantum-100 focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-quantum-800 rounded-lg">
            <div className="flex flex-col space-y-2 px-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 text-sm font-medium transition-colors ${
                    isActive(link.path) 
                      ? 'text-purple-400' 
                      : 'text-quantum-100 hover:text-purple-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-quantum-700 my-2 pt-2">
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-sm flex items-center space-x-2 hover:text-purple-400 transition-colors"
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="py-2 w-full text-left text-sm flex items-center space-x-2 text-quantum-300 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
