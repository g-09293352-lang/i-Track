import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials as per requirement
    if (username === 'sksgsian' && password === 'yba6303') {
      onLogin(true);
    } else {
      setError('Username atau password salah.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-slate-950 relative overflow-hidden -mt-6">
      
       {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          
           {/* PREMIUM BATIK MOTIF OVERLAY (BUNGA RAYA STYLE) */}
            <div 
                className="absolute inset-0 opacity-[0.06] z-0 pointer-events-none mix-blend-overlay" 
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23eab308' fill-opacity='1'%3E%3Cpath d='M40 40c6-10 18-10 22-2s-6 20-22 2z'/%3E%3Cpath d='M40 40c10 6 16 18 8 24s-20-6-8-24z'/%3E%3Cpath d='M40 40c-6 10-18 10-22 2s6-20 22-2z'/%3E%3Cpath d='M40 40c-10-6-16-18-8-24s20 6 8 24z'/%3E%3Cpath d='M40 40c0-12 8-16 12-12s-4 16-12 12z' opacity='0.7'/%3E%3Ccircle cx='40' cy='40' r='5'/%3E%3Cpath d='M0 0c10 0 15 10 5 15C-5 20 0 0 0 0zM80 80c-10 0-15-10-5-15 10-5 5 15 5 15z' opacity='0.6'/%3E%3Cpath d='M80 0c-10 0-15 10-5 15 10 5 5-20 5-15zM0 80c10 0 15-10 5-15-10-5-5 15-5 15z' opacity='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                }}
            ></div>

          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-yellow-500/10 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sunborn tracking-wider">Admin Login</h2>
          <p className="text-slate-400 mt-2 text-sm">Sila log masuk untuk akses dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-slate-200 outline-none transition-all placeholder-slate-600"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-slate-200 outline-none transition-all placeholder-slate-600"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-500/20 transform hover:-translate-y-0.5"
          >
            LOG MASUK SISTEM <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};