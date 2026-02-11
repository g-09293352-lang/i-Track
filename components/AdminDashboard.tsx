import React, { useState, useMemo } from 'react';
import { Users, Trash2, Calendar, Clock, Filter, AlertTriangle, BarChart3, ArrowRight, X, FileDown, FileText, Info, CheckCircle2, XCircle, PieChart, ClipboardList } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TeacherRecord } from '../types';
import { CLASS_LIST } from '../constants';

interface AdminDashboardProps {
  records: TeacherRecord[];
  onReset: () => void;
  onDeleteRecord: (id: string) => void;
}

// Time mapping for display and logic
const TIME_SLOTS = [
  { display: '7.30-8.00', value: '07:30' },
  { display: '8.00-8.30', value: '08:00' },
  { display: '8.30-9.00', value: '08:30' },
  { display: '9.00-9.30', value: '09:00' },
  { display: '9.30-10.00', value: '09:30' },
  { display: '10.00-10.20', value: '10:00', type: 'REHAT' },
  { display: '10.20-10.50', value: '10:20' },
  { display: '10.50-11.20', value: '10:50' },
  { display: '11.20-11.50', value: '11:20' },
  { display: '11.50-12.20', value: '11:50' },
  { display: '12.20-12.50', value: '12:20' },
  { display: '12.50-1.20', value: '12:50' },
  { display: '1.20-1.50', value: '13:20' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ records, onReset, onDeleteRecord }) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State for Report Generation
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');

  // Helper to get Day Name from Date String
  const getDayFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = ['AHAD', 'ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU'];
    return days[dayIndex] || 'ISNIN';
  };

  const currentDay = getDayFromDate(selectedDateFilter);

  // Helper to determine if a slot should be blacked out (End of school)
  const isSlotBlackedOut = (className: string, day: string, timeValue: string) => {
    const [h, m] = timeValue.split(':').map(Number);
    const timeNum = h + m / 60;

    const isLowerPrimary = ['TAHUN 1', 'TAHUN 2', 'TAHUN 3'].includes(className);
    const isUpperPrimary = ['TAHUN 4', 'TAHUN 5', 'TAHUN 6'].includes(className);

    // Time Thresholds (Start time of the blackout slot)
    const T_11_20 = 11 + 20/60; // 11.20 AM
    const T_12_20 = 12 + 20/60; // 12.20 PM
    const T_13_20 = 13 + 20/60; // 1.20 PM

    // Epsilon for float comparison safety
    const epsilon = 0.001;

    if (isLowerPrimary) {
      // TAHUN 1, 2, 3
      if (['ISNIN', 'SELASA', 'RABU'].includes(day)) {
        // Tamat pada kotak 1.20-1.50 (Blackout starts at 1.20)
        if (timeNum >= T_13_20 - epsilon) return true;
      } else if (day === 'KHAMIS') {
        // Habis pada pukul 12.20-12.50 dan seterusnya (Blackout starts at 12.20)
        if (timeNum >= T_12_20 - epsilon) return true;
      } else if (day === 'JUMAAT') {
        // Habis pada pukul 11.20-11.50 dan seterusnya (Blackout starts at 11.20)
        if (timeNum >= T_11_20 - epsilon) return true;
      }
    }

    if (isUpperPrimary) {
      // TAHUN 4, 5, 6
      if (day === 'ISNIN') {
        // Tiada kotak perlu dihitamkan
        return false;
      } else if (['SELASA', 'RABU', 'KHAMIS'].includes(day)) {
        // Tamat pada kotak 1.20-1.50 (Blackout starts at 1.20)
        if (timeNum >= T_13_20 - epsilon) return true;
      } else if (day === 'JUMAAT') {
        // Tamat pada kotak 11.20-11.50 (Blackout starts at 11.20)
        if (timeNum >= T_11_20 - epsilon) return true;
      }
    }

    return false;
  };

  // Filter records for the selected date (to show actual data on the grid)
  const todaysRecords = useMemo(() => {
    return records.filter(r => r.date === selectedDateFilter);
  }, [records, selectedDateFilter]);

  // Sort today's records for the list view
  const sortedTodaysRecords = useMemo(() => {
    return [...todaysRecords].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [todaysRecords]);

  // Logic for Class Analysis (Daily View)
  const dailyClassAnalysis = useMemo(() => {
    return CLASS_LIST.map(className => {
        const classRecords = todaysRecords.filter(r => r.className === className);
        const total = classRecords.length;
        const reliefCount = classRecords.filter(r => r.status === 'Guru Ganti').length;
        const subjectCount = total - reliefCount;

        return {
            className,
            total,
            reliefCount,
            subjectCount,
            reliefPercentage: total > 0 ? Math.round((reliefCount / total) * 100) : 0,
            subjectPercentage: total > 0 ? Math.round((subjectCount / total) * 100) : 0
        };
    });
  }, [todaysRecords]);

  // Logic for Overall Stats (Daily View)
  const dailyOverallStats = useMemo(() => {
      const total = todaysRecords.length;
      const reliefCount = todaysRecords.filter(r => r.status === 'Guru Ganti').length;
      const subjectCount = total - reliefCount;
      return {
          total,
          reliefCount,
          subjectCount,
          reliefPercentage: total > 0 ? ((reliefCount / total) * 100).toFixed(1) : '0',
          subjectPercentage: total > 0 ? ((subjectCount / total) * 100).toFixed(1) : '0'
      };
  }, [todaysRecords]);

  // Logic for Relief Grouping (Group by Original Teacher) for the daily view
  const groupedReliefs = useMemo(() => {
      const reliefRecords = todaysRecords.filter(r => r.status === 'Guru Ganti');
      const groups: Record<string, TeacherRecord[]> = {};

      reliefRecords.forEach(record => {
          const original = record.originalTeacherName || 'Tidak Diketahui';
          if (!groups[original]) {
              groups[original] = [];
          }
          groups[original].push(record);
      });

      const sortedKeys = Object.keys(groups).sort();
      sortedKeys.forEach(key => {
          groups[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      return { keys: sortedKeys, groups };
  }, [todaysRecords]);


  // Helper to find teacher in a specific slot
  // CHANGED: Now returns an array of teachers to support multiple entries per slot
  const getTeachersInSlot = (className: string, timeValue: string) => {
    return todaysRecords.filter(r => {
      if (r.className !== className) return false;
      return r.startTime <= timeValue && r.endTime > timeValue;
    });
  };

  // --- PDF GENERATION LOGIC ---
  const handleGeneratePDF = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Sila pilih Tarikh Mula dan Tarikh Tamat.");
      return;
    }

    // 1. Filter records by date range
    const rangeRecords = records.filter(r => 
       r.date >= reportStartDate && r.date <= reportEndDate
    );

    if (rangeRecords.length === 0) {
      alert("Tiada rekod dijumpai dalam julat tarikh ini.");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

    // --- HEADER ---
    doc.setFontSize(18);
    doc.text('Laporan Analisis Keberadaan Guru - MMI', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tempoh Laporan: ${reportStartDate} hingga ${reportEndDate}`, 14, 28);
    doc.text(`Dijana pada: ${new Date().toLocaleDateString()}`, 14, 34);

    // --- SECTION 1: RINGKASAN STATISTIK (ATTENDANCE PERCENTAGE) ---
    const totalRec = rangeRecords.length;
    const reliefRec = rangeRecords.filter(r => r.status === 'Guru Ganti').length;
    const subjectRec = totalRec - reliefRec;
    const subPct = totalRec > 0 ? ((subjectRec / totalRec) * 100).toFixed(1) : '0';
    const relPct = totalRec > 0 ? ((reliefRec / totalRec) * 100).toFixed(1) : '0';

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Ringkasan Peratusan Kehadiran (Sesi Pengajaran)', 14, 45);

    autoTable(doc, {
        startY: 50,
        head: [['Kategori', 'Jumlah Sesi', 'Peratusan (%)']],
        body: [
            ['Hadir (Guru Matapelajaran)', subjectRec, `${subPct}%`],
            ['Tidak Hadir (Diganti oleh Guru Ganti)', reliefRec, `${relPct}%`],
            ['JUMLAH KESELURUHAN', totalRec, '100%']
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // Blue
        styles: { fontSize: 11, cellPadding: 5 }
    });

    // --- SECTION 2: ANALISIS MENGIKUT KELAS ---
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('2. Analisis Terperinci Mengikut Kelas', 14, finalY + 15);

    const classStats = CLASS_LIST.map(cls => {
        const clsRecs = rangeRecords.filter(r => r.className === cls);
        const tot = clsRecs.length;
        const rel = clsRecs.filter(r => r.status === 'Guru Ganti').length;
        const sub = tot - rel;
        const pct = tot > 0 ? Math.round((sub / tot) * 100) : 0;
        return [cls, tot, sub, rel, `${pct}%`];
    });

    autoTable(doc, {
        startY: finalY + 20,
        head: [['Kelas', 'Jumlah Sesi', 'Guru Subjek', 'Guru Ganti', '% Kehadiran Subjek']],
        body: classStats,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] }, // Slate
    });

    // --- SECTION 3: SENARAI GURU GANTI (RELIEF LIST) ---
    doc.addPage();
    doc.text('3. Senarai Rekod Guru Ganti (Terperinci)', 14, 20);

    const reliefData = rangeRecords.filter(r => r.status === 'Guru Ganti');
    // Sort: Date -> Time
    reliefData.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });

    if (reliefData.length > 0) {
        const tableRows = reliefData.map((record, index) => [
            index + 1,
            record.date,
            `${record.startTime} - ${record.endTime}`,
            record.className,
            record.teacherName, // Guru Ganti
            record.originalTeacherName || '-', // Guru Tidak Hadir
            record.reliefReason || '-',
            record.notes || '-'
        ]);

        autoTable(doc, {
            startY: 25,
            head: [["No.", "Tarikh", "Masa", "Kelas", "GURU GANTI", "GURU TIDAK HADIR", "Sebab", "Catatan"]],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' }, // Orange
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                5: { cellWidth: 35 },
                6: { cellWidth: 35 },
                7: { cellWidth: 40 }
            },
            alternateRowStyles: { fillColor: [255, 247, 237] }
        });
    } else {
        doc.setFontSize(11);
        doc.text("Tiada rekod guru ganti dalam tempoh ini.", 14, 30);
    }

    doc.save(`Laporan_Analisis_MMI_${reportStartDate}_${reportEndDate}.pdf`);
  };

  return (
    <div className="max-w-[98%] mx-auto px-2 py-8 space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jadual Keberadaan Guru</h1>
          <p className="text-slate-500 mt-1">Paparan visual jadual waktu dan guru bertugas.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          
          {/* Date Filter for Data */}
          <div>
             <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Pilih Tarikh & Hari</label>
             <div className="flex items-center gap-2">
               <div className="relative">
                  <input 
                    type="date" 
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
               </div>
               {/* Display derived day name */}
               <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 min-w-[80px] text-center border border-slate-200">
                 {currentDay}
               </div>
             </div>
          </div>

          <button 
              onClick={() => {
                  if(confirm("Adakah anda pasti mahu memadam semua data?")) onReset();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center h-[38px] ml-auto md:ml-0"
          >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
          </button>
        </div>
      </div>

      {/* Visual Timetable - Transposed (Rows: Classes, Cols: Time) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                {/* Header: Class Label (Sticky Left) */}
                <th className="p-4 w-32 sticky left-0 z-30 bg-slate-900 border-r border-slate-700 shadow-md">
                    Kelas / Masa
                </th>
                
                {/* Header: Time Slots */}
                {TIME_SLOTS.map((slot, index) => (
                  <th 
                    key={index} 
                    className={`p-3 min-w-[120px] border-r border-slate-700 font-semibold tracking-wide text-center whitespace-nowrap sticky top-0 z-20 ${
                        slot.type === 'REHAT' ? 'bg-yellow-600 text-yellow-100 min-w-[60px]' : 'bg-slate-900'
                    }`}
                  >
                    {slot.display}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_LIST.map((cls, rowIndex) => (
                <tr key={cls} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {/* Column: Class Name (Sticky Left) */}
                    <td className="p-4 font-bold text-slate-800 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {cls}
                    </td>

                    {/* Columns: Time Slots */}
                    {TIME_SLOTS.map((slot, colIndex) => {
                        const isRecess = slot.type === 'REHAT';

                        if (isRecess) {
                            return (
                                <td key={`${cls}-${slot.value}`} className="p-1 border-r border-yellow-200 bg-yellow-50 text-center relative min-w-[60px]">
                                    <div className="h-full flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-yellow-700 -rotate-90 whitespace-nowrap">REHAT</span>
                                    </div>
                                </td>
                            );
                        }

                        // Pass the derived currentDay here
                        const isBlackedOut = isSlotBlackedOut(cls, currentDay, slot.value);
                        // CHANGED: Get ARRAY of teachers instead of single object
                        const activeRecords = !isBlackedOut ? getTeachersInSlot(cls, slot.value) : [];

                        return (
                            <td 
                                key={`${cls}-${slot.value}`} 
                                className={`p-1 border-r border-slate-100 relative h-24 align-top min-w-[140px] ${
                                    isBlackedOut ? 'bg-slate-800' : ''
                                }`}
                            >
                                {isBlackedOut ? (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                         <div className="w-full h-[1px] bg-slate-500 transform rotate-45"></div>
                                         <div className="w-full h-[1px] bg-slate-500 transform -rotate-45 absolute"></div>
                                    </div>
                                ) : activeRecords.length > 0 ? (
                                    <div className="flex flex-col gap-1 w-full h-full overflow-y-auto custom-scrollbar">
                                        {activeRecords.map((activeRecord) => (
                                            <div key={activeRecord.id} className={`group relative w-full p-2 rounded-lg text-xs border shadow-sm animate-fade-in flex flex-col shrink-0 ${
                                                activeRecord.status === 'Guru Ganti' 
                                                    ? 'bg-orange-50 border-orange-200 text-orange-900' 
                                                    : 'bg-blue-50 border-blue-200 text-blue-900'
                                            }`}>
                                                {/* DELETE BUTTON */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteRecord(activeRecord.id);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-white/50 hover:bg-red-500 hover:text-white text-slate-500 transition-all opacity-0 group-hover:opacity-100 z-10"
                                                    title="Padam rekod ini"
                                                >
                                                    <X size={12} strokeWidth={3} />
                                                </button>

                                                <div className="font-bold mb-1 line-clamp-2 leading-tight pr-4" title={activeRecord.teacherName}>
                                                    {activeRecord.teacherName}
                                                </div>
                                                <div className="text-[10px] opacity-75 mb-auto">
                                                    {activeRecord.subject}
                                                </div>
                                                {activeRecord.status === 'Guru Ganti' && (
                                                    <div className="mt-1 pt-1 border-t border-orange-200 text-[9px] font-semibold text-orange-700 truncate">
                                                        Ganti: {activeRecord.originalTeacherName}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200 text-lg">
                                        •
                                    </div>
                                )}
                            </td>
                        );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm text-slate-600 justify-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
            <span>Guru Matapelajaran</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded mr-2"></div>
            <span>Guru Ganti (Relief)</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2"></div>
            <span>Waktu Rehat</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-800 rounded mr-2"></div>
            <span>Tamat Sesi (Tiada Kelas)</span>
        </div>
      </div>

      {/* NEW SECTION: FULL LIST VIEW OF ALL RECORDS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-lg text-white">
                    <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Senarai Penuh Rekod Harian</h2>
                    <p className="text-xs text-slate-500">Lihat semua kemasukan guru (Mata Pelajaran & Ganti)</p>
                </div>
             </div>
             <span className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
                Jumlah: {sortedTodaysRecords.length}
             </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Masa</th>
                        <th className="px-6 py-4 whitespace-nowrap">Kelas</th>
                        <th className="px-6 py-4">Nama Guru</th>
                        <th className="px-6 py-4">Subjek / Status</th>
                        <th className="px-6 py-4">Catatan</th>
                        <th className="px-6 py-4 text-center">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedTodaysRecords.length > 0 ? (
                        sortedTodaysRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-slate-600 whitespace-nowrap bg-slate-50/30">
                                    {record.startTime} - {record.endTime}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                                    {record.className}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700">{record.teacherName}</div>
                                    {record.status === 'Guru Ganti' && (
                                        <div className="text-xs text-orange-600 mt-1 flex items-center font-semibold">
                                            <ArrowRight className="w-3 h-3 mr-1" />
                                            Ganti: {record.originalTeacherName}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-700 mb-1">{record.subject}</div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                                        record.status === 'Guru Ganti'
                                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic text-xs max-w-[200px]">
                                    {record.notes ? record.notes : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => {
                                            if(confirm('Padam rekod ini?')) onDeleteRecord(record.id);
                                        }}
                                        className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-lg transition-all shadow-sm"
                                        title="Padam"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                <div className="flex flex-col items-center justify-center">
                                    <Info className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="italic">Tiada rekod dijumpai pada tarikh ini.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* DEDICATED REPORT GENERATION PANEL (MOVED UP) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="bg-slate-800 p-2 rounded-lg text-white">
                <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">JANA PDF (Laporan & Analisis)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Tarikh Mula</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Tarikh Tamat</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
            </div>
            <div>
                <button 
                    onClick={handleGeneratePDF}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                    <FileDown className="w-5 h-5" />
                    Muat Turun Laporan PDF
                </button>
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Laporan ini mengandungi Ringkasan Statistik, Peratusan Kehadiran, Analisis Kelas dan Senarai Terperinci Guru Ganti.
        </p>
      </div>

      {/* NEW SECTIONS: Stats & List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: Relief Teachers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
               <div className="flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Senarai Guru Ganti (Relief)</h2>
               </div>
            </div>
            
            {groupedReliefs.keys.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 text-left w-1/3 rounded-l-lg border-b border-slate-200">Guru Tidak Hadir</th>
                                <th className="px-6 py-4 text-left w-2/3 rounded-r-lg border-b border-slate-200">Senarai Pengganti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {groupedReliefs.keys.map(originalTeacher => (
                                <tr key={originalTeacher} className="hover:bg-slate-50/50 transition-colors">
                                    {/* Left Column: Absent Teacher */}
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-bold text-slate-800 text-base flex items-center mb-1">
                                            <div className="w-2 h-8 bg-red-400 rounded-sm mr-3"></div>
                                            {originalTeacher}
                                        </div>
                                        {/* Display Reason if any record in group has it (assuming same reason for the day) */}
                                        {groupedReliefs.groups[originalTeacher][0].reliefReason && (
                                            <div className="ml-5 inline-block px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-600 font-bold border border-red-200">
                                                {groupedReliefs.groups[originalTeacher][0].reliefReason}
                                            </div>
                                        )}
                                    </td>
                                    
                                    {/* Right Column: List of Reliefs */}
                                    <td className="px-6 py-4 align-top">
                                        <div className="space-y-3">
                                            {groupedReliefs.groups[originalTeacher].map(record => (
                                                <div key={record.id} className="flex flex-col sm:flex-row sm:items-center bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-orange-300 transition-colors group relative">
                                                    
                                                    {/* Time & Class */}
                                                    <div className="flex items-center gap-3 min-w-[180px] border-b sm:border-b-0 sm:border-r border-slate-100 pb-2 sm:pb-0 sm:pr-4 mb-2 sm:mb-0">
                                                        <div className="flex items-center text-orange-600 font-mono text-xs font-bold bg-orange-50 px-2 py-1 rounded">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {record.startTime} - {record.endTime}
                                                        </div>
                                                        <div className="font-bold text-slate-700 text-sm">
                                                            {record.className}
                                                        </div>
                                                    </div>

                                                    {/* Teacher & Subject */}
                                                    <div className="flex-1 sm:pl-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-blue-700 text-sm flex items-center">
                                                                    <ArrowRight className="w-3 h-3 mr-1 text-slate-400" />
                                                                    {record.teacherName}
                                                                </div>
                                                                <div className="text-xs text-slate-500 pl-4 mt-0.5">
                                                                    {record.subject}
                                                                </div>
                                                                {record.notes && (
                                                                    <div className="text-[10px] text-slate-400 pl-4 mt-1 italic flex items-center">
                                                                        <Info className="w-3 h-3 mr-1" />
                                                                        {record.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    if(confirm(`Padam rekod penggantian ${record.teacherName}?`)) {
                                                                        onDeleteRecord(record.id);
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                                                                title="Padam"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p>Tiada guru ganti direkodkan pada tarikh ini.</p>
                </div>
            )}
        </div>

        {/* SECTION 2: Class Analysis & Overall Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                {/* RENAMED TITLE AS REQUESTED */}
                <h2 className="text-xl font-bold text-slate-900">PERATUS KEHADIRAN GURU</h2>
            </div>
            
            {/* Overall Summary Box */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Statistik Keseluruhan (Harian)
               </h3>
               <div className="flex gap-4">
                  <div className="flex-1 bg-white p-3 rounded border border-slate-100 shadow-sm text-center">
                      <div className="text-xs text-slate-500 mb-1">Kehadiran (Sesi)</div>
                      <div className="text-lg font-bold text-blue-600">{dailyOverallStats.subjectPercentage}%</div>
                      <div className="text-[10px] text-slate-400">{dailyOverallStats.subjectCount} sesi</div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded border border-slate-100 shadow-sm text-center">
                      <div className="text-xs text-slate-500 mb-1">Diganti (Sesi)</div>
                      <div className="text-lg font-bold text-orange-600">{dailyOverallStats.reliefPercentage}%</div>
                      <div className="text-[10px] text-slate-400">{dailyOverallStats.reliefCount} sesi</div>
                  </div>
               </div>
            </div>

            <h3 className="text-sm font-bold text-slate-700 mb-4 px-1">Pecahan Mengikut Kelas</h3>
            <div className="space-y-6">
                {dailyClassAnalysis.map((stat) => (
                    <div key={stat.className}>
                        <div className="flex justify-between items-end mb-1">
                            <span className="font-bold text-slate-800 text-sm">{stat.className}</span>
                            <span className="text-xs text-slate-500">Jumlah Rekod: {stat.total}</span>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                            {stat.total > 0 ? (
                                <>
                                    <div 
                                        className="h-full bg-blue-500 relative group transition-all duration-500" 
                                        style={{ width: `${stat.subjectPercentage}%` }}
                                        title={`Guru Subjek: ${stat.subjectCount} (${stat.subjectPercentage}%)`}
                                    ></div>
                                    <div 
                                        className="h-full bg-orange-500 relative group transition-all duration-500" 
                                        style={{ width: `${stat.reliefPercentage}%` }}
                                        title={`Guru Ganti: ${stat.reliefCount} (${stat.reliefPercentage}%)`}
                                    ></div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-200"></div>
                            )}
                        </div>

                        {/* Legend / details for this row */}
                        <div className="flex justify-between mt-1 text-xs">
                             <div className="flex items-center gap-1 text-blue-700 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Hadir: {stat.subjectPercentage}%</span>
                             </div>
                             <div className="flex items-center gap-1 text-orange-700 font-medium">
                                <XCircle className="w-3 h-3" />
                                <span>Ganti: {stat.reliefPercentage}%</span>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

    </div>
  );
};