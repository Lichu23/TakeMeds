import { format, isToday, isTomorrow } from 'date-fns';
import type { MedicationLog } from '../services/api';

interface DailyTrackerProps {
  logs: MedicationLog[];
  onMarkAsTaken: (logId: number) => void;
  onMarkAsSkipped: (logId: number) => void;
}

export function DailyTracker({ logs, onMarkAsTaken, onMarkAsSkipped }: DailyTrackerProps) {
  // Helper to check if a log is for tomorrow
  const isTomorrowLog = (scheduledTime: string) => {
    return isTomorrow(new Date(scheduledTime));
  };

  // Separate today's and tomorrow's logs
  const todayLogs = logs.filter(log => isToday(new Date(log.scheduled_time)));
  const tomorrowLogs = logs.filter(log => isTomorrowLog(log.scheduled_time));
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      taken: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'missed':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  if (logs.length === 0) {
    return (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No medications for today</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add medications to start tracking your daily routine.
        </p>
      </div>
    );
  }

  // Render a single medication log card
  const renderLogCard = (log: MedicationLog, isTomorrow: boolean = false) => (
    <div
      key={log.id}
      className={`card p-4 sm:p-6 ${
        log.status === 'taken' ? 'bg-green-50 border border-green-200' : ''
      } ${log.status === 'missed' ? 'bg-red-50 border border-red-200' : ''} ${
        isTomorrow ? 'border-l-4 border-l-primary-400' : ''
      }`}
    >
      {/* Mobile Layout: Stack vertically */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Med info */}
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0 mt-0.5 sm:mt-0">{getStatusIcon(log.status)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {log.medication_name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(log.status)}`}>
                {log.status}
              </span>
            </div>
            {log.dosage && <p className="text-sm text-gray-600 mt-0.5">{log.dosage}</p>}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {format(new Date(log.scheduled_time), 'h:mm a')}
              </span>
              {log.taken_time && (
                <span className="text-green-600">
                  Taken at {format(new Date(log.taken_time), 'h:mm a')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Full width on mobile (only show for today's pending) */}
        {log.status === 'pending' && !isTomorrow && (
          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              onClick={() => onMarkAsTaken(log.id)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
            >
              Take
            </button>
            <button
              onClick={() => onMarkAsSkipped(log.id)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Today's medications */}
      {todayLogs.length > 0 && (
        <div className="space-y-3">
          {todayLogs.map((log) => renderLogCard(log, false))}
        </div>
      )}

      {/* Tomorrow's medications (upcoming) */}
      {tomorrowLogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 py-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-sm font-medium text-primary-600 px-2">Tomorrow</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          {tomorrowLogs.map((log) => renderLogCard(log, true))}
        </div>
      )}
    </div>
  );
}
