import { useState, useEffect } from 'react';
import { logsApi, type MedicationLog } from '../services/api';
import { format } from 'date-fns';

interface HistoryStats {
  totalDays: number;
  totalLogs: number;
  taken: number;
  compliance_rate: number;
  streak: number;
  byMedication: Record<string, any>;
}

export function HistoryPage() {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchHistory();
  }, [days]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logsApi.getHistory(days);
      setLogs(response.logs);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      taken: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = format(new Date(log.scheduled_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, MedicationLog[]>);

  const dates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medication History</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          View your past medication logs and statistics
        </p>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setDays(7)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            days === 7 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            days === 30 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setDays(90)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            days === 90 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          90 Days
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Compliance Rate</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{stats.compliance_rate}%</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-green-600 h-1.5 sm:h-2 rounded-full"
                style={{ width: `${stats.compliance_rate}%` }}
              ></div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Current Streak</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-orange-600">{stats.streak}</div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">days</p>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Total Taken</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-green-600">{stats.taken}</div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">of {stats.totalLogs}</p>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-600">Days Tracked</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalDays}</div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">in period</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* History Logs */}
      {!loading && dates.length === 0 && (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No history yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start taking your medications to see your history here.
          </p>
        </div>
      )}

      {!loading && dates.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {dates.map((date) => (
            <div key={date} className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                {format(new Date(date), 'EEE, MMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {logsByDate[date].map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{log.medication_name}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(log.scheduled_time), 'h:mm a')}
                        {log.dosage && ` • ${log.dosage}`}
                      </p>
                      {log.taken_time && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Taken at {format(new Date(log.taken_time), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
