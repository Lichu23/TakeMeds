import { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { MedicationForm } from '../components/MedicationForm';
import { MedicationList } from '../components/MedicationList';
import type { Medication } from '../services/api';

export function MedicationsPage() {
  const {
    medications,
    loading,
    error,
    createMedication,
    updateMedication,
    deleteMedication,
  } = useMedications();

  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>();

  const handleAddNew = () => {
    setEditingMedication(undefined);
    setShowForm(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedication(undefined);
  };

  const handleSubmit = async (data: Partial<Medication>) => {
    if (editingMedication) {
      const result = await updateMedication(editingMedication.id, data);
      if (result) {
        setShowForm(false);
        setEditingMedication(undefined);
      }
    } else {
      const result = await createMedication(data);
      if (result) {
        setShowForm(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMedication(id);
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    await updateMedication(id, { active });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Medications</h1>
          <p className="mt-2 text-gray-600">
            Manage your medications and reminder schedules
          </p>
        </div>
        {!showForm && (
          <button onClick={handleAddNew} className="btn-primary">
            + Add Medication
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </h2>
          <MedicationForm
            medication={editingMedication}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* List */}
      {!showForm && (
        <MedicationList
          medications={medications}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
}
