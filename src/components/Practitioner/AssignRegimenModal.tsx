import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Patient {
  _id: string;
  name: string;
  email: string;
}

interface Regimen {
  _id: string;
  name: string;
  description: string;
  duration: number;
  steps: Array<{
    dayOffset: number;
    procedureName: string;
    instructions: string;
  }>;
}

interface AssignRegimenModalProps {
  patientId: string;
  patients: Patient[];
  regimens: Regimen[];
  onSubmit: (regimenId: string, patientId: string, startDate: string) => Promise<void>;
  onClose: () => void;
}

const AssignRegimenModal: React.FC<AssignRegimenModalProps> = ({
  patientId,
  patients,
  regimens,
  onSubmit,
  onClose,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patientId);
  const [selectedRegimenId, setSelectedRegimenId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedRegimen = regimens.find(r => r._id === selectedRegimenId);
  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegimenId || !selectedPatientId || !startDate) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedRegimenId, selectedPatientId, startDate);
    } catch (error) {
      console.error('Failed to assign regimen:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Assign Regimen</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Regimen
              </label>
              <select
                value={selectedRegimenId}
                onChange={(e) => setSelectedRegimenId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Choose a regimen...</option>
                {regimens.map((regimen) => (
                  <option key={regimen._id} value={regimen._id}>
                    {regimen.name} ({regimen.duration} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {selectedRegimen && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Regimen Preview</h4>
                <p className="text-sm text-gray-600 mb-3">{selectedRegimen.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Duration: {selectedRegimen.duration} days</p>
                  <p>Total procedures: {selectedRegimen.steps.length}</p>
                </div>
              </div>
            )}

            {selectedPatient && selectedRegimen && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="font-medium text-emerald-900 mb-2">Assignment Summary</h4>
                <p className="text-sm text-emerald-800">
                  <strong>{selectedRegimen.name}</strong> will be assigned to{' '}
                  <strong>{selectedPatient.name}</strong> starting from{' '}
                  <strong>{new Date(startDate).toLocaleDateString()}</strong>
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  This will create {selectedRegimen.steps.length} scheduled sessions.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPatientId || !selectedRegimenId}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Regimen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRegimenModal;