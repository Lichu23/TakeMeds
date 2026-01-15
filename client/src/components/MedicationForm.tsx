import { useState, useEffect } from 'react';
import type { Medication } from '../services/api';

interface MedicationFormProps {
  medication?: Medication;
  onSubmit: (data: Partial<Medication>) => Promise<void>;
  onCancel: () => void;
}

export function MedicationForm({ medication, onSubmit, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage || '',
        frequency: medication.frequency,
        times: medication.times,
        start_date: medication.start_date,
        end_date: medication.end_date || '',
        notes: medication.notes || '',
        active: medication.active,
      });
    }
  }, [medication]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData((prev) => ({ ...prev, times: newTimes }));
  };

  const addTime = () => {
    setFormData((prev) => ({ ...prev, times: [...prev.times, '09:00'] }));
  };

  const removeTime = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, times: newTimes }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }

    if (formData.times.length === 0) {
      newErrors.times = 'At least one reminder time is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        end_date: formData.end_date || undefined,
        dosage: formData.dosage || undefined,
        notes: formData.notes || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medication Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Medication Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g., Aspirin"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Dosage */}
      <div>
        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
          Dosage
        </label>
        <input
          type="text"
          id="dosage"
          name="dosage"
          value={formData.dosage}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g., 500mg, 2 pills"
        />
      </div>

      {/* Frequency */}
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
          Frequency *
        </label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="input-field"
        >
          <option value="daily">Daily</option>
          <option value="twice-daily">Twice Daily</option>
          <option value="three-times-daily">Three Times Daily</option>
          <option value="custom">Custom</option>
        </select>
        {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
      </div>

      {/* Reminder Times */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reminder Times *
        </label>
        <div className="space-y-2">
          {formData.times.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="input-field flex-1"
              />
              {formData.times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTime(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTime}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          + Add Another Time
        </button>
        {errors.times && <p className="mt-1 text-sm text-red-600">{errors.times}</p>}
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
          Start Date *
        </label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="input-field"
        />
        {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
          End Date (Optional)
        </label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="input-field"
        />
        <p className="mt-1 text-xs text-gray-500">Leave empty for ongoing medication</p>
        {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input-field"
          placeholder="Any additional information..."
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Active (enable reminders)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : medication ? 'Update Medication' : 'Add Medication'}
        </button>
      </div>
    </form>
  );
}
