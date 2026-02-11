export interface TeacherRecord {
  id: string;
  date: string;
  teacherName: string; // Nama guru yang mengisi borang (Guru Subjek atau Guru Ganti)
  originalTeacherName?: string; // Nama guru asal (hanya untuk status Guru Ganti)
  reliefReason?: string; // Sebab guru asal tidak hadir
  notes?: string; // Catatan tambahan
  className: string;
  subject: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: 'Guru Matapelajaran' | 'Guru Ganti';
  timestamp: number;
}

export type ViewState = 'landing' | 'form' | 'login' | 'admin';

export interface ClassStat {
  name: string;
  count: number;
}

export interface DailyStat {
  date: string;
  count: number;
}