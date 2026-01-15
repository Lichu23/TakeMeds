// Re-export types from api.ts for convenience
export type { Medication, MedicationLog, PushSubscription, Settings } from '../services/api';

export interface DailyStats {
  total: number;
  taken: number;
  missed: number;
  pending: number;
  skipped: number;
}

export interface HistoryStats {
  totalDays: number;
  totalLogs: number;
  taken: number;
  compliance_rate: number;
  streak: number;
  byMedication: Record<string, {
    name: string;
    total: number;
    taken: number;
    missed: number;
    pending: number;
    skipped: number;
  }>;
}

export interface Settings {
  notifications_enabled: string;
  reminder_advance_minutes: string;
  theme: string;
  timezone: string;
}
