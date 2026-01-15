import { useState, useEffect, useCallback } from 'react';
import { medicationsApi, type Medication } from '../services/api';

interface UseMedicationsReturn {
  medications: Medication[];
  loading: boolean;
  error: string | null;
  fetchMedications: () => Promise<void>;
  createMedication: (data: Partial<Medication>) => Promise<Medication | null>;
  updateMedication: (id: number, data: Partial<Medication>) => Promise<Medication | null>;
  deleteMedication: (id: number) => Promise<boolean>;
  getMedicationById: (id: number) => Medication | undefined;
}

export function useMedications(): UseMedicationsReturn {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all medications
  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicationsApi.getAll();
      setMedications(response.medications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch medications');
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new medication
  const createMedication = async (data: Partial<Medication>): Promise<Medication | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicationsApi.create(data);
      setMedications((prev) => [...prev, response.medication]);
      return response.medication;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medication');
      console.error('Error creating medication:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update medication
  const updateMedication = async (id: number, data: Partial<Medication>): Promise<Medication | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicationsApi.update(id, data);
      setMedications((prev) =>
        prev.map((med) => (med.id === id ? response.medication : med))
      );
      return response.medication;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update medication');
      console.error('Error updating medication:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete medication
  const deleteMedication = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await medicationsApi.delete(id);
      setMedications((prev) => prev.filter((med) => med.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete medication');
      console.error('Error deleting medication:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get medication by ID
  const getMedicationById = (id: number): Medication | undefined => {
    return medications.find((med) => med.id === id);
  };

  // Fetch medications on mount
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  return {
    medications,
    loading,
    error,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    getMedicationById,
  };
}
