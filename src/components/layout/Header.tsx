import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Braces, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import UserMenu from '../auth/UserMenu';

const Header: React.FC = () => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Braces className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <Link to="/" className="text-xl font-semibold">
            AI Prompt Testing
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/" active={location.pathname === '/'}>
            Playground
          </NavLink>
          <NavLink to="/saved" active={location.pathname === '/saved'}>
            Saved Prompts
          </NavLink>
          <NavLink to="/settings" active={location.pathname === '/settings'}>
            API Keys
          </NavLink>
        </nav>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link 
              to="/login" 
              className="btn-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-3 h-12">
          <MobileNavLink to="/" active={location.pathname === '/'}>
            Playground
          </MobileNavLink>
          <MobileNavLink to="/saved" active={location.pathname === '/saved'}>
            Saved
          </MobileNavLink>
          <MobileNavLink to="/settings" active={location.pathname === '/settings'}>
            API Keys
          </MobileNavLink>
        </div>
      </nav>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`py-2 px-1 border-b-2 transition-colors ${
      active 
        ? 'text-primary-700 dark:text-primary-400 border-primary-600 dark:border-primary-500 font-medium' 
        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`flex items-center justify-center text-sm ${
      active 
        ? 'text-primary-700 dark:text-primary-400 font-medium' 
        : 'text-gray-600 dark:text-gray-400'
    }`}
  >
    {children}
  </Link>
);

export default Header;