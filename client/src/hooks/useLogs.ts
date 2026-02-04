import { useState, useEffect, useCallback } from 'react';
import { logsApi, type MedicationLog } from '../services/api';

interface DailyStats {
  total: number;
  taken: number;
  missed: number;
  pending: number;
  skipped: number;
}

interface UseLogsReturn {
  todayLogs: MedicationLog[];
  todayStats: DailyStats | null;
  loading: boolean;
  error: string | null;
  includesUpcoming: boolean;
  fetchTodayLogs: () => Promise<void>;
  markAsTaken: (logId: number, notes?: string) => Promise<boolean>;
  markAsSkipped: (logId: number, notes?: string) => Promise<boolean>;
  updateLog: (logId: number, status: string, notes?: string) => Promise<boolean>;
}

export function useLogs(): UseLogsReturn {
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includesUpcoming, setIncludesUpcoming] = useState(false);

  // Fetch today's logs
  const fetchTodayLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logsApi.getToday();
      setTodayLogs(response.logs);
      setTodayStats(response.stats);
      setIncludesUpcoming(response.includesUpcoming || false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch today\'s logs');
      console.error('Error fetching today\'s logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark log as taken
  const markAsTaken = async (logId: number, notes?: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await logsApi.update(logId, {
        status: 'taken',
        taken_time: new Date().toISOString(),
        notes,
      });

      // Update local state
      setTodayLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? response.log : log
        )
      );

      // Recalculate stats
      await fetchTodayLogs();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as taken');
      console.error('Error marking as taken:', err);
      return false;
    }
  };

  // Mark log as skipped
  const markAsSkipped = async (logId: number, notes?: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await logsApi.update(logId, {
        status: 'skipped',
        notes,
      });

      // Update local state
      setTodayLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? response.log : log
        )
      );

      // Recalculate stats
      await fetchTodayLogs();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as skipped');
      console.error('Error marking as skipped:', err);
      return false;
    }
  };

  // Update log with custom status
  const updateLog = async (logId: number, status: string, notes?: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await logsApi.update(logId, {
        status,
        ...(status === 'taken' && { taken_time: new Date().toISOString() }),
        notes,
      });

      // Update local state
      setTodayLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? response.log : log
        )
      );

      // Recalculate stats
      await fetchTodayLogs();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update log');
      console.error('Error updating log:', err);
      return false;
    }
  };

  // Fetch logs on mount
  useEffect(() => {
    fetchTodayLogs();
  }, [fetchTodayLogs]);

  return {
    todayLogs,
    todayStats,
    loading,
    error,
    includesUpcoming,
    fetchTodayLogs,
    markAsTaken,
    markAsSkipped,
    updateLog,
  };
}
