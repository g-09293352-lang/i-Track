import React, { useState } from 'react';
import { Send, CheckCircle, User, Calendar, BookOpen, Users, UserPlus, FileText, ClipboardList, School, Clock } from 'lucide-react';
import { TeacherRecord } from '../types';
import { CLASS_LIST, SUBJECT_LIST, TEACHER_LIST, RELIEF_REASONS } from '../constants';
import { AnalogTimePicker } from './AnalogTimePicker';

interface TeacherFormProps {
  onSubmit: (record: Omit<TeacherRecord, 'id' | 'timestamp'>) => void;
}

type FormMode = 'subject' | 'relief';

export const TeacherForm: React.FC<TeacherFormProps> = ({ onSubmit }) => {
  const [mode, setMode] = useState<FormMode>('subject');
  
  const [formData, setFormData] = useState({
    teacherName: '',
    originalTeacherName: '',
    reliefReason: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    className: '',
    subject: '',
    startTime: '',
    endTime: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherName || !formData.className || !formData.subject || !formData.startTime || !formData.endTime) {
      return;
    }

    if (mode === 'relief') {
        if (!formData.originalTeacherName) return;
        if (!formData.reliefReason) {
            alert("Sila pilih sebab tidak hadir.");
            return;
        }
    }
    
    const submissionData: Omit<TeacherRecord, 'id' | 'timestamp'> = {
      date: formData.date,
      teacherName: formData.teacherName,
      className: formData.className,
      subject: formData.subject,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: mode === 'subject' ? 'Guru Matapelajaran' : 'Guru Ganti',
      originalTeacherName: mode === 'relief' ? formData.originalTeacherName : undefined,
      reliefReason: mode === 'relief' ? formData.reliefReason : undefined,
      notes: formData.notes
    };

    onSubmit(submissionData);
    setSubmitted(true);
    
    // Reset form after delay
    setTimeout(() => {
      setSubmitted(false);
      setFormData(prev => ({
        ...prev,
        teacherName: '',
        originalTeacherName: '',
        reliefReason: '',
        notes: '',
        subject: '',
        className: '',
        startTime: '',
        endTime: ''
      }));
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 py-10 px-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-yellow-600/30 overflow-hidden">
        
        {/* Luxury Header */}
        <div className="bg-slate-950 px-6 py-10 text-center relative overflow-hidden border-b-4 border-yellow-500">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(234,179,8,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          
          <div className="relative z-10">
            <h1 className="font-sunborn text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest drop-shadow-sm mb-2">
              Borang Keberadaan Guru
            </h1>
            <p className="text-slate-400 font-sans text-sm tracking-widest uppercase">
              Sistem Rekod Rasmi • SK Sg. Sian Meradong
            </p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-slate-900 p-1">
          <button
            onClick={() => setMode('subject')}
            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base tracking-wider transition-all duration-300 relative overflow-hidden ${
              mode === 'subject' 
                ? 'text-slate-950 bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-lg' 
                : 'text-slate-500 hover:text-yellow-200 hover:bg-slate-800'
            }`}
          >
            GURU MATAPELAJARAN
          </button>
          <button
            onClick={() => setMode('relief')}
            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base tracking-wider transition-all duration-300 relative overflow-hidden ${
              mode === 'relief' 
                ? 'text-white bg-gradient-to-r from-orange-700 to-red-900 shadow-lg' 
                : 'text-slate-500 hover:text-orange-200 hover:bg-slate-800'
            }`}
          >
            GURU GANTI (RELIEF)
          </button>
        </div>

        <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-50 to-slate-100">
          {submitted ? (
            <div className="bg-white border-2 border-green-500/30 rounded-2xl p-12 text-center animate-fade-in-up flex flex-col items-center justify-center shadow-2xl">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <CheckCircle className="h-14 w-14 text-green-600" />
              </div>
              <h3 className="text-3xl font-sunborn font-bold text-slate-900 uppercase tracking-wide mb-2">Rekod Berjaya</h3>
              <p className="text-slate-500">Maklumat anda telah disimpan ke dalam sistem.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Teacher Info Section */}
              <div className={`p-6 rounded-xl border-l-4 shadow-sm transition-all duration-300 ${
                  mode === 'subject' 
                  ? 'bg-white border-yellow-500 shadow-yellow-500/5' 
                  : 'bg-white border-orange-600 shadow-orange-600/5'
              }`}>
                <h3 className={`font-bold mb-6 flex items-center text-lg uppercase tracking-wider ${
                    mode === 'subject' ? 'text-slate-900' : 'text-orange-900'
                }`}>
                  <div className={`p-2 rounded-lg mr-3 ${mode === 'subject' ? 'bg-slate-900 text-yellow-500' : 'bg-orange-100 text-orange-700'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  {mode === 'subject' ? 'Maklumat Guru' : 'Maklumat Guru Ganti'}
                </h3>
                
                <div className="space-y-6">
                  {/* Current Teacher Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">
                      {mode === 'subject' ? 'Nama Anda' : 'Nama Guru Ganti'}
                    </label>
                    <div className="relative group">
                      <input
                        list="teachers"
                        type="text"
                        name="teacherName"
                        required
                        placeholder="Sila pilih nama anda..."
                        value={formData.teacherName}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:ring-0 focus:border-yellow-500 text-slate-900 font-medium transition-all outline-none group-hover:border-slate-300"
                      />
                      <datalist id="teachers">
                        {TEACHER_LIST.map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Relief Specific Fields */}
                  {mode === 'relief' && (
                    <div className="animate-fade-in space-y-6 pt-4 border-t border-dashed border-orange-200">
                      {/* Original Teacher */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-orange-700 mb-2 block uppercase tracking-wide flex items-center">
                                <UserPlus className="w-3 h-3 mr-1" />
                                Menggantikan Guru
                            </label>
                            <input
                                list="teachers"
                                type="text"
                                name="originalTeacherName"
                                required={mode === 'relief'}
                                placeholder="Nama guru tidak hadir"
                                value={formData.originalTeacherName}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-orange-50/50 border-2 border-orange-100 rounded-lg focus:ring-0 focus:border-orange-500 text-slate-900 transition-all outline-none"
                            />
                        </div>

                        {/* Reason for Absence */}
                        <div>
                            <label className="text-xs font-bold text-orange-700 mb-2 block uppercase tracking-wide flex items-center">
                                <ClipboardList className="w-3 h-3 mr-1" />
                                Sebab Ketidakhadiran
                            </label>
                            <select
                                name="reliefReason"
                                required={mode === 'relief'}
                                value={formData.reliefReason}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-orange-50/50 border-2 border-orange-100 rounded-lg focus:ring-0 focus:border-orange-500 text-slate-900 transition-all outline-none cursor-pointer"
                            >
                                <option value="">Sila Pilih Sebab...</option>
                                {RELIEF_REASONS.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 transition-colors">
                  <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wide flex items-center">
                     <Calendar className="w-4 h-4 mr-2 text-yellow-500" /> Tarikh
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-transparent font-mono text-lg font-bold text-slate-800 outline-none border-b border-slate-200 focus:border-yellow-500 transition-all pb-2"
                  />
                </div>
                
                <AnalogTimePicker 
                  label="Masa Mula" 
                  value={formData.startTime} 
                  onChange={(val) => handleTimeChange('startTime', val)} 
                  required
                />

                <AnalogTimePicker 
                  label="Masa Tamat" 
                  value={formData.endTime} 
                  onChange={(val) => handleTimeChange('endTime', val)} 
                  required
                />
              </div>

              {/* Class & Subject Info */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white shadow-xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-yellow-500 uppercase tracking-wide flex items-center">
                        <Users className="w-4 h-4 mr-2" /> Kelas
                      </label>
                      <select
                        name="className"
                        required
                        value={formData.className}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-white transition-all outline-none cursor-pointer hover:bg-slate-700"
                      >
                        <option value="" className="text-slate-400">Pilih Kelas</option>
                        {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-yellow-500 uppercase tracking-wide flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" /> Subjek
                      </label>
                      <input 
                        list="subjects" 
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Pilih Subjek..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-white transition-all outline-none placeholder-slate-500"
                      />
                      <datalist id="subjects">
                        {SUBJECT_LIST.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                 </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center pl-1">
                    <FileText className="w-4 h-4 mr-2" /> Catatan Tambahan
                 </label>
                 <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tulis catatan di sini (jika ada)..."
                    rows={2}
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all outline-none resize-none"
                 />
              </div>

              <div className="pt-6 pb-2">
                <button
                  type="submit"
                  className={`w-full group flex items-center justify-center space-x-3 text-slate-950 font-black tracking-widest py-4 px-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                    mode === 'subject' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:shadow-yellow-500/30' 
                      : 'bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-orange-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
                  <Send className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">HANTAR REKOD {mode === 'relief' ? 'RELIEF' : 'PENGAJARAN'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};