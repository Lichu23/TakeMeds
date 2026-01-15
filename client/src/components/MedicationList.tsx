import type { Medication } from '../services/api';
import { MedicationCard } from './MedicationCard';

interface MedicationListProps {
  medications: Medication[];
  loading: boolean;
  onEdit: (medication: Medication) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
}

export function MedicationList({
  medications,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: MedicationListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No medications</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first medication.
        </p>
      </div>
    );
  }

  // Separate active and inactive medications
  const activeMedications = medications.filter((med) => med.active);
  const inactiveMedications = medications.filter((med) => !med.active);

  return (
    <div className="space-y-6">
      {/* Active Medications */}
      {activeMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Medications ({activeMedications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inactive Medications ({inactiveMedications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
