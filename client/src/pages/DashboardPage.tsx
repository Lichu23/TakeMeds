import { useLogs } from '../hooks/useLogs';
import { DailyTracker } from '../components/DailyTracker';
import { format } from 'date-fns';

export function DashboardPage() {
  const {
    todayLogs,
    todayStats,
    loading,
    error,
    markAsTaken,
    markAsSkipped,
  } = useLogs();

  const handleMarkAsTaken = async (logId: number) => {
    await markAsTaken(logId);
  };

  const handleMarkAsSkipped = async (logId: number) => {
    await markAsSkipped(logId);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Today's Medications</h1>
        <p className="mt-2 text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Cards */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-sm font-medium text-blue-600">Total</div>
            <div className="mt-1 text-3xl font-bold text-blue-900">{todayStats.total}</div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="text-sm font-medium text-green-600">Taken</div>
            <div className="mt-1 text-3xl font-bold text-green-900">{todayStats.taken}</div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-sm font-medium text-yellow-600">Pending</div>
            <div className="mt-1 text-3xl font-bold text-yellow-900">{todayStats.pending}</div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="text-sm font-medium text-red-600">Missed</div>
            <div className="mt-1 text-3xl font-bold text-red-900">{todayStats.missed}</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Daily Tracker */}
      {!loading && (
        <DailyTracker
          logs={todayLogs}
          onMarkAsTaken={handleMarkAsTaken}
          onMarkAsSkipped={handleMarkAsSkipped}
        />
      )}

      {/* Progress Bar */}
      {todayStats && todayStats.total > 0 && (
        <div className="mt-8 card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {todayStats.taken} / {todayStats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(todayStats.taken / todayStats.total) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {Math.round((todayStats.taken / todayStats.total) * 100)}% completed
          </p>
        </div>
      )}
    </div>
  );
}
