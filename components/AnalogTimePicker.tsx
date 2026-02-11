import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface AnalogTimePickerProps {
  label: string;
  value: string; // HH:mm format (24h)
  onChange: (value: string) => void;
  required?: boolean;
}

export const AnalogTimePicker: React.FC<AnalogTimePickerProps> = ({ label, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hours: 12, minutes: 0, period: 'AM' };
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hours = h % 12 || 12;
    return { hours, minutes: m, period };
  };

  const { hours, minutes, period } = parseTime(value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMode('hour');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHourClick = (h: number) => {
    let newHour24 = h;
    if (period === 'PM' && h !== 12) newHour24 += 12;
    if (period === 'AM' && h === 12) newHour24 = 0;
    
    updateTime(newHour24, minutes);
    setMode('minute');
  };

  const handleMinuteClick = (m: number) => {
    let h24 = hours;
    if (period === 'PM' && hours !== 12) h24 += 12;
    if (period === 'AM' && hours === 12) h24 = 0;

    updateTime(h24, m);
  };

  const togglePeriod = () => {
    let h24 = hours;
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    
    if (newPeriod === 'PM' && hours !== 12) h24 += 12;
    if (newPeriod === 'AM' && hours === 12) h24 = 0;
    if (newPeriod === 'PM' && hours === 12) h24 = 12; // 12 PM is 12:00
    if (newPeriod === 'AM' && hours !== 12) h24 = hours; // 1 AM is 01:00

    updateTime(h24, minutes);
  };

  const updateTime = (h: number, m: number) => {
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  // Clock visual helpers
  const CLOCK_SIZE = 200;
  const CENTER = CLOCK_SIZE / 2;
  const RADIUS = CLOCK_SIZE / 2 - 30;

  const getPosition = (index: number, total: number) => {
    const angle = (index * 360) / total;
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      left: CENTER + RADIUS * Math.cos(rad),
      top: CENTER + RADIUS * Math.sin(rad),
    };
  };

  const clockNumbers = mode === 'hour' 
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const currentSelection = mode === 'hour' ? hours : minutes;
  
  // Calculate hand rotation
  let rotationDegrees = 0;
  if (mode === 'hour') {
    rotationDegrees = (hours % 12) * 30; // 360 / 12 = 30
  } else {
    rotationDegrees = minutes * 6; // 360 / 60 = 6
  }

  return (
    <div className="relative space-y-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 transition-colors h-full" ref={containerRef}>
      <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wide flex items-center">
         <Clock className="w-4 h-4 mr-2 text-yellow-500" /> {label}
      </label>
      
      {/* Trigger Input */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-1 bg-transparent border-b border-slate-200 flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-yellow-500' : 'hover:border-slate-400'}`}
      >
        <span className={`font-mono text-lg font-bold ${!value ? 'text-slate-300' : 'text-slate-800'}`}>
          {value ? `${hours}:${minutes.toString().padStart(2, '0')} ${period}` : '--:-- --'}
        </span>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 bg-slate-900 rounded-xl shadow-2xl border border-yellow-600/30 p-4 w-[280px] animate-fade-in origin-top-left">
          
          {/* Digital Display Header */}
          <div className="flex items-center justify-center gap-2 mb-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
            <button 
              type="button"
              onClick={() => setMode('hour')}
              className={`text-2xl font-bold p-1 rounded font-mono ${mode === 'hour' ? 'text-yellow-400 bg-slate-700' : 'text-slate-500'}`}
            >
              {hours.toString().padStart(2, '0')}
            </button>
            <span className="text-2xl font-bold text-slate-600">:</span>
            <button 
              type="button"
              onClick={() => setMode('minute')}
              className={`text-2xl font-bold p-1 rounded font-mono ${mode === 'minute' ? 'text-yellow-400 bg-slate-700' : 'text-slate-500'}`}
            >
              {minutes.toString().padStart(2, '0')}
            </button>
            
            <button 
              type="button"
              onClick={togglePeriod}
              className="ml-2 px-2 py-1 bg-yellow-500 rounded text-sm font-bold text-slate-900 hover:bg-yellow-400 transition-colors"
            >
              {period}
            </button>
          </div>

          {/* Clock Face */}
          <div className="relative mx-auto bg-slate-800 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-slate-700" style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}>
            
            {/* Center Dot */}
            <div className="absolute bg-yellow-500 w-3 h-3 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>

            {/* Clock Hand */}
            <div 
              className="absolute bg-yellow-200/50 w-1 rounded-full top-1/2 left-1/2 origin-top z-10 transition-transform duration-300 ease-out"
              style={{ 
                height: RADIUS, 
                transform: `translate(-50%, -100%) rotate(${rotationDegrees}deg) scaleY(-1)`
              }}
            >
               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-yellow-500 w-8 h-8 rounded-full -mb-4 opacity-30"></div>
            </div>

            {/* Numbers */}
            {clockNumbers.map((num, i) => {
              const posIdx = i; 
              const { left, top } = getPosition(posIdx, 12);
              const isSelected = currentSelection === num;
              const displayNum = mode === 'hour' ? num : num.toString().padStart(2, '0');

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => mode === 'hour' ? handleHourClick(num) : handleMinuteClick(num)}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-20 transform -translate-x-1/2 -translate-y-1/2
                    ${isSelected 
                      ? 'bg-yellow-500 text-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.6)] scale-110' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-yellow-400'
                    }`}
                  style={{ left, top }}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center text-xs text-slate-500 uppercase tracking-wider">
            {mode === 'hour' ? 'Pilih Jam' : 'Pilih Minit'}
          </div>
          
          <button 
             type="button"
             onClick={() => setIsOpen(false)}
             className="mt-2 w-full py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold rounded-lg text-sm hover:from-yellow-400 hover:to-yellow-500 shadow-lg"
          >
            SELESAI
          </button>
        </div>
      )}
    </div>
  );
};