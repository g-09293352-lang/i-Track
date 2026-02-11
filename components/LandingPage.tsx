import React from 'react';
import { ShieldCheck, Activity, BarChart3, ArrowRight, Lock, BookOpen, School } from 'lucide-react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* Background Effects (Wow Factor) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        
        {/* PREMIUM BATIK MOTIF OVERLAY (BUNGA RAYA STYLE) */}
        <div 
            className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-overlay" 
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23eab308' fill-opacity='1'%3E%3Cpath d='M40 40c6-10 18-10 22-2s-6 20-22 2z'/%3E%3Cpath d='M40 40c10 6 16 18 8 24s-20-6-8-24z'/%3E%3Cpath d='M40 40c-6 10-18 10-22 2s6-20 22-2z'/%3E%3Cpath d='M40 40c-10-6-16-18-8-24s20 6 8 24z'/%3E%3Cpath d='M40 40c0-12 8-16 12-12s-4 16-12 12z' opacity='0.7'/%3E%3Ccircle cx='40' cy='40' r='5'/%3E%3Cpath d='M0 0c10 0 15 10 5 15C-5 20 0 0 0 0zM80 80c-10 0-15-10-5-15 10-5 5 15 5 15z' opacity='0.6'/%3E%3Cpath d='M80 0c-10 0-15 10-5 15 10 5 5-20 5-15zM0 80c10 0 15-10 5-15-10-5-5 15-5 15z' opacity='0.6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px'
            }}
        ></div>

        {/* Yellow ambient glow centered top */}
        <div className="absolute top-[-20%] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px]"></div>
        {/* Bottom right subtle glow */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
        {/* Grid texture for technical feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {/* Navbar - Minimal */}
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
           <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
             <School className="w-5 h-5 text-slate-950" />
           </div>
           <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">I-TRACK</span>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 text-center max-w-6xl mx-auto w-full -mt-16">
        
        {/* 1. TAJUK SEKOLAH (Top Hierarchy) */}
        <div className="mb-6 animate-fade-in-down flex flex-col items-center z-20">
            {/* Font changed to 'font-sunborn' (Cinzel) and size reduced to medium (text-2xl/4xl) */}
            <h1 className="font-sunborn text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-widest leading-relaxed uppercase drop-shadow-2xl border-b-2 border-yellow-500/50 pb-4 px-8">
              SEKOLAH KEBANGSAAN <br className="md:hidden"/>SG. SIAN MERADONG
            </h1>
        </div>

        {/* 2. I-TRACK TITLE (Centerpiece) - Resized Smaller */}
        <div className="mb-6 relative group cursor-default z-20">
            {/* Glow effect behind text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-yellow-500/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
            {/* Changed to font-bebas and adjusted size (Bebas Neue is condensed so it needs to be slightly larger to match previous impact) */}
            <h2 className="font-bebas text-7xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-wider relative z-10 drop-shadow-2xl mt-4">
              I-TRACK
            </h2>
        </div>

        {/* 3. DEFINITION & SUBTITLE - Cursive Font */}
        <div className="max-w-4xl mx-auto mb-16 z-20 bg-slate-900/40 backdrop-blur-sm px-8 py-4 rounded-full border border-white/5 shadow-xl">
            {/* Added font-script and increased size for readability */}
            <p className="font-script text-2xl sm:text-3xl md:text-4xl text-slate-300 leading-relaxed">
              <span className="text-yellow-500 font-bold">I</span>ntelligent&nbsp; 
              <span className="text-yellow-500 font-bold">T</span>racking&nbsp; 
              <span className="text-yellow-500 font-bold">R</span>ecord&nbsp; 
              <span className="text-yellow-500 font-bold">A</span>ttendance&nbsp; 
              <span className="text-yellow-500 font-bold">C</span>ontrol&nbsp; 
              <span className="text-yellow-500 font-bold">K</span>ey System
            </p>
        </div>

        {/* 4. BUTTONS (Action Area) */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center relative z-20">
          
          {/* Main Button: Masuk */}
          <button 
            onClick={() => onNavigate('form')}
            className="group relative px-8 py-5 bg-yellow-500 text-slate-950 text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:bg-yellow-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
            <span className="relative flex items-center justify-center gap-3">
              <BookOpen className="w-6 h-6" />
              MASUK
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Secondary Button: Admin */}
          <button 
            onClick={() => onNavigate('login')}
            className="group px-8 py-5 bg-transparent border-2 border-slate-800 text-slate-400 text-lg font-bold rounded-xl hover:bg-slate-900 hover:text-yellow-500 hover:border-yellow-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-3"
          >
            <Lock className="w-5 h-5 group-hover:text-yellow-500 transition-colors" />
            ADMIN
          </button>

        </div>

      </main>

      {/* Footer Features (Formal Grid) */}
      <footer className="relative z-10 w-full py-8 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
           
           <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors border border-slate-800/50 hover:border-yellow-900/50 group">
              <div className="p-3 bg-slate-950 rounded-lg shadow-inner group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all">
                <Activity className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-slate-200 font-bold text-sm">Rekod Masa Nyata</h3>
                <p className="text-slate-500 text-xs mt-1">Sistem kehadiran berpusat yang pantas.</p>
              </div>
           </div>

           <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors border border-slate-800/50 hover:border-yellow-900/50 group">
              <div className="p-3 bg-slate-950 rounded-lg shadow-inner group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all">
                <BarChart3 className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-slate-200 font-bold text-sm">Analisis Pintar</h3>
                <p className="text-slate-500 text-xs mt-1">Visualisasi data statistik secara automatik.</p>
              </div>
           </div>

           <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors border border-slate-800/50 hover:border-yellow-900/50 group">
              <div className="p-3 bg-slate-950 rounded-lg shadow-inner group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all">
                <ShieldCheck className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
              </div>
              <div>
                <h3 className="text-slate-200 font-bold text-sm">Sekuriti Data</h3>
                <p className="text-slate-500 text-xs mt-1">Penyimpanan rekod selamat dan terjamin.</p>
              </div>
           </div>

        </div>
        <div className="text-center mt-8 text-slate-700 text-[10px] font-mono uppercase">
           Hak Cipta Terpelihara &copy; {new Date().getFullYear()} SK Sg. Sian Meradong
        </div>
      </footer>

    </div>
  );
};