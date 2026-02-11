import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TeacherForm } from './components/TeacherForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { TeacherRecord, ViewState } from './types';

// Initial dummy data for demonstration if empty
const DUMMY_DATA: TeacherRecord[] = [
  { id: '1', date: '2023-10-24', teacherName: 'JULAIHEI @ JULAIHI BIN MAHDI', className: 'TAHUN 5', subject: 'SCIENCE', startTime: '08:00', endTime: '08:30', status: 'Guru Matapelajaran', timestamp: 1698105600000 },
  { id: '2', date: '2023-10-24', teacherName: 'HASIAH BINTI SALLEH', originalTeacherName: 'BEREMAS ANAK INGGIT', className: 'TAHUN 4', subject: 'MATHEMATICS', startTime: '09:00', endTime: '09:30', status: 'Guru Ganti', timestamp: 1698109200000 },
  { id: '3', date: '2023-10-24', teacherName: 'VOON CHUN WEI', originalTeacherName: 'YII CHIN SIEW', className: 'TAHUN 3', subject: 'SEJARAH', startTime: '10:30', endTime: '11:00', status: 'Guru Ganti', timestamp: 1698114600000 },
  { id: '4', date: '2023-10-25', teacherName: 'SYLVIA LEE MEI BAY', className: 'TAHUN 5', subject: 'ENGLISH', startTime: '07:30', endTime: '08:00', status: 'Guru Matapelajaran', timestamp: 1698192000000 },
  { id: '5', date: '2023-10-25', teacherName: 'BEREMAS ANAK INGGIT', originalTeacherName: 'JULAIHEI @ JULAIHI BIN MAHDI', className: 'TAHUN 5', subject: 'SCIENCE', startTime: '11:00', endTime: '11:30', status: 'Guru Ganti', timestamp: 1698204600000 },
  { id: '6', date: '2023-10-26', teacherName: 'JULAIHEI @ JULAIHI BIN MAHDI', originalTeacherName: 'VOON CHUN WEI', className: 'TAHUN 1', subject: 'PENDIDIKAN JASMANI', startTime: '08:00', endTime: '08:30', status: 'Guru Ganti', timestamp: 1698282000000 },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [records, setRecords] = useState<TeacherRecord[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('mmi_records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    } else {
      // Seed with dummy data for better first impression
      setRecords(DUMMY_DATA);
      localStorage.setItem('mmi_records', JSON.stringify(DUMMY_DATA));
    }
  }, []);

  const handleAddRecord = (newRecordData: Omit<TeacherRecord, 'id' | 'timestamp'>) => {
    const newRecord: TeacherRecord = {
      ...newRecordData,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem('mmi_records', JSON.stringify(updatedRecords));
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem('mmi_records', JSON.stringify(updatedRecords));
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      setCurrentView('admin');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
  };

  const handleChangeView = (view: ViewState) => {
    if (view === 'admin' && !isAuthenticated) {
      setCurrentView('login');
    } else {
      setCurrentView(view);
    }
  };

  const handleResetData = () => {
    setRecords([]);
    localStorage.removeItem('mmi_records');
  };

  if (currentView === 'landing') {
    return <LandingPage onNavigate={handleChangeView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar 
        currentView={currentView} 
        onChangeView={handleChangeView} 
        onLogout={handleLogout} 
      />
      
      <main className="pt-6">
        {currentView === 'form' && (
          <TeacherForm onSubmit={handleAddRecord} />
        )}

        {currentView === 'login' && (
          <AdminLogin onLogin={handleLogin} />
        )}

        {currentView === 'admin' && isAuthenticated && (
          <AdminDashboard 
            records={records} 
            onReset={handleResetData} 
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </main>
    </div>
  );
};

export default App;