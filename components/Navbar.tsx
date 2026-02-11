import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Lock, LogOut, Home, School, WifiOff } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, onLogout }) => {
  const isFormActive = currentView === 'form';
  const isAdminActive = currentView === 'admin' || currentView === 'login';
  const isLandingActive = currentView === 'landing';
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reusable Nav Button Component with Animation
  const NavButton = ({ 
    active, 
    onClick, 
    icon: Icon, 
    label 
  }: { 
    active: boolean; 
    onClick: () => void; 
    icon: any; 
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 transform
        ${active 
          ? 'bg-slate-800 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-105 ring-1 ring-yellow-500/50' 
          : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-105'
        }
      `}
    >
      <Icon className={`w-4 h-4 mr-2 ${active ? 'text-yellow-400' : 'text-slate-500'}`} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label === 'UTAMA' ? 'HOME' : label}</span>
      
      {active && (
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-yellow-500 rounded-full blur-[1px]"></span>
      )}
    </button>
  );

  return (
    <>
      {/* Offline Banner - High Visibility */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-[10px] sm:text-xs font-bold text-center py-2 animate-pulse shadow-lg sticky top-0 z-[60] tracking-widest uppercase">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>TIADA SAMBUNGAN INTERNET - MOD LUAR TALIAN (OFFLINE)</span>
          </div>
        </div>
      )}

      <nav className={`bg-slate-950/95 backdrop-blur-md border-b border-white/5 sticky ${!isOnline ? 'top-[32px]' : 'top-0'} z-50 shadow-2xl transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Left: Logo */}
            <div 
              className="flex items-center cursor-pointer group select-none" 
              onClick={() => onChangeView('landing')}
            >
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] group-hover:scale-110 transition-all duration-300">
                  <School className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bebas text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 group-hover:text-yellow-300 transition-colors">I-TRACK SYSTEM</span>
                  <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase hidden sm:block group-hover:text-slate-400 transition-colors">SK SG. SIAN MERADONG</span>
                </div>
              </div>
            </div>
            
            {/* Right: Navigation Items */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              <NavButton 
                active={isLandingActive} 
                onClick={() => onChangeView('landing')} 
                icon={Home} 
                label="UTAMA" 
              />

              <NavButton 
                active={isFormActive} 
                onClick={() => onChangeView('form')} 
                icon={FileText} 
                label="BORANG" 
              />

              <button
                onClick={() => onChangeView('admin')}
                className={`
                  relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 transform
                  ${isAdminActive 
                    ? 'bg-slate-800 text-white shadow-lg scale-105 ring-1 ring-slate-600' 
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-105'
                  }
                `}
              >
                {isAdminActive && currentView === 'admin' ? (
                  <LayoutDashboard className="w-4 h-4 mr-2 text-yellow-500" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">ADMIN</span>
                <span className="sm:hidden">ADMIN</span>
                
                {isAdminActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-slate-500 rounded-full blur-[1px]"></span>
                )}
              </button>

              {/* Logout Button (Only if Admin view is active) */}
              {currentView === 'admin' && (
                <div className="pl-2 border-l border-slate-800 ml-2">
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all hover:scale-110 hover:rotate-90"
                    title="Log Keluar"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};