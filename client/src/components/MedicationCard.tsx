import type { Medication } from '../services/api';
import { format } from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
}

export function MedicationCard({ medication, onEdit, onDelete, onToggleActive }: MedicationCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${medication.name}"?`)) {
      onDelete(medication.id);
    }
  };

  const handleToggle = () => {
    onToggleActive(medication.id, !medication.active);
  };

  return (
    <div className={`card p-4 sm:p-6 ${!medication.active ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{medication.name}</h3>
          {medication.dosage && (
            <p className="text-sm text-gray-600 mt-0.5">{medication.dosage}</p>
          )}
        </div>
        <span
          className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
            medication.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {medication.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Frequency */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Frequency:</span>{' '}
          <span className="capitalize">{medication.frequency.replace('-', ' ')}</span>
        </p>
      </div>

      {/* Times */}
      <div className="mb-3">
        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Reminder Times:</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {medication.times.map((time, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs sm:text-sm font-medium"
            >
              {time}
            </span>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="mb-3 text-xs sm:text-sm text-gray-600">
        <p>
          <span className="font-medium">Start:</span>{' '}
          {format(new Date(medication.start_date), 'MMM dd, yyyy')}
        </p>
        {medication.end_date && (
          <p>
            <span className="font-medium">End:</span>{' '}
            {format(new Date(medication.end_date), 'MMM dd, yyyy')}
          </p>
        )}
      </div>

      {/* Notes */}
      {medication.notes && (
        <div className="mb-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{medication.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={handleToggle}
          className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors"
        >
          {medication.active ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => onEdit(medication)}
          className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
