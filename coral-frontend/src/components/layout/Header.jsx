import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
import { useCoral } from '../../context/CoralContext';

const headerNavItems = [
  { path: '/', label: 'Arena' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/roles', label: 'Roles' },
];

const Header = () => {
  const { dispatch } = useCoral();
  const navigate = useNavigate();
  const location = useLocation();

  // Arena tab is active for /, /arena routes
  const isActiveTab = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/arena';
    return location.pathname === path;
  };

  return (
    <header className="h-[72px] px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-10">
        <div 
          className="font-serif font-bold text-2xl text-coral-orange tracking-wide cursor-pointer" 
          onClick={() => navigate('/')}
        >
          C.O.R.A.L
        </div>
        <nav className="hidden md:flex space-x-8 text-coral-text-secondary text-sm">
          {headerNavItems.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`hover:text-coral-text-primary pb-1 transition-colors ${
                isActiveTab(path)
                  ? 'border-b-2 border-coral-orange font-medium text-coral-text-primary'
                  : ''
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-6">
        <Settings className="w-5 h-5 text-coral-text-secondary hover:text-coral-text-primary cursor-pointer" />
        <User className="w-5 h-5 text-coral-text-secondary hover:text-coral-text-primary cursor-pointer" />
        <button 
          onClick={() => { dispatch({ type: 'RESET_APP' }); navigate('/'); }}
          className="bg-coral-orange text-white px-5 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          New Debate
        </button>
      </div>
    </header>
  );
};

export default Header;

